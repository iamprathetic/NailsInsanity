"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; image: string };

// Lets the owner reorder a collection's products with up/down arrows. The first
// 5 are what show on the homepage (marked with a divider); the rest sit behind
// the "View all" link.
export function CollectionOrderManager({
  collectionId,
  collectionName,
  initial,
}: {
  collectionId: string;
  collectionName: string;
  initial: Item[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initial);
  const [saving, setSaving] = useState(false);

  async function persist(next: Item[]) {
    setItems(next);
    setSaving(true);
    await fetch("/api/collections/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId, orderedIds: next.map((i) => i.id) }),
    });
    setSaving(false);
    router.refresh();
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  }

  return (
    <div className="rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h3 className="font-display text-lg text-navy">{collectionName}</h3>
        <span className="text-xs text-ink/50">
          {saving ? "Saving…" : `${items.length} product${items.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink/50">
          No active products in this collection.
        </p>
      ) : (
        <ul>
          {items.map((it, i) => (
            <Fragment key={it.id}>
              {i === 5 && (
                <li className="border-y border-dashed border-royal/30 bg-royal/5 px-5 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-royal">
                  ↑ Shown on homepage &nbsp;·&nbsp; below hidden behind “View all” ↓
                </li>
              )}
              <li className="flex items-center gap-3 border-b border-line px-5 py-2.5 last:border-b-0">
                <span className="w-5 shrink-0 text-center text-xs text-ink/40">
                  {i + 1}
                </span>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-mist">
                  {it.image ? (
                    <Image
                      src={it.image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <span className="flex-1 truncate text-sm text-navy">
                  {it.name}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || saving}
                    aria-label="Move up"
                    className="rounded-md border border-line px-2.5 py-1 text-sm text-navy hover:bg-mist disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1 || saving}
                    aria-label="Move down"
                    className="rounded-md border border-line px-2.5 py-1 text-sm text-navy hover:bg-mist disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </li>
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}
