"use client";

import * as React from "react";
import styles from "./price-range-slider.module.css";

function formatFa(value: number) {
  return Math.round(value).toLocaleString("fa-IR");
}

export function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 10000,
  compact = false,
  onChange,
  onCommit,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  compact?: boolean;
  onChange?: (next: { min: number; max: number }) => void;
  onCommit?: (next: { min: number; max: number }) => void;
}) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Math.max(Number.isFinite(max) ? max : safeMin + step, safeMin + step);
  const low = Math.min(Math.max(valueMin, safeMin), safeMax);
  const high = Math.max(Math.min(valueMax, safeMax), low);
  const span = safeMax - safeMin || 1;
  const left = ((low - safeMin) / span) * 100;
  const right = ((high - safeMin) / span) * 100;

  const latestRef = React.useRef({ min: low, max: high });
  latestRef.current = { min: low, max: high };

  const emit = (nextMin: number, nextMax: number, commit = false) => {
    const clampedMin = Math.min(Math.max(nextMin, safeMin), nextMax);
    const clampedMax = Math.max(Math.min(nextMax, safeMax), clampedMin);
    latestRef.current = { min: clampedMin, max: clampedMax };
    onChange?.({ min: clampedMin, max: clampedMax });
    if (commit) onCommit?.({ min: clampedMin, max: clampedMax });
  };

  const commitLatest = () => {
    onCommit?.(latestRef.current);
  };

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`} dir="ltr">
      <div className={styles.trackWrap}>
        <div className={styles.track} />
        <div className={styles.fill} style={{ left: `${left}%`, width: `${Math.max(right - left, 0)}%` }} />
        <input
          aria-label="حداقل قیمت"
          type="range"
          min={safeMin}
          max={safeMax}
          step={step}
          value={low}
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), high);
            emit(next, high);
          }}
          onMouseUp={commitLatest}
          onTouchEnd={commitLatest}
          onKeyUp={commitLatest}
          className={`${styles.thumb} ${styles.thumbLow}`}
        />
        <input
          aria-label="حداکثر قیمت"
          type="range"
          min={safeMin}
          max={safeMax}
          step={step}
          value={high}
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), low);
            emit(low, next);
          }}
          onMouseUp={commitLatest}
          onTouchEnd={commitLatest}
          onKeyUp={commitLatest}
          className={`${styles.thumb} ${styles.thumbHigh}`}
        />
      </div>
      {!compact ? (
        <div className={styles.values} dir="rtl">
          <span>از {formatFa(low)}</span>
          <span>تا {formatFa(high)}</span>
        </div>
      ) : null}
    </div>
  );
}
