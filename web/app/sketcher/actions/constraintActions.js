import {AlgNumConstraint, ConstraintDefinitions} from "../constr/ANConstraints";
import {EndPoint} from "../shapes/point";
import {Circle} from "../shapes/circle";
import {Segment} from "../shapes/segment";
import {isInstanceOf, matchAll, matchTypes} from "./matchUtils";
import {Arc} from "../shapes/arc";
import {FilletTool} from "../tools/fillet";
import {showConstraintEditorUI} from "../components/ConstraintEditor";
import {BezierCurve} from "../shapes/bezier-curve";
import {
  AngleBetweenConstraintIcon,
  AngleConstraintIcon,
  CoincidentConstraintIcon,
  DistanceConstraintIcon,
  DistancePLConstraintIcon,
  EqualConstraintIcon, FilletConstraintIcon,
  HorizontalConstraintIcon,
  LockConstraintIcon,
  ParallelConstraintIcon,
  PerpendicularConstraintIcon,
  PointInMiddleConstraintIcon,
  PointOnCurveConstraintIcon,
  PointOnLineConstraintIcon,
  RadiusConstraintIcon,
  SymmetryConstraintIcon,
  TangentConstraintIcon,
  VerticalConstraintIcon
} from "../icons/constraints/ConstraintIcons";

