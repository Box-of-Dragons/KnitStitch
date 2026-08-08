/**
 * Closed-shape cell fill logic, adapted from KnitStitch.
 *
 * Given JSketcher sketch objects (Segment, Arc, Circle, BezierCurve, Ellipse),
 * tessellates them into line segments, finds closed loops (cycles) in the
 * line graph, and determines which grid cells are >= fillThreshold inside
 * any closed polygon.
 */

const EPSILON = 0.01;
const ARC_SEGMENTS = 32;
const CIRCLE_SEGMENTS = 48;
const BEZIER_SEGMENTS = 24;

/**
 * Tessellate a JSketcher sketch object into line segments.
 * Returns an array of {start:{x,y}, end:{x,y}, isConstruction:boolean}.
 */
export function tessellateShape(obj) {
  if (!obj || !obj.visible) return [];

  const isConstruction = obj.role === 'objectConstruction' || obj.construction;

  // Segment: a.x,a.y -> b.x,b.y
  if (obj.TYPE === 'Segment' || obj._class === 'TCAD.TWO.Segment') {
    return [{
      start: { x: obj.a.x, y: obj.a.y },
      end: { x: obj.b.x, y: obj.b.y },
      isConstruction,
    }];
  }

  // Arc: tessellate from a to b around centre c
  if (obj.TYPE === 'Arc' || obj._class === 'TCAD.TWO.Arc') {
    return tessellateArc(obj, isConstruction);
  }

  // Circle: full circle tessellation
  if (obj.TYPE === 'Circle' || obj._class === 'TCAD.TWO.Circle') {
    const r = obj.r.get();
    if (r <= 0) return [];
    const segs = [];
    for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
      const a1 = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
      const a2 = ((i + 1) / CIRCLE_SEGMENTS) * Math.PI * 2;
      segs.push({
        start: { x: obj.c.x + r * Math.cos(a1), y: obj.c.y + r * Math.sin(a1) },
        end: { x: obj.c.x + r * Math.cos(a2), y: obj.c.y + r * Math.sin(a2) },
        isConstruction,
      });
    }
    return segs;
  }

  // BezierCurve: cubic bezier tessellation
  if (obj.TYPE === 'BezierCurve' || obj._class === 'TCAD.TWO.BezierCurve') {
    const segs = [];
    let prev = { x: obj.a.x, y: obj.a.y };
    for (let i = 1; i <= BEZIER_SEGMENTS; i++) {
      const t = i / BEZIER_SEGMENTS;
      const mt = 1 - t;
      const x = mt*mt*mt*obj.a.x + 3*mt*mt*t*obj.cp1.x + 3*mt*t*t*obj.cp2.x + t*t*t*obj.b.x;
      const y = mt*mt*mt*obj.a.y + 3*mt*mt*t*obj.cp1.y + 3*mt*t*t*obj.cp2.y + t*t*t*obj.b.y;
      segs.push({ start: prev, end: { x, y }, isConstruction });
      prev = { x, y };
    }
    return segs;
  }

  // Ellipse: tessellate as full ellipse
  if (obj.TYPE === 'Ellipse' || obj._class === 'TCAD.TWO.Ellipse') {
    return tessellateEllipse(obj, isConstruction);
  }

  // EllipticalArc: tessellate arc portion
  if (obj.TYPE === 'EllipticalArc' || obj._class === 'TCAD.TWO.EllipticalArc') {
    return tessellateEllipticalArc(obj, isConstruction);
  }

  return [];
}

function tessellateArc(obj, isConstruction) {
  const r = obj.r.get();
  if (r <= 0) return [];
  const cx = obj.c.x, cy = obj.c.y;
  const startAng = obj.ang1.get();
  let endAng = obj.ang2.get();
  // Handle full circle case (a and b coincide)
  if (Math.abs(obj.a.x - obj.b.x) < EPSILON && Math.abs(obj.a.y - obj.b.y) < EPSILON) {
    endAng = startAng + Math.PI * 2;
  }
  // Ensure we go the right way (arc from start to end, counter-clockwise)
  if (endAng < startAng) endAng += Math.PI * 2;
  const segs = [];
  for (let i = 0; i < ARC_SEGMENTS; i++) {
    const a1 = startAng + (endAng - startAng) * (i / ARC_SEGMENTS);
    const a2 = startAng + (endAng - startAng) * ((i + 1) / ARC_SEGMENTS);
    segs.push({
      start: { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) },
      end: { x: cx + r * Math.cos(a2), y: cy + r * Math.sin(a2) },
      isConstruction,
    });
  }
  return segs;
}

