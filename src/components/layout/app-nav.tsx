"use client";

import {
  Brain01Icon,
  CheckListIcon,
  Home01Icon,
  Leaf01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: IconSvgElement };

const navItems: NavItem[] = [
  { href: "/home", label: "Home", icon: Home01Icon },
  { href: "/thoughts", label: "Brain Dump", icon: Brain01Icon },
  { href: "/tasks", label: "Tasks", icon: CheckListIcon },
  { href: "/clarity", label: "Mind Clarity", icon: Leaf01Icon },
  { href: "/settings", label: "Settings", icon: Settings01Icon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-8 border-r bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
      <div className="flex flex-col gap-1 px-3">
        <span className="text-lg font-semibold">{siteConfig.name}</span>
        <span className="text-sm text-muted-foreground">
          {siteConfig.tagline}
        </span>
      </div>
      <nav aria-label="Main">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    active &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={20}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 border-t bg-background md:hidden"
    >
      <ul className="grid grid-cols-5">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-xs leading-tight font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  active && "text-primary",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full",
                    active && "bg-accent",
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={22}
                    aria-hidden="true"
                  />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
