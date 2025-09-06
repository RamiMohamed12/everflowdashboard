"use client";

import { 
  BarChart3, 
  Users, 
  Gift, 
  Megaphone, 
  Settings,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '#', icon: Home, current: true },
  { name: 'Offers', href: '#', icon: Gift, current: false },
  { name: 'Affiliates', href: '#', icon: Users, current: false },
  { name: 'Advertisers', href: '#', icon: Megaphone, current: false },
  { name: 'Reports', href: '#', icon: BarChart3, current: false },
  { name: 'Settings', href: '#', icon: Settings, current: false },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "flex flex-col h-full min-h-screen bg-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h1 className="text-lg font-semibold">Everflow</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={item.current ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center px-2"
              )}
              asChild
            >
              <a href={item.href}>
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </a>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
