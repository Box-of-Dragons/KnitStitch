import React from 'react';
import {
  ArrowLeftRight,
  ArrowUpDown,
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  Circle,
  CircleDashed,
  CircleDot,
  CircleQuestionMark,
  Compass,
  CornerDownLeft,
  CornerDownRight,
  DraftingCompass,
  Equal,
  FlipHorizontal,
  Link,
  Link2,
  LineSquiggle,
  Lock,
  Merge,
  MoveHorizontal,
  MoveVertical,
  RulerDimensionLine,
  CircleSlash2,
} from 'lucide-react';

export function CoincidentConstraintIcon(props) {
  return <Link size={16} strokeWidth={1.8} {...props} />
}

export function DistancePLConstraintIcon(props) {
  return <BetweenHorizontalEnd size={16} strokeWidth={1.8} {...props} />
}

export function HorizontalConstraintIcon(props) {
  return <ArrowLeftRight size={16} strokeWidth={1.8} {...props} />
}

export function ParallelConstraintIcon(props) {
  return <BetweenHorizontalStart size={16} strokeWidth={1.8} {...props} />
}

export function PerpendicularConstraintIcon(props) {
  return <CornerDownRight size={16} strokeWidth={1.8} {...props} />
}

export function PointOnLineConstraintIcon(props) {
  return <Link size={16} strokeWidth={1.8} {...props} />
}

export function VerticalConstraintIcon(props) {
  return <ArrowUpDown size={16} strokeWidth={1.8} {...props} />
}

export function DistanceConstraintIcon(props) {
  return <RulerDimensionLine size={16} strokeWidth={1.8} {...props} />
}

export function EqualConstraintIcon(props) {
  return <Equal size={16} strokeWidth={1.8} {...props} />
}

export function TangentConstraintIcon(props) {
  return <Merge size={16} strokeWidth={1.8} {...props} />
}

export function RadiusConstraintIcon(props) {
  return <Circle size={16} strokeWidth={1.8} {...props} />
}

export function PointOnCurveConstraintIcon(props) {
  return <LineSquiggle size={16} strokeWidth={1.8} {...props} />
}

export function PointInMiddleConstraintIcon(props) {
  return <CircleDot size={16} strokeWidth={1.8} {...props} />
}

export function SymmetryConstraintIcon(props) {
  return <FlipHorizontal size={16} strokeWidth={1.8} {...props} />
}

export function AngleBetweenConstraintIcon(props) {
  return <DraftingCompass size={16} strokeWidth={1.8} {...props} />
}

export function AngleConstraintIcon(props) {
  return <Compass size={16} strokeWidth={1.8} {...props} />
}

export function LockConstraintIcon(props) {
  return <Lock size={16} strokeWidth={1.8} {...props} />
}

export function FilletConstraintIcon(props) {
  return <CornerDownLeft size={16} strokeWidth={1.8} {...props} />
}

export function GenericConstraintIcon(props) {
  return <CircleQuestionMark size={16} strokeWidth={1.8} {...props} />
}
