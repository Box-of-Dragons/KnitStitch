import {ReferencePointTool} from "../tools/origin";
import {Crosshair, Hand} from "lucide-react";

export default [
  {
    id: 'PanTool',
    shortName: 'Pan',
    kind: 'Tool',
    description: 'Pan mode',
    icon: Hand,

    invoke: (ctx) => {
      ctx.viewer.toolManager.releaseControl();
    }

  },

  {
    id: 'ReferencePointTool',
    shortName: 'Set Origin',
    kind: 'Tool',
    description: 'Sets reference point for commands',
    icon: Crosshair,
    command: 'origin',
    invoke: (ctx) => {
      ctx.viewer.toolManager.takeControl(new ReferencePointTool(ctx.viewer));
    }

  },
]
