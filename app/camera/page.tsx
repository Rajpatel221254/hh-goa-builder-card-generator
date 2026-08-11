'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './camera.module.css';

/* ─── Logo for camera page with Goa attached in center ─── */
function MiniLogo() {
  return (
    <div className={styles.miniLogo} role="img" aria-label="HH Goa logo">
      <div className={styles.miniLogoWordmarkWrap}>
        <Image
          src="/Hacker house.png"
          alt="Hacker House"
          width={130}
          height={20}
          className={styles.miniLogoWordmark}
          priority
        />
        <div className={styles.miniGoaBadgeWrap}>
          <Image
            src="/logo.svg"
            alt="गोवा"
            width={24}
            height={24}
            className={styles.miniGoaLogo}
            priority
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Corner frame decorators ─── */
function FrameCorners() {
  return (
    <div className={styles.frameCorners} aria-hidden="true">
      <div className={`${styles.corner} ${styles.cornerTL}`} />
      <div className={`${styles.corner} ${styles.cornerTR}`} />
      <div className={`${styles.corner} ${styles.cornerBL}`} />
      <div className={`${styles.corner} ${styles.cornerBR}`} />
    </div>
  );
}

/* ─── Camera Page ─── */
export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  const [permission, setPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [captured, setCaptured] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashActive, setFlashActive] = useState(false);

  /* Start camera */
  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    try {
      /* Stop existing stream */
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission('granted');
    } catch {
      setPermission('denied');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Flip camera */
  const handleFlip = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  /* Capture photo */
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Mirror if front camera */
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCaptured(dataUrl);

    /* Flash effect */
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);
  }, [facingMode]);

  /* Use captured photo — navigate to editor */
  const handleUsePhoto = useCallback(() => {
    if (!captured) return;
    try {
      sessionStorage.setItem('hh_photo_src', captured);
      sessionStorage.setItem('hh_photo_type', 'camera');
    } catch {
      sessionStorage.clear();
      try {
        sessionStorage.setItem('hh_photo_src', captured);
        sessionStorage.setItem('hh_photo_type', 'camera');
      } catch (e) {
        console.error('Camera storage error:', e);
      }
    }
    router.push('/editor');
  }, [captured, router]);

  /* Retake */
  const handleRetake = useCallback(() => {
    setCaptured(null);
  }, []);

  /* Back */
  const handleBack = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push('/');
  }, [router]);

  return (
    <main className={styles.main} id="camera-main">
      {/* Hidden canvas */}
      <canvas ref={canvasRef} className={styles.hiddenCanvas} aria-hidden="true" />

      {/* Flash overlay */}
      {flashActive && <div className={styles.flashOverlay} aria-hidden="true" />}

      {/* ─── Header ─── */}
      <header className={styles.header}>
        <button
          id="btn-back"
          className={`btn btn-ghost ${styles.backBtn}`}
          onClick={handleBack}
          aria-label="Go back to landing page"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          BACK
        </button>

        <MiniLogo />

        {/* Flip camera button */}
        <button
          id="btn-flip-camera"
          className={`btn btn-ghost ${styles.flipBtn}`}
          onClick={handleFlip}
          aria-label="Flip camera"
          disabled={permission !== 'granted' || !!captured}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          FLIP
        </button>
      </header>

      {/* ─── Camera Viewfinder ─── */}
      <div className={styles.viewfinderWrapper}>
        {/* Permission denied */}
        {permission === 'denied' && (
          <div className={styles.permissionDenied}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#ff2d78" strokeWidth="1.5" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="#ff2d78" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className={styles.deniedTitle}>Camera Access Denied</p>
            <p className={styles.deniedText}>
              Please allow camera access in your browser settings to capture a photo.
            </p>
            <button
              className={`btn btn-primary ${styles.tryAgainBtn}`}
              onClick={() => startCamera(facingMode)}
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* Loading */}
        {permission === 'pending' && (
          <div className={styles.loadingState}>
            <div className={styles.loadingRing} />
            <p className={styles.loadingText}>Starting camera…</p>
          </div>
        )}

        {/* Camera preview */}
        {!captured && (
          <video
            ref={videoRef}
            className={`${styles.video} ${facingMode === 'user' ? styles.videoMirrored : ''}`}
            autoPlay
            playsInline
            muted
            aria-label="Camera preview"
          />
        )}

        {/* Captured preview */}
        {captured && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={captured}
            alt="Captured photo preview"
            className={styles.capturedImage}
          />
        )}

        {/* Frame corners overlay */}
        <FrameCorners />

        {/* Viewfinder crosshair */}
        {!captured && permission === 'granted' && (
          <div className={styles.crosshair} aria-hidden="true">
            <div className={styles.crosshairH} />
            <div className={styles.crosshairV} />
          </div>
        )}

        {/* Label overlay */}
        {!captured && permission === 'granted' && (
          <div className={styles.viewfinderLabel}>
            <span className={styles.viewfinderDot} />
            LIVE
          </div>
        )}
      </div>

      {/* ─── Controls ─── */}
      <div className={styles.controls}>
        {!captured ? (
          <>
            <p className={styles.captureHint}>
              Position yourself in frame, then tap capture
            </p>
            <button
              id="btn-capture"
              className={styles.captureBtn}
              onClick={handleCapture}
              disabled={permission !== 'granted'}
              aria-label="Capture photo"
            >
              <div className={styles.captureBtnInner} />
            </button>
            <div className={styles.captureTag}>
              <span className={styles.hashTagSmall}>#FRAMEINGOA</span>
            </div>
          </>
        ) : (
          <div className={styles.reviewControls}>
            <p className={styles.reviewText}>Looking good, builder?</p>
            <div className={styles.reviewBtns}>
              <button
                id="btn-retake"
                className={`btn btn-ghost ${styles.retakeBtn}`}
                onClick={handleRetake}
              >
                RETAKE
              </button>
              <button
                id="btn-use-photo"
                className={`btn btn-primary ${styles.usePhotoBtn}`}
                onClick={handleUsePhoto}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                USE THIS PHOTO
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
