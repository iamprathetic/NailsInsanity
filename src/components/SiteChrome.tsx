"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { MysteryReward } from "@/components/MysteryReward";

// The admin panel has its own layout, so we hide the storefront nav/footer
// there. Everything else gets the standard site chrome.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Nav />
      <AnnouncementBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MysteryReward />
    </>
  );
}
