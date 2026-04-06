"use client";

interface ToolLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function ToolLayout({ sidebar, children }: ToolLayoutProps) {
  return (
    <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
      <main className="flex-1 relative overflow-hidden bg-gray-50">
        {children}
      </main>
      {sidebar}
    </div>
  );
}
