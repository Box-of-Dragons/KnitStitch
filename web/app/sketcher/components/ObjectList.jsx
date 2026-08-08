import React from 'react';
import {useStream} from "ui/effects";
import Label from "ui/components/controls/Label";
import './ObjectList.less';

export function ObjectList() {

  const objects = useStream(ctx => ctx.viewer.streams.objects);

  if (!objects) {
    return <div className="object-list-container">
      <div className="object-list-title">Canvas Objects</div>
      <div className="object-list-scrollable">
        <div style={{padding: '12px', color: '#888', fontSize: '11px'}}>Loading objects...</div>
      </div>
    </div>;
  }

  const categorizedObjects = React.useMemo(() => {
    const points = [];
    const lines = [];
    const arcs = [];
    const circles = [];
    const other = [];

    objects.forEach(obj => {
      if (!obj) return;
      
      const objType = obj._class || obj.type || obj.simpleClassName;
      const id = obj.id || obj.objId;
      
      if (objType && (objType.includes('Point') || objType === 'Point')) {
        points.push({ id, type: 'Point', obj });
      } else if (objType && (objType.includes('Segment') || objType === 'Segment' || objType === 'Line')) {
        lines.push({ id, type: 'Line', obj });
      } else if (objType && (objType.includes('Arc') || objType === 'Arc')) {
        arcs.push({ id, type: 'Arc', obj });
      } else if (objType && (objType.includes('Circle') || objType === 'Circle')) {
        circles.push({ id, type: 'Circle', obj });
      } else {
        other.push({ id, type: objType || 'Unknown', obj });
      }
    });

    return { points, lines, arcs, circles, other };
  }, [objects]);

  const ObjectItem = ({ item }) => {
    return (
      <div 
        className="object-item"
        onClick={(e) => {
          // Select the object when clicked
          const ctx = window.__CAD_APP;
          if (ctx && ctx.viewer) {
            ctx.viewer.select([item.obj], !e.shiftKey);
            ctx.viewer.refresh();
          }
        }}
      >
        <span className="object-type">{item.type}</span>
        <span className="object-id">#{item.id}</span>
      </div>
    );
  };

  const ObjectSection = ({ title, items }) => {
    if (items.length === 0) return null;
    
    return (
      <div className="object-section">
        <Label>{title} ({items.length})</Label>
        <div className="object-list">
          {items.map((item, index) => (
            <ObjectItem key={`${item.type}-${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    );
  };

  const totalObjects = objects.length;
  
  return (
    <div className="object-list-container">
      <div className="object-list-title">Canvas Objects ({totalObjects})</div>
      <div className="object-list-scrollable">
        {totalObjects === 0 ? (
          <div style={{padding: '12px', color: '#888', fontSize: '11px'}}>No objects on canvas</div>
        ) : (
          <>
            <ObjectSection title="Points" items={categorizedObjects.points} />
            <ObjectSection title="Lines" items={categorizedObjects.lines} />
            <ObjectSection title="Arcs" items={categorizedObjects.arcs} />
            <ObjectSection title="Circles" items={categorizedObjects.circles} />
            <ObjectSection title="Other" items={categorizedObjects.other} />
          </>
        )}
      </div>
    </div>
  );
}
