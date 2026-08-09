'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import styles from './card.module.css';

interface BuilderData {
  name: string;
  role: string;
  builderTitle: string;
  xHandle: string;
  stack: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  email: string;
  fuel: string;
  mode: string;
  vibe: string;
}

/* ─── Social Handle Auto-Prefix Formatting Helpers ─── */
function formatXHandle(val: string): string {
  if (!val) return '';
  const clean = val.trim().replace(/^@+/, '');
  return clean ? `@${clean}` : '';
}

function formatGithub(val: string): string {
  if (!val) return '';
  const clean = val.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@+/, '');
  return clean ? `github.com/${clean}` : '';
}

function formatLinkedIn(val: string): string {
  if (!val) return '';
  const clean = val.trim().replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/i, '').replace(/^@+/, '');
  return clean ? `linkedin.com/in/${clean}` : '';
}

function formatWebsite(val: string): string {
  if (!val) return '';
  return val.trim().replace(/^https?:\/\//i, '');
}

export default function CardExportPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [photoSrc, setPhotoSrc] = useState<string>('');
  const [formData, setFormData] = useState<BuilderData>({
    name: 'BUILDER',
    role: 'HACKER',
    builderTitle: 'THE CODE ARCHITECT',
    xHandle: '@builder',
    stack: 'FULLSTACK',
    location: 'GOA, INDIA',
    website: 'builder.dev',
    linkedin: '',
    github: '',
    email: '',
    fuel: 'COFFEE & CODE',
    mode: 'SHIP • BUILD REPEAT',
    vibe: 'BUILDING IDEAS. BREAKING LIMITS.',
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Load from session storage
  useEffect(() => {
    const cropped = sessionStorage.getItem('hh_cropped_photo');
    const raw = sessionStorage.getItem('hh_photo_src');
    if (cropped) {
      setPhotoSrc(cropped);
    } else if (raw) {
      setPhotoSrc(raw);
    }

    const savedData = sessionStorage.getItem('hh_builder_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Download Card as High-Quality PNG
  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;

    try {
      setIsDownloading(true);

      // Render high-res PNG at 3x resolution
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        quality: 1,
      });

      // Trigger file download
      const safeName = formData.name ? formData.name.trim().replace(/\s+/g, '_') : 'Builder';
      const link = document.createElement('a');
      link.download = `HH_Goa_2026_Card_${safeName}.png`;
      link.href = dataUrl;
      link.click();

      // Confetti celebratory burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f5c800', '#ff2d78', '#229946', '#ffffff'],
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Error generating card image:', err);
      alert('Could not export image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Share to X intent
  const handleShareToX = () => {
    const builderName = formData.name ? formData.name.trim() : 'Builder';
    const builderTitle = formData.builderTitle || 'The Code Architect';
    const text = `Just generated my official Builder Card as "${builderTitle}" for @HackerHouseGoa 2026! 🌴🚀\n\nSee you in Goa! 🏖️\n\n#FrameInGoa #HHGoa2026 #HackerHouseGoa`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Create another card (reset session)
  const handleCreateAnother = () => {
    sessionStorage.removeItem('hh_cropped_photo');
    sessionStorage.removeItem('hh_photo_src');
    sessionStorage.removeItem('hh_photo_type');
    sessionStorage.removeItem('hh_builder_data');
    router.push('/');
  };

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <header className={styles.navbar}>
        <button
          onClick={() => router.push('/builder')}
          className={styles.backBtn}
          aria-label="Edit details"
        >
          ← EDIT CARD
        </button>

        {/* Center Logo with Goa attached in center */}
        <div className={styles.navBrandWrap} role="img" aria-label="Hacker House Goa">
          <div className={styles.navWordmarkContainer}>
            <Image
              src="/Hacker_house_transparent.png"
              alt="Hacker House"
              width={140}
              height={28}
              className={styles.navWordmarkImg}
              priority
            />
            <div className={styles.navGoaCenter}>
              <Image
                src="/logo.svg"
                alt="गोवा"
                width={26}
                height={26}
                className={styles.navGoaImg}
                priority
              />
            </div>
          </div>
          <span className={styles.navSubBadge}>FINAL CARD</span>
        </div>

        <button
          onClick={handleCreateAnother}
          className={styles.newCardBtn}
        >
          + NEW CARD
        </button>
      </header>

      {/* Success Toast */}
      {downloadSuccess && (
        <div className={styles.toastSuccess} role="status">
          <span className={styles.toastIcon}>🎉</span>
          <div className={styles.toastText}>
            <strong>Card Downloaded Successfully!</strong>
            <span>Ready to post on X with #FrameInGoa</span>
          </div>
        </div>
      )}

      {/* Main Studio Viewport */}
      <main className={styles.finalLayout}>
        {/* Left Column: The Completed Collectible Card to Export */}
        <section className={styles.cardSection}>
          <div className={styles.cardScaler} ref={cardRef}>
            {/* Lanyard Graphic */}
            <div className={styles.lanyardContainer}>
              <div className={styles.lanyardStrap}>
                <div className={styles.lanyardPattern}>
                  <span>★ HH GOA 2026 🌴</span>
                </div>
              </div>
              <div className={styles.lanyardMetalClip}>
                <div className={styles.clipRing} />
                <div className={styles.clipBody}>
                  <div className={styles.clipSlot} />
                </div>
              </div>
            </div>

            {/* The Badge Card Frame */}
            <div className={styles.cardFrame}>
              <div className={styles.cardInner}>
                {/* ── CARD HEADER ROW ── */}
                <div className={styles.cardHeaderRow}>
                  {/* Left: Official Hacker House Wordmark + Goa in center */}
                  <div className={styles.logoBlock}>
                    <div className={styles.cardWordmarkContainer}>
                      <Image
                        src="/Hacker_house_transparent.png"
                        alt="Hacker House"
                        width={200}
                        height={36}
                        className={styles.cardWordmarkImg}
                        priority
                      />
                      <div className={styles.cardGoaCenter}>
                        <Image
                          src="/logo.svg"
                          alt="गोवा"
                          width={32}
                          height={32}
                          className={styles.cardGoaImg}
                          priority
                        />
                      </div>
                    </div>
                    <div className={styles.logoDates}>
                      <span>GOA, INDIA</span>
                      <span className={styles.dateDot}>•</span>
                      <span>28 – 31 OCT 2026</span>
                    </div>
                    <div className={styles.logoStudio}>2:47 PM STUDIO</div>
                  </div>

                  {/* Right: Postmark Stamp + Beach Sunset Scene */}
                  <div className={styles.artworkBlock}>
                    {/* Circular Gold Postmark Stamp */}
                    <div className={styles.postmarkStamp}>
                      <svg viewBox="0 0 100 100" className={styles.stampSvg}>
                        <circle cx="50" cy="50" r="46" fill="none" stroke="#f5c800" strokeWidth="2.5" strokeDasharray="3.5 2.5" />
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f5c800" strokeWidth="1.5" />
                        <path id="finalStampArcTop" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
                        <text className={styles.stampSvgText}>
                          <textPath href="#finalStampArcTop" startOffset="50%" textAnchor="middle" fill="#f5c800">
                            BUILT IN GOA ★
                          </textPath>
                        </text>
                        <path id="finalStampArcBottom" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
                        <text className={styles.stampSvgTextSmall}>
                          <textPath href="#finalStampArcBottom" startOffset="50%" textAnchor="middle" fill="#f5c800">
                            BUILDING THE FUTURE
                          </textPath>
                        </text>
                        {/* Center Palm Icon */}
                        <path d="M50 32 L50 68" stroke="#f5c800" strokeWidth="3" strokeLinecap="round" />
                        <path d="M50 38 Q34 30 28 42" stroke="#f5c800" strokeWidth="2.5" fill="none" />
                        <path d="M50 42 Q66 34 72 46" stroke="#f5c800" strokeWidth="2.5" fill="none" />
                        <path d="M50 48 Q32 46 26 58" stroke="#f5c800" strokeWidth="2" fill="none" />
                        <path d="M50 52 Q68 50 74 62" stroke="#f5c800" strokeWidth="2" fill="none" />
                      </svg>
                    </div>

                    {/* Tropical Beach & Shack Artwork with generous spacing */}
                    <div className={styles.beachArtBox}>
                      <svg viewBox="0 0 220 110" fill="none" className={styles.beachArtSvg}>
                        {/* Glowing Sun */}
                        <circle cx="80" cy="48" r="26" fill="#f5c800" />
                        {/* Sun Reflections on water */}
                        <path d="M55 76 L105 76 M62 80 L98 80 M70 84 L90 84" stroke="#f5c800" strokeWidth="1.5" opacity="0.6" />
                        {/* Ocean Water Waves */}
                        <path d="M0 70 Q55 64 110 70 T220 70 L220 110 L0 110 Z" fill="#0b4520" />
                        <path d="M0 76 Q55 72 110 76 T220 76" stroke="#1d8040" strokeWidth="1.2" />

                        {/* Sailboat */}
                        <path d="M30 63 L40 44 L40 63 Z" fill="#fdf5e0" />
                        <path d="M26 65 L44 65 L40 69 L30 69 Z" fill="#fdf5e0" />
                        {/* Small flying seagulls */}
                        <path d="M18 32 Q23 27 28 32 Q33 27 38 32" stroke="#fdf5e0" strokeWidth="1.2" fill="none" opacity="0.75" />
                        <path d="M48 22 Q53 17 58 22 Q63 17 68 22" stroke="#fdf5e0" strokeWidth="1.2" fill="none" opacity="0.75" />

                        {/* Surfboards */}
                        <ellipse cx="108" cy="72" rx="4" ry="17" fill="#fdf5e0" stroke="#0e3d1f" strokeWidth="1.5" transform="rotate(-15 108 72)" />
                        <ellipse cx="118" cy="72" rx="4" ry="17" fill="#f5c800" stroke="#ff2d78" strokeWidth="1.5" transform="rotate(10 118 72)" />

                        {/* Goa Beach Shack Cafe */}
                        <rect x="130" y="52" width="56" height="38" rx="3" fill="#fdf5e0" stroke="#0e3d1f" strokeWidth="2" />
                        <polygon points="124,52 158,34 192,52" fill="#ff2d78" stroke="#0e3d1f" strokeWidth="1.5" />
                        <text x="158" y="47" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">
                          GOA BEACH
                        </text>
                        <rect x="138" y="62" width="16" height="16" fill="#155a28" />
                        <rect x="162" y="62" width="16" height="28" fill="#0e3d1f" />
                        {/* Cafe Bar Stools */}
                        <line x1="142" y1="78" x2="142" y2="88" stroke="#0e3d1f" strokeWidth="1.5" />
                        <line x1="148" y1="78" x2="148" y2="88" stroke="#0e3d1f" strokeWidth="1.5" />

                        {/* Palm Tree on Right with clean spacing */}
                        <path d="M208 110 Q202 65 190 25" stroke="#165a2d" strokeWidth="7" strokeLinecap="round" />
                        <path d="M190 25 Q162 10 144 24" stroke="#229946" strokeWidth="3.5" fill="none" />
                        <path d="M190 25 Q172 0 182 -15" stroke="#229946" strokeWidth="3.5" fill="none" />
                        <path d="M190 25 Q212 5 224 20" stroke="#229946" strokeWidth="3.5" fill="none" />
                        <path d="M190 25 Q208 40 218 55" stroke="#229946" strokeWidth="3.5" fill="none" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ── CARD MIDDLE GRID: PHOTO + DETAILS ── */}
                <div className={styles.cardMainGrid}>
                  {/* Left Column: Photo & Builder Title */}
                  <div className={styles.photoCol}>
                    <div className={styles.photoFrameOuter}>
                      <div className={styles.photoFrameInner}>
                        {photoSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoSrc} alt={formData.name || 'Builder Photo'} className={styles.userPhoto} />
                        ) : (
                          <div className={styles.photoPlaceholder}>
                            <span className={styles.placeholderIcon}>👤</span>
                            <span className={styles.placeholderText}>BUILDER</span>
                          </div>
                        )}
                      </div>

                      {/* Hacker Builder Circular Seal */}
                      <div className={styles.hackerSeal}>
                        <span className={styles.sealTop}>HACKER</span>
                        <span className={styles.sealPalm}>🌴</span>
                        <span className={styles.sealBottom}>BUILDER</span>
                      </div>
                    </div>

                    {/* Builder Title Box */}
                    <div className={styles.builderTitleBox}>
                      <span className={styles.builderTitleBadge}>BUILDER TITLE</span>
                      <div className={styles.builderTitleText}>
                        <span>{formData.builderTitle ? formData.builderTitle.toUpperCase() : 'THE CODE ARCHITECT'}</span>
                        <span className={styles.titlePalm}>🌴</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Name & Details List */}
                  <div className={styles.infoCol}>
                    {/* Name Header */}
                    <div className={styles.nameRow}>
                      <span className={styles.nameSparkle}>✦</span>
                      <h2 className={styles.cardName}>
                        {formData.name ? formData.name.toUpperCase() : 'BUILDER NAME'}
                      </h2>
                      <span className={styles.nameSparkle}>✦</span>
                    </div>

                    {/* Role / Subtitle */}
                    {formData.role && (
                      <div className={styles.cardRole}>
                        {formData.role.toUpperCase()}
                      </div>
                    )}

                    {/* Detail Rows */}
                    <div className={styles.detailsList}>
                      {/* X / Twitter */}
                      {formData.xHandle && (
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>𝕏</div>
                          <span className={styles.detailKey}>X HANDLE</span>
                          <span className={styles.detailVal}>{formatXHandle(formData.xHandle)}</span>
                        </div>
                      )}

                      {/* Stack / Role */}
                      {formData.stack && (
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>&lt;/&gt;</div>
                          <span className={styles.detailKey}>STACK / ROLE</span>
                          <span className={styles.detailVal}>{formData.stack}</span>
                        </div>
                      )}

                      {/* Location */}
                      {formData.location && (
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>📍</div>
                          <span className={styles.detailKey}>LOCATION</span>
                          <span className={styles.detailVal}>{formData.location}</span>
                        </div>
                      )}

                      {/* Website */}
                      {formData.website && (
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>🌐</div>
                          <span className={styles.detailKey}>WEBSITE</span>
                          <span className={styles.detailVal}>{formatWebsite(formData.website)}</span>
                        </div>
                      )}

                      {/* LinkedIn */}
                      {formData.linkedin && (
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>in</div>
                          <span className={styles.detailKey}>LINKEDIN</span>
                          <span className={styles.detailVal}>{formatLinkedIn(formData.linkedin)}</span>
                        </div>
                      )}

                      {/* GitHub */}
                      {formData.github && (
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>🐙</div>
                          <span className={styles.detailKey}>GITHUB</span>
                          <span className={styles.detailVal}>{formatGithub(formData.github)}</span>
                        </div>
                      )}

                      {/* Email */}
                      {formData.email && (
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>✉</div>
                          <span className={styles.detailKey}>EMAIL</span>
                          <span className={styles.detailVal}>{formData.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── CARD STATS ROW: FUEL, MODE, VIBE ── */}
                <div className={styles.statsRow}>
                  <div className={styles.statBox}>
                    <div className={styles.statIcon}>☕</div>
                    <div className={styles.statMeta}>
                      <span className={styles.statKey}>FUEL</span>
                      <span className={styles.statVal}>{formData.fuel}</span>
                    </div>
                  </div>

                  <div className={styles.statSeparator} />

                  <div className={styles.statBox}>
                    <div className={styles.statIcon}>💻</div>
                    <div className={styles.statMeta}>
                      <span className={styles.statKey}>MODE</span>
                      <span className={styles.statVal}>{formData.mode}</span>
                    </div>
                  </div>

                  <div className={styles.statSeparator} />

                  <div className={styles.statBox}>
                    <div className={styles.statIcon}>🚀</div>
                    <div className={styles.statMeta}>
                      <span className={styles.statKey}>VIBE</span>
                      <span className={styles.statVal}>{formData.vibe}</span>
                    </div>
                  </div>
                </div>

                {/* ── CARD FOOTER: BARCODE + #FRAMEINGOA + VILLA ── */}
                <div className={styles.cardFooterRow}>
                  {/* Barcode */}
                  <div className={styles.barcodeBox}>
                    <div className={styles.barcodeBars}>
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4].map(
                        (w, i) => (
                          <div key={i} className={styles.barLine} style={{ width: `${w * 1.5}px` }} />
                        )
                      )}
                    </div>
                  </div>

                  {/* #FRAMEINGOA Tag */}
                  <div className={styles.frameTag}>
                    <span className={styles.frameTagText}>#FRAMEINGOA</span>
                    <span className={styles.frameTagPalm}>🌴</span>
                  </div>

                  {/* Goa Villa with Hibiscus Artwork */}
                  <div className={styles.villaBox}>
                    <svg viewBox="0 0 130 90" fill="none" className={styles.villaSvg}>
                      {/* Terracotta Villa Roof */}
                      <polygon points="15,40 65,14 115,40" fill="#cf4c28" stroke="#0e3d1f" strokeWidth="2" />
                      <path d="M25,36 L65,20 L105,36" stroke="#f5c800" strokeWidth="1.5" fill="none" />
                      {/* Villa Wall */}
                      <rect x="22" y="40" width="86" height="42" fill="#fdf5e0" stroke="#0e3d1f" strokeWidth="2" />
                      {/* Windows with Pink Shutters */}
                      <rect x="30" y="46" width="15" height="18" fill="#155a28" />
                      <rect x="28" y="46" width="4" height="18" fill="#ff2d78" />
                      <rect x="43" y="46" width="4" height="18" fill="#ff2d78" />
                      <rect x="85" y="46" width="15" height="18" fill="#155a28" />
                      <rect x="83" y="46" width="4" height="18" fill="#ff2d78" />
                      <rect x="98" y="46" width="4" height="18" fill="#ff2d78" />
                      {/* Door */}
                      <rect x="58" y="46" width="14" height="36" fill="#f5c800" stroke="#0e3d1f" strokeWidth="1.5" />
                      <line x1="65" y1="46" x2="65" y2="82" stroke="#0e3d1f" strokeWidth="1" />
                      {/* Flowers and Tropical Leaves */}
                      <ellipse cx="12" cy="74" rx="12" ry="6" fill="#166b30" transform="rotate(-30 12 74)" />
                      <ellipse cx="118" cy="76" rx="12" ry="6" fill="#166b30" transform="rotate(30 118 76)" />
                      <circle cx="14" cy="68" r="8" fill="#ff2d78" />
                      <circle cx="14" cy="68" r="3" fill="#f5c800" />
                      <circle cx="116" cy="70" r="8" fill="#ff2d78" />
                      <circle cx="116" cy="70" r="3" fill="#f5c800" />
                      <circle cx="26" cy="80" r="5" fill="#f5c800" />
                      <circle cx="104" cy="82" r="5" fill="#ff2d78" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Download & Sharing Action Card */}
        <section className={styles.actionSection}>
          <div className={styles.actionCard}>
            {/* Header / Status */}
            <div className={styles.actionHeader}>
              <div className={styles.badgeReady}>
                <span className={styles.badgeDot} />
                <span>CARD GENERATED</span>
              </div>
              <h1 className={styles.actionTitle}>Your HH Goa Identity is Ready!</h1>
              <p className={styles.actionSubtitle}>
                Download your official collectible Builder Card in full high resolution and share it with the world.
              </p>
            </div>

            {/* Builder Summary Pill */}
            <div className={styles.summaryBox}>
              <div className={styles.summaryAvatar}>
                {photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoSrc} alt={formData.name} className={styles.summaryImg} />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className={styles.summaryInfo}>
                <h3 className={styles.summaryName}>{formData.name || 'HACKER HOUSE BUILDER'}</h3>
                <span className={styles.summaryTitle}>{formData.builderTitle || 'THE CODE ARCHITECT'}</span>
              </div>
              <span className={styles.summaryTag}>#FRAMEINGOA</span>
            </div>

            {/* Primary Action Buttons */}
            <div className={styles.actionButtons}>
              {/* Download PNG Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className={styles.downloadBtn}
              >
                {isDownloading ? (
                  <>
                    <span className={styles.spinner} />
                    <span>EXPORTING HD PNG...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>DOWNLOAD CARD (HD PNG)</span>
                  </>
                )}
              </button>

              {/* Share to X Button */}
              <button
                type="button"
                onClick={handleShareToX}
                className={styles.shareXBtn}
              >
                <span className={styles.xIcon}>𝕏</span>
                <span>SHARE TO X (#FrameInGoa)</span>
              </button>
            </div>

            {/* Secondary Options */}
            <div className={styles.secondaryActions}>
              <button
                type="button"
                onClick={() => router.push('/builder')}
                className={styles.editBtn}
              >
                ✏️ Edit Card Details
              </button>

              <button
                type="button"
                onClick={handleCreateAnother}
                className={styles.resetBtn}
              >
                ↺ Create Another Card
              </button>
            </div>

            {/* Tropical Event Footer Stamp */}
            <div className={styles.actionFooter}>
              <span>🌴 HACKER HOUSE GOA 2026</span>
              <span>•</span>
              <span>28–31 OCT 2026</span>
              <span>•</span>
              <span>2:47 PM STUDIO</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
