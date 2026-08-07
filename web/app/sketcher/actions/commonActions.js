import {Copy, Expand, File, FileUp, FolderOpen, Save} from "lucide-react";
import {NoIcon} from "../icons/NoIcon";

export default [

  {
    id: 'New',
    shortName: 'New',
    kind: 'Common',
    description: 'Create new sketch',
    icon: File,

    invoke: (ctx) => {
      ctx.project.newSketch();
    }
  },

  {
    id: 'Clone',
    shortName: 'Clone',
    kind: 'Common',
    description: 'Clone sketch',
    icon: Copy,

    invoke: (ctx, e) => {
      ctx.project.cloneSketch();
    }
  },

  {
    id: 'Open',
    shortName: 'Open',
    kind: 'Common',
    description: 'Open sketch',
    icon: FolderOpen,

    invoke: (ctx, e) => {
      ctx.ui.$sketchManagerRequest.next({
        x: e.pageX,
        y: e.pageY
      });
    }
  },

  {
    id: 'Save',
    shortName: 'Save',
    kind: 'Common',
    description: 'Save sketch',
    icon: Save,

    invoke: (ctx) => {
      const sketchData = ctx.viewer.io.serializeSketch();
      const sketchId = ctx.project.getSketchId();
      localStorage.setItem(sketchId, sketchData);
    }
  },

  {
    id: 'Export',
    shortName: 'Export',
    kind: 'Common',
    description: 'Export sketch to other formats',
    icon: FileUp,

    invoke: (ctx, e) => {
      ctx.ui.$exportDialogRequest.next({
        x: e.pageX,
        y: e.pageY
      });
    }
  },

  {
    id: 'Fit',
    shortName: 'Fit',
    kind: 'Common',
    description: 'Fit Sketch On Screen',
    icon: Expand,

    invoke: (ctx) => {
      ctx.viewer.toolManager.releaseControl();
      ctx.viewer.fit();
      ctx.viewer.refresh();
    }

  },

  {
    id: 'ToggleTerminal',
    shortName: 'Toggle Terminal',
    kind: 'Common',
    description: 'Open/Close Terminal Window',
    icon: NoIcon,

    invoke: (ctx) => {
      ctx.ui.$showTerminalRequest.update(shown => shown ? null : 'please open');
    }

  },
]