function tessellateEllipse(obj, isConstruction) {
  const rx = obj.rx ? obj.rx.get() : (obj.r ? obj.r.get() : 0);
  const ry = obj.ry ? obj.ry.get() : rx;
  if (rx <= 0 || ry <= 0) return [];
  const cx = obj.c.x, cy = obj.c.y;
  const segs = [];
  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const a1 = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    const a2 = ((i + 1) / CIRCLE_SEGMENTS) * Math.PI * 2;
    segs.push({
      start: { x: cx + rx * Math.cos(a1), y: cy + ry * Math.sin(a1) },
      end: { x: cx + rx * Math.cos(a2), y: cy + ry * Math.sin(a2) },
      isConstruction,
    });
  }
  return segs;
}

function tessellateEllipticalArc(obj, isConstruction) {
  // Fall back to treating as arc-like if it has the right properties
  if (obj.a && obj.b && obj.c) {
    return tessellateArc(obj, isConstruction);
  }
  return [];
}

/**
 * Collect all line segments from the viewer's sketch layers.
 */
export function collectSegmentsFromLayers(layers) {
  const allSegs = [];
  for (const layer of layers) {
    for (const obj of layer.objects) {
      obj.accept((o) => {
        if (!o.visible) return true;
        const segs = tessellateShape(o);
        for (const s of segs) allSegs.push(s);
        return true;
      });
    }
  }
  return allSegs;
}

/**
 * Compute the set of grid cell keys ("r,c") that should be filled because they
 * are >= fillThreshold inside a closed shape formed by the sketch lines.
 */
export function computeFilledCellsFromSketch(lines, cellW, cellH, fillThreshold = 0.5) {
  const realLines = (lines || []).filter((l) => !l.isConstruction);
  if (realLines.length < 3 || cellW <= 0 || cellH <= 0) {
    return new Set();
  }

  const polygons = findClosedPolygons(realLines);
  if (polygons.length === 0) return new Set();

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of polygons) {
    for (const p of poly) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }

  const minCol = Math.floor(minX / cellW);
  const maxCol = Math.ceil(maxX / cellW);
  const minRow = Math.floor(minY / cellH);
  const maxRow = Math.ceil(maxY / cellH);

  const filled = new Set();
  const cellArea = cellW * cellH;
  const requiredArea = cellArea * Math.max(0, Math.min(1, fillThreshold));

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const x0 = c * cellW;
      const y0 = r * cellH;
      const coveredArea = polygons.reduce((largest, polygon) => {
        const clipped = clipPolygonToRect(polygon, x0, y0, x0 + cellW, y0 + cellH);
        return Math.max(largest, polygonArea(clipped));
      }, 0);

      if (coveredArea + EPSILON >= requiredArea) {
        filled.add(`${r},${c}`);
      }
    }
  }

  // Mirror symmetric polygons so their knitted cell pattern is symmetric
  for (const polygon of polygons) {
    const axis = verticalSymmetryAxis(polygon);
    if (axis === null) continue;
    const mirrored = new Set(filled);
    for (const key of filled) {
      const [r, c] = key.split(',').map(Number);
      const reflectedCenter = (2 * axis - (c + 0.5) * cellW) / cellW;
      const reflectedColumn = Math.floor(reflectedCenter);
      mirrored.add(`${r},${reflectedColumn}`);
    }
    for (const key of mirrored) filled.add(key);
  }

  return filled;
}

function verticalSymmetryAxis(polygon) {
  if (polygon.length < 3) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const point of polygon) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
  }
  const axis = (minX + maxX) / 2;
  const tolerance = EPSILON * 2;
  const hasMirror = (point) => polygon.some((candidate) =>
    Math.abs(candidate.x - (2 * axis - point.x)) <= tolerance
      && Math.abs(candidate.y - point.y) <= tolerance
  );
  return polygon.every(hasMirror) ? axis : null;
}

/**
 * Finds all minimal closed polygons (cycles) in the line graph.
 */
