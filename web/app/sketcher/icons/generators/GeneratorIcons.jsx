import React from 'react';
import {Copy, FlipHorizontal} from 'lucide-react';

export function MirrorGeneratorIcon(props) {
  return <FlipHorizontal size={16} strokeWidth={1.8} {...props} />
}

export function OffsetGeneratorIcon(props) {
  return <Copy size={16} strokeWidth={1.8} {...props} />
}
