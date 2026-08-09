import { deleteSketchSelection } from './deleteSketchSelection.js';

export function deleteSelected(service, ) {
    if (!service.hasSelection) return;
    service._recordSnapshot('Delete selection');
    const sketch = service.store.state.sketch;
    const { dimsToRemove, linesToRemove, removedPoints } = deleteSketchSelection({
      sketch,
      selectedLines: service._selectedLines,
      selectedPoints: service._selectedPoints,
    });

    for (const point of service._selectedPoints) {
      service._removeOrphanPoint(point);
    }
    for (const line of linesToRemove) {
      service._removeOrphanPoint(line.start);
      service._removeOrphanPoint(line.end);
    }
    for (const dim of dimsToRemove) {
      service._removeOrphanPoint(dim.a);
      service._removeOrphanPoint(dim.b);
    }
    // Remove orphaned points from rectangle/circle deletion that weren't
    // already caught by the line-endpoint cleanup above (e.g. circle centers,
    // rectangle centers that are only connected via midpoint constraints).
    for (const point of removedPoints) {
      service._removeOrphanPoint(point);
    }

    // Final pass: any point no longer referenced by a line, dimension,
    // constraint, or bezier is now an orphan and can be removed.
    const allPoints = [...sketch.points];
    for (const point of allPoints) {
      service._removeOrphanPoint(point);
    }

    // Drop any constraints/dimensions/circles/lines that now reference
    // removed points.
    const pointSet = new Set(sketch.points);
    sketch.constraints = sketch.constraints.filter((c) =>
      (!c.pointA || pointSet.has(c.pointA)) && (!c.pointB || pointSet.has(c.pointB)),
    );
    sketch.dimensions = sketch.dimensions.filter((d) =>
      pointSet.has(d.a) && pointSet.has(d.b),
    );
    sketch.circles = (sketch.circles || []).filter((c) => pointSet.has(c.center));

    service._selectedPoints.clear();
    service._selectedLines.clear();
    service._setSnapCandidate(null);
    service._rebuildObjects();
    service._flushSketchArrays();
}
export function getHasSelection(service) {
    const sketch = service.store.state.sketch;
    return service._selectedPoints.size > 0
      || service._selectedLines.size > 0
      || sketch.dimensions.some((d) => d.isSelected)
      || sketch.constraints.some((c) => c?.isSelected)
      || (sketch.circles || []).some((c) => c.isSelected)
      || (sketch.beziers || []).some((b) => b.isSelected);
}