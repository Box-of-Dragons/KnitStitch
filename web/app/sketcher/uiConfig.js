import measureActions from "./actions/measureActions";
import objectToolActions from "./actions/objectToolActions";
import commonActions from "./actions/commonActions";
import {insertAfter, removeInPlace} from "gems/iterables";
import generalToolActions from "./actions/generalToolActions";

export const sketcherRightToolbarConfig = [
  'CoincidentGlobal',
  'VerticalGlobal',
  'HorizontalGlobal',
  'ParallelGlobal',
  'PerpendicularGlobal',
  '-',
  'DistancePLGlobal',
  'DistanceGlobal',
  'EntityEqualityGlobal',
  '-',
  'PointOnLineGlobal',
  'TangentGlobal',
  'RadiusGlobal',
  'PointOnCurveGlobal',
  'PointInMiddleGlobal',
  'SymmetryGlobal',
  '-',
  'AngleBetweenGlobal',
  'AngleGlobal',
  '-',
  'LockGlobal',
  'FilletGlobal',
  'MirrorStart',
];

export const sketcherTopToolbarConfig = [
  ...commonActions.map(a => a.id),
  ...generalToolActions.map(a => a.id),
  ...objectToolActions.map(a => a.id),
  'Offset',
  '-',
  ...measureActions.map(a => a.id)
];

insertAfter(sketcherTopToolbarConfig, 'Export', '-');
insertAfter(sketcherTopToolbarConfig, 'PanTool', '-');
insertAfter(sketcherTopToolbarConfig, 'BezierTool', '-');
insertAfter(sketcherTopToolbarConfig, 'New', 'Clear');

removeInPlace(sketcherTopToolbarConfig, 'ToggleTerminal');
