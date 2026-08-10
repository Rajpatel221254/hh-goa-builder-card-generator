'use client';

import { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

async function compressFileToDataUrl(file: File, maxDim = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = document.createElement('img');
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function safeSetSessionItem(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn('SessionStorage quota exceeded. Clearing previous items and retrying...', e);
    sessionStorage.clear();
    try {
      sessionStorage.setItem(key, value);
    } catch (err) {
      console.error('Failed to set sessionStorage item after clear:', err);
    }
  }
}

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleGalleryPick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      let processFile = file;

      // Handle iPhone HEIC / HEIF format conversion
      if (
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif') ||
        file.type === 'image/heic' ||
        file.type === 'image/heif'
      ) {
        try {
          const heic2any = (await import('heic2any')).default;
          const converted = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.92,
          });
          const blobToUse = Array.isArray(converted) ? converted[0] : converted;
          processFile = new File([blobToUse], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg',
          });
        } catch (err) {
          console.error('HEIC conversion failed:', err);
        }
      }

      try {
        const compressedDataUrl = await compressFileToDataUrl(processFile, 1200, 0.85);
        if (compressedDataUrl) {
          safeSetSessionItem('hh_photo_src', compressedDataUrl);
          safeSetSessionItem('hh_photo_type', 'gallery');
          router.push('/editor');
        }
      } catch (err) {
        console.error('File compression error:', err);
      }
    },
    [router]
  );

  const handleUseSamplePhoto = useCallback(() => {
    // High quality sample hacker avatar for quick testing
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 600;
    sampleCanvas.height = 800;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 600, 800);
      grad.addColorStop(0, '#0b4520');
      grad.addColorStop(0.5, '#155a28');
      grad.addColorStop(1, '#082512');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 800);

      // Draw avatar silhouette
      ctx.fillStyle = '#f5c800';
      ctx.beginPath();
      ctx.arc(300, 320, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff2d78';
      ctx.beginPath();
      ctx.arc(300, 680, 240, 0, Math.PI * 2);
      ctx.fill();

      // Sunglasses overlay
      ctx.fillStyle = '#082512';
      ctx.fillRect(210, 300, 75, 45);
      ctx.fillRect(315, 300, 75, 45);
      ctx.fillRect(285, 315, 30, 10);

      const sampleUrl = sampleCanvas.toDataURL('image/jpeg', 0.9);
      safeSetSessionItem('hh_photo_src', sampleUrl);
      safeSetSessionItem('hh_photo_type', 'sample');
      router.push('/editor');
    }
  }, [router]);

  const handleCapture = useCallback(() => {
    router.push('/camera');
  }, [router]);

  return (
    <main className={styles.main} id="main-content">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        id="gallery-picker"
        aria-label="Pick photo from gallery"
        onChange={handleFileChange}
      />

      {/* ── Desktop-only left panel ── */}
      <aside className={styles.desktopLeft} aria-hidden="true">
        <div className={styles.desktopRotatedText}>HH GOA 2026</div>
        <div className={styles.desktopPalmAccent}>
          <svg viewBox="0 0 120 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M65 340 C62 300 56 260 54 220 C52 185 56 155 60 125" stroke="#1a6632" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M60 125 C38 100 10 75 0 50" stroke="#1d8040" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C55 95 50 60 60 38" stroke="#229946" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C82 102 108 90 120 72" stroke="#1d8040" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C85 138 112 150 118 168" stroke="#166b30" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M60 125 C35 140 12 152 4 170" stroke="#166b30" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div className={styles.desktopStamp}>
          <div className={styles.stampCircle}>
            <span>BUILT</span><span>IN</span><span>GOA</span><span>★</span>
          </div>
        </div>
      </aside>

      {/* ── Desktop-only right panel ── */}
      <aside className={styles.desktopRight} aria-hidden="true">
        <div className={styles.desktopCardPreview}>
          <div className={styles.previewLanyard} />
          <div className={styles.previewCard}>
            <div className={styles.previewPhotoSlot}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="rgba(245,200,0,0.4)" strokeWidth="1.5" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(245,200,0,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>YOUR PHOTO</span>
            </div>
            <div className={styles.previewInfo}>
              <div className={styles.previewNameLine} />
              <div className={styles.previewDetailLine} />
              <div className={styles.previewDetailLine} style={{ width: '60%' }} />
            </div>
            <div className={styles.previewBarcode}>
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className={styles.previewBar} style={{ width: i % 3 === 0 ? 3 : 1.5 }} />
              ))}
            </div>
            <div className={styles.previewTag}>#FRAMEINGOA 🌴</div>
          </div>
        </div>
        <div className={styles.desktopRotatedTextRight}>BUILDER CARD</div>
      </aside>

      {/* ── CENTER: stack top + diagonal + bottom ── */}
      <div className={styles.centerCol}>

        {/* ── TOP: Logo section ── */}
        <section className={styles.topSection} aria-label="Hacker House Goa">

          {/* Event strip */}
          <div className={styles.eventStrip}>
            <span>GOA, INDIA</span>
            <span className={styles.stripDot}>·</span>
            <span>28–31 OCT 2026</span>
            <span className={styles.stripDot}>·</span>
            <span>2:47 PM STUDIO</span>
          </div>

          {/* Wordmark + Goa badge */}
          <div className={styles.logoBlock}>
            {/* The official Hacker House wordmark image */}
            <div className={styles.wordmarkWrap}>
              <Image
                src="/Hacker house.png"
                alt="Hacker House"
                width={1200}
                height={180}
                className={styles.wordmark}
                priority
              />

              {/* गोवा badge overlaid on the wordmark */}
              <div className={styles.goaBadgeWrap} aria-label="Goa">
                <Image
                  src="/logo.svg"
                  alt="गोवा"
                  width={100}
                  height={100}
                  className={styles.goaLogo}
                  priority
                />
              </div>
            </div>

            {/* Tagline */}
            <p className={styles.tagline}>
              BUILDER CARD GENERATOR &nbsp;—&nbsp; CREATE YOUR IDENTITY
            </p>
          </div>

          {/* Decorative yellow line */}
          <div className={styles.topDivider} aria-hidden="true" />
        </section>

        {/* Diagonal slash separator */}
        <div className={styles.diagonalSep} aria-hidden="true" />

        {/* ── BOTTOM: Two action cards ── */}
        <section className={styles.bottomSection} aria-label="Choose how to add your photo">

          {/* Action title */}
          <div className={styles.actionTitle}>
            <span className={styles.actionTitleLine}>BUILD YOUR</span>
            <span className={styles.actionTitleMain}>BUILDER CARD</span>
          </div>

          <p className={styles.actionDesc}>
            Add your photo — upload from gallery or take one live.
            Your HH Goa 2026 builder identity awaits.
          </p>

          {/* Two option cards */}
          <div className={styles.cardRow}>

            {/* Gallery card */}
            <button
              id="btn-gallery"
              className={`${styles.optionCard} ${styles.cardGallery}`}
              onClick={handleGalleryPick}
              aria-label="Pick a photo from your gallery"
            >
              <div className={styles.cardIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.75" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={styles.cardLabel}>PICK FROM</span>
              <span className={styles.cardLabelBig}>GALLERY</span>
              <span className={styles.cardHint}>JPG · PNG · WEBP · HEIC</span>
              <div className={styles.cardArrow}>→</div>
            </button>

            {/* Divider between cards */}
            <div className={styles.orDivider} aria-hidden="true">
              <div className={styles.orLine} />
              <span className={styles.orText}>OR</span>
              <div className={styles.orLine} />
            </div>

            {/* Camera card */}
            <button
              id="btn-camera"
              className={`${styles.optionCard} ${styles.cardCamera}`}
              onClick={handleCapture}
              aria-label="Capture a photo with your camera"
            >
              <div className={styles.cardIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.75" />
                </svg>
              </div>
              <span className={styles.cardLabel}>CAPTURE</span>
              <span className={styles.cardLabelBig}>PHOTO</span>
              <span className={styles.cardHint}>USE YOUR CAMERA LIVE</span>
              <div className={styles.cardArrow}>→</div>
            </button>

          </div>

          {/* Quick Demo Button */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              id="btn-sample"
              type="button"
              onClick={handleUseSamplePhoto}
              style={{
                background: 'rgba(245, 200, 0, 0.12)',
                border: '1px solid rgba(245, 200, 0, 0.4)',
                color: '#f5c800',
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              ⚡ Try Demo Hacker Photo (Instant Test)
            </button>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span className={styles.hashTag}>#FRAMEINGOA</span>
            <span className={styles.footerDot}>·</span>
            <span className={styles.footerCredit}>by 2:47 PM Studio</span>
          </div>
        </section>

      </div>{/* /centerCol */}

    </main>
  );
}
