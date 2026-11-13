import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import {
  ALL_STOCK_STATUSES,
  deriveStockStatus,
  formatCurrency,
  formatNumber,
} from '../data/retailData';
import { SkuItem, StockHealthStatus } from '../types/retail';
import { Sparkline } from './Sparkline';
import { StatusPill } from './StatusPill';

interface InventoryScreenProps {
  skus: SkuItem[];
  allSkusCount: number;
  selectedStatuses: StockHealthStatus[];
  onToggleStatus: (status: StockHealthStatus) => void;
  onClearStatuses: () => void;
  onSelectSku: (sku: SkuItem) => void;
  onResetAllFilters: () => void;
}

type SortKey =
  | 'name'
  | 'onHand'
  | 'dailyVelocity'
  | 'daysSupply'
  | 'marginPct'
  | 'valuation'
  | 'pendingPoUnits';

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  skus,
  allSkusCount,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  onSelectSku,
  onResetAllFilters,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('daysSupply');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'daysSupply' ? 'asc' : 'desc');
    }
  };

  const sortedSkus = useMemo(() => {
    return [...skus].sort((a, b) => {
      const aSupply = a.dailyVelocity > 0 ? a.onHand / a.dailyVelocity : 999;
      const bSupply = b.dailyVelocity > 0 ? b.onHand / b.dailyVelocity : 999;
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'onHand':
          cmp = a.onHand - b.onHand;
          break;
        case 'dailyVelocity':
          cmp = a.dailyVelocity - b.dailyVelocity;
          break;
        case 'daysSupply':
          cmp = aSupply - bSupply;
          break;
        case 'marginPct':
          cmp = a.marginPct - b.marginPct;
          break;
        case 'valuation':
          cmp = a.onHand * a.unitCost - b.onHand * b.unitCost;
          break;
        case 'pendingPoUnits':
          cmp = a.pendingPoUnits - b.pendingPoUnits;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [skus, sortKey, sortDir]);

  const totalUnits = skus.reduce((s, item) => s + item.onHand, 0);
  const totalValuation = skus.reduce(
    (s, item) => s + item.onHand * item.unitCost,
    0
  );
  const totalPendingPo = skus.reduce((s, item) => s + item.pendingPoUnits, 0);
  const avgDaysSupply =
    skus.length > 0
      ? skus.reduce(
          (s, item) =>
            s + (item.dailyVelocity > 0 ? item.onHand / item.dailyVelocity : 0),
          0
        ) / skus.length
      : 0;

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#0F172A]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#0F172A]" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Summary Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Filtered SKUs
          </div>
          <div className="font-display text-[24px] font-bold text-[#0F172A] tabular-nums mt-1">
            {skus.length}{' '}
            <span className="text-[13px] font-medium text-[#64748B]">
              / {allSkusCount}
            </span>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            On-Hand Cost Valuation
          </div>
          <div className="font-display text-[24px] font-bold text-[#0F172A] tabular-nums mt-1">
            {formatCurrency(totalValuation, true)}
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Avg Days of Supply
          </div>
          <div className="font-display text-[24px] font-bold text-[#0F172A] tabular-nums mt-1">
            {avgDaysSupply.toFixed(1)}d
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Pending PO Units
          </div>
          <div className="font-display text-[24px] font-bold text-[#0284C7] tabular-nums mt-1">
            {formatNumber(totalPendingPo)}
          </div>
        </div>
      </div>

      {/* Status Filter Chip Row */}
      <div className="card-surface p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClearStatuses}
            className={`h-7 px-3 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
              selectedStatuses.length === 0
                ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
            }`}
          >
            All Health States
          </button>
          {ALL_STOCK_STATUSES.map((status) => {
            const active = selectedStatuses.includes(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => onToggleStatus(status)}
                className={`h-7 px-3 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                    : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div className="text-[12px] text-[#64748B] tabular-nums">
          {formatNumber(totalUnits)} total units on hand · Click any row to inspect & order
        </div>
      </div>

      {/* High-Density Inventory Data Grid */}
      <div className="card-surface overflow-hidden">
        {sortedSkus.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="h-[36px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  <th className="pl-5 pr-3 sticky left-0 bg-[#F8FAFC] z-10 border-r border-[#E2E8F0]/60">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1 cursor-pointer hover:text-[#0F172A]"
                    >
                      <span>SKU / Merchandise</span>
                      {renderSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-3">Category</th>
                  <th className="px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('onHand')}
                      className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                    >
                      <span>On Hand</span>
                      {renderSortIcon('onHand')}
                    </button>
                  </th>
                  <th className="px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('dailyVelocity')}
                      className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                    >
                      <span>Velocity/d</span>
                      {renderSortIcon('dailyVelocity')}
                    </button>
                  </th>
                  <th className="px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('daysSupply')}
                      className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                    >
                      <span>Supply</span>
                      {renderSortIcon('daysSupply')}
                    </button>
                  </th>
                  <th className="px-3 text-center">14d Trend</th>
                  <th className="px-3 text-right">MSRP</th>
                  <th className="px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('marginPct')}
                      className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                    >
                      <span>Margin</span>
                      {renderSortIcon('marginPct')}
                    </button>
                  </th>
                  <th className="px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('valuation')}
                      className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                    >
                      <span>Valuation</span>
                      {renderSortIcon('valuation')}
                    </button>
                  </th>
                  <th className="px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('pendingPoUnits')}
                      className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                    >
                      <span>On PO</span>
                      {renderSortIcon('pendingPoUnits')}
                    </button>
                  </th>
                  <th className="pl-3 pr-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
                {sortedSkus.map((item) => {
                  const status = deriveStockStatus(item);
                  const daysSupply =
                    item.dailyVelocity > 0
                      ? item.onHand / item.dailyVelocity
                      : 999;
                  const valuation = item.onHand * item.unitCost;

                  return (
                    <tr
                      key={item.sku}
                      onClick={() => onSelectSku(item)}
                      className="h-[44px] hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="pl-5 pr-3 py-1.5 sticky left-0 bg-white group-hover:bg-[#F8FAFC] border-r border-[#F1F5F9]">
                        <div className="font-semibold text-[#0F172A] truncate max-w-[210px]">
                          {item.name}
                        </div>
                        <div className="font-mono text-[11px] text-[#64748B]">
                          {item.sku}
                        </div>
                      </td>
                      <td className="px-3 text-[#45464d] whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                        {formatNumber(item.onHand)}
                      </td>
                      <td className="px-3 text-right text-[#64748B] tabular-nums">
                        {item.dailyVelocity.toFixed(1)}
                      </td>
                      <td
                        className={`px-3 text-right font-semibold tabular-nums ${
                          daysSupply < 7
                            ? 'text-[#BE123C]'
                            : daysSupply < 14
                            ? 'text-[#B45309]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {daysSupply.toFixed(1)}d
                      </td>
                      <td className="px-3">
                        <div className="flex justify-center">
                          <Sparkline
                            data={item.velocityHistory}
                            strokeColor={
                              status === 'Critical Low' ? '#F43F5E' : '#38BDF8'
                            }
                            width={72}
                            height={22}
                            showPeakDot={false}
                          />
                        </div>
                      </td>
                      <td className="px-3 text-right text-[#64748B] tabular-nums">
                        {formatCurrency(item.retailPrice)}
                      </td>
                      <td className="px-3 text-right font-semibold text-[#047857] tabular-nums">
                        {item.marginPct.toFixed(1)}%
                      </td>
                      <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                        {formatCurrency(valuation)}
                      </td>
                      <td className="px-3 text-right tabular-nums">
                        {item.pendingPoUnits > 0 ? (
                          <span className="font-semibold text-[#0284C7]">
                            +{formatNumber(item.pendingPoUnits)}
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>
                      <td className="pl-3 pr-5 text-right">
                        <StatusPill status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <h3 className="font-display text-[16px] font-semibold text-[#0F172A]">
              No matching SKUs in active filter view
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1 max-w-md mx-auto">
              Adjust your search query or clear category, channel, and stock health filters to restore the full inventory ledger.
            </p>
            <button
              type="button"
              onClick={onResetAllFilters}
              className="mt-4 h-9 px-4 rounded bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
