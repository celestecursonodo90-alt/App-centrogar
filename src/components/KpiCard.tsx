import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface KpiCardProps {
  label: string;
  value: string;
  deltaPct: number;
  comparisonLabel: string;
  sparkData: number[];
  invertDeltaSemantic?: boolean;
  onClick?: () => void;
  contextTag?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  deltaPct,
  comparisonLabel,
  sparkData,
  invertDeltaSemantic = false,
  onClick,
  contextTag,
}) => {
  const isPositiveChange = deltaPct >= 0;
  const isGood = invertDeltaSemantic ? !isPositiveChange : isPositiveChange;

  const badgeStyle = isGood
    ? 'bg-[#ECFDF5] text-[#047857]'
    : 'bg-[#FFF1F2] text-[#BE123C]';

  const formattedDelta = `${isPositiveChange ? '+' : ''}${deltaPct.toFixed(1)}%`;

  const ContainerTag = onClick ? 'button' : 'div';

  return (
    <ContainerTag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`card-surface p-5 text-left w-full flex flex-col justify-between gap-3.5 ${
        onClick
          ? 'card-surface-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
          {label}
        </span>
        {contextTag && (
          <span className="text-[11px] font-medium text-[#64748B] whitespace-nowrap">
            {contextTag}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="font-display text-[28px] leading-[32px] font-bold tracking-[-0.03em] text-[#0F172A] tabular-nums">
          {value}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold tabular-nums shrink-0 ${badgeStyle}`}
        >
          {isPositiveChange ? (
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3 h-3" aria-hidden="true" />
          )}
          {formattedDelta}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 pt-1 border-t border-[#F1F5F9]">
        <span className="text-[12px] leading-[16px] text-[#64748B]">
          {comparisonLabel}
        </span>
        <Sparkline
          data={sparkData}
          strokeColor={isGood ? '#38BDF8' : '#F43F5E'}
          width={96}
          height={28}
        />
      </div>
    </ContainerTag>
  );
};
