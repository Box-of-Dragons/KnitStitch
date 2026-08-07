import {state, StateStream, Stream, stream} from 'lstream';

export interface SketcherStreams {
  selection: StateStream<any[]>;
  addingRoleMode: StateStream<any>;
  objectsUpdate: StateStream<any>;
  objects: StateStream<any>;
  objectUpdate: Stream<any>;
  dimScale: StateStream<number>;
  tool: { $change: Stream<any>; $message: Stream<any>; $hint: Stream<any> };
  knitting: {
    cellWidthPx: StateStream<number>;
    cellHeightPx: StateStream<number>;
    stitchesPer4Inches: StateStream<number>;
    rowsPer4Inches: StateStream<number>;
    fillThreshold: StateStream<number>;
    filledCells: StateStream<Set<string>>;
    cellFillEnabled: StateStream<boolean>;
    finishedWidth: StateStream<number>;
    finishedHeight: StateStream<number>;
  };
}

export default function(viewer): SketcherStreams {

  const streams: any = {
  };

  streams.objectsUpdate = stream();
  streams.objects = streams.objectsUpdate.throttle().map(() => {
    const objects = [];
    viewer.layers.forEach(l => l.objects.forEach(o => objects.push(o)));
    return objects;
  }).remember([]);

  streams.addingRoleMode = state(null);
  streams.selection = state([]);
  streams.objectUpdate = stream();
  streams.dimScale = state(1);
  streams.tool = {
    $change: stream(),
    $message: stream(),
    $hint: stream()
  };

  streams.knitting = {
    cellWidthPx: state(20),
    cellHeightPx: state(28),
    stitchesPer4Inches: state(20),
    rowsPer4Inches: state(28),
    fillThreshold: state(0.5),
    filledCells: state(new Set()),
    cellFillEnabled: state(false),
    finishedWidth: state(0),
    finishedHeight: state(0),
  };

  return streams as SketcherStreams;
}