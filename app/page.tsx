'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
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

  const [showCelebration, setShowCelebration] = useState(true);

  // Load photo & form data if already in session to make the center card live!
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'HACKER BUILDER',
    role: 'THE CODE ARCHITECT',
    builderTitle: 'THE CODE ARCHITECT',
    xHandle: '@hacker',
    stack: 'REACT, NEXT.JS, SOL',
    location: 'GOA, INDIA',
    github: 'hacker',
    email: 'hacker@hhgoa.com',
    fuel: 'COFFEE & CODE',
    mode: 'SHIP • BUILD REPEAT',
    vibe: 'BUILDING IDEAS. BREAKING LIMITS.',
  });

  // Laptop terminal state
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '> HH_GOA_2026: STARTING SPRINT...',
    '> HACKERS ACTIVE: 390+',
    '> SYSTEM STATUS: SHIP OR SHIP! 🚀',
  ]);

  // Unmount celebration elements after 5.5 seconds to keep DOM clean
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cropped = sessionStorage.getItem('hh_cropped_photo');
      const raw = sessionStorage.getItem('hh_photo_src');
      if (cropped || raw) {
        setPhotoSrc(cropped || raw);
      }

      const savedData = sessionStorage.getItem('hh_builder_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Cycle terminal messages for the laptop screen
  useEffect(() => {
    const messages = [
      '> LOAD_FUEL: COFFEE & CHAI LOADED ☕',
      '> CODE_BASE: COMPILING REPOS...',
      '> SHIP_SPEED: 100+ SHIPPED!',
      '> BOUNTY_POOL: $50K+ ACTIVE 💰',
      '> MISSION: SOLVE PROB, CODE VIBES',
      '> LOCATION: MORJIM BEACH, GOA 🏖️',
    ];

    const timer = setInterval(() => {
      setTerminalLines((prev) => {
        const nextMsg = messages[Math.floor(Math.random() * messages.length)];
        return [...prev.slice(1), nextMsg];
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

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
      {showCelebration && (
        <div className={styles.celebrationOverlay} aria-hidden="true">
          {/* Rocket 1 (Left Diagonal) */}
          <div className={`${styles.rocket} ${styles.rocket1}`}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.rocketSvg}>
              <path d="M12 2C12 2 15 6 15 12C15 15 13.5 17 12 19C10.5 17 9 15 9 12C9 6 12 2 12 2Z" fill="var(--yellow)" stroke="var(--pink)" strokeWidth="1.5" />
              <path d="M12 19L12 22M9 14L6 17M15 14L18 17" stroke="var(--pink)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className={styles.rocketFlame} />
          </div>

          {/* Rocket 2 (Right Diagonal) */}
          <div className={`${styles.rocket} ${styles.rocket2}`}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.rocketSvg}>
              <path d="M12 2C12 2 15 6 15 12C15 15 13.5 17 12 19C10.5 17 9 15 9 12C9 6 12 2 12 2Z" fill="var(--pink)" stroke="var(--yellow)" strokeWidth="1.5" />
              <path d="M12 19L12 22M9 14L6 17M15 14L18 17" stroke="var(--yellow)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className={styles.rocketFlame} />
          </div>

          {/* Rocket 3 (Left Outer Vertical) */}
          <div className={`${styles.rocket} ${styles.rocket3}`}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.rocketSvg}>
              <path d="M12 2C12 2 15 6 15 12C15 15 13.5 17 12 19C10.5 17 9 15 9 12C9 6 12 2 12 2Z" fill="var(--cream)" stroke="var(--pink)" strokeWidth="1.5" />
              <path d="M12 19L12 22M9 14L6 17M15 14L18 17" stroke="var(--pink)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className={styles.rocketFlame} />
          </div>

          {/* Rocket 4 (Right Outer Vertical) */}
          <div className={`${styles.rocket} ${styles.rocket4}`}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.rocketSvg}>
              <path d="M12 2C12 2 15 6 15 12C15 15 13.5 17 12 19C10.5 17 9 15 9 12C9 6 12 2 12 2Z" fill="var(--yellow)" stroke="var(--cream)" strokeWidth="1.5" />
              <path d="M12 19L12 22M9 14L6 17M15 14L18 17" stroke="var(--cream)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className={styles.rocketFlame} />
          </div>

          {/* Rocket 5 (Left Inner Diagonal) */}
          <div className={`${styles.rocket} ${styles.rocket5}`}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.rocketSvg}>
              <path d="M12 2C12 2 15 6 15 12C15 15 13.5 17 12 19C10.5 17 9 15 9 12C9 6 12 2 12 2Z" fill="var(--pink)" stroke="var(--cream)" strokeWidth="1.5" />
              <path d="M12 19L12 22M9 14L6 17M15 14L18 17" stroke="var(--cream)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className={styles.rocketFlame} />
          </div>

          {/* Rocket 6 (Right Inner Diagonal) */}
          <div className={`${styles.rocket} ${styles.rocket6}`}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.rocketSvg}>
              <path d="M12 2C12 2 15 6 15 12C15 15 13.5 17 12 19C10.5 17 9 15 9 12C9 6 12 2 12 2Z" fill="var(--cream)" stroke="var(--yellow)" strokeWidth="1.5" />
              <path d="M12 19L12 22M9 14L6 17M15 14L18 17" stroke="var(--yellow)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className={styles.rocketFlame} />
          </div>

          {/* Explosion 1 */}
          <div className={`${styles.fireworkExplosion} ${styles.fw1}`}>
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={styles.fwSparkle} 
                style={{ 
                  '--angle': `${i * 25.7}deg`, 
                  '--color': i % 2 === 0 ? 'var(--pink)' : 'var(--cream)' 
                } as React.CSSProperties} 
              />
            ))}
            <div className={styles.fwFlash} />
          </div>

          {/* Explosion 2 */}
          <div className={`${styles.fireworkExplosion} ${styles.fw2}`}>
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={styles.fwSparkle} 
                style={{ 
                  '--angle': `${i * 25.7}deg`, 
                  '--color': i % 2 === 0 ? 'var(--yellow)' : 'var(--cream)' 
                } as React.CSSProperties} 
              />
            ))}
            <div className={styles.fwFlash} />
          </div>

          {/* Explosion 3 */}
          <div className={`${styles.fireworkExplosion} ${styles.fw3}`}>
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={styles.fwSparkle} 
                style={{ 
                  '--angle': `${i * 25.7}deg`, 
                  '--color': 'var(--cream)' 
                } as React.CSSProperties} 
              />
            ))}
            <div className={styles.fwFlash} />
          </div>

          {/* Explosion 4 */}
          <div className={`${styles.fireworkExplosion} ${styles.fw4}`}>
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={styles.fwSparkle} 
                style={{ 
                  '--angle': `${i * 25.7}deg`, 
                  '--color': 'var(--yellow)' 
                } as React.CSSProperties} 
              />
            ))}
            <div className={styles.fwFlash} />
          </div>

          {/* Explosion 5 */}
          <div className={`${styles.fireworkExplosion} ${styles.fw5}`}>
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={styles.fwSparkle} 
                style={{ 
                  '--angle': `${i * 25.7}deg`, 
                  '--color': 'var(--pink)' 
                } as React.CSSProperties} 
              />
            ))}
            <div className={styles.fwFlash} />
          </div>

          {/* Explosion 6 */}
          <div className={`${styles.fireworkExplosion} ${styles.fw6}`}>
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={styles.fwSparkle} 
                style={{ 
                  '--angle': `${i * 25.7}deg`, 
                  '--color': i % 2 === 0 ? 'var(--yellow)' : 'var(--pink)' 
                } as React.CSSProperties} 
              />
            ))}
            <div className={styles.fwFlash} />
          </div>
        </div>
      )}

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

      {/* ── STICKY GLASSMORPHISM HEADER ── */}
      <header className={styles.headerNavbar}>
        <div className={styles.headerBrand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className={styles.headerLogoContainer}>
            <Image
              src="/Hacker_house_transparent.png"
              alt="Hacker House Logo"
              width={125}
              height={25}
              className={styles.headerWordmarkImg}
              priority
            />
            <div className={styles.headerGoaCenter}>
              <Image
                src="/logo.svg"
                alt="गोवा"
                width={25}
                height={25}
                className={styles.headerGoaImg}
                priority
              />
            </div>
          </div>
          <span className={styles.headerSubBadge}>STUDIO</span>
        </div>

        <nav className={styles.headerNavLinks}>
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={styles.navLink}>
            BUILDER CARD
          </a>
          <a href="#hype-meter" className={styles.navLink}>
            THE HYPE
          </a>
          <a href="#journey" className={styles.navLink}>
            TIMELINE
          </a>
        </nav>

        <div className={styles.headerActions}>
          <button 
            onClick={() => {
              const el = document.getElementById('btn-gallery');
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={styles.headerCtaBtn}
          >
            GENERATE NOW 🌴
          </button>
        </div>
      </header>

      {/* ── BACKGROUND FLOATING TROPICAL DECORATIONS ── */}
      <div className={`${styles.floatingDecor} ${styles.decorLeft}`} aria-hidden="true">
        <div className={styles.palmTreeWrap}>
          <svg viewBox="0 0 120 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M65 340 C62 300 56 260 54 220 C52 185 56 155 60 125" stroke="#1d6b35" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M60 125 C38 100 10 75 0 50" stroke="#2a8a46" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C55 95 50 60 60 38" stroke="#f5c800" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C82 102 108 90 120 72" stroke="#2a8a46" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C85 138 112 150 118 168" stroke="#1d6b35" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M60 125 C35 140 12 152 4 170" stroke="#1d6b35" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div className={styles.stampCircle}>
          <div className={styles.stampCircleInner}>
            <span>BUILT</span><span>IN</span><span>GOA</span><span>★</span>
          </div>
        </div>
      </div>

      <div className={`${styles.floatingDecor} ${styles.decorRight}`} aria-hidden="true">
        <div className={styles.palmTreeWrap} style={{ transform: 'scaleX(-1)' }}>
          <svg viewBox="0 0 120 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M65 340 C62 300 56 260 54 220 C52 185 56 155 60 125" stroke="#1d6b35" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M60 125 C38 100 10 75 0 50" stroke="#2a8a46" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C55 95 50 60 60 38" stroke="#f5c800" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C82 102 108 90 120 72" stroke="#2a8a46" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 125 C85 138 112 150 118 168" stroke="#1d6b35" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M60 125 C35 140 12 152 4 170" stroke="#1d6b35" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div className={styles.decorBadge}>
          <span>BUILDER ID</span>
        </div>
      </div>

      {/* ── SECTION 1: HERO ID GENERATOR ── */}
      <section className={styles.heroSection} aria-label="Identity Generator">
        <div className={styles.centerCol}>
          
          {/* Logo Section */}
          <div className={styles.topSection}>
            <div className={styles.eventStrip}>
              <span>GOA, INDIA</span>
              <span className={styles.stripDot}>·</span>
              <span>28–31 OCT 2026</span>
              <span className={styles.stripDot}>·</span>
              <span>2:47 PM STUDIO</span>
            </div>

            <div className={styles.logoBlock}>
              <div className={styles.wordmarkWrap}>
                <Image
                  src="/Hacker house.png"
                  alt="Hacker House"
                  width={1200}
                  height={180}
                  className={styles.wordmark}
                  priority
                />
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
              <p className={styles.tagline}>
                BUILDER CARD GENERATOR &nbsp;—&nbsp; CREATE YOUR IDENTITY
              </p>
            </div>
            <div className={styles.topDivider} aria-hidden="true" />
          </div>

          {/* DYNAMIC DASHBOARD HERO LAYOUT (Centered card surrounded by 4 flying stats) */}
          <div className={styles.heroLayout} id="hype-meter">
            
            {/* Left Stats Column on Desktop */}
            <div className={styles.heroStatsColLeft}>
              <div className={`${styles.heroStatCard} ${styles.statLeft1}`}>
                <div className={styles.heroStatIcon} style={{ backgroundColor: 'rgba(255, 45, 120, 0.1)', color: 'var(--pink)' }}>📈</div>
                <div className={styles.heroStatInfo}>
                  <div className={styles.heroStatNum} style={{ color: 'var(--pink-light)' }}>6800+</div>
                  <div className={styles.heroStatLabel}>REGISTRATIONS</div>
                </div>
              </div>

              <div className={`${styles.heroStatCard} ${styles.statLeft2}`}>
                <div className={styles.heroStatIcon} style={{ backgroundColor: 'rgba(253, 245, 224, 0.1)', color: 'var(--cream)' }}>🚀</div>
                <div className={styles.heroStatInfo}>
                  <div className={styles.heroStatNum} style={{ color: 'var(--cream)' }}>100+</div>
                  <div className={styles.heroStatLabel}>SHIPPED PROJECTS</div>
                </div>
              </div>
            </div>

            {/* Central Card Preview */}
            <div className={styles.cardPreviewContainer}>
              <div className={styles.previewLanyard} />
              <div className={styles.previewCard}>
                <div className={styles.previewCardInner}>
                  
                  {/* Card Header */}
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.cardLogoBlock}>
                      <div className={styles.cardWordmarkContainer}>
                        <Image
                          src="/Hacker_house_transparent.png"
                          alt="Hacker House"
                          width={150}
                          height={24}
                          className={styles.cardWordmarkImg}
                          priority
                        />
                        <div className={styles.cardGoaCenter}>
                          <Image
                            src="/logo.svg"
                            alt="गोवा"
                            width={24}
                            height={24}
                            className={styles.cardGoaImg}
                            priority
                          />
                        </div>
                      </div>
                      <div className={styles.cardDates}>
                        <span>GOA, INDIA</span>
                        <span className={styles.cardDot}>•</span>
                        <span>28–31 OCT 2026</span>
                      </div>
                    </div>

                    <div className={styles.cardStampBlock}>
                      <div className={styles.miniPostmark}>
                        <svg viewBox="0 0 100 100" className={styles.miniStampSvg}>
                          <circle cx="50" cy="50" r="46" fill="none" stroke="#f5c800" strokeWidth="2.5" strokeDasharray="3.5 2.5" />
                          <path id="miniStampArc" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                          <text className={styles.miniStampText}>
                            <textPath href="#miniStampArc" startOffset="50%" textAnchor="middle" fill="#f5c800">
                              BUILT IN GOA ★
                            </textPath>
                          </text>
                          <path d="M50 35 L50 65 M38 45 Q50 38 62 45" stroke="#f5c800" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card Middle: Photo & Details */}
                  <div className={styles.cardMainGrid}>
                    <div className={styles.photoCol}>
                      <div className={styles.photoFrameOuter}>
                        {/* Duct tape effect for creative DIY vibe */}
                        <div className={styles.tapeAccent} />
                        
                        <div className={styles.photoFrameInner}>
                          {photoSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photoSrc} alt="Preview" className={styles.userPhoto} />
                          ) : (
                            /* Highly creative, neon-themed hologram placeholder */
                            <div className={styles.hologramPlaceholder}>
                              <div className={styles.scanline} />
                              <div className={styles.gridOverlay} />
                              
                              <svg viewBox="0 0 100 100" className={styles.hackerAvatarSvg}>
                                <circle cx="50" cy="50" r="38" fill="rgba(255, 45, 120, 0.12)" stroke="rgba(255, 45, 120, 0.25)" strokeWidth="1" />
                                <line x1="12" y1="50" x2="88" y2="50" stroke="rgba(255, 45, 120, 0.15)" strokeWidth="1" />
                                <line x1="20" y1="35" x2="80" y2="35" stroke="rgba(255, 45, 120, 0.15)" strokeWidth="1" />
                                <line x1="20" y1="65" x2="80" y2="65" stroke="rgba(255, 45, 120, 0.15)" strokeWidth="1" />
                                
                                <path d="M 50,22 C 40,22 36,30 36,38 C 36,46 39,48 42,50 C 32,56 26,64 26,78 L 74,78 C 74,64 68,56 58,50 C 61,48 64,46 64,38 C 64,30 60,22 50,22 Z" fill="var(--yellow)" opacity="0.8" />
                                <rect x="38" y="34" width="11" height="6" rx="1" fill="#0c4520" stroke="var(--pink)" strokeWidth="1.2" />
                                <rect x="51" y="34" width="11" height="6" rx="1" fill="#0c4520" stroke="var(--pink)" strokeWidth="1.2" />
                                <line x1="49" y1="37" x2="51" y2="37" stroke="var(--pink)" strokeWidth="1.2" />
                              </svg>
                              <span className={styles.hologramText}>ATTACH IMAGE</span>
                              <span className={styles.hologramHint}>CLICK BELOW</span>
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.hackerSeal}>
                          <span className={styles.sealTop}>HACKER</span>
                          <span className={styles.sealPalm}>🌴</span>
                          <span className={styles.sealBottom}>BUILDER</span>
                        </div>
                      </div>

                      <div className={styles.builderTitleBox}>
                        <span className={styles.builderTitleBadge}>BUILDER TITLE</span>
                        <div className={styles.builderTitleText}>
                          <span>{formData.builderTitle || 'THE CODE ARCHITECT'}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoCol}>
                      <div className={styles.nameRow}>
                        <span className={styles.nameSparkle}>✦</span>
                        <h2 className={styles.cardName}>{formData.name || 'HACKER BUILDER'}</h2>
                      </div>
                      <div className={styles.cardRole}>{formData.role || 'FULLSTACK DEVELOPER'}</div>

                      <div className={styles.detailsList}>
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>𝕏</div>
                          <span className={styles.detailKey}>X</span>
                          <span className={styles.detailVal}>{formData.xHandle || '@username'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>&lt;/&gt;</div>
                          <span className={styles.detailKey}>STACK</span>
                          <span className={styles.detailVal}>{formData.stack || 'REACT, NEXT.JS, SOL'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>📍</div>
                          <span className={styles.detailKey}>LOC</span>
                          <span className={styles.detailVal}>{formData.location || 'GOA, INDIA'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Stats Footer Row */}
                  <div className={styles.cardStatsRow}>
                    <div className={styles.cardStatBox}>
                      <span className={styles.cardStatKey}>FUEL</span>
                      <span className={styles.cardStatVal}>{formData.fuel}</span>
                    </div>
                    <div className={styles.cardStatBox}>
                      <span className={styles.cardStatKey}>MODE</span>
                      <span className={styles.cardStatVal}>{formData.mode}</span>
                    </div>
                    <div className={styles.cardStatBox}>
                      <span className={styles.cardStatKey}>VIBE</span>
                      <span className={styles.cardStatVal}>{formData.vibe}</span>
                    </div>
                  </div>

                  {/* Card Footer: Barcode & Tag */}
                  <div className={styles.cardFooterRow}>
                    <div className={styles.barcodeBox}>
                      <div className={styles.barcodeBars}>
                        {[2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2].map((w, i) => (
                          <div key={i} className={styles.barLine} style={{ width: `${w * 1.2}px` }} />
                        ))}
                      </div>
                    </div>
                    <div className={styles.frameTag}>
                      <span className={styles.frameTagText}>#FRAMEINGOA</span>
                      <span className={styles.frameTagPalm}>🌴</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Stats Column on Desktop */}
            <div className={styles.heroStatsColRight}>
              <div className={`${styles.heroStatCard} ${styles.statRight1}`}>
                <div className={styles.heroStatIcon} style={{ backgroundColor: 'rgba(245, 200, 0, 0.1)', color: 'var(--yellow)' }}>🔥</div>
                <div className={styles.heroStatInfo}>
                  <div className={styles.heroStatNum} style={{ color: 'var(--yellow)' }}>390+</div>
                  <div className={styles.heroStatLabel}>SELECTED HACKERS</div>
                </div>
              </div>

              <div className={`${styles.heroStatCard} ${styles.statRight2}`}>
                <div className={styles.heroStatIcon} style={{ backgroundColor: 'rgba(29, 107, 53, 0.2)', color: '#2a8a46' }}>💰</div>
                <div className={styles.heroStatInfo}>
                  <div className={styles.heroStatNum} style={{ color: '#2a8a46' }}>$50K+</div>
                  <div className={styles.heroStatLabel}>BOUNTY POOL</div>
                </div>
              </div>
            </div>

          </div>

          {/* UPLOAD ACTION SECTION (Enlarged, Highlighted Dashboard Card) */}
          <div className={styles.uploadContainerBox}>
            <div className={styles.uploadBoxHeader}>
              <div className={styles.stepBadge}>STEP 01</div>
              <h2 className={styles.uploadBoxTitle}>UPLOAD OR CAPTURE YOUR IMAGE</h2>
              <p className={styles.uploadBoxSubtitle}>
                Add your photo to preview and generate your collectible Goa Builder Identity
              </p>
            </div>

            <div className={styles.cardRow}>
              {/* Gallery button */}
              <button
                id="btn-gallery"
                className={`${styles.optionCard} ${styles.cardGallery}`}
                onClick={handleGalleryPick}
                aria-label="Pick a photo from your gallery"
              >
                <div className={styles.cardIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className={styles.cardLabel}>BROWSE FROM</span>
                <span className={styles.cardLabelBig}>GALLERY</span>
                <span className={styles.cardHint}>PNG, JPG, WEBP OR HEIC</span>
                <div className={styles.cardArrow}>→</div>
              </button>

              <div className={styles.orDivider} aria-hidden="true">
                <div className={styles.orLine} />
                <span className={styles.orText}>OR</span>
                <div className={styles.orLine} />
              </div>

              {/* Camera button */}
              <button
                id="btn-camera"
                className={`${styles.optionCard} ${styles.cardCamera}`}
                onClick={handleCapture}
                aria-label="Capture a photo with your camera"
              >
                <div className={styles.cardIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <span className={styles.cardLabel}>TAKE A SNAP</span>
                <span className={styles.cardLabelBig}>CAMERA</span>
                <span className={styles.cardHint}>CAPTURE LIVE PHOTO</span>
                <div className={styles.cardArrow}>→</div>
              </button>
            </div>

            <div className={styles.uploadBoxFooter}>
              <button
                id="btn-sample"
                type="button"
                onClick={handleUseSamplePhoto}
                className={styles.demoButton}
              >
                ⚡ Use Demo Hacker Photo (Instant Playground Test)
              </button>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className={styles.scrollIndicator}>
            <span>SCROLL TO DISCOVER TIMELINE</span>
            <div className={styles.chevronDown}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: 4 DAYS JOURNEY (Timeline & Wooden desk typing simulator) ── */}
      <section className={styles.journeySection} id="journey">
        <div className={styles.sectionContainer}>
          
          <div className={styles.journeyHeader}>
            <span className={styles.journeyBadge}>EVENT TIMELINE</span>
            <h2 className={styles.journeyTitle}>4 DAYS. ONE RHYTHM.</h2>
            <p className={styles.journeySubtitle}>EVERYTHING INTENTIONAL.</p>
          </div>

          {/* Bamboo Roof Hanging Day Cards */}
          <div className={styles.bambooStructure}>
            <div className={styles.bambooPole} />
            
            <div className={styles.hangingFramesGrid}>
              
              {/* Day 1 */}
              <div className={`${styles.hangingFrame} ${styles.frame1}`}>
                <div className={styles.hangingCord} />
                <div className={styles.frameContent} style={{ borderTop: '6px solid #f5c800' }}>
                  <span className={styles.dayLabel}>DAY 01</span>
                  <h3 className={styles.dayName}>GENESIS DAY</h3>
                  <div className={styles.dayDesc}>WHERE IT ALL BEGINS. CHECKS-INS, TEAM MATCHES & VIBES.</div>
                </div>
              </div>

              {/* Day 2 */}
              <div className={`${styles.hangingFrame} ${styles.frame2}`}>
                <div className={styles.hangingCord} />
                <div className={styles.frameContent} style={{ borderTop: '6px solid #ff2d78' }}>
                  <span className={styles.dayLabel}>DAY 02</span>
                  <h3 className={styles.dayName}>DAY OF TRIANGLE</h3>
                  <div className={styles.dayDesc}>PROBLEM. SOLUTION. MARKET. ALIGNING THE VISIONS.</div>
                </div>
              </div>

              {/* Day 3 */}
              <div className={`${styles.hangingFrame} ${styles.frame3}`}>
                <div className={styles.hangingCord} />
                <div className={styles.frameContent} style={{ borderTop: '6px solid #ff2d78' }}>
                  <span className={styles.dayLabel}>DAY 03</span>
                  <h3 className={styles.dayName}>BUILD DAY</h3>
                  <div className={styles.dayDesc}>HEADS DOWN. SHIP OR SHIP. CONTINUOUS CODING FLOW.</div>
                </div>
              </div>

              {/* Day 4 */}
              <div className={`${styles.hangingFrame} ${styles.frame4}`}>
                <div className={styles.hangingCord} />
                <div className={styles.frameContent} style={{ borderTop: '6px solid #f5c800' }}>
                  <span className={styles.dayLabel}>DAY 04</span>
                  <h3 className={styles.dayName}>LAUNCH DAY</h3>
                  <div className={styles.dayDesc}>THE WORLD WATCHES. DEMOS, BOUNTIES & CLOSING SUNSET PARTY.</div>
                </div>
              </div>

            </div>
          </div>

          {/* Wooden Studio Desk Scene */}
          <div className={styles.studioDeskScene}>
            
            {/* The Wooden Desk Surface */}
            <div className={styles.deskSurface}>
              <div className={styles.woodPlankLine} />
              
              {/* Steaming Coffee Mug */}
              <div className={styles.coffeeCupWrap}>
                <div className={styles.steamContainer}>
                  <span className={styles.steamLine} />
                  <span className={styles.steamLine} />
                  <span className={styles.steamLine} />
                </div>
                <div className={styles.coffeeMug}>
                  <div className={styles.mugHandle} />
                  <div className={styles.mugBadge}>🌴</div>
                </div>
              </div>

              {/* Laptop & Typing Hands */}
              <div className={styles.laptopContainer}>
                
                {/* Screen */}
                <div className={styles.laptopScreen}>
                  <div className={styles.terminalContainer}>
                    <div className={styles.terminalHeader}>
                      <span className={`${styles.dot} ${styles.dotRed}`} />
                      <span className={`${styles.dot} ${styles.dotYellow}`} />
                      <span className={`${styles.dot} ${styles.dotGreen}`} />
                      <span className={styles.terminalTitle}>hacker-house-terminal.sh</span>
                    </div>
                    <div className={styles.terminalBody}>
                      {terminalLines.map((line, idx) => (
                        <div key={idx} className={styles.terminalLine}>
                          {line}
                        </div>
                      ))}
                      <div className={styles.terminalCursorLine}>
                        <span>&gt; </span>
                        <span className={styles.blinkingCursor}>█</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base & Keyboard */}
                <div className={styles.laptopBase}>
                  <div className={styles.keyboard}>
                    <div className={styles.keyRow} />
                    <div className={styles.keyRow} />
                    <div className={styles.trackpad} />
                  </div>
                </div>

                {/* Typing Hands overlay */}
                <div className={styles.handsOverlay}>
                  <svg viewBox="0 0 200 100" className={styles.typingHandsSvg}>
                    {/* Left hand */}
                    <g className={styles.handLeft}>
                      <path d="M 30,95 C 40,80 50,65 52,50 C 53,42 45,35 48,25 C 50,20 56,22 55,28 C 54,34 56,40 59,45 M 59,45 C 62,38 58,25 61,16 C 63,12 68,14 67,20 C 66,28 66,35 69,45 M 69,45 C 72,36 71,24 74,15 C 76,11 81,13 80,20 C 79,28 78,35 79,45 M 79,45 C 83,38 85,28 89,20 C 91,16 96,18 94,25 C 92,32 89,40 88,50 M 88,50 C 92,52 95,45 100,42 C 103,40 107,46 103,50 C 95,60 85,75 75,95 Z" fill="#d89680" stroke="#0e3d1f" strokeWidth="2.5" strokeLinejoin="round" />
                    </g>
                    {/* Right hand */}
                    <g className={styles.handRight}>
                      <path d="M 170,95 C 160,80 150,65 148,50 C 147,42 155,35 152,25 C 150,20 144,22 145,28 C 146,34 144,40 141,45 M 141,45 C 138,38 142,25 139,16 C 137,12 132,14 133,20 C 134,28 134,35 131,45 M 131,45 C 128,36 129,24 126,15 C 124,11 119,13 120,20 C 121,28 122,35 121,45 M 121,45 C 117,38 115,28 111,20 C 109,16 104,18 106,25 C 108,32 111,40 112,50 M 112,50 C 108,52 105,45 100,42 C 97,40 93,46 97,50 C 105,60 115,75 125,95 Z" fill="#d89680" stroke="#0e3d1f" strokeWidth="2.5" strokeLinejoin="round" />
                    </g>
                  </svg>
                </div>

              </div>

              {/* Goa Beverage Bottle */}
              <div className={styles.beverageBottle}>
                <div className={styles.bottleNeck} />
                <div className={styles.bottleCap} />
                <div className={styles.bottleLabel}>
                  <span>GOA</span>
                  <span>BREW</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── RICH MULTI-COLUMN TROPICAL FOOTER ── */}
      <footer className={styles.footerSection}>
        <div className={styles.footerContainer}>
          {/* Column 1: Brand details & Socials */}
          <div className={styles.footerColBrand}>
            <div className={styles.footerLogoWrap}>
              <Image
                src="/Hacker_house_transparent.png"
                alt="Hacker House"
                width={150}
                height={30}
                className={styles.footerWordmarkImg}
              />
              <div className={styles.footerGoaCenter}>
                <Image
                  src="/logo.svg"
                  alt="गोवा"
                  width={28}
                  height={28}
                  className={styles.footerGoaImg}
                />
              </div>
            </div>
            <p className={styles.footerBrandDesc}>
              A high-octane tropical sandbox where top builders unite, collaborate, and push the boundaries of coding under the Goan sun.
            </p>
            <div className={styles.footerSocials}>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="X">𝕏</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="GitHub">🐙</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">in</a>
            </div>
          </div>

          {/* Column 2: Event Stats/Details */}
          <div className={styles.footerColLinks}>
            <h4 className={styles.footerColTitle}>HH GOA 2026</h4>
            <ul className={styles.footerLinksList}>
              <li>📍 Morjim Beach, Goa</li>
              <li>📅 28 – 31 October 2026</li>
              <li>⚡ 100+ Shipped Projects</li>
              <li>💰 $50K+ Bounty Pool</li>
            </ul>
          </div>

          {/* Column 3: Site Navigation */}
          <div className={styles.footerColLinks}>
            <h4 className={styles.footerColTitle}>NAVIGATION</h4>
            <ul className={styles.footerLinksList}>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Card Generator
                </a>
              </li>
              <li><a href="#hype-meter">The Hype Stats</a></li>
              <li><a href="#journey">4-Day Journey</a></li>
              <li><a href="/editor">Photo Cropper</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Rights Bar */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContainer}>
            <span>© 2026 HACKER HOUSE GOA. ALL RIGHTS RESERVED.</span>
            <span className={styles.footerBottomCredit}>
              CRAFTED WITH 🌴 IN GOA BY <a href="https://247pm.studio" target="_blank" rel="noopener noreferrer">2:47 PM STUDIO</a>
            </span>
          </div>
        </div>
      </footer>

    </main>
  );
}