export default [


  {
    id: 'Coincident',
    shortName: 'Coincident',
    kind: 'Constraint',
    description: 'Point coincident',
    icon: CoincidentConstraintIcon,
    selectionMatcher: {
      selector: 'matchAll',
      types: [EndPoint],
      minQuantity: 2
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const [first, ...others] = matchedObjects;
      const pm = viewer.parametricManager;
      for (const obj of others) {
        pm._add(
          new AlgNumConstraint(ConstraintDefinitions.PCoincident, [first, obj])
        );
      }
      pm.commit();
    }
  },

  {
    id: 'Tangent',
    shortName: 'Tangent',
    kind: 'Constraint',
    description: 'Tangent between line and circle',
    icon: TangentConstraintIcon,
    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [Circle, Arc, BezierCurve],
          quantity: 1
        },
        {
          types: [Segment],
          quantity: 1
        },
      ]
    },

    invoke: (ctx, matchedObjects) => {

      const {viewer} = ctx;
      const [curve, line] = matchedObjects;
      let constraint;
      if (isInstanceOf(curve, BezierCurve) ) {
        constraint = new AlgNumConstraint(ConstraintDefinitions.TangentLineBezier, [line, curve]);
      } else {
        constraint = new AlgNumConstraint(ConstraintDefinitions.TangentLC, [line, curve]);
      }
      constraint.initConstants();
      const pm = viewer.parametricManager;
      pm.add(constraint);
    }

  },

  {
    id: 'EqualRadius',
    shortName: 'Equal Radius',
    kind: 'Constraint',
    description: 'Equal radius between two circles',
    icon: EqualConstraintIcon,
    selectionMatcher: {
      selector: 'matchAll',
      types: [Circle, Arc],
      minQuantity: 2
    },

    invoke: (ctx, matchedObjects) => {

      const {viewer} = ctx;

      const pm = viewer.parametricManager;
      for (let i = 1; i < matchedObjects.length; ++i) {
        pm._add(new AlgNumConstraint(ConstraintDefinitions.EqualRadius, [matchedObjects[i-1], matchedObjects[i]]));
      }
      pm.commit();
    }

  },

  {
    id: 'EqualLength',
    shortName: 'Equal Length',
    kind: 'Constraint',
    description: 'Equal length between two segments',
    icon: EqualConstraintIcon,
    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 2
    },
    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const pm = viewer.parametricManager;
      for (let i = 1; i < matchedObjects.length; ++i) {
        pm._add(new AlgNumConstraint(ConstraintDefinitions.EqualLength, [matchedObjects[i-1], matchedObjects[i]]));
      }
      pm.commit();
    }

  },

  {
    id: 'PointOnLine',
    shortName: 'On Line',
    kind: 'Constraint',
    description: 'Point on line',
    icon: PointOnLineConstraintIcon,
    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 1
        },
        {
          types: [Segment],
          quantity: 1
        },
      ]
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const [pt, line] = matchedObjects;
      const pm = viewer.parametricManager;
      pm.add(new AlgNumConstraint(ConstraintDefinitions.PointOnLine, [pt, line]));
    }
  },

  {
    id: 'PointOnCircle',
    shortName: 'On Circle',
    kind: 'Constraint',
    description: 'Point on circle',
    icon: PointOnCurveConstraintIcon,
    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 1
        },
        {
          types: [Circle, Arc],
          quantity: 1
        },
      ]
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const [pt, circle] = matchedObjects;
      const pm = viewer.parametricManager;
      pm.add(new AlgNumConstraint(ConstraintDefinitions.PointOnCircle, [pt, circle]));
    }
  },

  {
    id: 'PointOnCurve',
    shortName: 'On Curve',
    kind: 'Constraint',
    description: 'Point on curve',
    icon: PointOnCurveConstraintIcon,
    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 1
        },
        {
          types: [BezierCurve],
          quantity: 1
        },
      ]
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const [pt, curve] = matchedObjects;
      const pm = viewer.parametricManager;
      pm.add(new AlgNumConstraint(ConstraintDefinitions.PointOnBezier, [pt, curve]));
    }
  },

  {
    id: 'PointInMiddle',
    shortName: 'Midpoint',
    kind: 'Constraint',
    description: 'Point in the middle',
    icon: PointInMiddleConstraintIcon,
    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 1
        },
        {
          types: [Segment],
          quantity: 1
        },
      ]
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      viewer.parametricManager.add(new AlgNumConstraint(ConstraintDefinitions.PointInMiddle, matchedObjects));
    }
  },

  {
    id: 'Symmetry',
    shortName: 'Symmetry',
    kind: 'Constraint',
    description: 'Symmetry of two points against middle point',
    icon: SymmetryConstraintIcon,
    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 1
        },
        {
          types: [Segment],
          quantity: 1
        },
      ]
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      viewer.parametricManager.add(new AlgNumConstraint(ConstraintDefinitions.Symmetry, matchedObjects));
    }
  },

  {
    id: 'Angle',
    shortName: 'Angle',
    kind: 'Constraint',
    description: 'Angle',
    icon: AngleConstraintIcon,
    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 1
    },
    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const firstSegment = matchedObjects[0];

      const firstConstr = new AlgNumConstraint(ConstraintDefinitions.Angle, [firstSegment]);
      firstConstr.initConstants();

      editConstraint(ctx, firstConstr, () => {
        const pm = viewer.parametricManager;
        pm._add(firstConstr);
        for (let i = 1; i < matchedObjects.length; ++i) {
          pm._add(new AlgNumConstraint(ConstraintDefinitions.Angle, [matchedObjects[i]], {...firstConstr.constants}));
        }
        pm.commit();
      });
    }
  },

  {
    id: 'Vertical',
    shortName: 'Vertical',
    kind: 'Constraint',
    description: 'Vertical',
    icon: VerticalConstraintIcon,

    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 1
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const pm = viewer.parametricManager;

      matchedObjects.forEach(obj => {
        const constr = new AlgNumConstraint(ConstraintDefinitions.Vertical, [obj]);
        constr.initConstants();
        pm._add(constr);
      });
      pm.commit();
    }
  },

  {
    id: 'Horizontal',
    shortName: 'Horizontal',
    kind: 'Constraint',
    description: 'Horizontal',
    icon: HorizontalConstraintIcon,

    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 1
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const pm = viewer.parametricManager;

      matchedObjects.forEach(obj => {
        const constr = new AlgNumConstraint(ConstraintDefinitions.Horizontal, [obj]);
        constr.initConstants();
        pm._add(constr);
      });
      pm.commit();
    }
  },

  {
    id: 'AngleBetween',
    shortName: 'Angle Between',
    kind: 'Constraint',
    description: 'Angle between lines',
    icon: AngleBetweenConstraintIcon,

    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 2
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const [firstSegment, secondSegment] = matchedObjects;

      const firstConstr = new AlgNumConstraint(ConstraintDefinitions.AngleBetween, [firstSegment, secondSegment]);
      firstConstr.initConstants();

      editConstraint(ctx, firstConstr, () => {
        const pm = viewer.parametricManager;
        pm._add(firstConstr);
        for (let i = 2; i < matchedObjects.length; ++i) {
          pm._add(new AlgNumConstraint(ConstraintDefinitions.Angle,
            [matchedObjects[i-1], matchedObjects[i]], {...firstConstr.constants}));
        }
        pm.commit();
      });
    }
  },

  {
    id: 'Perpendicular',
    shortName: 'Perpendicular',
    kind: 'Constraint',
    description: 'Perpendicularity between two or more lines',
    icon: PerpendicularConstraintIcon,

    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 2
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const pm = viewer.parametricManager;

      for (let i = 1; i < matchedObjects.length; ++i) {
        const constr = new AlgNumConstraint(ConstraintDefinitions.Perpendicular, [matchedObjects[i-1], matchedObjects[i]]);
        constr.initConstants();
        pm._add(constr);
      }
      pm.commit();
    }
  },

  {
    id: 'Parallel',
    shortName: 'Parallel',
    kind: 'Constraint',
    description: 'Parallelism between two or more lines',
    icon: ParallelConstraintIcon,

    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 2
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const pm = viewer.parametricManager;

      for (let i = 1; i < matchedObjects.length; ++i) {
        const constr = new AlgNumConstraint(ConstraintDefinitions.Parallel, [matchedObjects[i-1], matchedObjects[i]]);
        constr.initConstants();
        pm._add(constr);
      }
      pm.commit();
    }
  },

  {
    id: 'Length',
    shortName: 'Length',
    kind: 'Constraint',
    description: 'Segment length',
    icon: DistanceConstraintIcon,

    selectionMatcher: {
      selector: 'matchAll',
      types: [Segment],
      minQuantity: 1
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const [firstSegment, ...others] = matchedObjects;

      const firstConstr = new AlgNumConstraint(ConstraintDefinitions.SegmentLength, [firstSegment]);
      firstConstr.initConstants();

      editConstraint(ctx, firstConstr, () => {
        const pm = viewer.parametricManager;
        pm._add(firstConstr);
        for (const other of others) {
          pm._add(new AlgNumConstraint(ConstraintDefinitions.SegmentLength, [other], {...firstConstr.constants}));
        }
        pm.commit();
      });
    }
  },

  {
    id: 'RadiusLength',
    shortName: 'Radius',
    kind: 'Constraint',
    description: 'Radius length',
    icon: RadiusConstraintIcon,

    selectionMatcher: {
      selector: 'matchAll',
      types: [Circle, Arc],
      minQuantity: 1
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const [firstCircle, ...others] = matchedObjects;

      const firstConstr = new AlgNumConstraint(ConstraintDefinitions.RadiusLength, [firstCircle]);
      firstConstr.initConstants();

      editConstraint(ctx, firstConstr, () => {
        const pm = viewer.parametricManager;
        pm._add(firstConstr);
        for (const other of others) {
          pm._add(new AlgNumConstraint(ConstraintDefinitions.RadiusLength, [other], {...firstConstr.constants}));
        }
        pm.commit();
      });
    }
  },

  {
    id: 'DistancePL',
    shortName: 'Dist PL',
    kind: 'Constraint',
    description: 'Distance between point and line',
    icon: DistancePLConstraintIcon,

    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 1
        },
        {
          types: [Segment],
          quantity: 1
        },
      ]
    },


    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const [pt, seg] = matchedObjects;

      const constr = new AlgNumConstraint(ConstraintDefinitions.DistancePL, [pt, seg]);
      constr.initConstants();

      editConstraint(ctx, constr, () => {
        const pm = viewer.parametricManager;
        pm.add(constr);
      });
    }
  },

  {
    id: 'DistancePP',
    shortName: 'Dist PP',
    kind: 'Constraint',
    description: 'Distance between two points',
    icon: DistanceConstraintIcon,

    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 2
        }
      ]
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const [p1, p2] = matchedObjects;

      const constr = new AlgNumConstraint(ConstraintDefinitions.DistancePP, [p1, p2]);
      constr.initConstants();

      editConstraint(ctx, constr, () => {
        const pm = viewer.parametricManager;
        pm.add(constr);
      });
    }
  },

  {
    id: 'Lock',
    shortName: 'Lock',
    kind: 'Constraint',
    description: 'Lock point',
    icon: LockConstraintIcon,

    selectionMatcher: {
      selector: 'matchSequence',
      sequence: [
        {
          types: [EndPoint],
          quantity: 1
        }
      ]
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;

      const [point] = matchedObjects;

      const constr = new AlgNumConstraint(ConstraintDefinitions.LockPoint, [point]);
      constr.initConstants();
      editConstraint(ctx, constr, () => viewer.parametricManager.add(constr));
    }
  },

  {
    id: 'Fillet',
    shortName: 'Fillet',
    kind: 'Tool',
    description: 'Make a fillet',
    icon: FilletConstraintIcon,

    selectionMatcher: {
      selector: 'function',
      match: (selection) => {
        if (matchTypes(selection, EndPoint, 1)) {
          const [point] = selection;
          if (isInstanceOf(point.parent, Segment)) {
            let pair = null;
            point.visitLinked(l => {
              if (l !== point && isInstanceOf(l.parent, Segment)) {
                pair = l;
                return true;
              }
            });
            if (pair) {
              return true;
            }
          }
        }
        return false;
      },
      description: 'a point linking two segment'
    },

    invoke: (ctx, matchedObjects) => {
      const {viewer} = ctx;
      const filletTool = new FilletTool(ctx.viewer);
      const cands = filletTool.getCandidateFromSelection(viewer.selected);
      if (cands) {
        filletTool.breakLinkAndMakeFillet(cands[0], cands[1]);
      }

    }
  },

];

export function editConstraint(ctx, constraint, onApply) {
  showConstraintEditorUI(ctx.ui.$constraintEditRequest, constraint, onApply)
}