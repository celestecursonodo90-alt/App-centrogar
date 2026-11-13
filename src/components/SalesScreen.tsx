import React, { useState } from 'react';
import {
  ALL_CATEGORIES,
  ALL_CHANNELS,
  DATE_RANGE_MULTIPLIER,
  formatCurrency,
  formatNumber,
} from '../data/retailData';
import {
  ChannelName,
  CommercialOrder,
  GlobalFilters,
  SkuItem,
} from '../types/retail';

interface SalesScreenProps {
  skus: SkuItem[];
  orders: CommercialOrder[];
  filters: GlobalFilters;
  onToggleChannel: (ch: ChannelName) => void;
  onSelectSku: (sku: SkuItem) => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({
  skus,
  orders,
  filters,
  onToggleChannel,
  onSelectSku,
}) => {
  const [orderStateFilter, setOrderStateFilter] = useState<string>('All');
  const dateMult = DATE_RANGE_MULTIPLIER[filters.dateRange];

  const channelMetrics = ALL_CHANNELS.map((channel) => {
    const chSkus = skus.filter((s) => s.primaryChannel === channel);
    const rev = chSkus.reduce(
      (sum, s) => sum + s.dailyVelocity * 30 * s.retailPrice * dateMult,
      0
    );
    const cogs = chSkus.reduce(
      (sum, s) => sum + s.dailyVelocity * 30 * s.unitCost * dateMult,
      0
    );
    const marginPct = rev > 0 ? ((rev - cogs) / rev) * 100 : 0;
    const units = chSkus.reduce(
      (sum, s) => sum + s.dailyVelocity * 30 * dateMult,
      0
    );
    return {
      channel,
      revenue: rev,
      marginPct,
      units,
      skuCount: chSkus.length,
    };
  });

  const totalChannelRev =
    channelMetrics.reduce((sum, c) => sum + c.revenue, 0) || 1;

  const categoryFinancials = ALL_CATEGORIES.map((category, idx) => {
    const catSkus = skus.filter((s) => s.category === category);
    const revenue = catSkus.reduce(
      (sum, s) => sum + s.dailyVelocity * 30 * s.retailPrice * dateMult,
      0
    );
    const cogs = catSkus.reduce(
      (sum, s) => sum + s.dailyVelocity * 30 * s.unitCost * dateMult,
      0
    );
    const grossProfit = revenue - cogs;
    const marginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const yoyDeltas = [14.2, 9.8, 12.1, 7.4, 16.5];
    const sellThroughs = [78.4, 82.1, 74.9, 69.5, 84.2];
    return {
      category,
      revenue,
      cogs,
      grossProfit,
      marginPct,
      yoyDelta: yoyDeltas[idx],
      sellThrough: sellThroughs[idx],
    };
  });

  const topRevenueSkus = [...skus]
    .sort(
      (a, b) =>
        b.dailyVelocity * b.retailPrice - a.dailyVelocity * a.retailPrice
    )
    .slice(0, 5);

  const visibleOrders = orders.filter((o) => {
    if (
      orderStateFilter !== 'All' &&
      o.fulfillmentState !== orderStateFilter
    ) {
      return false;
    }
    if (
      filters.channels.length > 0 &&
      !filters.channels.includes(o.channel)
    ) {
      return false;
    }
    if (
      filters.regions.length > 0 &&
      !filters.regions.includes(o.region)
    ) {
      return false;
    }
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(o.category)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 4-Column Interactive Channel Cards */}
      <section
        aria-label="Channel Revenue Breakdown"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6"
      >
        {channelMetrics.map((ch) => {
          const active = filters.channels.includes(ch.channel);
          const share = (ch.revenue / totalChannelRev) * 100;
          return (
            <button
              key={ch.channel}
              type="button"
              onClick={() => onToggleChannel(ch.channel)}
              className={`card-surface card-surface-hover p-5 text-left transition-all cursor-pointer ${
                active ? 'ring-2 ring-[#38BDF8] border-[#0284C7]' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  {ch.channel}
                </span>
                <span className="text-[11px] font-semibold text-[#0284C7] tabular-nums">
                  {share.toFixed(1)}% share
                </span>
              </div>
              <div className="font-display text-[26px] font-bold text-[#0F172A] tabular-nums mt-2">
                {formatCurrency(ch.revenue, true)}
              </div>
              <div className="flex items-center justify-between text-[12px] text-[#64748B] mt-3 pt-2.5 border-t border-[#F1F5F9] tabular-nums">
                <span>{formatNumber(ch.units)} units</span>
                <span className="font-semibold text-[#047857]">
                  {ch.marginPct.toFixed(1)}% margin
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {/* Category Financial Matrix + Top Revenue SKUs */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
        <div className="xl:col-span-7 card-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Category Financial P&L Matrix
            </h2>
            <p className="text-[12px] text-[#64748B]">
              Revenue, landed COGS, gross profit realization, and seasonal sell-through
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="h-[36px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  <th className="pl-5 pr-3">Category</th>
                  <th className="px-3 text-right">Revenue</th>
                  <th className="px-3 text-right">COGS</th>
                  <th className="px-3 text-right">Gross Profit</th>
                  <th className="px-3 text-right">Margin</th>
                  <th className="px-3 text-right">YoY</th>
                  <th className="pl-3 pr-5 text-right">Sell-Thru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
                {categoryFinancials.map((row) => (
                  <tr key={row.category} className="h-[44px] hover:bg-[#F8FAFC]">
                    <td className="pl-5 pr-3 font-semibold text-[#0F172A]">
                      {row.category}
                    </td>
                    <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {formatCurrency(row.revenue, true)}
                    </td>
                    <td className="px-3 text-right text-[#64748B] tabular-nums">
                      {formatCurrency(row.cogs, true)}
                    </td>
                    <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {formatCurrency(row.grossProfit, true)}
                    </td>
                    <td className="px-3 text-right font-semibold text-[#047857] tabular-nums">
                      {row.marginPct > 0 ? `${row.marginPct.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-3 text-right tabular-nums">
                      <span className="px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#047857] text-[11px] font-semibold">
                        +{row.yoyDelta.toFixed(1)}%
                      </span>
                    </td>
                    <td className="pl-3 pr-5 text-right font-semibold text-[#0F172A] tabular-nums">
                      {row.sellThrough.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing SKUs */}
        <div className="xl:col-span-5 card-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Top Revenue Velocity SKUs
            </h2>
            <p className="text-[12px] text-[#64748B]">
              Highest daily revenue contributors in active selection
            </p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {topRevenueSkus.map((item, idx) => {
              const dailyRev = item.dailyVelocity * item.retailPrice;
              return (
                <button
                  key={item.sku}
                  type="button"
                  onClick={() => onSelectSku(item)}
                  className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded bg-[#F1F5F9] text-[#0F172A] font-display text-[12px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#0F172A] truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate">
                        {item.sku} · {item.dailyVelocity.toFixed(1)} units/day
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <div className="text-[13px] font-bold text-[#0F172A]">
                      {formatCurrency(dailyRev)}/d
                    </div>
                    <div className="text-[11px] font-semibold text-[#047857]">
                      {item.marginPct.toFixed(1)}% GM
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commercial Order Ledger */}
      <section className="card-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Commercial Order & Dispatch Ledger
            </h2>
            <p className="text-[12px] text-[#64748B]">
              Recent omnichannel orders across flagship, direct, and wholesale pipelines
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                'All',
                'Dispatched',
                'Ready for Pickup',
                'In Transit',
                'Exception',
              ] as const
            ).map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setOrderStateFilter(state)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                  orderStateFilter === state
                    ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                    : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="h-[36px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                <th className="pl-5 pr-3">Order ID</th>
                <th className="px-3">Timestamp</th>
                <th className="px-3">Channel</th>
                <th className="px-3">Fulfillment Node</th>
                <th className="px-3">Category</th>
                <th className="px-3 text-right">Units</th>
                <th className="px-3 text-right">Revenue</th>
                <th className="px-3 text-right">Margin</th>
                <th className="pl-3 pr-5 text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
              {visibleOrders.map((ord) => {
                const stateStyle =
                  ord.fulfillmentState === 'Dispatched'
                    ? 'bg-[#ECFDF5] text-[#047857]'
                    : ord.fulfillmentState === 'Exception'
                    ? 'bg-[#FFF1F2] text-[#BE123C]'
                    : ord.fulfillmentState === 'Ready for Pickup'
                    ? 'bg-[#F0F9FF] text-[#0369A1]'
                    : 'bg-[#FFFBEB] text-[#B45309]';
                return (
                  <tr key={ord.orderId} className="h-[44px] hover:bg-[#F8FAFC]">
                    <td className="pl-5 pr-3 font-mono font-semibold text-[#0F172A]">
                      {ord.orderId}
                    </td>
                    <td className="px-3 text-[#64748B] tabular-nums">
                      {ord.timestamp}
                    </td>
                    <td className="px-3 text-[#0F172A] font-medium">
                      {ord.channel}
                    </td>
                    <td className="px-3 text-[#0F172A]">{ord.outletName}</td>
                    <td className="px-3 text-[#64748B]">{ord.category}</td>
                    <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {ord.units}
                    </td>
                    <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {formatCurrency(ord.revenue)}
                    </td>
                    <td className="px-3 text-right font-semibold text-[#047857] tabular-nums">
                      {ord.marginPct.toFixed(1)}%
                    </td>
                    <td className="pl-3 pr-5 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${stateStyle}`}
                      >
                        {ord.fulfillmentState}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {visibleOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-8 text-center text-[13px] text-[#64748B]"
                  >
                    No orders match the current channel, region, or fulfillment filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
