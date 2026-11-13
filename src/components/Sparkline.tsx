import React from 'react';

interface SparklineProps {
  data: number[];
  strokeColor?: string;
  height?: number;
  width?: number;
  showPeakDot?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  strokeColor = '#38BDF8',
  height = 32,
  width = 112,
  showPeakDot = true,
}) => {
  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingX = 3;
  const paddingY = 4;
  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const points = data.map((value, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * innerW;
    const y = paddingY + innerH - ((value - min) / range) * innerH;
    return { x, y, value };
  });

  const linePath = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  let peakIndex = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].value >= points[peakIndex].value) {
      peakIndex = i;
    }
  }
  const peak = points[peakIndex];
  const gradientId = `spark-fill-${strokeColor.replace('#', '')}-${width}-${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showPeakDot && (
        <circle
          cx={peak.x}
          cy={peak.y}
          r="2.5"
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
};
