import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  ALL_CATEGORIES,
  ALL_CHANNELS,
  ALL_REGIONS,
  ALL_STOCK_STATUSES,
} from '../data/retailData';
import {
  CategoryName,
  ChannelName,
  GlobalFilters,
  RegionName,
  StockHealthStatus,
} from '../types/retail';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: GlobalFilters;
  onApplyFilters: (next: GlobalFilters) => void;
  onClearAll: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearAll,
}) => {
  const [draft, setDraft] = useState<GlobalFilters>(filters);

  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) {
    return null;
  }

  const toggleItem = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const draftCount =
    draft.regions.length +
    draft.channels.length +
    draft.categories.length +
    draft.stockStatuses.length;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Filter Retail Telemetry"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/48 backdrop-blur-[4px]"
        onClick={onClose}
      />

      {/* Slide-Over Panel */}
      <div className="relative z-10 w-full sm:max-w-[380px] h-full bg-white flex flex-col shadow-[-8px_0_24px_-4px_rgba(15,23,42,0.15)]">
        {/* Sticky Top Bar */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Filter Operations
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#0F172A] text-[11px] font-bold tabular-nums">
              {draftCount}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-8 h-8 rounded flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Filter Sections */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Regions */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-2.5">
              Operating Regions
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_REGIONS.map((region: RegionName) => {
                const active = draft.regions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        regions: toggleItem(prev.regions, region),
                      }))
                    }
                    className={`h-8 px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                        : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>{region}</span>
                    {active && <X className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Channels */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-2.5">
              Sales Channels
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_CHANNELS.map((channel: ChannelName) => {
                const active = draft.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        channels: toggleItem(prev.channels, channel),
                      }))
                    }
                    className={`h-8 px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                        : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>{channel}</span>
                    {active && <X className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-2.5">
              Merchandise Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((category: CategoryName) => {
                const active = draft.categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        categories: toggleItem(prev.categories, category),
                      }))
                    }
                    className={`h-8 px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                        : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>{category}</span>
                    {active && <X className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Health */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-2.5">
              Inventory Health
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_STOCK_STATUSES.map((status: StockHealthStatus) => {
                const active = draft.stockStatuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        stockStatuses: toggleItem(prev.stockStatuses, status),
                      }))
                    }
                    className={`h-8 px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                        : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>{status}</span>
                    {active && <X className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="px-5 py-4 border-t border-[#E2E8F0] bg-white flex flex-col gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              onApplyFilters(draft);
              onClose();
            }}
            className="w-full h-10 rounded bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] active:bg-[#0284C7] transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={() => {
              onClearAll();
              setDraft({
                ...draft,
                regions: [],
                channels: [],
                categories: [],
                stockStatuses: [],
              });
            }}
            className="w-full h-9 rounded border border-[#CBD5E1] text-[#0F172A] text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
