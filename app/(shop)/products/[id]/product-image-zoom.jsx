"use client";

import Image from "next/image";
import { useState } from "react";

const lensSize = 34;

export function ProductImageZoom({ product }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  function handlePointerMove(event) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }

  function handlePointerEnter(event) {
    if (event.pointerType !== "touch") setIsZooming(true);
  }

  function handlePointerLeave() {
    setIsZooming(false);
  }

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-primary-elevated"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <Image src={product.image} alt={product.name} width={1200} height={1200} priority className="aspect-square w-full object-cover transition duration-700 hover:scale-[1.02]" />
        {isZooming ? (
          <div
            className="pointer-events-none absolute hidden rounded-lg border-2 border-surface-container-lowest/95 bg-surface-container-lowest/15 shadow-[0_16px_45px_rgb(0_63_177_/_0.28)] ring-1 ring-primary/40 backdrop-blur-[1px] md:block"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${lensSize}%`,
              height: `${lensSize}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ) : null}

        {isZooming ? (
          <div className="pointer-events-none absolute right-5 top-5 z-20 hidden aspect-square w-36 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-2xl shadow-primary/20 md:block xl:w-44">
            <div
              className="size-full bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${product.image})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: "245%",
              }}
            />
          </div>
        ) : null}

      </div>
    </div>
  );
}
