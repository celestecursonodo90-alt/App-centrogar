export type NavScreen = 'overview' | 'inventory' | 'sales' | 'outlets';

export type DateRangeKey = '7d' | '30d' | 'qtd' | 'ytd';

export type RegionName =
  | 'North America East'
  | 'North America West'
  | 'EMEA Flagships'
  | 'APAC Hubs';

export type ChannelName =
  | 'Flagship Retail'
  | 'E-Commerce Direct'
  | 'Marketplace'
  | 'Wholesale B2B';

export type CategoryName =
  | 'Outerwear'
  | 'Tailored Knitwear'
  | 'Footwear'
  | 'Leather Goods'
  | 'Technical Accessories';

export type StockHealthStatus =
  | 'In Stock'
  | 'Low Stock'
  | 'Critical Low'
  | 'Overstock';

export interface OutletStockAllocation {
  outletId: string;
  units: number;
}

export interface SkuItem {
  sku: string;
  name: string;
  category: CategoryName;
  primaryChannel: ChannelName;
  supplier: string;
  unitCost: number;
  retailPrice: number;
  marginPct: number;
  onHand: number;
  reserved: number;
  dailyVelocity: number;
  reorderPoint: number;
  pendingPoUnits: number;
  leadTimeDays: number;
  lastRestockDate: string;
  velocityHistory: number[];
  outletAllocations: OutletStockAllocation[];
}

export interface OutletLocation {
  id: string;
  code: string;
  name: string;
  city: string;
  region: RegionName;
  manager: string;
  sqft: number;
  monthlyRevenue: number;
  monthlyTarget: number;
  footfall: number;
  conversionPct: number;
  stockAccuracyPct: number;
  fulfillmentSlaPct: number;
  activeStaff: number;
  topCategory: CategoryName;
}

export interface CommercialOrder {
  orderId: string;
  timestamp: string;
  channel: ChannelName;
  region: RegionName;
  outletName: string;
  category: CategoryName;
  units: number;
  revenue: number;
  marginPct: number;
  fulfillmentState: 'Dispatched' | 'Ready for Pickup' | 'In Transit' | 'Exception';
}

export interface TimeSeriesPoint {
  label: string;
  revenue: number;
  target: number;
  grossProfit: number;
  marginPct: number;
  unitsSold: number;
}

export interface GlobalFilters {
  dateRange: DateRangeKey;
  regions: RegionName[];
  channels: ChannelName[];
  categories: CategoryName[];
  stockStatuses: StockHealthStatus[];
  searchQuery: string;
}
