import React, { useState } from 'react';
import { ArrowUpRight, Truck } from 'lucide-react';
import {
  ALL_CATEGORIES,
  ALL_CHANNELS,
  DATE_RANGE_LABELS,
  DATE_RANGE_MULTIPLIER,
  REVENUE_SERIES_BY_GRANULARITY,
  deriveStockStatus,
  formatCurrency,
  formatNumber,
} from '../data/retailData';
import {
  CategoryName,
  ChannelName,
  GlobalFilters,
  NavScreen,
  OutletLocation,
  SkuItem,
} from '../types/retail';
import { KpiCard } from './KpiCard';
import { RevenueChart } from './RevenueChart';
import { StatusPill } from './StatusPill';

interface OverviewScreenProps {
  skus: SkuItem[];
  filteredSkus: SkuItem[];
  filteredOutlets: OutletLocation[];
  filters: GlobalFilters;
  scaleFactor: number;
  onSelectSku: (sku: SkuItem) => void;
  onNavigate: (screen: NavScreen) => void;
  onFilterCriticalOnly: () => void;
  onToggleCategoryFilter: (cat: CategoryName) => void;
  onQuickReorder: (skuCode: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  skus,
  filteredSkus,
  filteredOutlets,
  filters,
  scaleFactor,
  onSelectSku,
  onNavigate,
  onFilterCriticalOnly,
  onToggleCategoryFilter,
  onQuickReorder,
}) => {
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const dateMult = DATE_RANGE_MULTIPLIER[filters.dateRange];
  const baseMonthlyRevenue = filteredOutlets.reduce(
    (sum, o) => sum + o.monthlyRevenue,
    0
  );
  const skuRatio =
    skus.length > 0 ? Math.max(0.2, filteredSkus.length / skus.length) : 1;
  const totalRevenue = Math.round(
    baseMonthlyRevenue * dateMult * (filters.categories.length > 0 || filters.channels.length > 0 ? skuRatio : 1)
  );

  const avgMarginPct =
    filteredSkus.length > 0
      ? filteredSkus.reduce((sum, s) => sum + s.marginPct, 0) /
        filteredSkus.length
      : 69.2;

  const totalInventoryCost = filteredSkus.reduce(
    (sum, s) => sum + s.onHand * s.unitCost,
    0
  );
  const annualizedCogs =
    filteredSkus.reduce(
      (sum, s) => sum + s.dailyVelocity * 365 * s.unitCost,
      0
    ) || 1;
  const turnRatio =
    totalInventoryCost > 0 ? annualizedCogs / totalInventoryCost : 5.4;

  const criticalSkus = filteredSkus.filter((s) => {
    const st = deriveStockStatus(s);
    return st === 'Critical Low' || st === 'Low Stock';
  });

  const criticalOnlyCount = filteredSkus.filter(
    (s) => deriveStockStatus(s) === 'Critical Low'
  ).length;

  // Category Mix Breakdown
  const categoryStats = ALL_CATEGORIES.map((category) => {
    const catSkus = filteredSkus.filter((s) => s.category === category);
    const est30dRev = catSkus.reduce(
      (sum, s) => sum + s.dailyVelocity * 30 * s.retailPrice,
      0
    );
    const scaledRev = est30dRev * dateMult;
    const avgM =
      catSkus.length > 0
        ? catSkus.reduce((sum, s) => sum + s.marginPct, 0) / catSkus.length
        : 0;
    return {
      category,
      revenue: scaledRev,
      marginPct: avgM,
      skuCount: catSkus.length,
    };
  });
  const maxCatRev = Math.max(...categoryStats.map((c) => c.revenue), 1);

  // Channel Fulfillment Pipeline
  const channelPipeline = ALL_CHANNELS.map((channel: ChannelName, idx) => {
    const chSkus = filteredSkus.filter((s) => s.primaryChannel === channel);
    const unitsPerDay = chSkus.reduce((sum, s) => sum + s.dailyVelocity, 0);
    const slaTargets = [98.4, 99.1, 96.8, 97.6];
    const leadHours = ['2.1h pickup', '4.6h dispatch', '8.2h hub sync', '14.0h freight'];
    return {
      channel,
      unitsPerPeriod: Math.round(unitsPerDay * (filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : filters.dateRange === 'qtd' ? 90 : 365)),
      slaPct: slaTargets[idx],
      cadence: leadHours[idx],
    };
  });

  const periodLabel = DATE_RANGE_LABELS[filters.dateRange];

  return (
    <div className="space-y-6">
      {/* 4-Column KPI Spread */}
      <section
        aria-label="Executive KPI Summary"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6"
      >
        <KpiCard
          label="Gross Merchandise Revenue"
          value={formatCurrency(totalRevenue, true)}
          deltaPct={11.4}
          comparisonLabel={`vs prior ${periodLabel.toLowerCase()}`}
          sparkData={[62, 66, 65, 70, 73, 71, 76, 80, 79, 85, 89, 94]}
          contextTag={`${filteredOutlets.length} outlets`}
          onClick={() => onNavigate('sales')}
        />
        <KpiCard
          label="Realized Gross Margin"
          value={`${avgMarginPct.toFixed(1)}%`}
          deltaPct={1.8}
          comparisonLabel="Target benchmark 68.5%"
          sparkData={[67.8, 68.1, 68.4, 68.3, 68.9, 69.2, 69.0, 69.5, 69.8, 70.1, 70.4, 70.6]}
          contextTag="Net of markdown"
          onClick={() => onNavigate('sales')}
        />
        <KpiCard
          label="Annualized Stock Turn"
          value={`${turnRatio.toFixed(2)}x`}
          deltaPct={6.2}
          comparisonLabel={`On-hand cost ${formatCurrency(totalInventoryCost, true)}`}
          sparkData={[4.8, 4.9, 5.0, 4.95, 5.1, 5.2, 5.15, 5.3, 5.4, 5.5, 5.6, 5.75]}
          contextTag="Velocity index"
          onClick={() => onNavigate('inventory')}
        />
        <KpiCard
          label="Depletion Risk SKUs"
          value={`${criticalOnlyCount} Critical`}
          deltaPct={-14.3}
          comparisonLabel={`${criticalSkus.length} total below reorder point`}
          sparkData={[9, 8, 8, 7, 7, 6, 7, 6, 5, 5, 4, Math.max(2, criticalOnlyCount)]}
          invertDeltaSemantic
          contextTag="Immediate PO"
          onClick={onFilterCriticalOnly}
        />
      </section>

      {/* 12-Column Analytical Split */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6 items-stretch">
        <div className="xl:col-span-8">
          <RevenueChart
            data={REVENUE_SERIES_BY_GRANULARITY[granularity]}
            granularity={granularity}
            onGranularityChange={setGranularity}
            scaleFactor={scaleFactor}
          />
        </div>

        {/* Category Velocity & Margin Mix */}
        <div className="xl:col-span-4 card-surface p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-[16px] leading-[24px] font-semibold text-[#0F172A]">
                Category Mix & Margin
              </h2>
              <p className="text-[12px] text-[#64748B]">
                Click any category to isolate dashboard metrics
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="text-[12px] font-semibold text-[#0284C7] hover:text-[#0F172A] inline-flex items-center gap-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 my-auto">
            {categoryStats.map((item) => {
              const barPct = (item.revenue / maxCatRev) * 100;
              const isSelected = filters.categories.includes(item.category);
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => onToggleCategoryFilter(item.category)}
                  className={`w-full text-left p-2.5 -mx-2.5 rounded-md transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F0F9FF] ring-1 ring-[#38BDF8]'
                      : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[13px] mb-1.5">
                    <span className="font-semibold text-[#0F172A]">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2.5 tabular-nums">
                      <span className="text-[12px] font-semibold text-[#047857]">
                        {item.marginPct > 0 ? `${item.marginPct.toFixed(1)}%` : '—'}
                      </span>
                      <span className="font-semibold text-[#0F172A]">
                        {formatCurrency(item.revenue, true)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        isSelected ? 'bg-[#38BDF8]' : 'bg-[#0F172A]'
                      }`}
                      style={{ width: `${Math.max(4, barPct)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[12px] text-[#64748B] tabular-nums">
            <span>Active Catalog</span>
            <span className="font-semibold text-[#0F172A]">
              {filteredSkus.length} SKUs tracked
            </span>
          </div>
        </div>
      </section>

      {/* Bottom 12-Column Operational Split */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
        {/* Critical Stock Watchlist Table */}
        <div className="xl:col-span-7 card-surface overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[16px] leading-[24px] font-semibold text-[#0F172A]">
                Priority Replenishment Watchlist
              </h2>
              <p className="text-[12px] text-[#64748B]">
                SKUs below target days-of-supply threshold across filtered channels
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="h-8 px-3 rounded border border-[#CBD5E1] text-[12px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0"
            >
              Full Inventory
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="h-[36px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  <th className="pl-5 pr-3 sticky left-0 bg-[#F8FAFC] z-10">
                    SKU / Product
                  </th>
                  <th className="px-3 text-right">On Hand</th>
                  <th className="px-3 text-right">Velocity/d</th>
                  <th className="px-3 text-right">Supply</th>
                  <th className="px-3">Status</th>
                  <th className="pl-3 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
                {criticalSkus.slice(0, 6).map((item) => {
                  const status = deriveStockStatus(item);
                  const supplyDays =
                    item.dailyVelocity > 0
                      ? item.onHand / item.dailyVelocity
                      : 99;
                  return (
                    <tr
                      key={item.sku}
                      onClick={() => onSelectSku(item)}
                      className="h-[44px] hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="pl-5 pr-3 py-2 sticky left-0 bg-white group-hover:bg-[#F8FAFC]">
                        <div className="font-semibold text-[#0F172A] truncate max-w-[200px]">
                          {item.name}
                        </div>
                        <div className="font-mono text-[11px] text-[#64748B]">
                          {item.sku}
                        </div>
                      </td>
                      <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                        {formatNumber(item.onHand)}
                      </td>
                      <td className="px-3 text-right text-[#64748B] tabular-nums">
                        {item.dailyVelocity.toFixed(1)}
                      </td>
                      <td className="px-3 text-right font-semibold text-[#BE123C] tabular-nums">
                        {supplyDays.toFixed(1)}d
                      </td>
                      <td className="px-3">
                        <StatusPill status={status} />
                      </td>
                      <td
                        className="pl-3 pr-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onQuickReorder(item.sku)}
                          className="h-7 px-2.5 rounded bg-[#0F172A] text-white text-[11px] font-semibold hover:bg-[#1E293B] active:bg-[#0284C7] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          +250 PO
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {criticalSkus.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-[13px] text-[#64748B]"
                    >
                      All filtered SKUs are currently above reorder thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Channel Fulfillment Pipeline */}
        <div className="xl:col-span-5 card-surface p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-[16px] leading-[24px] font-semibold text-[#0F172A]">
                Fulfillment Pipeline SLA
              </h2>
              <p className="text-[12px] text-[#64748B]">
                Dispatch velocity and SLA compliance by commercial channel
              </p>
            </div>
            <Truck className="w-4 h-4 text-[#64748B] shrink-0 mt-1" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            {channelPipeline.map((row) => (
              <div
                key={row.channel}
                className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#0F172A] truncate">
                    {row.channel}
                  </div>
                  <div className="text-[12px] text-[#64748B] tabular-nums">
                    {formatNumber(row.unitsPerPeriod)} units · {row.cadence}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-[16px] font-bold text-[#0F172A] tabular-nums">
                    {row.slaPct.toFixed(1)}%
                  </div>
                  <div className="text-[11px] font-semibold text-[#047857]">
                    On-time SLA
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('outlets')}
            className="w-full h-9 rounded border border-[#CBD5E1] text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            Inspect Outlet Network Operations
          </button>
        </div>
      </section>
    </div>
  );
};
