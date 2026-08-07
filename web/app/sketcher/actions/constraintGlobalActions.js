import {runActionOrToastWhyNot, startOperation} from "./index";
import {
  AngleBetweenConstraintIcon, AngleConstraintIcon,
  CoincidentConstraintIcon, DistanceConstraintIcon,
  DistancePLConstraintIcon, EqualConstraintIcon, FilletConstraintIcon,
  HorizontalConstraintIcon, LockConstraintIcon,
  ParallelConstraintIcon,
  PerpendicularConstraintIcon, PointInMiddleConstraintIcon, PointOnCurveConstraintIcon,
  PointOnLineConstraintIcon, RadiusConstraintIcon, SymmetryConstraintIcon, TangentConstraintIcon,
  VerticalConstraintIcon
} from "../icons/constraints/ConstraintIcons";
import {toast} from "react-toastify";
import {MirrorGeneratorIcon} from "../icons/generators/GeneratorIcons";

export default [

  {
    id: 'CoincidentGlobal',
    shortName: 'Coincident',
    kind: 'Constraint',
    description: 'Point coincident constraint',
    icon: CoincidentConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Coincident', ctx,)
    }
  },

  {
    id: 'VerticalGlobal',
    shortName: 'Vertical',
    kind: 'Constraint',
    description: 'Vertical constraint',
    icon: VerticalConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Vertical', ctx);
    }
  },

  {
    id: 'HorizontalGlobal',
    shortName: 'Horizontal',
    kind: 'Constraint',
    description: 'Horizontal constraint',
    icon: HorizontalConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Horizontal', ctx);
    }
  },

  {
    id: 'ParallelGlobal',
    shortName: 'Parallel',
    kind: 'Constraint',
    description: 'Parallel constraint',
    icon: ParallelConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Parallel', ctx);
    }
  },

  {
    id: 'PerpendicularGlobal',
    shortName: 'Perpendicular',
    kind: 'Constraint',
    description: 'Perpendicular constraint',
    icon: PerpendicularConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Perpendicular', ctx);
    }
  },

  {
    id: 'DistancePLGlobal',
    shortName: 'Dist PL',
    kind: 'Constraint',
    description: 'Distance between point and line',
    icon: DistancePLConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('DistancePL', ctx);
    }
  },

  {
    id: 'DistanceGlobal',
    shortName: 'Dist PP',
    kind: 'Constraint',
    description: 'Distance between two points',
    icon: DistanceConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('DistancePP', ctx);
    }
  },

  {
    id: 'EntityEqualityGlobal',
    shortName: 'Equal',
    kind: 'Constraint',
    description: 'Equal length or equal radius',
    icon: EqualConstraintIcon,

    invoke: (ctx) => {
      const fail1 = runActionOrToastWhyNot('EqualRadius', ctx, true);
      const fail2 = runActionOrToastWhyNot('EqualLength', ctx, true);
      if (fail1 && fail2) {
        toast('Requires selection of either segments or circles and arcs');
      }
    }
  },

  {
    id: 'PointOnLineGlobal',
    shortName: 'On Line',
    kind: 'Constraint',
    description: 'Point on line',
    icon: PointOnLineConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('PointOnLine', ctx);
    }
  },

  {
    id: 'TangentGlobal',
    shortName: 'Tangent',
    kind: 'Constraint',
    description: 'Tangent between different curves',
    icon: TangentConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Tangent', ctx);
    }
  },

  {
    id: 'RadiusGlobal',
    shortName: 'Radius',
    kind: 'Constraint',
    description: 'Radius of a circle or arc',
    icon: RadiusConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('RadiusLength', ctx);
    }
  },

  {
    id: 'PointOnCurveGlobal',
    shortName: 'On Curve',
    kind: 'Constraint',
    description: 'Point on curve',
    icon: PointOnCurveConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('PointOnCircle', ctx);
    }
  },

  {
    id: 'PointInMiddleGlobal',
    shortName: 'Midpoint',
    kind: 'Constraint',
    description: 'Point in middle',
    icon: PointInMiddleConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('PointInMiddle', ctx);
    }
  },

  {
    id: 'SymmetryGlobal',
    shortName: 'Symmetry',
    kind: 'Constraint',
    description: 'Symmetry',
    icon: SymmetryConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Symmetry', ctx);
    }
  },

  {
    id: 'AngleBetweenGlobal',
    shortName: 'Angle Between',
    kind: 'Constraint',
    description: 'Angle between',
    icon: AngleBetweenConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('AngleBetween', ctx);
    }
  },

  {
    id: 'AngleGlobal',
    shortName: 'Angle',
    kind: 'Constraint',
    description: 'Angle of a line',
    icon: AngleConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Angle', ctx);
    }
  },

  {
    id: 'LockGlobal',
    shortName: 'Lock',
    kind: 'Constraint',
    description: 'Locks a point',
    icon: LockConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Lock', ctx);
    }
  },

  {
    id: 'FilletGlobal',
    shortName: 'Fillet',
    kind: 'Constraint',
    description: 'Make a fillet',
    icon: FilletConstraintIcon,

    invoke: (ctx) => {
      runActionOrToastWhyNot('Fillet', ctx);
    }
  },

  {
    id: 'MirrorStart',
    shortName: 'Mirror',
    kind: 'Constraint',
    description: 'Adds mirror generator',
    icon: MirrorGeneratorIcon,

    invoke: (ctx) => {
      startOperation(ctx, 'Mirror');
    }
  },

]

