"use client";

import { cn } from "@/lib/utils/cn";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  children: React.ReactNode;
  title?: string;
}

export function Sidebar({ children, title }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-full bg-white border-l border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-12" : "w-72"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        {!collapsed && title && (
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          {collapsed ? (
            <PanelRightOpen className="w-4 h-4" />
          ) : (
            <PanelRightClose className="w-4 h-4" />
          )}
        </button>
      </div>
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">{children}</div>
      )}
    </aside>
  );
}
