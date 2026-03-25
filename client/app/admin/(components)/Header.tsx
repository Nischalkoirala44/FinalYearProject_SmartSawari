"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  stats?: {
    total: number;
  };
}

export default function AdminHeader({ onMenuClick, title, stats }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>

        {stats && (
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Submissions</p>
            <p className="text-xl font-bold text-blue-600">{stats.total}</p>
          </div>
        )}
      </div>
    </header>
  );
}