import React, {useState, useEffect} from 'react';
import {SketcherAppContext} from './SketcherAppContext';

export function KnittingPanel() {
  const ctx = React.useContext(SketcherAppContext);
  if (!ctx || !ctx.viewer || !ctx.viewer.streams || !ctx.viewer.streams.knitting) return null;

  const k = ctx.viewer.streams.knitting;
  const [stitches, setStitches] = useStreamState(k.stitchesPer4Inches);
  const [rows, setRows] = useStreamState(k.rowsPer4Inches);
  const [threshold, setThreshold] = useStreamState(k.fillThreshold);
  const [fillEnabled, setFillEnabled] = useStreamState(k.cellFillEnabled);
  const [finishedWidth] = useStreamState(k.finishedWidth);
  const [finishedHeight] = useStreamState(k.finishedHeight);
  const [collapsed, setCollapsed] = useState(false);

  function recalculate() {
    const s = Number(stitches) || 20;
    const r = Number(rows) || 28;
    k.stitchesPer4Inches.set(s);
    k.rowsPer4Inches.set(r);
    k.cellWidthPx.set(Math.max(1, s));
    k.cellHeightPx.set(Math.max(1, r));
  }

  function onThresholdChange(e) {
    const pct = Math.max(0, Math.min(100, Number(e.target.value)));
    setThreshold(pct / 100);
  }

  function clearFill() {
    k.filledCells.set(new Set());
  }

  return (
    <div className={'dock-node' + (collapsed ? ' collapsed' : '')}>
      <div className="tool-caption accordion-caption" onClick={() => setCollapsed(c => !c)}>
        <i className={'fa accordion-caret ' + (collapsed ? 'fa-caret-right' : 'fa-caret-down')}/>
        <span className="txt">KNITTING GRID</span>
      </div>

      <div className="knitting-panel-body">
        <label>
          <span>Stitches / 4in</span>
          <input type="number" min="1" max="60" value={stitches}
            onChange={e => setStitches(e.target.value)}
            onBlur={recalculate}/>
        </label>

        <label>
          <span>Rows / 4in</span>
          <input type="number" min="1" max="60" value={rows}
            onChange={e => setRows(e.target.value)}
            onBlur={recalculate}/>
        </label>

        <label>
          <span>Fill %</span>
          <input type="number" min="0" max="100" value={Math.round(threshold * 100)}
            onChange={onThresholdChange}/>
        </label>

        <label className="knitting-checkbox">
          <input type="checkbox" checked={fillEnabled}
            onChange={e => setFillEnabled(e.target.checked)}/>
          <span>Fill tool (click cells)</span>
        </label>

        <button onClick={clearFill} className="knitting-clear-btn">
          Clear Fill
        </button>

        <div className="knitting-finished-size">
          <div>Width: {finishedWidth > 0 ? finishedWidth.toFixed(2) : '--'} in</div>
          <div>Height: {finishedHeight > 0 ? finishedHeight.toFixed(2) : '--'} in</div>
        </div>
      </div>
    </div>
  );
}

// Helper hook for lstream state streams
function useStreamState(stream) {
  const [value, setValue] = useState(stream.value);
  useEffect(() => {
    const unsub = stream.attach(setValue);
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [stream]);
  return [value, (v) => {
    setValue(v);
    stream.set(v);
  }];
}
