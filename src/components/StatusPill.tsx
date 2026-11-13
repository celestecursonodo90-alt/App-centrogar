import React from 'react';
import { StockHealthStatus } from '../types/retail';

interface StatusPillProps {
  status: StockHealthStatus;
}

const STATUS_STYLES: Record<StockHealthStatus, string> = {
  'In Stock': 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  'Low Stock': 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  'Critical Low': 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]',
  Overstock: 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
};

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
};
