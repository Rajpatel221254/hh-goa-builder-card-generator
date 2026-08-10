'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './editor.module.css';

/* ─── constants ─── */
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const CROP_ASPECT = 3 / 4; // portrait (width / height)

/* ─── helpers ─── */
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getTouchDist(t0: React.Touch | Touch, t1: React.Touch | Touch) {
  const dx = t1.clientX - t0.clientX;
  const dy = t1.clientY - t0.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ─── Photo Editor ─── */
export default function EditorPage() {
  const router = useRouter();

  /* ── Source image ── */
  const [src, setSrc] = useState<string | null>(null);
  const [imgNatW, setImgNatW] = useState(0);
  const [imgNatH, setImgNatH] = useState(0);

  /* ── Canvas / layout refs ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Transform state (refs for live perf, state for slider sync) ── */
  const posRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const [sliderScale, setSliderScale] = useState(1); // 0→1 normalized

  /* ── Crop frame size (computed from container) ── */
  const [cropSize, setCropSize] = useState({ w: 0, h: 0 });

  /* ── baseScale: scale at which image just covers the crop frame ── */
  const baseScaleRef = useRef(1);

  /* ── Drag / pinch refs ── */
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const pinch = useRef({ active: false, lastDist: 0, lastScale: 1 });

  /* ── Load src from sessionStorage ── */
  useEffect(() => {
    const stored = sessionStorage.getItem('hh_photo_src');
    if (!stored) { router.replace('/'); return; }
    setSrc(stored);
  }, [router]);

  /* ── Compute crop size & baseScale when image loads or container resizes ── */
  const recalcLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || imgNatW === 0 || imgNatH === 0) return;

    const cW = container.clientWidth;
    const cH = container.clientHeight;

    // Crop frame: portrait 3:4, fits inside container with 10% padding
    const padW = cW * 0.08;
    const padH = cH * 0.06;
    const availW = cW - padW * 2;
    const availH = cH - padH * 2;

    let cfw: number, cfh: number;
    if (availW / CROP_ASPECT <= availH) {
      cfw = availW;
      cfh = availW / CROP_ASPECT;
    } else {
      cfh = availH;
      cfw = availH * CROP_ASPECT;
    }
    setCropSize({ w: Math.round(cfw), h: Math.round(cfh) });

    // baseScale: image covers crop frame (object-fit: cover equivalent)
    const bs = Math.max(cfw / imgNatW, cfh / imgNatH);
    baseScaleRef.current = bs;

    // Reset position & scale
    posRef.current = { x: 0, y: 0 };
    scaleRef.current = 1;
    setSliderScale(0.25); // default 25% into the range
    applyTransform(0, 0, 1);
  }, [imgNatW, imgNatH]);

  /* ResizeObserver on container */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recalcLayout);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcLayout]);

  /* ── Apply CSS transform to img (no state, direct DOM for perf) ── */
  const applyTransform = useCallback((x: number, y: number, s: number) => {
    if (!photoRef.current) return;
    photoRef.current.style.transform =
      `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${s * baseScaleRef.current})`;
  }, []);

  /* ── Constrain pan so photo always covers crop frame ── */
  const constrain = useCallback(
    (x: number, y: number, s: number) => {
      const { w: cfw, h: cfh } = cropSize;
      if (cfw === 0 || imgNatW === 0) return { x, y };

      const dispW = imgNatW * baseScaleRef.current * s;
      const dispH = imgNatH * baseScaleRef.current * s;

      const maxX = (dispW - cfw) / 2;
      const maxY = (dispH - cfh) / 2;

      return {
        x: clamp(x, -maxX, maxX),
        y: clamp(y, -maxY, maxY),
      };
    },
    [cropSize, imgNatW, imgNatH]
  );

  /* ── Set scale from slider (0–1) ── */
  const setScaleFromSlider = useCallback(
    (norm: number) => {
      const s = MIN_SCALE + norm * (MAX_SCALE - MIN_SCALE);
      scaleRef.current = s;
      const { x, y } = constrain(posRef.current.x, posRef.current.y, s);
      posRef.current = { x, y };
      applyTransform(x, y, s);
      setSliderScale(norm);
    },
    [applyTransform, constrain]
  );

  /* ── Zoom controls ── */
  const zoomBy = useCallback(
    (delta: number) => {
      const newS = clamp(scaleRef.current + delta, MIN_SCALE, MAX_SCALE);
      const norm = (newS - MIN_SCALE) / (MAX_SCALE - MIN_SCALE);
      setScaleFromSlider(norm);
    },
    [setScaleFromSlider]
  );

  /* ── MOUSE drag ── */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: posRef.current.x,
      originY: posRef.current.y,
    };
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      const raw = {
        x: drag.current.originX + dx,
        y: drag.current.originY + dy,
      };
      const { x, y } = constrain(raw.x, raw.y, scaleRef.current);
      posRef.current = { x, y };
      applyTransform(x, y, scaleRef.current);
    },
    [applyTransform, constrain]
  );

  const onMouseUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  /* ── TOUCH drag & pinch ── */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      drag.current = {
        active: true,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        originX: posRef.current.x,
        originY: posRef.current.y,
      };
      pinch.current.active = false;
    } else if (e.touches.length === 2) {
      drag.current.active = false;
      pinch.current = {
        active: true,
        lastDist: getTouchDist(e.touches[0], e.touches[1]),
        lastScale: scaleRef.current,
      };
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinch.current.active) {
        const dist = getTouchDist(e.touches[0], e.touches[1]);
        const newS = clamp(
          pinch.current.lastScale * (dist / pinch.current.lastDist),
          MIN_SCALE,
          MAX_SCALE
        );
        scaleRef.current = newS;
        const { x, y } = constrain(posRef.current.x, posRef.current.y, newS);
        posRef.current = { x, y };
        applyTransform(x, y, newS);
        const norm = (newS - MIN_SCALE) / (MAX_SCALE - MIN_SCALE);
        setSliderScale(norm);
      } else if (e.touches.length === 1 && drag.current.active) {
        const dx = e.touches[0].clientX - drag.current.startX;
        const dy = e.touches[0].clientY - drag.current.startY;
        const raw = {
          x: drag.current.originX + dx,
          y: drag.current.originY + dy,
        };
        const { x, y } = constrain(raw.x, raw.y, scaleRef.current);
        posRef.current = { x, y };
        applyTransform(x, y, scaleRef.current);
      }
    },
    [applyTransform, constrain]
  );

  const onTouchEnd = useCallback(() => {
    drag.current.active = false;
    pinch.current.active = false;
  }, []);

  /* ── RESET ── */
  const handleReset = useCallback(() => {
    posRef.current = { x: 0, y: 0 };
    scaleRef.current = 1;
    setSliderScale(0.25);
    applyTransform(0, 0, 1);
  }, [applyTransform]);

  /* ── USE THIS PHOTO: crop to canvas → session → navigate ── */
  const handleUse = useCallback(() => {
    const img = photoRef.current;
    const canvas = exportCanvasRef.current;
    if (!img || !canvas || cropSize.w === 0 || imgNatW === 0) return;

    // Output resolution (4× crop frame for HQ)
    const OUT_W = 800;
    const OUT_H = Math.round(OUT_W / CROP_ASPECT);
    canvas.width = OUT_W;
    canvas.height = OUT_H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Container dims
    const container = containerRef.current!;
    const cW = container.clientWidth;
    const cH = container.clientHeight;

    // Image displayed top-left in container coords
    const dispW = imgNatW * baseScaleRef.current * scaleRef.current;
    const dispH = imgNatH * baseScaleRef.current * scaleRef.current;
    const imgX = (cW - dispW) / 2 + posRef.current.x;
    const imgY = (cH - dispH) / 2 + posRef.current.y;

    // Crop frame top-left in container coords
    const cfLeft = (cW - cropSize.w) / 2;
    const cfTop = (cH - cropSize.h) / 2;

    // Crop frame region in image display coords → source coords
    const scaleTotal = baseScaleRef.current * scaleRef.current;
    const srcX = (cfLeft - imgX) / scaleTotal;
    const srcY = (cfTop - imgY) / scaleTotal;
    const srcW = cropSize.w / scaleTotal;
    const srcH = cropSize.h / scaleTotal;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT_W, OUT_H);

    const cropped = canvas.toDataURL('image/jpeg', 0.88);
    try {
      sessionStorage.setItem('hh_cropped_photo', cropped);
      sessionStorage.setItem(
        'hh_photo_transform',
        JSON.stringify({ x: posRef.current.x, y: posRef.current.y, scale: scaleRef.current })
      );
    } catch {
      sessionStorage.clear();
      try {
        sessionStorage.setItem('hh_cropped_photo', cropped);
      } catch (err) {
        console.error('Cropped photo storage error:', err);
      }
    }

    router.push('/builder');
  }, [cropSize, imgNatW, router]);

  /* ── Back ── */
  const handleBack = useCallback(() => router.push('/'), [router]);

  /* ── Image load ── */
  const handleImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNatW(img.naturalWidth);
    setImgNatH(img.naturalHeight);
  }, []);

  /* ─── Render ─── */
  if (!src) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingWrap}>
          <div className={styles.loadingRing} />
          <p className={styles.loadingText}>Loading photo…</p>
        </div>
      </main>
    );
  }

  const scaleDisplay = (scaleRef.current * baseScaleRef.current * 100).toFixed(0);

  return (
    <main className={styles.main} id="editor-main">
      <canvas ref={exportCanvasRef} className={styles.hiddenCanvas} aria-hidden="true" />

      {/* ─── Header ─── */}
      <header className={styles.header}>
        <button
          id="btn-editor-back"
          className={styles.headerBtn}
          onClick={handleBack}
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          BACK
        </button>

        {/* Logo with Goa in center */}
        <div className={styles.headerLogo} role="img" aria-label="HH Goa">
          <div className={styles.headerWordmarkWrap}>
            <Image src="/Hacker house.png" alt="Hacker House" width={130} height={22} className={styles.headerWordmark} priority />
            <div className={styles.headerGoaCenter}>
              <Image src="/logo.svg" alt="गोवा" width={24} height={24} className={styles.headerGoaLogo} priority />
            </div>
          </div>
        </div>

        <button
          id="btn-editor-reset"
          className={styles.headerBtn}
          onClick={handleReset}
          aria-label="Reset photo position and zoom"
        >
          RESET
        </button>
      </header>

      {/* ─── Editor canvas area ─── */}
      <div
        ref={containerRef}
        className={styles.editorArea}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ cursor: drag.current.active ? 'grabbing' : 'grab' }}
      >
        {/* Photo (draggable) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={photoRef}
          src={src}
          alt="Your photo"
          className={styles.photo}
          onLoad={handleImgLoad}
          draggable={false}
        />

        {/* Dark overlay with crop hole */}
        {cropSize.w > 0 && (
          <>
            {/* Overlay: box-shadow punches the hole */}
            <div
              className={styles.cropOverlay}
              style={{ width: cropSize.w, height: cropSize.h }}
              aria-hidden="true"
            />

            {/* Crop frame border + corners */}
            <div
              ref={cropRef}
              className={styles.cropFrame}
              style={{ width: cropSize.w, height: cropSize.h }}
              aria-label="Crop frame — position your photo inside"
            >
              {/* Corner accents */}
              <span className={`${styles.fc} ${styles.fcTL}`} aria-hidden="true" />
              <span className={`${styles.fc} ${styles.fcTR}`} aria-hidden="true" />
              <span className={`${styles.fc} ${styles.fcBL}`} aria-hidden="true" />
              <span className={`${styles.fc} ${styles.fcBR}`} aria-hidden="true" />

              {/* Helper text */}
              <div className={styles.cropHint} aria-hidden="true">
                <span>DRAG · PINCH TO ZOOM</span>
              </div>
            </div>
          </>
        )}

        {/* Zoom % indicator */}
        <div className={styles.zoomBadge} aria-live="polite" aria-atomic="true">
          {scaleDisplay}%
        </div>
      </div>

      {/* ─── Controls ─── */}
      <footer className={styles.controls}>
        {/* Zoom row */}
        <div className={styles.zoomRow}>
          <button
            id="btn-zoom-out"
            className={styles.zoomBtn}
            onClick={() => zoomBy(-0.15)}
            aria-label="Zoom out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className={styles.sliderWrap}>
            <input
              id="zoom-slider"
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={sliderScale}
              onChange={(e) => setScaleFromSlider(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Zoom slider"
            />
          </div>

          <button
            id="btn-zoom-in"
            className={styles.zoomBtn}
            onClick={() => zoomBy(0.15)}
            aria-label="Zoom in"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Hint */}
        <p className={styles.hint}>
          Position your face in the crop frame
        </p>

        {/* Primary CTA */}
        <button
          id="btn-use-photo"
          className={styles.useBtn}
          onClick={handleUse}
          aria-label="Use this photo and continue"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          USE THIS PHOTO
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.footerTag}>
          <span className={styles.hashTag}>#FRAMEINGOA</span>
        </div>
      </footer>
    </main>
  );
}
