'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './builder.module.css';

const BUILDER_TITLES = [
  'THE CODE ARCHITECT',
  'THE AI BUILDER',
  'THE PRODUCT HACKER',
  'THE SHIPMASTER',
  'FRONTEND NINJA',
  'FULLSTACK WIZARD',
  'SMART CONTRACT HACKER',
  'DEVREL DEGEN',
  'SYSTEMS EXPLORER',
];

const FUEL_OPTIONS = ['COFFEE & CODE', 'CHAI & LOOPS', 'BEACH BREEZE & BUGS', 'RED BULL & COMMITS'];
const MODE_OPTIONS = ['SHIP • BUILD REPEAT', 'BUILD IN PUBLIC', 'SOLO SPRINT', 'NIGHT OWL MODE'];
const VIBE_OPTIONS = [
  'BUILDING IDEAS. BREAKING LIMITS.',
  'SUN, SAND & SOFTWARE.',
  'CODE BY DAY, VIBES BY NIGHT.',
  'LESS TALK, MORE REPOS.',
];

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

export default function BuilderPage() {
  const router = useRouter();

  // Photo state
  const [photoSrc, setPhotoSrc] = useState<string>('');

  // Step state (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form fields start EMPTY as requested by user
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    builderTitle: 'THE CODE ARCHITECT',
    xHandle: '',
    stack: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    email: '',
    fuel: 'COFFEE & CODE',
    mode: 'SHIP • BUILD REPEAT',
    vibe: 'BUILDING IDEAS. BREAKING LIMITS.',
  });

  // Load cropped photo and saved builder data on mount
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
        setFormData((prev) => ({
          ...prev,
          ...JSON.parse(savedData),
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cycleTitle = useCallback(() => {
    setFormData((prev) => {
      const idx = BUILDER_TITLES.indexOf(prev.builderTitle);
      const nextIdx = (idx + 1) % BUILDER_TITLES.length;
      return { ...prev, builderTitle: BUILDER_TITLES[nextIdx] };
    });
  }, []);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleConfirm = () => {
    sessionStorage.setItem('hh_builder_data', JSON.stringify(formData));
    router.push('/card');
  };

  return (
    <div className={styles.container}>
      {/* Top Navbar with official Wordmark + Goa in center */}
      <header className={styles.navbar}>
        <button
          onClick={() => router.push('/editor')}
          className={styles.backBtn}
          aria-label="Back to photo editor"
        >
          ← BACK
        </button>

        {/* Center Logo with Goa attached in center */}
        <div className={styles.navBrandWrap} role="img" aria-label="Hacker House Goa">
          <div className={styles.navWordmarkContainer}>
            <Image
              src="/Hacker house.png"
              alt="Hacker House"
              width={140}
              height={22}
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
          <span className={styles.navSubBadge}>BUILDER CARD</span>
        </div>

        <button
          onClick={() => router.push('/editor')}
          className={styles.changePhotoBtn}
        >
          📷 PHOTO
        </button>
      </header>

      {/* Main Studio Area */}
      <main className={styles.studioLayout}>
        {/* Preview Section (Top on mobile, Right on desktop) */}
        <section className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              <span>LIVE PREVIEW</span>
            </div>
            <span className={styles.resolutionBadge}>HH GOA 2026 ID</span>
          </div>

          <div className={styles.cardScaler}>
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

            {/* The Badge Card Container */}
            <div className={styles.cardFrame}>
              <div className={styles.cardInner}>
                {/* ── CARD HEADER ROW ── */}
                <div className={styles.cardHeaderRow}>
                  {/* Left: Official Hacker House Wordmark + Goa in center */}
                  <div className={styles.logoBlock}>
                    <div className={styles.cardWordmarkContainer}>
                      <Image
                        src="/Hacker house.png"
                        alt="Hacker House"
                        width={200}
                        height={32}
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
                        <path id="stampArcTop" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
                        <text className={styles.stampSvgText}>
                          <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle" fill="#f5c800">
                            BUILT IN GOA ★
                          </textPath>
                        </text>
                        <path id="stampArcBottom" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
                        <text className={styles.stampSvgTextSmall}>
                          <textPath href="#stampArcBottom" startOffset="50%" textAnchor="middle" fill="#f5c800">
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
                        {/* Glowing Sun (Center-Left) */}
                        <circle cx="80" cy="48" r="26" fill="#f5c800" />
                        {/* Sun Reflections on water */}
                        <path d="M55 76 L105 76 M62 80 L98 80 M70 84 L90 84" stroke="#f5c800" strokeWidth="1.5" opacity="0.6" />
                        {/* Ocean Water Waves */}
                        <path d="M0 70 Q55 64 110 70 T220 70 L220 110 L0 110 Z" fill="#0b4520" />
                        <path d="M0 76 Q55 72 110 76 T220 76" stroke="#1d8040" strokeWidth="1.2" />

                        {/* Sailboat (Spaced to far left) */}
                        <path d="M30 63 L40 44 L40 63 Z" fill="#fdf5e0" />
                        <path d="M26 65 L44 65 L40 69 L30 69 Z" fill="#fdf5e0" />
                        {/* Small flying seagulls */}
                        <path d="M18 32 Q23 27 28 32 Q33 27 38 32" stroke="#fdf5e0" strokeWidth="1.2" fill="none" opacity="0.75" />
                        <path d="M48 22 Q53 17 58 22 Q63 17 68 22" stroke="#fdf5e0" strokeWidth="1.2" fill="none" opacity="0.75" />

                        {/* Surfboards (Spaced between sun & shack) */}
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
                            <span className={styles.placeholderText}>NO PHOTO</span>
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
                      <h2 className={`${styles.cardName} ${!formData.name ? styles.dimmedText : ''}`}>
                        {formData.name ? formData.name.toUpperCase() : 'YOUR NAME'}
                      </h2>
                      <span className={styles.nameSparkle}>✦</span>
                    </div>

                    {/* Role / Subtitle */}
                    <div className={`${styles.cardRole} ${!formData.role ? styles.dimmedText : ''}`}>
                      {formData.role ? formData.role.toUpperCase() : 'FULL STACK DEVELOPER'}
                    </div>

                    {/* Detail Rows */}
                    <div className={styles.detailsList}>
                      {/* X / Twitter */}
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>𝕏</div>
                        <span className={styles.detailKey}>X HANDLE</span>
                        <span className={`${styles.detailVal} ${!formData.xHandle ? styles.dimmedVal : ''}`}>
                          {formatXHandle(formData.xHandle) || '@username'}
                        </span>
                      </div>

                      {/* Stack / Role */}
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>&lt;/&gt;</div>
                        <span className={styles.detailKey}>STACK / ROLE</span>
                        <span className={`${styles.detailVal} ${!formData.stack ? styles.dimmedVal : ''}`}>
                          {formData.stack || 'REACT, NEXT.JS, SOL'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>📍</div>
                        <span className={styles.detailKey}>LOCATION</span>
                        <span className={`${styles.detailVal} ${!formData.location ? styles.dimmedVal : ''}`}>
                          {formData.location || 'GOA, INDIA'}
                        </span>
                      </div>

                      {/* Website */}
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>🌐</div>
                        <span className={styles.detailKey}>WEBSITE</span>
                        <span className={`${styles.detailVal} ${!formData.website ? styles.dimmedVal : ''}`}>
                          {formatWebsite(formData.website) || 'yoursite.dev'}
                        </span>
                      </div>

                      {/* LinkedIn */}
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>in</div>
                        <span className={styles.detailKey}>LINKEDIN</span>
                        <span className={`${styles.detailVal} ${!formData.linkedin ? styles.dimmedVal : ''}`}>
                          {formatLinkedIn(formData.linkedin) || 'linkedin.com/in/username'}
                        </span>
                      </div>

                      {/* GitHub */}
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>🐙</div>
                        <span className={styles.detailKey}>GITHUB</span>
                        <span className={`${styles.detailVal} ${!formData.github ? styles.dimmedVal : ''}`}>
                          {formatGithub(formData.github) || 'github.com/username'}
                        </span>
                      </div>

                      {/* Email */}
                      <div className={styles.detailItem}>
                        <div className={styles.detailIcon}>✉</div>
                        <span className={styles.detailKey}>EMAIL</span>
                        <span className={`${styles.detailVal} ${!formData.email ? styles.dimmedVal : ''}`}>
                          {formData.email || 'builder@hhgoa.com'}
                        </span>
                      </div>
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

        {/* Left Form Column (wizard) */}
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            {/* Step Wizard Navigator */}
            <div className={styles.stepHeader}>
              <button
                type="button"
                className={`${styles.stepBox} ${currentStep === 1 ? styles.stepBoxActive : ''} ${currentStep > 1 ? styles.stepBoxCompleted : ''
                  }`}
                onClick={() => setCurrentStep(1)}
              >
                <span className={styles.stepNumber}>01</span>
                <div className={styles.stepInfo}>
                  <span className={styles.stepTitle}>IDENTITY</span>
                  <span className={styles.stepSub}>Name & Role</span>
                </div>
              </button>

              <div className={styles.stepConnector} />

              <button
                type="button"
                className={`${styles.stepBox} ${currentStep === 2 ? styles.stepBoxActive : ''} ${currentStep > 2 ? styles.stepBoxCompleted : ''
                  }`}
                onClick={() => setCurrentStep(2)}
              >
                <span className={styles.stepNumber}>02</span>
                <div className={styles.stepInfo}>
                  <span className={styles.stepTitle}>SPECIALTY</span>
                  <span className={styles.stepSub}>Stack & Title</span>
                </div>
              </button>

              <div className={styles.stepConnector} />

              <button
                type="button"
                className={`${styles.stepBox} ${currentStep === 3 ? styles.stepBoxActive : ''}`}
                onClick={() => setCurrentStep(3)}
              >
                <span className={styles.stepNumber}>03</span>
                <div className={styles.stepInfo}>
                  <span className={styles.stepTitle}>CONNECT</span>
                  <span className={styles.stepSub}>Socials & Vibe</span>
                </div>
              </button>
            </div>

            {/* Form Step Contents */}
            <div className={styles.stepBody}>
              {/* STEP 1: Basic Info */}
              {currentStep === 1 && (
                <div className={styles.fieldsGrid}>
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>
                      FULL NAME <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Satoshi Nakamoto"
                      className={styles.input}
                      maxLength={30}
                      autoFocus
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>ROLE / SUBTITLE</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g. Full Stack Developer"
                      className={styles.input}
                      maxLength={35}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>LOCATION</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Ahmedabad, India"
                      className={styles.input}
                      maxLength={30}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <div className={styles.photoSummaryBox}>
                      <div className={styles.photoThumbWrap}>
                        {photoSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoSrc} alt="Thumbnail" className={styles.photoThumb} />
                        ) : (
                          <div className={styles.photoThumbPlaceholder}>👤</div>
                        )}
                      </div>
                      <div className={styles.photoSummaryText}>
                        <p className={styles.photoSummaryTitle}>
                          {photoSrc ? 'Profile Photo Ready' : 'No Photo Uploaded'}
                        </p>
                        <p className={styles.photoSummaryDesc}>
                          {photoSrc ? 'Ready for your official card' : 'Pick or capture a photo'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push('/editor')}
                        className={styles.editPhotoLink}
                      >
                        {photoSrc ? 'Adjust Crop ↺' : 'Add Photo +'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Stack & Builder Title */}
              {currentStep === 2 && (
                <div className={styles.fieldsGrid}>
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>TECH STACK / SKILLS</label>
                    <input
                      type="text"
                      name="stack"
                      value={formData.stack}
                      onChange={handleChange}
                      placeholder="e.g. React, Next.js, AI, Solana"
                      className={styles.input}
                      maxLength={40}
                      autoFocus
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <div className={styles.labelWithAction}>
                      <label className={styles.label}>BUILDER TITLE</label>
                      <button type="button" onClick={cycleTitle} className={styles.randomTitleBtn}>
                        ⚡ Randomize
                      </button>
                    </div>
                    <input
                      type="text"
                      name="builderTitle"
                      value={formData.builderTitle}
                      onChange={handleChange}
                      placeholder="e.g. The Code Architect"
                      className={`${styles.input} ${styles.highlightInput}`}
                      maxLength={30}
                    />
                    <div className={styles.titlePills}>
                      {BUILDER_TITLES.map((title) => (
                        <button
                          key={title}
                          type="button"
                          className={`${styles.titlePill} ${formData.builderTitle === title ? styles.titlePillActive : ''
                            }`}
                          onClick={() => setFormData((prev) => ({ ...prev, builderTitle: title }))}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Socials & Vibe */}
              {currentStep === 3 && (
                <div className={styles.fieldsGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>X / TWITTER</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.inputPrefix}>𝕏</span>
                      <input
                        type="text"
                        name="xHandle"
                        value={formData.xHandle}
                        onChange={handleChange}
                        placeholder="username"
                        className={styles.inputPrefixed}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>GITHUB</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.inputPrefix}>🐙</span>
                      <input
                        type="text"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="username"
                        className={styles.inputPrefixed}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>LINKEDIN</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.inputPrefix}>in</span>
                      <input
                        type="text"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="username"
                        className={styles.inputPrefixed}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>WEBSITE</label>
                    <div className={styles.inputWithIcon}>
                      <span className={styles.inputPrefix}>🌐</span>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="yoursite.dev"
                        className={styles.inputPrefixed}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>EMAIL ADDRESS (OPTIONAL)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@domain.com"
                      className={styles.input}
                    />
                  </div>

                  {/* Vibe Selection */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>BUILDER FUEL ☕</label>
                    <select
                      name="fuel"
                      value={formData.fuel}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      {FUEL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>BUILDER MODE 💻</label>
                    <select
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      {MODE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Step Actions */}
            <div className={styles.stepActions}>
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrev} className={styles.prevBtn}>
                  ← PREV
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button type="button" onClick={handleNext} className={styles.nextBtn}>
                  NEXT STEP (0{currentStep + 1}) →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={styles.submitBtn}
                >
                  ✓ CREATE BUILDER CARD →
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
