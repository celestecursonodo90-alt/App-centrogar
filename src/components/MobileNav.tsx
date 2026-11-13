import React from 'react';
import {
  BarChart3,
  Boxes,
  Building2,
  LayoutDashboard,
  SlidersHorizontal,
} from 'lucide-react';
import { NavScreen } from '../types/retail';

interface MobileNavProps {
  activeScreen: NavScreen;
  onSelectScreen: (screen: NavScreen) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  isFilterOpen: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenFilters,
  activeFilterCount,
  isFilterOpen,
}) => {
  const navItems: {
    id: NavScreen;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'sales', label: 'Sales', icon: BarChart3 },
    { id: 'outlets', label: 'Outlets', icon: Building2 },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-[60px] bg-[#0F172A] border-t border-[#1E293B] grid grid-cols-5"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = !isFilterOpen && activeScreen === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectScreen(item.id)}
            className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
              isActive ? 'text-[#38BDF8]' : 'text-[#64748B] hover:text-[#CBD5E1]'
            }`}
          >
            {isActive && (
              <span
                className="absolute top-0 left-3 right-3 h-[2px] bg-[#38BDF8]"
                aria-hidden="true"
              />
            )}
            <Icon className="w-[18px] h-[18px]" />
            <span className="leading-none">{item.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onOpenFilters}
        className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
          isFilterOpen
            ? 'text-[#38BDF8]'
            : 'text-[#64748B] hover:text-[#CBD5E1]'
        }`}
      >
        {isFilterOpen && (
          <span
            className="absolute top-0 left-3 right-3 h-[2px] bg-[#38BDF8]"
            aria-hidden="true"
          />
        )}
        <div className="relative">
          <SlidersHorizontal className="w-[18px] h-[18px]" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#38BDF8] text-[#0F172A] text-[10px] font-bold flex items-center justify-center tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </div>
        <span className="leading-none">Filters</span>
      </button>
    </nav>
  );
};
