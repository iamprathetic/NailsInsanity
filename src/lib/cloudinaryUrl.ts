// Pure, client-safe helper that builds an optimized Cloudinary delivery URL.
// Inserts an f_auto,q_auto,w_<width> transformation so CLOUDINARY (not Vercel)
// resizes and optimizes the image. This keeps images working even if Vercel's
// free Image Optimization quota runs out, and Cloudinary's transformations are
// free — so product images render <img> with `unoptimized` and this URL.
//
// Pass `aspect` (width / height, e.g. 4/5 or 1) to have Cloudinary auto-crop
// the source photo to that ratio with content-aware gravity (g_auto — it
// detects the salient subject and centers the crop on it). This is what
// makes every product photo line up in a grid even though the admin never
// manually cropped them: each card/thumbnail gets the exact same frame,
// intelligently centered, straight from Cloudinary.
export function cloudinaryUrl(src: string, width: number, aspect?: number): string {
  if (!src || !src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }
  const marker = "/upload/";
  const idx = src.indexOf(marker) + marker.length;
  const crop = aspect
    ? `c_fill,g_auto,w_${width},h_${Math.round(width / aspect)}`
    : `c_limit,w_${width}`;
  return `${src.slice(0, idx)}f_auto,q_auto,${crop}/${src.slice(idx)}`;
}
