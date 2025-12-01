interface MobileControlsProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
}

export function MobileControls({ onUp, onDown, onLeft, onRight }: MobileControlsProps) {
  return (
    <div id="mobile-controls">
      <div className="controls-row">
        <button className="control-btn" onClick={onUp}>
          ▲
        </button>
      </div>
      <div className="controls-row">
        <button className="control-btn" onClick={onLeft}>
          ◄
        </button>
        <button className="control-btn" style={{ visibility: 'hidden' }}>
          ●
        </button>
        <button className="control-btn" onClick={onRight}>
          ►
        </button>
      </div>
      <div className="controls-row">
        <button className="control-btn" onClick={onDown}>
          ▼
        </button>
      </div>
    </div>
  );
}
