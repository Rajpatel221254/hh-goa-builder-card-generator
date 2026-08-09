'use client';

import { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleGalleryPick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      sessionStorage.setItem('hh_photo_src', url);
      sessionStorage.setItem('hh_photo_type', 'gallery');
      router.push('/editor');
    },
    [router]
  );

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