export function findClosedPolygons(lines) {
  const realLines = (lines || []).filter((l) => !l.isConstruction);
  if (realLines.length < 3) return [];

  const nodeKey = (p) => `${round(p.x)},${round(p.y)}`;
  const nodes = new Map();
  const adj = new Map();

  const ensureNode = (p) => {
    const key = nodeKey(p);
    if (!nodes.has(key)) {
      nodes.set(key, { x: p.x, y: p.y });
      adj.set(key, []);
    }
    return key;
  };

  for (const line of realLines) {
    const sk = ensureNode(line.start);
    const ek = ensureNode(line.end);
    if (sk === ek) continue;
    adj.get(sk).push({ key: ek, line });
    adj.get(ek).push({ key: sk, line });
  }

  const polygons = [];
  const seen = new Set();

  for (const line of realLines) {
    const sk = nodeKey(line.start);
    const ek = nodeKey(line.end);
    if (sk === ek) continue;

    const path = bfsShortestPath(adj, ek, sk, line);
    if (!path || path.length < 2) continue;

    const polyKeys = [sk, ...path.slice(0, -1)];
    const sig = signature(polyKeys);
    if (seen.has(sig)) continue;
    seen.add(sig);

    polygons.push(polyKeys.map((k) => nodes.get(k)));
  }

  return polygons;
}

function bfsShortestPath(adj, fromKey, toKey, excludedLine) {
  const queue = [fromKey];
  const visited = new Set([fromKey]);
  const parent = new Map();

  while (queue.length > 0) {
    const node = queue.shift();
    if (node === toKey) {
      const path = [node];
      let cur = node;
      while (parent.has(cur)) {
        cur = parent.get(cur);
        path.unshift(cur);
      }
      return path;
    }
    const neighbors = adj.get(node) || [];
    for (const { key, line } of neighbors) {
      if (line === excludedLine) continue;
      if (visited.has(key)) continue;
      visited.add(key);
      parent.set(key, node);
      queue.push(key);
    }
  }
  return null;
}

function clipPolygonToRect(polygon, minX, minY, maxX, maxY) {
  let clipped = polygon;
  const edges = [
    { inside: (p) => p.x >= minX, intersect: (a, b) => intersectVertical(a, b, minX) },
    { inside: (p) => p.x <= maxX, intersect: (a, b) => intersectVertical(a, b, maxX) },
    { inside: (p) => p.y >= minY, intersect: (a, b) => intersectHorizontal(a, b, minY) },
    { inside: (p) => p.y <= maxY, intersect: (a, b) => intersectHorizontal(a, b, maxY) },
  ];

  for (const edge of edges) {
    if (clipped.length === 0) break;
    const output = [];
    let previous = clipped[clipped.length - 1];
    let previousInside = edge.inside(previous);

    for (const current of clipped) {
      const currentInside = edge.inside(current);
      if (currentInside !== previousInside) {
        output.push(edge.intersect(previous, current));
      }
      if (currentInside) output.push(current);
      previous = current;
      previousInside = currentInside;
    }
    clipped = output;
  }
  return clipped;
}

function intersectVertical(a, b, x) {
  const denominator = b.x - a.x;
  if (Math.abs(denominator) < EPSILON) return { x, y: a.y };
  const t = (x - a.x) / denominator;
  return { x, y: a.y + (b.y - a.y) * t };
}

function intersectHorizontal(a, b, y) {
  const denominator = b.y - a.y;
  if (Math.abs(denominator) < EPSILON) return { x: a.x, y };
  const t = (y - a.y) / denominator;
  return { x: a.x + (b.x - a.x) * t, y };
}

function polygonArea(polygon) {
  if (polygon.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area) / 2;
}

function signature(keys) {
  const n = keys.length;
  let min = 0;
  for (let i = 1; i < n; i++) {
    if (keys[i] < keys[min]) min = i;
  }
  const fwd = [];
  const bwd = [];
  for (let i = 0; i < n; i++) {
    fwd.push(keys[(min + i) % n]);
    bwd.push(keys[(min - i + n) % n]);
  }
  const fwdStr = fwd.join('|');
  const bwdStr = bwd.join('|');
  return fwdStr < bwdStr ? fwdStr : bwdStr;
}

function round(v) {
  return Math.round(v / EPSILON) * EPSILON;
}
