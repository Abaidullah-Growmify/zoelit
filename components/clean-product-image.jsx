"use client";

import { useEffect, useRef, useState } from "react";

const WORK_WIDTH = 640;

function sourceUrl(src) {
  if (!src || src.startsWith("data:") || src.startsWith("/_next/image")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${WORK_WIDTH}&q=75`;
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
    tryPush(x, 236);
    tryPush((height - 1) * width + x, 236);
  }
  for (let y = 0; y < height; y += 1) {
    tryPush(y * width, 236);
    tryPush(y * width + width - 1, 236);
  }
  while (stack.length) {
    const pixel = stack.pop();
    const x = pixel % width;
    const y = (pixel / width) | 0;
    if (x > 0) tryPush(pixel - 1, 236);
    if (x < width - 1) tryPush(pixel + 1, 236);
    if (y > 0) tryPush(pixel - width, 236);
    if (y < height - 1) tryPush(pixel + width, 236);
  }

  // One halo sweep: very light pixels bordering the cleared area are edge
  // fringing, so they go too.
  const halo = [];
  for (let pixel = 0; pixel < total; pixel += 1) {
    if (removed[pixel] || brightness(pixel) < 205) continue;
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

  for (let pixel = 0; pixel < total; pixel += 1) {
    if (removed[pixel]) px[pixel * 4 + 3] = 0;
  }
  ctx.putImageData(imageData, 0, 0);
}

// Renders a product photo with its white studio backdrop cut out. Falls back
// to the untouched image when the pixels cannot be read (CORS) or loading
// fails, so the layout never ends up empty.
export function CleanProductImage({ src, alt = "", className = "max-h-full max-w-full object-contain" }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = sourceUrl(src);

  useEffect(() => {
    if (!src) return undefined;
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
  }, [url, src]);

  if (!src || failed) {
    return src ? <img src={src} alt={alt} className={className} /> : null;
  }

  return (
    <>
      {ready ? null : <img src={url} alt={alt} className={className} />}
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
