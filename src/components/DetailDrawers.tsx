import React, { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, PackagePlus, X } from 'lucide-react';
import {
  deriveStockStatus,
  formatCurrency,
  formatNumber,
} from '../data/retailData';
import { OutletLocation, SkuItem } from '../types/retail';
import { Sparkline } from './Sparkline';
import { StatusPill } from './StatusPill';

interface SkuDetailDrawerProps {
  sku: SkuItem | null;
  outlets: OutletLocation[];
  onClose: () => void;
  onCreatePo: (skuCode: string, units: number) => void;
}

export const SkuDetailDrawer: React.FC<SkuDetailDrawerProps> = ({
  sku,
  outlets,
  onClose,
  onCreatePo,
}) => {
  const [poQty, setPoQty] = useState<number>(250);
  const [poSubmitted, setPoSubmitted] = useState<string | null>(null);

  if (!sku) {
    return null;
  }

  const status = deriveStockStatus(sku);
  const daysOfSupply =
    sku.dailyVelocity > 0 ? sku.onHand / sku.dailyVelocity : 999;
  const stockValue = sku.onHand * sku.unitCost;

  const handleSubmitPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (poQty <= 0) return;
    onCreatePo(sku.sku, poQty);
    setPoSubmitted(`PO issued for ${poQty} units`);
    setTimeout(() => setPoSubmitted(null), 3200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`SKU Intelligence: ${sku.name}`}
    >
      <div
        className="fixed inset-0 bg-[#0F172A]/48 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full sm:max-w-[460px] h-full bg-white flex flex-col shadow-[-8px_0_24px_-4px_rgba(15,23,42,0.15)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[12px] font-medium text-[#64748B]">
                {sku.sku}
              </span>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                ·
              </span>
              <span className="text-[12px] font-medium text-[#64748B]">
                {sku.category}
              </span>
            </div>
            <h2 className="font-display text-[18px] font-bold text-[#0F172A] leading-tight">
              {sku.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close SKU drawer"
            className="w-8 h-8 rounded flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status + Sparkline Banner */}
          <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5">
                Stock Health
              </div>
              <StatusPill status={status} />
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1">
                14-Day Velocity
              </div>
              <Sparkline
                data={sku.velocityHistory}
                strokeColor={status === 'Critical Low' ? '#F43F5E' : '#38BDF8'}
                width={120}
                height={32}
              />
            </div>
          </div>

          {/* Core Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-[#E2E8F0]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                On-Hand Units
              </div>
              <div className="font-display text-[22px] font-bold text-[#0F172A] tabular-nums mt-1">
                {formatNumber(sku.onHand)}
              </div>
              <div className="text-[12px] text-[#64748B] tabular-nums">
                {sku.reserved} reserved · {sku.pendingPoUnits} on PO
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E2E8F0]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Days of Supply
              </div>
              <div className="font-display text-[22px] font-bold text-[#0F172A] tabular-nums mt-1">
                {daysOfSupply.toFixed(1)}d
              </div>
              <div className="text-[12px] text-[#64748B] tabular-nums">
                {sku.dailyVelocity.toFixed(1)} units/day · {sku.leadTimeDays}d lead
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E2E8F0]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Gross Margin
              </div>
              <div className="font-display text-[22px] font-bold text-[#047857] tabular-nums mt-1">
                {sku.marginPct.toFixed(1)}%
              </div>
              <div className="text-[12px] text-[#64748B] tabular-nums">
                Cost {formatCurrency(sku.unitCost)} · MSRP {formatCurrency(sku.retailPrice)}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E2E8F0]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Inventory Value
              </div>
              <div className="font-display text-[22px] font-bold text-[#0F172A] tabular-nums mt-1">
                {formatCurrency(stockValue)}
              </div>
              <div className="text-[12px] text-[#64748B] truncate">
                {sku.supplier}
              </div>
            </div>
          </div>

          {/* Branch Stock Distribution */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Outlet Allocation Breakdown
              </h3>
              <span className="text-[12px] font-medium text-[#64748B] tabular-nums">
                {outlets.length} locations
              </span>
            </div>
            <div className="border border-[#E2E8F0] rounded-lg divide-y divide-[#F1F5F9]">
              {sku.outletAllocations.map((alloc) => {
                const outlet = outlets.find((o) => o.id === alloc.outletId);
                if (!outlet) return null;
                const share =
                  sku.onHand > 0
                    ? Math.min(100, (alloc.units / sku.onHand) * 100)
                    : 0;
                return (
                  <div
                    key={alloc.outletId}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#0F172A] truncate">
                        {outlet.name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {outlet.code} · {outlet.region}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div
                          className="h-full bg-[#0F172A] rounded-full"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-[13px] font-semibold text-[#0F172A] tabular-nums">
                        {alloc.units}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Replenishment Purchase Order Form */}
          <form
            onSubmit={handleSubmitPo}
            className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#0F172A]">
                Issue Replenishment Purchase Order
              </span>
              <span className="text-[11px] text-[#64748B] tabular-nums">
                Reorder pt: {sku.reorderPoint}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={25}
                max={5000}
                step={25}
                value={poQty}
                onChange={(e) => setPoQty(Number(e.target.value))}
                aria-label="Purchase order quantity"
                className="w-28 h-9 px-3 rounded bg-white border border-[#CBD5E1] text-[13px] font-semibold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#38BDF8]/40"
              />
              <button
                type="submit"
                className="flex-1 h-9 px-4 rounded bg-[#0F172A] text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#1E293B] active:bg-[#0284C7] transition-colors cursor-pointer whitespace-nowrap"
              >
                <PackagePlus className="w-4 h-4 text-[#38BDF8]" />
                <span>Approve PO ({formatCurrency(poQty * sku.unitCost)})</span>
              </button>
            </div>

            {poSubmitted && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#047857]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{poSubmitted}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

interface OutletDetailDrawerProps {
  outlet: OutletLocation | null;
  outlets: OutletLocation[];
  skus: SkuItem[];
  onClose: () => void;
  onTransferStock: (
    skuCode: string,
    fromOutletId: string,
    toOutletId: string,
    units: number
  ) => void;
}

export const OutletDetailDrawer: React.FC<OutletDetailDrawerProps> = ({
  outlet,
  outlets,
  skus,
  onClose,
  onTransferStock,
}) => {
  const [selectedSku, setSelectedSku] = useState<string>(
    skus[0]?.sku ?? ''
  );
  const [sourceOutletId, setSourceOutletId] = useState<string>('');
  const [transferUnits, setTransferUnits] = useState<number>(12);
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  if (!outlet) {
    return null;
  }

  const attainmentPct = (outlet.monthlyRevenue / outlet.monthlyTarget) * 100;
  const otherOutlets = outlets.filter((o) => o.id !== outlet.id);
  const activeSourceId = sourceOutletId || otherOutlets[0]?.id || '';

  const outletSkuStock = skus
    .map((item) => {
      const alloc = item.outletAllocations.find(
        (a) => a.outletId === outlet.id
      );
      return {
        sku: item.sku,
        name: item.name,
        category: item.category,
        units: alloc?.units ?? 0,
        dailyVelocity: item.dailyVelocity,
      };
    })
    .sort((a, b) => a.units - b.units);

  const sourceSkuUnits =
    skus
      .find((s) => s.sku === selectedSku)
      ?.outletAllocations.find((a) => a.outletId === activeSourceId)?.units ?? 0;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || !activeSourceId || transferUnits <= 0) return;
    const clamped = Math.min(transferUnits, sourceSkuUnits);
    if (clamped <= 0) return;
    onTransferStock(selectedSku, activeSourceId, outlet.id, clamped);
    const srcName =
      outlets.find((o) => o.id === activeSourceId)?.code ?? activeSourceId;
    setTransferMsg(`Transferred ${clamped} units from ${srcName}`);
    setTimeout(() => setTransferMsg(null), 3200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Outlet Operations: ${outlet.name}`}
    >
      <div
        className="fixed inset-0 bg-[#0F172A]/48 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full sm:max-w-[460px] h-full bg-white flex flex-col shadow-[-8px_0_24px_-4px_rgba(15,23,42,0.15)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[12px] font-medium text-[#64748B]">
                {outlet.code}
              </span>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                ·
              </span>
              <span className="text-[12px] font-medium text-[#64748B]">
                {outlet.region}
              </span>
            </div>
            <h2 className="font-display text-[18px] font-bold text-[#0F172A]">
              {outlet.name}
            </h2>
            <p className="text-[12px] text-[#64748B]">
              {outlet.city} · Store Lead: {outlet.manager}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close outlet drawer"
            className="w-8 h-8 rounded flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Revenue Attainment Card */}
          <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Monthly Target Attainment
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                  attainmentPct >= 100
                    ? 'bg-[#ECFDF5] text-[#047857]'
                    : 'bg-[#FFF1F2] text-[#BE123C]'
                }`}
              >
                {attainmentPct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-display text-[22px] font-bold text-[#0F172A] tabular-nums">
                {formatCurrency(outlet.monthlyRevenue)}
              </span>
              <span className="text-[12px] text-[#64748B] tabular-nums">
                Target {formatCurrency(outlet.monthlyTarget)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  attainmentPct >= 100 ? 'bg-[#10B981]' : 'bg-[#38BDF8]'
                }`}
                style={{ width: `${Math.min(100, attainmentPct)}%` }}
              />
            </div>
          </div>

          {/* Store Operations Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[#E2E8F0]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Conversion Rate
              </div>
              <div className="font-display text-[20px] font-bold text-[#0F172A] tabular-nums mt-0.5">
                {outlet.conversionPct.toFixed(1)}%
              </div>
              <div className="text-[12px] text-[#64748B] tabular-nums">
                {formatNumber(outlet.footfall)} monthly visitors
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[#E2E8F0]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Stock Accuracy
              </div>
              <div className="font-display text-[20px] font-bold text-[#0F172A] tabular-nums mt-0.5">
                {outlet.stockAccuracyPct.toFixed(1)}%
              </div>
              <div className="text-[12px] text-[#64748B] tabular-nums">
                SLA {outlet.fulfillmentSlaPct.toFixed(1)}% · {outlet.activeStaff} staff
              </div>
            </div>
          </div>

          {/* Lowest Stock SKUs at Outlet */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-2.5">
              Lowest Floor Inventory at {outlet.code}
            </h3>
            <div className="border border-[#E2E8F0] rounded-lg divide-y divide-[#F1F5F9]">
              {outletSkuStock.slice(0, 6).map((row) => (
                <div
                  key={row.sku}
                  className="px-3.5 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#0F172A] truncate">
                      {row.name}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {row.sku} · {row.category}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono text-[13px] font-bold tabular-nums ${
                        row.units <= 15 ? 'text-[#BE123C]' : 'text-[#0F172A]'
                      }`}
                    >
                      {row.units} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inter-Branch Stock Transfer */}
          <form
            onSubmit={handleTransfer}
            className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-3"
          >
            <div className="text-[13px] font-semibold text-[#0F172A]">
              Inter-Branch Stock Rebalance
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1">
                  SKU to Rebalance
                </label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full h-9 px-2.5 rounded bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                >
                  {skus.map((s) => (
                    <option key={s.sku} value={s.sku}>
                      {s.sku} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1">
                    Source Branch ({sourceSkuUnits} avail)
                  </label>
                  <select
                    value={activeSourceId}
                    onChange={(e) => setSourceOutletId(e.target.value)}
                    className="w-full h-9 px-2.5 rounded bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
                  >
                    {otherOutlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.code} ({o.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1">
                    Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, sourceSkuUnits)}
                    value={transferUnits}
                    onChange={(e) => setTransferUnits(Number(e.target.value))}
                    className="w-full h-9 px-2.5 rounded bg-white border border-[#CBD5E1] text-[13px] font-semibold text-[#0F172A] tabular-nums focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sourceSkuUnits <= 0}
                className="w-full h-9 px-4 rounded bg-[#0F172A] text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#1E293B] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#38BDF8]" />
                <span>Execute Transfer to {outlet.code}</span>
              </button>

              {transferMsg && (
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#047857]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{transferMsg}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
