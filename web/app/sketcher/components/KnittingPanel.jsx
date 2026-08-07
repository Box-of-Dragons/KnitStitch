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
    <div className="knitting-panel-section" style={{padding: '10px 12px', borderBottom: '1px solid var(--app-panel-border, #d4c9b5)'}}>
      <div className="tool-caption" style={{marginBottom: '8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--app-tool-caption-color, #5a4a30)'}}>
        Knitting Grid
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
        <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px'}}>
          <span>Stitches / 4in</span>
          <input type="number" min="1" max="60" value={stitches}
            onChange={e => setStitches(e.target.value)}
            onBlur={recalculate}
            style={{width: '50px', padding: '2px 4px', fontSize: '12px', textAlign: 'right', border: '1px solid var(--app-btn-border, #d4c9b5)', borderRadius: '0', background: 'var(--app-btn-bg, #fff)', color: 'var(--app-btn-color, #4a3a20)'}}/>
        </label>

        <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px'}}>
          <span>Rows / 4in</span>
          <input type="number" min="1" max="60" value={rows}
            onChange={e => setRows(e.target.value)}
            onBlur={recalculate}
            style={{width: '50px', padding: '2px 4px', fontSize: '12px', textAlign: 'right', border: '1px solid var(--app-btn-border, #d4c9b5)', borderRadius: '0', background: 'var(--app-btn-bg, #fff)', color: 'var(--app-btn-color, #4a3a20)'}}/>
        </label>

        <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px'}}>
          <span>Fill %</span>
          <input type="number" min="0" max="100" value={Math.round(threshold * 100)}
            onChange={onThresholdChange}
            style={{width: '50px', padding: '2px 4px', fontSize: '12px', textAlign: 'right', border: '1px solid var(--app-btn-border, #d4c9b5)', borderRadius: '0', background: 'var(--app-btn-bg, #fff)', color: 'var(--app-btn-color, #4a3a20)'}}/>
        </label>

        <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', userSelect: 'none'}}>
          <input type="checkbox" checked={fillEnabled}
            onChange={e => setFillEnabled(e.target.checked)}/>
          <span>Fill tool (click cells)</span>
        </label>

        <button onClick={clearFill}
          style={{padding: '4px 8px', fontSize: '11px', cursor: 'pointer', border: '1px solid var(--app-btn-border, #d4c9b5)', borderRadius: '0', background: 'var(--app-btn-bg, #fff)', color: 'var(--app-btn-color, #4a3a20)'}}>
          Clear Fill
        </button>

        <div style={{fontSize: '11px', color: 'var(--app-status-color, #5a4a30)', marginTop: '4px'}}>
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
