import React from 'react';
import {
  Circle,
  CircleDashed,
  CircleDot,
  Compass,
  Dot,
  Ellipse,
  MoveHorizontal,
  MoveVertical,
  PenLine,
  RulerDimensionLine,
  Slash,
  Spline,
  Square,
  DraftingCompass,
} from 'lucide-react';

export function MeasureCircleToolIcon(props) {
  return <CircleDot size={16} strokeWidth={1.8} {...props}/>
}

export function MeasureFreeToolIcon(props) {
  return <RulerDimensionLine size={16} strokeWidth={1.8} {...props}/>
}

export function MeasureHorizontalToolIcon(props) {
  return <MoveHorizontal size={16} strokeWidth={1.8} {...props}/>
}

export function MeasureVerticalToolIcon(props) {
  return <MoveVertical size={16} strokeWidth={1.8} {...props}/>
}

export function MeasureAngleBetweenAngle(props) {
  return <DraftingCompass size={16} strokeWidth={1.8} {...props}/>
}

export function RectangleToolIcon(props) {
  return <Square size={16} strokeWidth={1.8} {...props}/>
}

export function BezierToolIcon(props) {
  return <Spline size={16} strokeWidth={1.8} {...props}/>
}

export function EllipseArcToolIcon(props) {
  return <CircleDashed size={16} strokeWidth={1.8} {...props}/>
}

export function EllipseToolIcon(props) {
  return <Ellipse size={16} strokeWidth={1.8} {...props}/>
}

export function ArcToolIcon(props) {
  return <CircleDashed size={16} strokeWidth={1.8} {...props}/>
}

export function CircleToolIcon(props) {
  return <Circle size={16} strokeWidth={1.8} {...props}/>
}

export function MultiLineToolIcon(props) {
  return <PenLine size={16} strokeWidth={1.8} {...props}/>
}

export function LineToolIcon(props) {
  return <Slash size={16} strokeWidth={1.8} {...props}/>
}

export function PointToolIcon(props) {
  return <Dot size={16} strokeWidth={1.8} {...props}/>
}
