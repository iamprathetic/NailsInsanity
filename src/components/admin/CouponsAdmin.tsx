"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/format";

export type CouponRow = {
  id: string;
  code: string;
  type: string; // "percent" | "fixed"
  value: number;
  minSets: number;
  expiresAt: string | null; // ISO string
  active: boolean;
};

type FormState = {
  id?: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSets: number;
  expiresAt: string; // "YYYY-MM-DD" or ""
  active: boolean;
};

const empty: FormState = {
  code: "",
  type: "percent",
  value: 10,
  minSets: 0,
  expiresAt: "",
  active: true,
};

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-navy";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10); // YYYY-MM-DD
}

export function CouponsAdmin({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = Boolean(form.id);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function startEdit(c: CouponRow) {
    setError("");
    setForm({
      id: c.id,
      code: c.code,
      type: c.type === "fixed" ? "fixed" : "percent",
      value: c.value,
      minSets: c.minSets,
      expiresAt: toDateInput(c.expiresAt),
      active: c.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.code.trim()) return setError("Enter a coupon code.");
    if (form.value <= 0) return setError("Discount value must be more than 0.");
    setSaving(true);

    const res = await fetch(
      isEdit ? `/api/coupons/${form.id}` : "/api/coupons",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minSets: Number(form.minSets),
          expiresAt: form.expiresAt || null,
          active: form.active,
        }),
      }
    );
    setSaving(false);
    if (res.ok) {
      setForm(empty);
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Could not save the coupon.");
    }
  }

  async function remove(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (form.id === id) setForm(empty);
      router.refresh();
    } else {
      alert("Could not delete the coupon.");
    }
  }

  function describe(c: CouponRow) {
    const off =
      c.type === "percent" ? `${c.value}% off` : `${formatPrice(c.value)} off`;
    const min = c.minSets > 0 ? ` · min ${c.minSets} sets` : "";
    const exp = c.expiresAt
      ? ` · expires ${new Date(c.expiresAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : "";
    return `${off}${min}${exp}`;
  }

  return (
    <div className="max-w-2xl">
      {/* Add / edit form */}
      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-line bg-white p-5"
      >
        <h2 className="font-display text-lg text-navy">
          {isEdit ? "Edit coupon" : "Create a coupon"}
        </h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Coupon code
          </label>
          <input
            className={`${field} uppercase`}
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="e.g. WELCOME10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              Discount type
            </label>
            <select
              className={field}
              value={form.type}
              onChange={(e) =>
                set("type", e.target.value === "fixed" ? "fixed" : "percent")
              }
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              {form.type === "percent" ? "Percent off" : "Rupees off"}
            </label>
            <input
              type="number"
              min={1}
              className={field}
              value={form.value}
              onChange={(e) => set("value", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              Minimum sets to qualify
            </label>
            <input
              type="number"
              min={0}
              className={field}
              value={form.minSets}
              onChange={(e) => set("minSets", Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-ink/50">
              How many sets must be in the cart. 0 = no minimum.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              Expires on (optional)
            </label>
            <input
              type="date"
              className={field}
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
            />
            <p className="mt-1 text-xs text-ink/50">Leave blank for no expiry.</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          Active (customers can use it)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create coupon"}
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setForm(empty);
                setError("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* Existing coupons */}
      <div className="mt-8">
        <h2 className="font-display text-lg text-navy">Coupons</h2>
        {coupons.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">No coupons yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {coupons.map((c) => {
              const expired =
                c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-navy">
                        {c.code}
                      </span>
                      {!c.active && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          Inactive
                        </span>
                      )}
                      {expired && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-ink/60">{describe(c)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-sm text-royal hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(c.id, c.code)}
                      className="text-sm text-ink/50 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
