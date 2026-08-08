import {getSketcherAction} from "../actions";
import React, {useContext, useEffect, useState} from "react";
import {SketcherAppContext} from "./SketcherAppContext";

export function SketcherActionButton({actionId, text=false}) {

  const action = getSketcherAction(actionId);

  if (!action) {
    return <span>?{actionId}?</span>;
  }

  const ctx = useContext(SketcherAppContext);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (ctx.viewer && ctx.viewer.streams && ctx.viewer.streams.tool) {
      const checkActiveTool = (tool) => {
        // Check if the current tool matches this action by comparing tool class name
        let currentToolId = null;
        if (tool) {
          const toolName = tool.constructor.name;
          // Map tool class names to action IDs
          const toolToActionMap = {
            'AddPointTool': 'PointTool',
            'AddSegmentTool': 'SegmentTool',
            'AddArcTool': 'ArcTool',
            'EditCircleTool': 'CircleTool',
            'EllipseTool': 'EllipseTool',
            'BezierCurveTool': 'BezierTool',
            'RectangleTool': 'RectangleTool',
            'ReferencePointTool': 'ReferencePointTool',
            'PanTool': 'PanTool'
          };
          currentToolId = toolToActionMap[toolName];
          
          // Special case for MultiLineTool which uses AddSegmentTool with multi=true
          if (toolName === 'AddSegmentTool' && tool.multi && actionId === 'MultiLineTool') {
            currentToolId = 'MultiLineTool';
          }
          // Special case for EllipseArcTool which uses EllipseTool with arc=true  
          if (toolName === 'EllipseTool' && tool.arc && actionId === 'EllipseArcTool') {
            currentToolId = 'EllipseArcTool';
          }
        }
        setIsActive(currentToolId === actionId);
      };
      
      // Check current tool
      checkActiveTool(ctx.viewer.toolManager.tool);
      
      // Subscribe to tool changes
      const subscription = ctx.viewer.streams.tool.$change.attach(checkActiveTool);
      
      return () => subscription.detach();
    }
  }, [ctx, actionId]);

  const Icon = action.icon;

  return <button onClick={e => action.invoke(ctx, e)} title={action.description} className={`action-kind-${action.kind} ${text ? 'icon-button' : ''} ${isActive ? 'active' : ''}`}>
    {Icon && <Icon />}
    {Icon && <div className="tool-label">{action.shortName}</div>}
    {!Icon && action.shortName}
  </button>;

}
