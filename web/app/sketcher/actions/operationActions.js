import {Generator} from "../id-generator";
import {SketchGenerator} from "../generators/sketchGenerator";
import {MirrorGeneratorSchema} from "../generators/mirrorGenerator";
import {Copy, FlipHorizontal} from "lucide-react";
import {OffsetTool} from "../tools/offset";

export default [

  {
    id: 'Mirror',
    shortName: 'Mirror',
    kind: 'Generator',
    description: 'Mirror Objects',
    icon: FlipHorizontal,

    wizard: MirrorGeneratorSchema.params,

    invoke: (ctx, params) => {

      const {viewer} = ctx;
      const generator = new SketchGenerator(params, MirrorGeneratorSchema);
      viewer.parametricManager.addGenerator(generator);

    }

  },


  {
    id: 'Offset',
    shortName: 'Offset',
    kind: 'Generator',
    description: 'Offset',
    icon: Copy,

    invoke: (ctx) => {
      ctx.viewer.toolManager.takeControl(new OffsetTool(ctx.viewer));
    }

  },


];

