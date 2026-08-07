import {IO} from "../io";
import React from "react";
import {FileUp} from "lucide-react";


export default [
  {
    id: 'ExportSVG',
    shortName: 'Export SVG',
    kind: 'Export',
    description: 'Export sketch to SVG',
    icon: FileUp,

    invoke: (ctx) => {
      IO.exportTextData(ctx.viewer.io.svgExport(), ctx.project.getSketchId() + ".svg");
    }
  },

  {
    id: 'ExportDXF',
    shortName: 'Export DXF',
    kind: 'Export',
    description: 'Export sketch to DXF',
    icon: FileUp,

    invoke: (ctx) => {
      IO.exportTextData(ctx.viewer.io.dxfExport(), ctx.project.getSketchId() + ".dxf");
    }

  },
];
