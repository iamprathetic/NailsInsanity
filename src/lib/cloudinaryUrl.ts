// Pure, client-safe helper that builds an optimized Cloudinary delivery URL.
// Inserts an f_auto,q_auto,w_<width> transformation so CLOUDINARY (not Vercel)
// resizes and optimizes the image. This keeps images working even if Vercel's
// free Image Optimization quota runs out, and Cloudinary's transformations are
// free — so product images render <img> with `unoptimized` and this URL.
export function cloudinaryUrl(src: string, width: number): string {
  if (!src || !src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }
  const marker = "/upload/";
  const idx = src.indexOf(marker) + marker.length;
  return `${src.slice(0, idx)}f_auto,q_auto,c_limit,w_${width}/${src.slice(idx)}`;
}
