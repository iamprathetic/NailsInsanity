"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Orders", href: "/admin/orders" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-mist">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="border-b border-line px-6 py-5">
          <Logo compact />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-navy text-white"
                    : "text-ink/70 hover:bg-mist"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-4">
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink/70 hover:bg-mist"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 md:hidden">
          <Logo compact />
          <button onClick={logout} className="text-sm text-ink/70">
            Sign out
          </button>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 border-b border-line bg-white px-3 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-ink/70"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
