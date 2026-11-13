import React, { useState } from 'react';
import { TimeSeriesPoint } from '../types/retail';
import { formatCurrency, formatNumber } from '../data/retailData';

interface RevenueChartProps {
  data: TimeSeriesPoint[];
  granularity: 'daily' | 'weekly' | 'monthly';
  onGranularityChange: (g: 'daily' | 'weekly' | 'monthly') => void;
  scaleFactor: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  granularity,
  onGranularityChange,
  scaleFactor,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [showMarginLine, setShowMarginLine] = useState(true);

  const scaledData = data.map((d) => ({
    ...d,
    revenue: Math.round(d.revenue * scaleFactor),
    target: Math.round(d.target * scaleFactor),
    grossProfit: Math.round(d.grossProfit * scaleFactor),
    unitsSold: Math.round(d.unitsSold * scaleFactor),
  }));

  const maxVal = Math.max(
    ...scaledData.map((d) => Math.max(d.revenue, d.target)),
    1000
  );
  const yMax = Math.ceil(maxVal * 1.15);

  const svgWidth = 760;
  const svgHeight = 270;
  const padLeft = 58;
  const padRight = 46;
  const padTop = 18;
  const padBottom = 32;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const slotW = plotW / scaledData.length;
  const barW = Math.min(28, Math.max(12, slotW * 0.48));

  const getY = (val: number) => padTop + plotH - (val / yMax) * plotH;
  const getMarginY = (pct: number) => {
    const minM = 62;
    const maxM = 76;
    const clamped = Math.max(minM, Math.min(maxM, pct));
    return padTop + plotH - ((clamped - minM) / (maxM - minM)) * plotH;
  };

  const targetLinePath = scaledData
    .map((d, i) => {
      const x = padLeft + i * slotW + slotW / 2;
      const y = getY(d.target);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const marginLinePath = scaledData
    .map((d, i) => {
      const x = padLeft + i * slotW + slotW / 2;
      const y = getMarginY(d.marginPct);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    val: yMax * ratio,
    y: padTop + plotH - ratio * plotH,
  }));

  const activePoint = hoverIdx !== null ? scaledData[hoverIdx] : null;
  const activeX =
    hoverIdx !== null ? padLeft + hoverIdx * slotW + slotW / 2 : 0;

  return (
    <div className="card-surface p-5 flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[16px] leading-[24px] font-semibold text-[#0F172A]">
            Revenue Trajectory & Margin Realization
          </h2>
          <p className="text-[12px] text-[#64748B]">
            Actual merchandise revenue against plan benchmark and realized gross margin rate
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowMarginLine((prev) => !prev)}
            className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showMarginLine
                ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                : 'bg-white text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A]'
            }`}
          >
            Margin % Overlay
          </button>

          <div
            className="inline-flex items-center p-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0]"
            role="tablist"
            aria-label="Chart granularity"
          >
            {(['daily', 'weekly', 'monthly'] as const).map((g) => (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={granularity === g}
                onClick={() => onGranularityChange(g)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-[3px] capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  granularity === g
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center gap-5 text-[12px] text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-[2px] bg-[#0F172A] inline-block" />
          <span>Gross Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 border-t-2 border-dashed border-[#38BDF8] inline-block" />
          <span>Plan Target</span>
        </div>
        {showMarginLine && (
          <div className="flex items-center gap-2">
            <span className="w-4 border-t-2 border-[#10B981] inline-block" />
            <span>Gross Margin %</span>
          </div>
        )}
      </div>

      {/* Responsive SVG Plot */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Horizontal Gridlines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-[#64748B] text-[10px] font-medium tabular-nums"
              >
                {formatCurrency(tick.val, true)}
              </text>
            </g>
          ))}

          {/* Right Y-Axis Margin Labels */}
          {showMarginLine &&
            [64, 68, 72, 76].map((mPct) => (
              <text
                key={mPct}
                x={svgWidth - padRight + 8}
                y={getMarginY(mPct) + 4}
                textAnchor="start"
                className="fill-[#10B981] text-[10px] font-semibold tabular-nums"
              >
                {mPct}%
              </text>
            ))}

          {/* Bars */}
          {scaledData.map((d, i) => {
            const centerX = padLeft + i * slotW + slotW / 2;
            const barTop = getY(d.revenue);
            const barH = Math.max(2, padTop + plotH - barTop);
            const isHovered = hoverIdx === i;

            return (
              <g
                key={d.label}
                onMouseEnter={() => setHoverIdx(i)}
                className="cursor-pointer"
              >
                <rect
                  x={padLeft + i * slotW}
                  y={padTop}
                  width={slotW}
                  height={plotH}
                  fill={isHovered ? '#F8FAFC' : 'transparent'}
                />
                <rect
                  x={centerX - barW / 2}
                  y={barTop}
                  width={barW}
                  height={barH}
                  rx="3"
                  fill={isHovered ? '#38BDF8' : '#0F172A'}
                  className="transition-colors duration-150"
                />
                <text
                  x={centerX}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isHovered ? 'fill-[#0F172A] font-semibold' : 'fill-[#64748B]'
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Plan Target Line */}
          <path
            d={targetLinePath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="4 3"
            pointerEvents="none"
          />

          {/* Margin % Overlay Line */}
          {showMarginLine && (
            <>
              <path
                d={marginLinePath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="none"
              />
              {scaledData.map((d, i) => {
                const cx = padLeft + i * slotW + slotW / 2;
                const cy = getMarginY(d.marginPct);
                return (
                  <circle
                    key={`m-${d.label}`}
                    cx={cx}
                    cy={cy}
                    r={hoverIdx === i ? 4 : 2.5}
                    fill="#FFFFFF"
                    stroke="#10B981"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                );
              })}
            </>
          )}

          {/* Hover Crosshair */}
          {hoverIdx !== null && (
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={padTop + plotH}
              stroke="#38BDF8"
              strokeWidth="1"
              strokeDasharray="2 2"
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Precision Tooltip */}
        {activePoint && hoverIdx !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-[12px] shadow-[0_4px_12px_-2px_rgba(15,23,42,0.08)]"
            style={{
              left:
                hoverIdx > scaledData.length / 2
                  ? '16px'
                  : 'auto',
              right:
                hoverIdx <= scaledData.length / 2
                  ? '16px'
                  : 'auto',
            }}
          >
            <div className="font-display font-semibold text-[#0F172A] mb-1">
              {activePoint.label}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 tabular-nums">
              <span className="text-[#64748B]">Revenue</span>
              <span className="text-right font-semibold text-[#0F172A]">
                {formatCurrency(activePoint.revenue)}
              </span>
              <span className="text-[#64748B]">Target</span>
              <span className="text-right font-medium text-[#0284C7]">
                {formatCurrency(activePoint.target)}
              </span>
              <span className="text-[#64748B]">Margin</span>
              <span className="text-right font-semibold text-[#047857]">
                {activePoint.marginPct.toFixed(1)}%
              </span>
              <span className="text-[#64748B]">Units</span>
              <span className="text-right font-medium text-[#0F172A]">
                {formatNumber(activePoint.unitsSold)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
