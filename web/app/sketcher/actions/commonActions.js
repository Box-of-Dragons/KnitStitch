import {Copy, Expand, File, FileUp, FolderOpen, Save, Trash2} from "lucide-react";
import {NoIcon} from "../icons/NoIcon";

export default [

  {
    id: 'New',
    shortName: 'New',
    kind: 'Common',
    description: 'Create new sketch',
    icon: File,

    invoke: (ctx) => {
      // Clear autosave when creating new sketch
      ctx.project.clearAutosave();
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
      // Also update autosave
      ctx.project.autosave();
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
    description: 'Fit sketch on screen',
    icon: Expand,

    invoke: (ctx) => {
      ctx.viewer.toolManager.releaseControl();
      ctx.viewer.fit();
      ctx.viewer.refresh();
    }

  },

  {
    id: 'ToggleTerminal',
    shortName: 'Terminal',
    kind: 'Common',
    description: 'Open/close terminal window',
    icon: NoIcon,

    invoke: (ctx) => {
      ctx.ui.$showTerminalRequest.update(shown => shown ? null : 'please open');
    }

  },

  {
    id: 'Clear',
    shortName: 'Clear',
    kind: 'Common',
    description: 'Clear current sketch',
    icon: Trash2,

    invoke: (ctx) => {
      if (confirm('Are you sure you want to clear the current sketch? This cannot be undone.')) {
        ctx.project.clearAutosave();
        ctx.viewer.layers.forEach(layer => {
          layer.objects = [];
        });
        ctx.viewer.refresh();
        ctx.viewer.streams.objectsUpdate.next();
      }
    }

  },
]
