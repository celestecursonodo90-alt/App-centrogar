import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MapPin } from 'lucide-react';
import { ALL_REGIONS, formatCurrency, formatNumber } from '../data/retailData';
import { GlobalFilters, OutletLocation, RegionName } from '../types/retail';

interface OutletsScreenProps {
  outlets: OutletLocation[];
  filters: GlobalFilters;
  onToggleRegion: (region: RegionName) => void;
  onSelectOutlet: (outlet: OutletLocation) => void;
}

type OutletSortKey =
  | 'name'
  | 'monthlyRevenue'
  | 'attainment'
  | 'conversionPct'
  | 'stockAccuracyPct'
  | 'fulfillmentSlaPct';

export const OutletsScreen: React.FC<OutletsScreenProps> = ({
  outlets,
  filters,
  onToggleRegion,
  onSelectOutlet,
}) => {
  const [sortKey, setSortKey] = useState<OutletSortKey>('monthlyRevenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: OutletSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const regionRollups = ALL_REGIONS.map((region) => {
    const regOutlets = outlets.filter((o) => o.region === region);
    const rev = regOutlets.reduce((s, o) => s + o.monthlyRevenue, 0);
    const target = regOutlets.reduce((s, o) => s + o.monthlyTarget, 0);
    const att = target > 0 ? (rev / target) * 100 : 0;
    return {
      region,
      count: regOutlets.length,
      revenue: rev,
      attainment: att,
    };
  });

  const sortedOutlets = useMemo(() => {
    return [...outlets].sort((a, b) => {
      const aAtt = a.monthlyRevenue / a.monthlyTarget;
      const bAtt = b.monthlyRevenue / b.monthlyTarget;
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'monthlyRevenue':
          cmp = a.monthlyRevenue - b.monthlyRevenue;
          break;
        case 'attainment':
          cmp = aAtt - bAtt;
          break;
        case 'conversionPct':
          cmp = a.conversionPct - b.conversionPct;
          break;
        case 'stockAccuracyPct':
          cmp = a.stockAccuracyPct - b.stockAccuracyPct;
          break;
        case 'fulfillmentSlaPct':
          cmp = a.fulfillmentSlaPct - b.fulfillmentSlaPct;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [outlets, sortKey, sortDir]);

  const renderSortIcon = (key: OutletSortKey) => {
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
    <div className="space-y-6">
      {/* Regional Rollup Cards */}
      <section
        aria-label="Regional Store Performance"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6"
      >
        {regionRollups.map((reg) => {
          const active = filters.regions.includes(reg.region);
          const abovePlan = reg.attainment >= 100;
          return (
            <button
              key={reg.region}
              type="button"
              onClick={() => onToggleRegion(reg.region)}
              className={`card-surface card-surface-hover p-5 text-left transition-all cursor-pointer ${
                active ? 'ring-2 ring-[#38BDF8] border-[#0284C7]' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  {reg.region}
                </span>
                <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
                  {reg.count} stores
                </span>
              </div>
              <div className="font-display text-[26px] font-bold text-[#0F172A] tabular-nums mt-2">
                {formatCurrency(reg.revenue, true)}
              </div>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F1F5F9]">
                <span className="text-[12px] text-[#64748B]">
                  Plan Attainment
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                    abovePlan
                      ? 'bg-[#ECFDF5] text-[#047857]'
                      : 'bg-[#FFF1F2] text-[#BE123C]'
                  }`}
                >
                  {reg.attainment.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {/* Store & Fulfillment Hub Performance Table */}
      <section className="card-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Flagship & Regional Outlet Directory
            </h2>
            <p className="text-[12px] text-[#64748B]">
              Click any store to inspect floor inventory and execute inter-branch stock rebalancing
            </p>
          </div>
          <div className="text-[12px] text-[#64748B] tabular-nums">
            Showing {sortedOutlets.length} active locations
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="h-[36px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                <th className="pl-5 pr-3 sticky left-0 bg-[#F8FAFC] z-10 border-r border-[#E2E8F0]/60">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-[#0F172A]"
                  >
                    <span>Outlet / City</span>
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="px-3">Store Lead</th>
                <th className="px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('monthlyRevenue')}
                    className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                  >
                    <span>Revenue MTD</span>
                    {renderSortIcon('monthlyRevenue')}
                  </button>
                </th>
                <th className="px-3 w-[170px]">
                  <button
                    type="button"
                    onClick={() => handleSort('attainment')}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-[#0F172A]"
                  >
                    <span>Target Attainment</span>
                    {renderSortIcon('attainment')}
                  </button>
                </th>
                <th className="px-3 text-right">Footfall</th>
                <th className="px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('conversionPct')}
                    className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                  >
                    <span>Conv %</span>
                    {renderSortIcon('conversionPct')}
                  </button>
                </th>
                <th className="px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('stockAccuracyPct')}
                    className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                  >
                    <span>Accuracy</span>
                    {renderSortIcon('stockAccuracyPct')}
                  </button>
                </th>
                <th className="pl-3 pr-5 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('fulfillmentSlaPct')}
                    className="inline-flex items-center justify-end gap-1 cursor-pointer hover:text-[#0F172A]"
                  >
                    <span>SLA</span>
                    {renderSortIcon('fulfillmentSlaPct')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
              {sortedOutlets.map((outlet) => {
                const attainment =
                  (outlet.monthlyRevenue / outlet.monthlyTarget) * 100;
                const abovePlan = attainment >= 100;

                return (
                  <tr
                    key={outlet.id}
                    onClick={() => onSelectOutlet(outlet)}
                    className="h-[48px] hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                  >
                    <td className="pl-5 pr-3 py-2 sticky left-0 bg-white group-hover:bg-[#F8FAFC] border-r border-[#F1F5F9]">
                      <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                        <MapPin
                          className="w-3.5 h-3.5 text-[#38BDF8] shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{outlet.name}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] pl-5">
                        {outlet.code} · {outlet.city}
                      </div>
                    </td>
                    <td className="px-3 text-[#45464d] whitespace-nowrap">
                      {outlet.manager}
                    </td>
                    <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {formatCurrency(outlet.monthlyRevenue)}
                    </td>
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              abovePlan ? 'bg-[#10B981]' : 'bg-[#38BDF8]'
                            }`}
                            style={{ width: `${Math.min(100, attainment)}%` }}
                          />
                        </div>
                        <span
                          className={`text-[12px] font-semibold tabular-nums w-12 text-right ${
                            abovePlan ? 'text-[#047857]' : 'text-[#BE123C]'
                          }`}
                        >
                          {attainment.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 text-right text-[#64748B] tabular-nums">
                      {formatNumber(outlet.footfall)}
                    </td>
                    <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {outlet.conversionPct.toFixed(1)}%
                    </td>
                    <td className="px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {outlet.stockAccuracyPct.toFixed(1)}%
                    </td>
                    <td className="pl-3 pr-5 text-right font-semibold text-[#047857] tabular-nums">
                      {outlet.fulfillmentSlaPct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
