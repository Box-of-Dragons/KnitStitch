const MIN_CIRCLE_RADIUS = 2;
const DRAG_THRESHOLD_PX = 4;

function requiresLiveSolve(sketch, movedPoints) {
  const touches = (point) => point && movedPoints.has(point);
  const touchesLine = (line) => line && (touches(line.start) || touches(line.end));

  return (sketch.dimensions || []).some((dimension) =>
    dimension.isConstrained && (touches(dimension.a) || touches(dimension.b)))
    || (sketch.constraints || []).some((constraint) =>
      touches(constraint.pointA)
      || touches(constraint.pointB)
      || touchesLine(constraint.lineA)
      || touchesLine(constraint.lineB));
}

export function startDrag(service, position, modifiers = {}) {
  const explicitTarget = modifiers.target ?? null;
  // Direct service calls (unit tests and integrations) do not have a stage
  // hit result. UI events always pass `target`, including null, so they can
  // never accidentally pick up a nearby entity.
  const hasExplicitTarget = Object.hasOwn(modifiers, 'target');
  const nearPoint = explicitTarget?.point
    ?? (!hasExplicitTarget ? service._findNearestPoint(position, modifiers.snapEnabled !== false) : null);
    if (nearPoint) {
      // A point was found under the cursor. If it's an anchor, don't drag
      // it (and don't fall through to line-dragging either — clicking a
      // fixed point and dragging should do nothing, matching Fusion 360).
      if (!nearPoint.isAnchor) {
        service._dragPoint = nearPoint;
        service._dragLine = null;
        service._dragCircle = null;
        service._dragStartPointer = { x: position.x, y: position.y };
        service._dragHasMoved = false;
        service._dragLineStartPos = null;
        service.store.set('sketch.isDragging', true);
        service.selectPoint(nearPoint);
        service._history.beginDrag();
      } else {
        service.store.set('sketch.isDragging', false);
      }
      return;
    }

  const nearCircle = explicitTarget?.circle ?? null;
    if (nearCircle) {
      service._dragPoint = null;
      service._dragLine = null;
      service._dragLineStartPos = null;
      service._dragLineStart = null;
      service._dragLineEnd = null;
      service._dragCircle = nearCircle;
      service._dragStartPointer = { x: position.x, y: position.y };
      service._dragHasMoved = false;
      service._dragCircleStartPos = { x: position.x, y: position.y };
      service._dragCircleStartRadius = nearCircle.radius;
      service.store.set('sketch.isDragging', true);
      service.selectCircle(nearCircle);
      service._history.beginDrag();
      return;
    }

  const nearLine = explicitTarget?.line ?? null;
    if (nearLine) {
      service._dragPoint = null;
      service._dragLine = nearLine;
      service._dragCircle = null;
      service._dragStartPointer = { x: position.x, y: position.y };
      service._dragHasMoved = false;
      service._dragLineStartPos = { x: position.x, y: position.y };
      service._dragLineStart = { x: nearLine.start.x, y: nearLine.start.y };
      service._dragLineEnd = { x: nearLine.end.x, y: nearLine.end.y };
      service._dragCircleStartPos = null;
      service._dragCircleStartRadius = null;
      service.store.set('sketch.isDragging', true);
      service.selectLine(nearLine);
      service._history.beginDrag();
      return;
    }

    service._dragPoint = null;
    service._dragLine = null;
    service._dragLineStartPos = null;
    service._dragLineStart = null;
    service._dragLineEnd = null;
    service._dragCircle = null;
    service._dragStartPointer = null;
    service._dragHasMoved = false;
    service._dragCircleStartPos = null;
    service._dragCircleStartRadius = null;
    service.store.set('sketch.isDragging', false);
    service._history.cancelDrag();
}
export function onCanvasMouseUp(service, ) {
    service._history.endDrag();
    const draggedPoint = service._dragPoint;
    const draggedLine = service._dragLine;
    const draggedCircle = service._dragCircle;
    const dragHasMoved = service._dragHasMoved;
    service._dragPoint = null;
    service._dragLine = null;
    service._dragLineStartPos = null;
    service._dragLineStart = null;
    service._dragLineEnd = null;
    service._dragCircle = null;
    service._dragStartPointer = null;
    service._dragHasMoved = false;
    service._dragCircleStartPos = null;
    service._dragCircleStartRadius = null;

    if (!dragHasMoved) {
      service.store.set('sketch.isDragging', false);
      return;
    }

    if (draggedPoint) {
      // Recompute dimension kinds once the drag is finished so Horizontal/Vertical
      // kinds only take effect after the user has released the point.
      for (const dim of service.store.state.sketch.dimensions) dim.recompute();
      const movedPoints = new Set([draggedPoint]);
      if (requiresLiveSolve(service.store.state.sketch, movedPoints)) {
        service._solve(service.store.state.sketch, movedPoints);
      }
      service._flushSketchArrays();
      service._rebuildObjects();
    } else if (draggedLine) {
      for (const dim of service.store.state.sketch.dimensions) dim.recompute();
      const movedPoints = new Set([draggedLine.start, draggedLine.end]);
      service._solve(service.store.state.sketch, movedPoints);
      service._flushSketchArrays();
      service._rebuildObjects();
    } else if (draggedCircle) {
      for (const dim of service.store.state.sketch.dimensions) dim.recompute();
      service._solve(service.store.state.sketch, new Set(), new Set([draggedCircle]));
      service._flushSketchArrays();
      service._rebuildObjects();
    }
    service.store.set('sketch.isDragging', false);
}
export function onSelectMouseMove(service, position) {
    if (!service._dragHasMoved && service._dragStartPointer) {
      const dx = position.x - service._dragStartPointer.x;
      const dy = position.y - service._dragStartPointer.y;
      if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD_PX) {
        return;
      }
      service._dragHasMoved = true;
    }

    if (service._dragPoint && !service._dragPoint.isAnchor) {
      service._dragPoint.x = position.x;
      service._dragPoint.y = position.y;

      const movedPoints = new Set([service._dragPoint]);
      service._solve(service.store.state.sketch, movedPoints);

      service._assignConstraintIds();
      // During a drag, preserve the dimension kind so the solver doesn't switch a
      // dimension to Horizontal/Vertical and lock the line before the user releases.
      for (const dim of service.store.state.sketch.dimensions) dim.recompute(true);

      service._flushSketchArrays();
      return;
    }

    if (service._dragCircle) {
      const dx = position.x - service._dragCircle.center.x;
      const dy = position.y - service._dragCircle.center.y;
      service._dragCircle.radius = Math.max(MIN_CIRCLE_RADIUS, Math.sqrt(dx * dx + dy * dy));

      const movedPoints = new Set([service._dragCircle.center]);
      if (requiresLiveSolve(service.store.state.sketch, movedPoints)) {
        service._solve(service.store.state.sketch, movedPoints, new Set([service._dragCircle]));
      }

      service._assignConstraintIds();
      for (const dim of service.store.state.sketch.dimensions) dim.recompute(true);

      service._flushSketchArrays();
      return;
    }

    if (service._dragLine && service._dragLineStartPos) {
      const dx = position.x - service._dragLineStartPos.x;
      const dy = position.y - service._dragLineStartPos.y;

      if (!service._dragLine.start.isAnchor) {
        service._dragLine.start.x = service._dragLineStart.x + dx;
        service._dragLine.start.y = service._dragLineStart.y + dy;
      }
      if (!service._dragLine.end.isAnchor) {
        service._dragLine.end.x = service._dragLineEnd.x + dx;
        service._dragLine.end.y = service._dragLineEnd.y + dy;
      }

      const movedPoints = new Set();
      if (!service._dragLine.start.isAnchor) movedPoints.add(service._dragLine.start);
      if (!service._dragLine.end.isAnchor) movedPoints.add(service._dragLine.end);

      if (movedPoints.size > 0 && requiresLiveSolve(service.store.state.sketch, movedPoints)) {
        service._solve(service.store.state.sketch, movedPoints);
      }

      service._assignConstraintIds();
      for (const dim of service.store.state.sketch.dimensions) dim.recompute(true);

      service._flushSketchArrays();
    }
}
