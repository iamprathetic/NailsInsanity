"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import type { CollectionOption } from "@/lib/collections";

export type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  images: string[];
  stock: number;
  active: boolean;
  featured: boolean;
  collectionId: string | null;
};

const empty: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  sizes: [],
  images: [],
  stock: 0,
  active: true,
  featured: false,
  collectionId: null,
};

// Sentinel select value for "create a new collection".
const NEW_COLLECTION = "__new__";

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-navy";

export function ProductForm({
  initial,
  collections,
}: {
  initial?: ProductFormData;
  collections: CollectionOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [data, setData] = useState<ProductFormData>(initial ?? empty);
  const [sizeInput, setSizeInput] = useState("");
  // Collection picker: the selected option ("" = none, an id, or NEW_COLLECTION).
  const [collectionChoice, setCollectionChoice] = useState<string>(
    initial?.collectionId ?? ""
  );
  const [newCollectionName, setNewCollectionName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function addSize() {
    const s = sizeInput.trim();
    if (s && !data.sizes.includes(s)) set("sizes", [...data.sizes, s]);
    setSizeInput("");
  }

  function removeSize(s: string) {
    set("sizes", data.sizes.filter((x) => x !== s));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.url) uploaded.push(json.url);
      else setError(json.error || "Image upload failed");
    }
    set("images", [...data.images, ...uploaded]);
    setUploading(false);
  }

  function removeImage(url: string) {
    set("images", data.images.filter((x) => x !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!data.name.trim()) return setError("Please enter a product name.");
    if (data.price < 0) return setError("Price cannot be negative.");

    // Resolve the collection choice into what the API expects.
    const creatingCollection = collectionChoice === NEW_COLLECTION;
    if (creatingCollection && !newCollectionName.trim()) {
      return setError("Please enter a name for the new collection.");
    }

    setSaving(true);

    const url = isEdit ? `/api/products/${data.id}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        price: Number(data.price),
        sizes: data.sizes,
        images: data.images,
        stock: Number(data.stock),
        active: data.active,
        featured: data.featured,
        collectionId: creatingCollection ? null : collectionChoice || null,
        newCollectionName: creatingCollection ? newCollectionName.trim() : undefined,
      }),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Could not save the product.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Product name
        </label>
        <input
          className={field}
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Midnight Bloom"
        />
      </div>

      {/* Price + stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Price (₹)
          </label>
          <input
            type="number"
            min={0}
            className={field}
            value={data.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Stock (quantity available)
          </label>
          <input
            type="number"
            min={0}
            className={field}
            value={data.stock}
            onChange={(e) => set("stock", Number(e.target.value))}
          />
        </div>
      </div>

      {/* Collection */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Collection
        </label>
        <p className="mb-2 text-xs text-ink/50">
          Group this product into a collection, or create a new one. Leave as
          &ldquo;No collection&rdquo; if you don&rsquo;t want one.
        </p>
        <select
          className={field}
          value={collectionChoice}
          onChange={(e) => setCollectionChoice(e.target.value)}
        >
          <option value="">No collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={NEW_COLLECTION}>+ Create new collection…</option>
        </select>
        {collectionChoice === NEW_COLLECTION && (
          <input
            className={`${field} mt-2`}
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New collection name (e.g. Nude Shades)"
          />
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Description
        </label>
        <textarea
          rows={4}
          className={field}
          value={data.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the design, materials, wear time…"
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Sizes
        </label>
        <p className="mb-2 text-xs text-ink/50">
          Add each size the customer can choose. Leave empty if this product has
          no sizes.
        </p>
        <div className="flex gap-2">
          <input
            className={field}
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSize();
              }
            }}
            placeholder="e.g. Small, Medium, Large…"
          />
          <Button type="button" variant="outline" onClick={addSize}>
            Add
          </Button>
        </div>
        {data.sizes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.sizes.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-sm text-navy"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSize(s)}
                  className="text-ink/40 hover:text-red-600"
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Photos
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-navy-dark"
        />
        {uploading && (
          <p className="mt-2 text-sm text-ink/50">Uploading…</p>
        )}
        {data.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {data.images.map((url) => (
              <div key={url} className="relative h-24 w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-full w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink/60 shadow hover:text-red-600"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={data.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          Visible in shop
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={data.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          Feature on homepage
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={saving || uploading}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
