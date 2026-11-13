"use client";

import { useEffect, useRef, useState } from "react";

const WORK_WIDTH = 800;

const SAFE_IMAGE_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "images.icecat.biz",
  "pics.icecat.io",
  "dummyimage.com",
]);

export const SAFE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80";

export function safeImageSrc(value) {
  if (!value) return SAFE_IMAGE_FALLBACK;
  if (value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && (SAFE_IMAGE_HOSTS.has(url.hostname) || url.hostname.endsWith(".icecat.biz"))) return value;
  } catch {
    // Invalid image URLs use the fallback below.
  }
  return SAFE_IMAGE_FALLBACK;
}

function sourceUrl(src, width = WORK_WIDTH) {
  const safeSrc = safeImageSrc(src);
  if (!safeSrc || safeSrc.startsWith("data:") || safeSrc.startsWith("/_next/image")) return safeSrc;
  return `/_next/image?url=${encodeURIComponent(safeSrc)}&w=${width}&q=75`;
}

// Clears the plain white backdrop of a product photo by flooding inward from
// the image borders. Whites inside the product (paper, labels) stay untouched
// because the flood can only reach background pixels from the edges.
function stripBackdrop(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const px = imageData.data;
  const total = width * height;
  const removed = new Uint8Array(total);
  const stack = [];

  const brightness = (pixel) => {
    const i = pixel * 4;
    return Math.min(px[i], px[i + 1], px[i + 2]);
  };
  const tryPush = (pixel, threshold) => {
    if (pixel < 0 || pixel >= total || removed[pixel]) return;
    if (brightness(pixel) < threshold) return;
    removed[pixel] = 1;
    stack.push(pixel);
  };

  for (let x = 0; x < width; x += 1) {
    tryPush(x, 250);
    tryPush((height - 1) * width + x, 250);
  }
  for (let y = 0; y < height; y += 1) {
    tryPush(y * width, 250);
    tryPush(y * width + width - 1, 250);
  }
  while (stack.length) {
    const pixel = stack.pop();
    const x = pixel % width;
    const y = (pixel / width) | 0;
    if (x > 0) tryPush(pixel - 1, 250);
    if (x < width - 1) tryPush(pixel + 1, 250);
    if (y > 0) tryPush(pixel - width, 250);
    if (y < height - 1) tryPush(pixel + width, 250);
  }

  // Remove a few layers of near-white edge fringe left around product
  // shadows. The flood still only expands from already-cleared pixels, so
  // white details enclosed by the product remain intact.
  for (let pass = 0; pass < 12; pass += 1) {
    const halo = [];
    for (let pixel = 0; pixel < total; pixel += 1) {
      if (removed[pixel] || brightness(pixel) < 240) continue;
      const x = pixel % width;
      const y = (pixel / width) | 0;
      if (
        (x > 0 && removed[pixel - 1]) ||
        (x < width - 1 && removed[pixel + 1]) ||
        (y > 0 && removed[pixel - width]) ||
        (y < height - 1 && removed[pixel + width])
      ) {
        halo.push(pixel);
      }
    }
    for (const pixel of halo) removed[pixel] = 1;
  }

  for (let pixel = 0; pixel < total; pixel += 1) {
    if (removed[pixel]) px[pixel * 4 + 3] = 0;
  }
  ctx.putImageData(imageData, 0, 0);
}

// Renders a product photo with its white studio backdrop cut out. Falls back
// to the untouched image when the pixels cannot be read (CORS) or loading
// fails, so the layout never ends up empty.
export function CleanProductImage({ src, alt = "", className = "max-h-full max-w-full object-contain", priority = false, fetchPriority, process = true, width = WORK_WIDTH }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const safeSrc = safeImageSrc(src);
  const url = sourceUrl(safeSrc, width);

  const imageProps = {
    src: url,
    alt,
    className,
    decoding: "async",
    loading: priority ? "eager" : "lazy",
    fetchPriority: fetchPriority || (priority ? "high" : "auto"),
  };

  useEffect(() => {
    if (!src || !process) return undefined;
    let cancelled = false;

    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        stripBackdrop(ctx, width, height);
        setReady(true);
      } catch {
        setFailed(true);
      }
    };
    image.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    image.src = url;
    return () => {
      cancelled = true;
    };
  }, [url, src, process]);

  if (!process) return <img {...imageProps} />;

  if (!src || failed) {
    return <img src={safeSrc} alt={alt} className={className} />;
  }

  return (
    <>
      {ready ? null : <img {...imageProps} />}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className={className}
        style={{ display: ready ? "block" : "none" }}
      />
    </>
  );
}
