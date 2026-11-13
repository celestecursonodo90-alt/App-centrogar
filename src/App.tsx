import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  INITIAL_ORDERS,
  INITIAL_OUTLETS,
  INITIAL_SKUS,
  deriveStockStatus,
} from './data/retailData';
import {
  CategoryName,
  ChannelName,
  GlobalFilters,
  NavScreen,
  OutletLocation,
  RegionName,
  SkuItem,
  StockHealthStatus,
} from './types/retail';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { FilterDrawer } from './components/FilterDrawer';
import { OverviewScreen } from './components/OverviewScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { SalesScreen } from './components/SalesScreen';
import { OutletsScreen } from './components/OutletsScreen';
import { OutletDetailDrawer, SkuDetailDrawer } from './components/DetailDrawers';

const EMPTY_FILTERS: GlobalFilters = {
  dateRange: '30d',
  regions: [],
  channels: [],
  categories: [],
  stockStatuses: [],
  searchQuery: '',
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavScreen>('overview');
  const [filters, setFilters] = useState<GlobalFilters>(EMPTY_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [skus, setSkus] = useState<SkuItem[]>(INITIAL_SKUS);
  const [outlets] = useState<OutletLocation[]>(INITIAL_OUTLETS);
  const [orders] = useState(INITIAL_ORDERS);

  const [selectedSkuCode, setSelectedSkuCode] = useState<string | null>(null);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3200);
  };

  const toggleItem = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const handleToggleRegion = (region: RegionName) => {
    setFilters((prev) => ({
      ...prev,
      regions: toggleItem(prev.regions, region),
    }));
  };

  const handleToggleChannel = (channel: ChannelName) => {
    setFilters((prev) => ({
      ...prev,
      channels: toggleItem(prev.channels, channel),
    }));
  };

  const handleToggleCategory = (category: CategoryName) => {
    setFilters((prev) => ({
      ...prev,
      categories: toggleItem(prev.categories, category),
    }));
  };

  const handleToggleStockStatus = (status: StockHealthStatus) => {
    setFilters((prev) => ({
      ...prev,
      stockStatuses: toggleItem(prev.stockStatuses, status),
    }));
  };

  const handleClearAllFilters = () => {
    setFilters((prev) => ({
      ...EMPTY_FILTERS,
      dateRange: prev.dateRange,
    }));
  };

  const activeFilterCount =
    filters.regions.length +
    filters.channels.length +
    filters.categories.length +
    filters.stockStatuses.length;

  const filteredOutlets = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return outlets.filter((o) => {
      if (filters.regions.length > 0 && !filters.regions.includes(o.region)) {
        return false;
      }
      if (q) {
        const matchesOutlet =
          o.name.toLowerCase().includes(q) ||
          o.code.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.manager.toLowerCase().includes(q);
        const matchesSomeSku = skus.some(
          (s) =>
            s.sku.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.supplier.toLowerCase().includes(q)
        );
        if (!matchesOutlet && !matchesSomeSku) return false;
      }
      return true;
    });
  }, [outlets, filters.regions, filters.searchQuery, skus]);

  const filteredSkus = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return skus.filter((item) => {
      if (
        filters.channels.length > 0 &&
        !filters.channels.includes(item.primaryChannel)
      ) {
        return false;
      }
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(item.category)
      ) {
        return false;
      }
      if (filters.stockStatuses.length > 0) {
        const st = deriveStockStatus(item);
        if (!filters.stockStatuses.includes(st)) return false;
      }
      if (q) {
        const hit =
          item.sku.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [skus, filters]);

  const criticalCount = useMemo(
    () => skus.filter((s) => deriveStockStatus(s) === 'Critical Low').length,
    [skus]
  );

  const totalPendingPoUnits = useMemo(
    () => skus.reduce((sum, s) => sum + s.pendingPoUnits, 0),
    [skus]
  );

  // Scale factor for time-series chart when region/channel/category filters are applied
  const chartScaleFactor = useMemo(() => {
    const regionScale =
      outlets.length > 0 ? filteredOutlets.length / outlets.length : 1;
    const skuScale = skus.length > 0 ? filteredSkus.length / skus.length : 1;
    return Math.max(0.18, regionScale * skuScale);
  }, [filteredOutlets.length, outlets.length, filteredSkus.length, skus.length]);

  const handleCreatePo = (skuCode: string, units: number) => {
    setSkus((prev) =>
      prev.map((item) =>
        item.sku === skuCode
          ? { ...item, pendingPoUnits: item.pendingPoUnits + units }
          : item
      )
    );
    showToast(`Approved PO for +${units} units on ${skuCode}`);
  };

  const handleTransferStock = (
    skuCode: string,
    fromOutletId: string,
    toOutletId: string,
    units: number
  ) => {
    setSkus((prev) =>
      prev.map((item) => {
        if (item.sku !== skuCode) return item;
        const nextAllocations = item.outletAllocations.map((alloc) => {
          if (alloc.outletId === fromOutletId) {
            return { ...alloc, units: Math.max(0, alloc.units - units) };
          }
          if (alloc.outletId === toOutletId) {
            return { ...alloc, units: alloc.units + units };
          }
          return alloc;
        });
        return { ...item, outletAllocations: nextAllocations };
      })
    );
    showToast(`Rebalanced ${units} units of ${skuCode}`);
  };

  const handleExportCsv = () => {
    let csvContent = '';
    let filename = 'meridian-export.csv';

    if (activeScreen === 'outlets') {
      filename = `meridian-outlets-${filters.dateRange}.csv`;
      const headers = [
        'Code',
        'Outlet',
        'City',
        'Region',
        'Manager',
        'Revenue_MTD',
        'Target_MTD',
        'Conversion_Pct',
        'Stock_Accuracy_Pct',
        'Fulfillment_SLA_Pct',
      ];
      const rows = filteredOutlets.map((o) => [
        o.code,
        `"${o.name}"`,
        `"${o.city}"`,
        `"${o.region}"`,
        `"${o.manager}"`,
        o.monthlyRevenue,
        o.monthlyTarget,
        o.conversionPct,
        o.stockAccuracyPct,
        o.fulfillmentSlaPct,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
        '\n'
      );
    } else {
      filename = `meridian-inventory-${filters.dateRange}.csv`;
      const headers = [
        'SKU',
        'Product',
        'Category',
        'Channel',
        'On_Hand',
        'Daily_Velocity',
        'Unit_Cost',
        'Retail_Price',
        'Margin_Pct',
        'Pending_PO',
        'Health_Status',
      ];
      const rows = filteredSkus.map((s) => [
        s.sku,
        `"${s.name}"`,
        `"${s.category}"`,
        `"${s.primaryChannel}"`,
        s.onHand,
        s.dailyVelocity,
        s.unitCost,
        s.retailPrice,
        s.marginPct,
        s.pendingPoUnits,
        `"${deriveStockStatus(s)}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
        '\n'
      );
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice('Exported');
    setTimeout(() => setExportNotice(null), 2200);
  };

  const selectedSku = useMemo(
    () => skus.find((s) => s.sku === selectedSkuCode) ?? null,
    [skus, selectedSkuCode]
  );

  const selectedOutlet = useMemo(
    () => outlets.find((o) => o.id === selectedOutletId) ?? null,
    [outlets, selectedOutletId]
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex">
      {/* Persistent Desktop Executive Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        criticalCount={criticalCount}
        pendingPoUnits={totalPendingPoUnits}
        onJumpToCriticalStock={() => {
          setFilters((prev) => ({
            ...prev,
            stockStatuses: ['Critical Low', 'Low Stock'],
          }));
          setActiveScreen('inventory');
        }}
      />

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col pb-[76px] lg:pb-8">
        <TopBar
          activeScreen={activeScreen}
          searchQuery={filters.searchQuery}
          onSearchChange={(q) =>
            setFilters((prev) => ({ ...prev, searchQuery: q }))
          }
          dateRange={filters.dateRange}
          onDateRangeChange={(d) =>
            setFilters((prev) => ({ ...prev, dateRange: d }))
          }
          activeFilterCount={activeFilterCount}
          onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
          onExportCsv={handleExportCsv}
          exportNotice={exportNotice}
        />

        {/* Desktop Inline Filter Matrix */}
        <FilterBar
          filters={filters}
          onToggleRegion={handleToggleRegion}
          onToggleChannel={handleToggleChannel}
          onToggleCategory={handleToggleCategory}
          onClearAll={handleClearAllFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Workspace Viewport */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-6">
          {activeScreen === 'overview' && (
            <OverviewScreen
              skus={skus}
              filteredSkus={filteredSkus}
              filteredOutlets={filteredOutlets}
              filters={filters}
              scaleFactor={chartScaleFactor}
              onSelectSku={(s) => setSelectedSkuCode(s.sku)}
              onNavigate={setActiveScreen}
              onFilterCriticalOnly={() => {
                setFilters((prev) => ({
                  ...prev,
                  stockStatuses: ['Critical Low'],
                }));
                setActiveScreen('inventory');
              }}
              onToggleCategoryFilter={handleToggleCategory}
              onQuickReorder={(skuCode) => handleCreatePo(skuCode, 250)}
            />
          )}

          {activeScreen === 'inventory' && (
            <InventoryScreen
              skus={filteredSkus}
              allSkusCount={skus.length}
              selectedStatuses={filters.stockStatuses}
              onToggleStatus={handleToggleStockStatus}
              onClearStatuses={() =>
                setFilters((prev) => ({ ...prev, stockStatuses: [] }))
              }
              onSelectSku={(s) => setSelectedSkuCode(s.sku)}
              onResetAllFilters={handleClearAllFilters}
            />
          )}

          {activeScreen === 'sales' && (
            <SalesScreen
              skus={filteredSkus}
              orders={orders}
              filters={filters}
              onToggleChannel={handleToggleChannel}
              onSelectSku={(s) => setSelectedSkuCode(s.sku)}
            />
          )}

          {activeScreen === 'outlets' && (
            <OutletsScreen
              outlets={filteredOutlets}
              filters={filters}
              onToggleRegion={handleToggleRegion}
              onSelectOutlet={(o) => setSelectedOutletId(o.id)}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileNav
        activeScreen={activeScreen}
        onSelectScreen={(screen) => {
          setIsFilterDrawerOpen(false);
          setActiveScreen(screen);
        }}
        onOpenFilters={() => setIsFilterDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
        isFilterOpen={isFilterDrawerOpen}
      />

      {/* Slide-Over Filter Drawer (Mobile & Tablet) */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onClearAll={handleClearAllFilters}
      />

      {/* SKU Intelligence & Replenishment Drawer */}
      <SkuDetailDrawer
        sku={selectedSku}
        outlets={outlets}
        onClose={() => setSelectedSkuCode(null)}
        onCreatePo={handleCreatePo}
      />

      {/* Outlet Operations & Branch Rebalance Drawer */}
      <OutletDetailDrawer
        outlet={selectedOutlet}
        outlets={outlets}
        skus={skus}
        onClose={() => setSelectedOutletId(null)}
        onTransferStock={handleTransferStock}
      />

      {/* Action Confirmation Toast */}
      {actionToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 px-4 py-2.5 rounded-lg bg-[#0F172A] text-white text-[13px] font-semibold shadow-lg flex items-center gap-2 border border-[#334155]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
}
