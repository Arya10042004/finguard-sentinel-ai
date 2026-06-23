"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileClock,
  Database,
  Activity,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Compliance",
      href: "/compliance",
      icon: ShieldCheck,
    },
    {
      name: "Audit Logs",
      href: "/audit",
      icon: FileClock,
    },
    {
      name: "Data Quality",
      href: "/data-quality",
      icon: Database,
    },
  ];

  return (
    <aside className="min-h-screen w-72 bg-black border-r border-zinc-800 px-5 py-6 shrink-0">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white text-black flex items-center justify-center">
            <Activity size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              FINGUARD
            </h1>
            <p className="text-xs text-gray-500">
              Sentinel AI
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-black"
                  : "text-gray-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 border-t border-zinc-800 pt-6">
        <p className="text-xs text-gray-500 leading-relaxed">
          Enterprise financial risk, compliance intelligence, and data quality
          monitoring platform.
        </p>
      </div>
    </aside>
  );
}