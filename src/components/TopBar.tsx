import React from 'react';
import {
  Calendar,
  Download,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { DATE_RANGE_LABELS } from '../data/retailData';
import { DateRangeKey, NavScreen } from '../types/retail';

interface TopBarProps {
  activeScreen: NavScreen;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  dateRange: DateRangeKey;
  onDateRangeChange: (d: DateRangeKey) => void;
  activeFilterCount: number;
  onOpenFilterDrawer: () => void;
  onExportCsv: () => void;
  exportNotice: string | null;
}

const SCREEN_TITLES: Record<NavScreen, string> = {
  overview: 'Executive Overview',
  inventory: 'Inventory & Replenishment',
  sales: 'Sales & Margin Performance',
  outlets: 'Outlet Network Operations',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  activeFilterCount,
  onOpenFilterDrawer,
  onExportCsv,
  exportNotice,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">
        {/* Left: Brand (Mobile) + Breadcrumb Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="lg:hidden w-7 h-7 rounded bg-[#0F172A] flex items-center justify-center shrink-0">
            <span className="font-display text-[13px] font-bold text-[#38BDF8]">
              M
            </span>
          </div>
          <div className="min-w-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
              <span>Executive Intelligence</span>
              <span aria-hidden="true">/</span>
              <span className="text-[#0F172A]">
                {SCREEN_TITLES[activeScreen]}
              </span>
            </div>
            <h1 className="sm:hidden font-display text-[16px] font-bold text-[#0F172A] truncate">
              {SCREEN_TITLES[activeScreen]}
            </h1>
          </div>
        </div>

        {/* Right: Search, Date Range, Mobile/Tablet Filters Trigger, Export CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Search Input */}
          <div className="relative hidden md:block w-[220px] xl:w-[260px]">
            <Search
              className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search SKU, outlet, supplier..."
              aria-label="Search SKU, outlet, or supplier"
              className="w-full h-9 pl-8 pr-7 rounded bg-white border border-[#CBD5E1] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#38BDF8]/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Range Select */}
          <div className="relative flex items-center">
            <Calendar
              className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRangeKey)}
              aria-label="Reporting period"
              className="h-9 pl-8 pr-7 rounded bg-white border border-[#CBD5E1] text-[13px] font-medium text-[#0F172A] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#38BDF8]/40 cursor-pointer"
            >
              {(Object.keys(DATE_RANGE_LABELS) as DateRangeKey[]).map((key) => (
                <option key={key} value={key}>
                  {DATE_RANGE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Tablet/Mobile Filter Drawer Button */}
          <button
            type="button"
            onClick={onOpenFilterDrawer}
            className="lg:hidden h-9 px-3 rounded border border-[#CBD5E1] bg-white text-[#0F172A] text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#F8FAFC] cursor-pointer whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0F172A] text-[#38BDF8] text-[11px] font-bold tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Primary Export CSV Action */}
          <button
            type="button"
            onClick={onExportCsv}
            className="h-9 px-3.5 rounded bg-[#38BDF8] text-[#0F172A] hover:bg-[#0284C7] hover:text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {exportNotice ?? 'Export CSV'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Strip */}
      <div className="md:hidden px-4 pb-2.5">
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search SKU, outlet, supplier..."
            aria-label="Search SKU, outlet, or supplier"
            className="w-full h-[40px] pl-9 pr-8 rounded bg-white border border-[#CBD5E1] text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#38BDF8]/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
