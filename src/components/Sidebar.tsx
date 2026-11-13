import React, { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  LayoutDashboard,
  PackageCheck,
} from 'lucide-react';
import { NavScreen } from '../types/retail';
import executiveAvatar from '../assets/images/avatar_executive_director_1794570993965.jpg';

interface SidebarProps {
  activeScreen: NavScreen;
  onSelectScreen: (screen: NavScreen) => void;
  criticalCount: number;
  pendingPoUnits: number;
  onJumpToCriticalStock: () => void;
}

const NAV_ITEMS: {
  id: NavScreen;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'sales', label: 'Sales & Margin', icon: BarChart3 },
  { id: 'outlets', label: 'Outlets', icon: Building2 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onSelectScreen,
  criticalCount,
  pendingPoUnits,
  onJumpToCriticalStock,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[252px] lg:shrink-0 bg-[#0F172A] text-white min-h-screen sticky top-0 h-screen select-none border-r border-[#1E293B]">
      {/* Brand Header */}
      <div className="h-[60px] px-5 flex items-center gap-3 border-b border-[#1E293B]">
        <div className="w-8 h-8 rounded bg-[#38BDF8] flex items-center justify-center shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 18V6L10 13L15 8L20 18H4Z"
              fill="#0F172A"
              stroke="#0F172A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-display text-[15px] font-bold tracking-[-0.01em] text-white whitespace-nowrap truncate">
            Meridian Retail
          </div>
        </div>
      </div>

      {/* Primary Workspace Navigation */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1" aria-label="Primary">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectScreen(item.id)}
              className={`group relative flex items-center justify-between px-3 py-2.5 rounded text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1E293B] text-[#38BDF8]'
                  : 'text-[#CBD5E1] hover:bg-[#1E293B]/60 hover:text-white'
              }`}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#38BDF8]"
                  aria-hidden="true"
                />
              )}
              <span className="flex items-center gap-3">
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive
                      ? 'text-[#38BDF8]'
                      : 'text-[#64748B] group-hover:text-[#CBD5E1]'
                  }`}
                />
                <span>{item.label}</span>
              </span>
              {item.id === 'inventory' && criticalCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF1F2] text-[#BE123C] tabular-nums">
                  {criticalCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Operational Priority Callout */}
        <div className="mt-6 mx-1 p-3.5 rounded-lg bg-[#1E293B] border border-[#334155]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#94A3B8]">
              Replenishment Queue
            </span>
            <PackageCheck className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
          </div>
          <div className="font-display text-[20px] font-bold text-white tabular-nums">
            {pendingPoUnits.toLocaleString('en-US')} units
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-1 leading-[16px]">
            {criticalCount} critical SKUs require PO approval across 8 outlets.
          </p>
          <button
            type="button"
            onClick={onJumpToCriticalStock}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#38BDF8] text-[#0F172A] text-[12px] font-semibold hover:bg-[#0284C7] hover:text-white transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            Review Critical SKUs
          </button>
        </div>
      </nav>

      {/* Executive Account Footer */}
      <div className="p-4 border-t border-[#1E293B] flex items-center gap-3">
        {!imgFailed ? (
          <img
            src={executiveAvatar}
            alt="Elena Vance"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-9 h-9 rounded-full object-cover border border-[#334155] shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[12px] font-bold text-[#38BDF8] shrink-0">
            EV
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-white truncate">
            Elena Vance
          </div>
          <div className="text-[11px] text-[#94A3B8] truncate">
            VP Retail Operations
          </div>
        </div>
      </div>
    </aside>
  );
};
