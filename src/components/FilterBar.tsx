import React from 'react';
import { X } from 'lucide-react';
import {
  ALL_CATEGORIES,
  ALL_CHANNELS,
  ALL_REGIONS,
} from '../data/retailData';
import {
  CategoryName,
  ChannelName,
  GlobalFilters,
  RegionName,
} from '../types/retail';

interface FilterBarProps {
  filters: GlobalFilters;
  onToggleRegion: (r: RegionName) => void;
  onToggleChannel: (c: ChannelName) => void;
  onToggleCategory: (cat: CategoryName) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onToggleRegion,
  onToggleChannel,
  onToggleCategory,
  onClearAll,
  activeFilterCount,
}) => {
  return (
    <div className="hidden lg:block bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1600px] mx-auto px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mr-1">
            Regions
          </span>
          {ALL_REGIONS.map((region) => {
            const active = filters.regions.includes(region);
            return (
              <button
                key={region}
                type="button"
                onClick={() => onToggleRegion(region)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                    : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{region}</span>
                {active && <X className="w-3 h-3" aria-hidden="true" />}
              </button>
            );
          })}

          <span className="h-4 w-[1px] bg-[#E2E8F0] mx-1" aria-hidden="true" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mr-1">
            Channels
          </span>
          {ALL_CHANNELS.map((channel) => {
            const active = filters.channels.includes(channel);
            return (
              <button
                key={channel}
                type="button"
                onClick={() => onToggleChannel(channel)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                    : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{channel}</span>
                {active && <X className="w-3 h-3" aria-hidden="true" />}
              </button>
            );
          })}

          <span className="h-4 w-[1px] bg-[#E2E8F0] mx-1" aria-hidden="true" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mr-1">
            Categories
          </span>
          {ALL_CATEGORIES.map((category) => {
            const active = filters.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => onToggleCategory(category)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#0F172A] text-[#38BDF8] border-[#0F172A]'
                    : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{category}</span>
                {active && <X className="w-3 h-3" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#0F172A] text-[11px] font-bold tabular-nums">
              {activeFilterCount} active
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-[12px] font-semibold text-[#0284C7] hover:text-[#0F172A] cursor-pointer whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
