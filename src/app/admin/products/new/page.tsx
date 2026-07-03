import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <AdminShell>
      <nav className="mb-4 text-sm text-ink/50">
        <Link href="/admin/products" className="hover:text-royal">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">New</span>
      </nav>
      <h1 className="font-display text-3xl text-navy">Add product</h1>
      <p className="mt-1 text-sm text-ink/60">
        Fill in the details below. Only the name and price are required.
      </p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </AdminShell>
  );
}
