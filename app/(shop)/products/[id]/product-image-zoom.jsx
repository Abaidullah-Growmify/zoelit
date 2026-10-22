"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const DESKTOP_LENS_SIZE = 80;
const DESKTOP_PREVIEW_SIZE = 240;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function ProductImageZoom({ product, src = product?.image, alt = product?.name }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const frameRef = useRef(null);
  const activePointerRef = useRef(null);
  const lastPointRef = useRef(null);
  const sizesRef = useRef({ lens: DESKTOP_LENS_SIZE, preview: DESKTOP_PREVIEW_SIZE });
  const [imageArea, setImageArea] = useState(null);
  const [sizes, setSizes] = useState({ lens: DESKTOP_LENS_SIZE, preview: DESKTOP_PREVIEW_SIZE });
  const [lens, setLens] = useState(null);

  const getRenderedImageArea = useCallback(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image || !image.naturalWidth || !image.naturalHeight) return null;

    const imageRect = image.getBoundingClientRect();
    const styles = window.getComputedStyle(image);
    const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
    const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
    const contentWidth = Math.max(0, imageRect.width - paddingLeft - paddingRight);
    const contentHeight = Math.max(0, imageRect.height - paddingTop - paddingBottom);
    const scale = Math.min(contentWidth / image.naturalWidth, contentHeight / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const containerRect = container.getBoundingClientRect();

    return {
      left: imageRect.left - containerRect.left + paddingLeft + (contentWidth - width) / 2,
      top: imageRect.top - containerRect.top + paddingTop + (contentHeight - height) / 2,
      width,
      height,
    };
  }, []);

  const getResponsiveSizes = useCallback((width) => {
    if (window.innerWidth >= 1024) return { lens: DESKTOP_LENS_SIZE, preview: DESKTOP_PREVIEW_SIZE };
    if (window.innerWidth >= 640) {
      const lens = width * 0.18;
      return { lens, preview: lens * 2.8 };
    }
    const lens = width * 0.22;
    return { lens, preview: width * 0.45 };
  }, []);

  const measure = useCallback(() => {
    const area = getRenderedImageArea();
    if (!area) return null;
    const nextSizes = getResponsiveSizes(area.width);
    sizesRef.current = nextSizes;
    setImageArea(area);
    setSizes(nextSizes);
    return { area, sizes: nextSizes };
  }, [getRenderedImageArea, getResponsiveSizes]);

  const updateLens = useCallback((clientX, clientY, area, pointerType, currentSizes = sizesRef.current) => {
    const container = containerRef.current;
    if (!container || !area) return;

    const rect = container.getBoundingClientRect();
    const touchOffset = pointerType === "mouse" ? 0 : 40;
    const cursorX = clientX - rect.left - area.left;
    const cursorY = clientY - rect.top - area.top - touchOffset;
    const lensX = clamp(cursorX - currentSizes.lens / 2, 0, Math.max(0, area.width - currentSizes.lens));
    const lensY = clamp(cursorY - currentSizes.lens / 2, 0, Math.max(0, area.height - currentSizes.lens));
    setLens({ x: lensX, y: lensY });
  }, []);

  const activatePointer = useCallback((event) => {
    if (event.pointerType !== "mouse" && activePointerRef.current !== null) return;
    const measured = measure();
    if (!measured) return;

    lastPointRef.current = { x: event.clientX, y: event.clientY, pointerType: event.pointerType };
    if (event.pointerType !== "mouse") {
      activePointerRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    updateLens(event.clientX, event.clientY, measured.area, event.pointerType, measured.sizes);
  }, [measure, updateLens]);

  const handlePointerMove = useCallback((event) => {
    if (event.pointerType !== "mouse" && activePointerRef.current !== event.pointerId) return;
    lastPointRef.current = { x: event.clientX, y: event.clientY, pointerType: event.pointerType };
    if (frameRef.current) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const point = lastPointRef.current;
      const area = getRenderedImageArea();
      if (point && area) updateLens(point.x, point.y, area, point.pointerType);
    });
  }, [getRenderedImageArea, updateLens]);

  const handlePointerUp = useCallback((event) => {
    if (event.pointerType !== "mouse" && activePointerRef.current === event.pointerId) {
      activePointerRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      lastPointRef.current = null;
      setLens(null);
    }
  }, []);

  const handlePointerLeave = useCallback((event) => {
    if (event.pointerType === "mouse") {
      setLens(null);
      lastPointRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!lens) return undefined;

    function handleResize() {
      const measured = measure();
      const point = lastPointRef.current;
      if (measured && point) updateLens(point.x, point.y, measured.area, point.pointerType, measured.sizes);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [lens, measure, updateLens]);

  useEffect(() => () => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
  }, []);

  const zoom = sizes.preview / sizes.lens;
  const previewOnLeft = imageArea && lens ? lens.x + sizes.lens / 2 > imageArea.width / 2 : false;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-primary-elevated ${lens ? "touch-none select-none" : ""}`}
        onPointerDown={activatePointer}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") activatePointer(event); }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          width={1200}
          height={1200}
          priority
          onLoad={measure}
          draggable={false}
          className="aspect-square w-full object-contain p-3 select-none sm:p-6"
          style={{ WebkitTouchCallout: "none" }}
        />

        {lens && imageArea ? (
          <>
            <div
              className="pointer-events-none absolute z-10 border-2 border-primary/80 bg-primary/10 shadow-[0_0_0_1px_rgb(255_255_255_/_0.7)]"
              style={{
                left: imageArea.left + lens.x,
                top: imageArea.top + lens.y,
                width: sizes.lens,
                height: sizes.lens,
              }}
            />
            <div
              className="pointer-events-none absolute top-3 z-20 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl"
              style={{
                ...(previewOnLeft ? { left: 12 } : { right: 12 }),
                width: sizes.preview,
                height: sizes.preview,
                backgroundImage: `url(${src})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${imageArea.width * zoom}px ${imageArea.height * zoom}px`,
                backgroundPosition: `${-lens.x * zoom}px ${-lens.y * zoom}px`,
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
