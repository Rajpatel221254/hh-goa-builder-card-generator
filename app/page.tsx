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

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: string; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  const target = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easeProgress * target);
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    const el = elementRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [target, hasAnimated]);

  return (
    <span ref={elementRef} className={hasAnimated ? styles.pulsingStat : ''}>
      {prefix}
      {hasAnimated ? count : '0'}
      {suffix}
    </span>
  );
}

async function autoCropToDataUrl(src: string, aspect = 3 / 4): Promise<string> {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(src);
        return;
      }
      const targetW = 600;
      const targetH = Math.round(targetW / aspect);
      canvas.width = targetW;
      canvas.height = targetH;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      let sx = 0, sy = 0, sw = imgW, sh = imgH;
      if (imgW / aspect > imgH) {
        sw = imgH * aspect;
        sx = (imgW - sw) / 2;
      } else {
        sh = imgW / aspect;
        sy = (imgH - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [showCelebration, setShowCelebration] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingStep, setBuildingStep] = useState('> INITIALIZING SECURE BUILDER ENVIRONMENT...');

  // Load photo & form data if already in session to make the center card live!
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'HACKER BUILDER',
    role: 'THE CODE ARCHITECT',
    builderTitle: 'THE CODE ARCHITECT',
    xHandle: '@hacker',
    stack: 'REACT, NEXT.JS, SOL',
    location: 'GOA, INDIA',
    website: 'builder.dev',
    linkedin: '',
    github: 'hacker',
    email: 'hacker@hhgoa.com',
    fuel: 'COFFEE & CODE',
    mode: 'SHIP • BUILD REPEAT',
    vibe: 'BUILDING IDEAS. BREAKING LIMITS.',
  });

  // Laptop terminal state with real character typewriter effect
  const [historyLines, setHistoryLines] = useState<string[]>([
    '> HH_GOA_2026: STARTING SPRINT...',
    '> HACKERS ACTIVE: 390+',
  ]);
  const [currentLine, setCurrentLine] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

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
      const savedData = sessionStorage.getItem('hh_builder_data');

      setTimeout(() => {
        if (cropped || raw) {
          setPhotoSrc(cropped || raw);
        }
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setFormData((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            // ignore
          }
        }
      }, 0);
    }
  }, []);

  // Character typing simulator for the laptop terminal
  useEffect(() => {
    const messages = [
      'BUILD. SHIP. DEPLOY. Repeat. 💻',
      'LOAD_FUEL: COFFEE & CHAI LOADED ☕',
      'CODE_BASE: COMPILING REPOS...',
      'SHIP_SPEED: 100+ SHIPPED!',
      'BOUNTY_POOL: $50K+ ACTIVE 💰',
      'MISSION: SOLVE PROB, CODE VIBES',
      'LOCATION: MORJIM BEACH, GOA 🏖️',
      'SYSTEM STATUS: SHIP OR SHIP! 🚀',
    ];

    let timer: NodeJS.Timeout;
    let charIndex = 0;
    const fullText = '> ' + messages[messageIndex];

    const typeChar = () => {
      if (charIndex < fullText.length) {
        setCurrentLine(fullText.substring(0, charIndex + 1));
        charIndex++;
        timer = setTimeout(typeChar, 50 + Math.random() * 30);
      } else {
        timer = setTimeout(() => {
          setHistoryLines((prev) => {
            const nextHistory = [...prev, fullText];
            if (nextHistory.length > 3) {
              return nextHistory.slice(1);
            }
            return nextHistory;
          });
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2500);
      }
    };

    // Defer state reset and typing execution to avoid synchronous setState inside render-loop
    timer = setTimeout(() => {
      setCurrentLine('');
      typeChar();
    }, 500);

    return () => clearTimeout(timer);
  }, [messageIndex]);

  // Handle building step cycling text
  useEffect(() => {
    if (!isBuilding) return;
    const steps = [
      '> INITIALIZING SECURE BUILDER ENVIRONMENT...',
      '> PARSING PHOTO & BIO METADATA...',
      '> COMPILING CURRICULUM & SKILLSTACK...',
      '> DEPLOYING COLLECTIBLE BADGE TO GOA VILLA...',
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setBuildingStep(steps[stepIdx]);
      }
    }, 450);
    return () => clearInterval(interval);
  }, [isBuilding]);

  // Scroll Reveal & Timeline Scroll Progress Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.scrollRevealActive);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const revealElements = document.querySelectorAll(`.${styles.scrollReveal}`);
    revealElements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      const journey = document.getElementById('journey');
      if (!journey) return;
      const rect = journey.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalHeight = rect.height + windowHeight;
      const scrolled = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(100, (scrolled / totalHeight) * 100));
      journey.style.setProperty('--timeline-progress', `${progress}%`);

      const frames = journey.querySelectorAll(`.${styles.hangingFrame}`);
      let closestIndex = -1;
      let minDistance = Infinity;
      frames.forEach((frame, idx) => {
        const frameRect = frame.getBoundingClientRect();
        const frameCenter = frameRect.top + frameRect.height / 2;
        const screenCenter = windowHeight / 2;
        const distance = Math.abs(frameCenter - screenCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      frames.forEach((frame, idx) => {
        if (idx === closestIndex && minDistance < 200) {
          frame.classList.add(styles.activeDay);
        } else {
          frame.classList.remove(styles.activeDay);
        }
      });
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse positions from -1 to 1 relative to center
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      const mainEl = document.getElementById('main-content');
      if (mainEl) {
        mainEl.style.setProperty('--parallax-x', `${x}`);
        mainEl.style.setProperty('--parallax-y', `${y}`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });
    handleScroll();

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, []);

  // Card 3D tilt handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 8;
    const rotateX = -((y - yc) / yc) * 8;
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.style.setProperty('--glow-x', '50%');
    card.style.setProperty('--glow-y', '50%');
  };

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

          // Instantly auto-crop the image to 3:4 portrait
          const croppedUrl = await autoCropToDataUrl(compressedDataUrl);
          safeSetSessionItem('hh_cropped_photo', croppedUrl);

          setIsBuilding(true);
          setBuildingStep('> PARSING PHOTO & BIO METADATA...');
          setTimeout(() => {
            router.push('/builder');
          }, 600);
        }
      } catch (err) {
        console.error('File compression error:', err);
      }
    },
    [router]
  );

  const handleUseSamplePhoto = useCallback(async () => {
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
      safeSetSessionItem('hh_cropped_photo', sampleUrl); // Already 3:4

      setIsBuilding(true);
      setBuildingStep('> PARSING PHOTO & BIO METADATA...');
      setTimeout(() => {
        router.push('/builder');
      }, 600);
    }
  }, [router]);

  const handleCapture = useCallback(() => {
    setIsBuilding(true);
    setBuildingStep('> OPENING CAMERA INTERFACE...');
    setTimeout(() => {
      router.push('/camera');
    }, 600);
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
          <div className={styles.headerStudioWrap}>
            <Image
              src="/2-47.svg"
              alt="2:47 PM Studio"
              width={16}
              height={10}
              className={styles.headerStudioImg}
            />
            <span className={styles.headerSubBadge}>STUDIO</span>
          </div>
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
      <div className={`${styles.floatingDecor} ${styles.decorLeft} ${styles.parallaxWrapper}`} style={{ '--depth': -12 } as React.CSSProperties} aria-hidden="true">
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
      </div>
      <div className={`${styles.decorLeftStamp} ${styles.parallaxWrapper}`} style={{ '--depth': -22 } as React.CSSProperties} aria-hidden="true">
        <div className={styles.stampCircle}>
          <div className={styles.stampCircleInner}>
            <span>BUILT</span><span>IN</span><span>GOA</span><span>★</span>
          </div>
        </div>
      </div>

      <div className={`${styles.floatingDecor} ${styles.decorRight} ${styles.parallaxWrapper}`} style={{ '--depth': -12 } as React.CSSProperties} aria-hidden="true">
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
      </div>
      <div className={`${styles.decorRightBadge} ${styles.parallaxWrapper}`} style={{ '--depth': -22 } as React.CSSProperties} aria-hidden="true">
        <div className={styles.decorBadge}>
          <span>BUILDER ID</span>
        </div>
      </div>

      {/* ── SECTION 1: HERO ID GENERATOR ── */}
      <section className={styles.heroSection} aria-label="Identity Generator">
        
        {/* Top Hero Side Decorations */}
        <div className={`${styles.sideDecorZone} ${styles.sideLeft} ${styles.heroTopSide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -5 } as React.CSSProperties}>
            <div className={styles.signalText}>
              <span className={styles.accentPink}>&gt;_</span> BUILDING...
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -15 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerPink} ${styles.floatSlow}`}>
              <span>BUILD</span>
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -10 } as React.CSSProperties}>
            <div className={styles.signalText}>
              ★ GOA 2026
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -25 } as React.CSSProperties}>
            <div className={styles.dottedGrid} />
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -8 } as React.CSSProperties}>
            <div className={styles.signalText}>
              01
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -18 } as React.CSSProperties}>
            <div className={styles.techLineWrapper}>
              <span className={styles.pulsingDot}>★</span>
              <span className={styles.techLine} />
              <span className={styles.pulsingDot}>&gt;_</span>
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -12 } as React.CSSProperties}>
            <div className={styles.signalText}>
              ↗ SHIP IT
            </div>
          </div>
        </div>

        <div className={`${styles.sideDecorZone} ${styles.sideRight} ${styles.heroTopSide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -6 } as React.CSSProperties}>
            <div className={styles.signalText}>
              <span className={styles.accentYellow}>&gt;_</span> SYSTEM READY
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -16 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerYellow} ${styles.floatMed}`}>
              <span>HACK</span>
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -10 } as React.CSSProperties}>
            <div className={styles.signalText}>
              ⚡ BUILD
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -20 } as React.CSSProperties}>
            <div className={styles.dottedGrid} />
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -8 } as React.CSSProperties}>
            <div className={styles.signalText}>
              04
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -14 } as React.CSSProperties}>
            <div className={styles.signalText}>
              GOA // INDIA
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -12 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerCream} ${styles.floatSlow}`}>
              <span>24/7</span>
            </div>
          </div>
        </div>

        {/* Upload Section Side Decorations */}
        <div className={`${styles.sideDecorZone} ${styles.sideLeft} ${styles.heroBottomSide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -8 } as React.CSSProperties}>
            <div className={styles.signalText}>
              [📷] CAPTURE
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -18 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerPink} ${styles.floatMed}`}>
              <span>NO SLEEP</span>
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -12 } as React.CSSProperties}>
            <div className={styles.signalText}>
              01
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -22 } as React.CSSProperties}>
            <div className={styles.dottedGrid} />
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -6 } as React.CSSProperties}>
            <div className={styles.signalText}>
              📷 FRAME
            </div>
          </div>
        </div>

        <div className={`${styles.sideDecorZone} ${styles.sideRight} ${styles.heroBottomSide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -10 } as React.CSSProperties}>
            <div className={styles.signalText}>
              [🖼️] UPLOAD
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -20 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerYellow} ${styles.floatSlow}`}>
              <span>SHIP IT</span>
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -6 } as React.CSSProperties}>
            <div className={styles.signalText}>
              IDEATE
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -15 } as React.CSSProperties}>
            <div className={styles.dottedGrid} />
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -12 } as React.CSSProperties}>
            <div className={styles.signalText}>
              DEPLOY
            </div>
          </div>
        </div>

        <div className={styles.centerCol}>
          
          {/* Logo Section */}
          <div className={styles.topSection}>
            <div className={styles.eventStrip}>
              <span>GOA, INDIA</span>
              <span className={styles.stripDot}>·</span>
              <span>28–31 OCT 2026</span>
              <span className={styles.stripDot}>·</span>
              <a 
                href="https://247pm.studio" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.studioPartnerBadge}
              >
                <Image
                  src="/2-47.svg"
                  alt="2:47 PM Studio"
                  width={16}
                  height={10}
                  className={styles.eventStripStudioImg}
                />
                <span>2:47 PM STUDIO</span>
              </a>
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
                  <div className={styles.heroStatNum} style={{ color: 'var(--pink-light)' }}>
                    <AnimatedNumber value="6800" suffix="+" />
                  </div>
                  <div className={styles.heroStatLabel}>REGISTRATIONS</div>
                </div>
              </div>

              <div className={`${styles.heroStatCard} ${styles.statLeft2}`}>
                <div className={styles.heroStatIcon} style={{ backgroundColor: 'rgba(253, 245, 224, 0.1)', color: 'var(--cream)' }}>🚀</div>
                <div className={styles.heroStatInfo}>
                  <div className={styles.heroStatNum} style={{ color: 'var(--cream)' }}>
                    <AnimatedNumber value="100" suffix="+" />
                  </div>
                  <div className={styles.heroStatLabel}>SHIPPED PROJECTS</div>
                </div>
              </div>
            </div>

            {/* Central Card Preview - Exact Final Format B Badge */}
            <div className={styles.cardPreviewContainer}>
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
              <div 
                ref={cardRef} 
                className={styles.cardFrame}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
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
                      <div className={styles.logoStudio}>
                        <Image
                          src="/2-47.svg"
                          alt="2:47 PM Studio"
                          width={14}
                          height={9}
                          className={styles.logoStudioImg}
                        />
                        <span>2:47 PM STUDIO</span>
                      </div>
                    </div>

                    {/* Right: Postmark Stamp + Beach Sunset Scene */}
                    <div className={styles.artworkBlock}>
                      {/* Circular Gold Postmark Stamp */}
                      <div className={styles.postmarkStamp}>
                        <svg viewBox="0 0 100 100" className={styles.stampSvg}>
                          <circle cx="50" cy="50" r="46" fill="none" stroke="#f5c800" strokeWidth="2.5" strokeDasharray="3.5 2.5" />
                          <circle cx="50" cy="50" r="38" fill="none" stroke="#f5c800" strokeWidth="1.5" />
                          <path id="heroStampArcTop" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
                          <text className={styles.stampSvgText}>
                            <textPath href="#heroStampArcTop" startOffset="50%" textAnchor="middle" fill="#f5c800">
                              BUILT IN GOA ★
                            </textPath>
                          </text>
                          <path id="heroStampArcBottom" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
                          <text className={styles.stampSvgTextSmall}>
                            <textPath href="#heroStampArcBottom" startOffset="50%" textAnchor="middle" fill="#f5c800">
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
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>𝕏</div>
                          <span className={styles.detailKey}>X HANDLE</span>
                          <span className={styles.detailVal}>{formData.xHandle || '@builder'}</span>
                        </div>

                        {/* Stack / Role */}
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>&lt;/&gt;</div>
                          <span className={styles.detailKey}>STACK / ROLE</span>
                          <span className={styles.detailVal}>{formData.stack || 'FULLSTACK'}</span>
                        </div>

                        {/* Location */}
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>📍</div>
                          <span className={styles.detailKey}>LOCATION</span>
                          <span className={styles.detailVal}>{formData.location || 'GOA, INDIA'}</span>
                        </div>

                        {/* Website */}
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>🌐</div>
                          <span className={styles.detailKey}>WEBSITE</span>
                          <span className={styles.detailVal}>{formData.website || 'builder.dev'}</span>
                        </div>

                        {/* GitHub / Social */}
                        <div className={styles.detailItem}>
                          <div className={styles.detailIcon}>🐙</div>
                          <span className={styles.detailKey}>GITHUB</span>
                          <span className={styles.detailVal}>{formData.github ? (formData.github.startsWith('github.com') ? formData.github : `github.com/${formData.github.replace(/^@/, '')}`) : 'github.com/builder'}</span>
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
                        <span className={styles.statVal}>{formData.fuel || 'COFFEE & CODE'}</span>
                      </div>
                    </div>

                    <div className={styles.statSeparator} />

                    <div className={styles.statBox}>
                      <div className={styles.statIcon}>💻</div>
                      <div className={styles.statMeta}>
                        <span className={styles.statKey}>MODE</span>
                        <span className={styles.statVal}>{formData.mode || 'SHIP • BUILD REPEAT'}</span>
                      </div>
                    </div>

                    <div className={styles.statSeparator} />

                    <div className={styles.statBox}>
                      <div className={styles.statIcon}>🚀</div>
                      <div className={styles.statMeta}>
                        <span className={styles.statKey}>VIBE</span>
                        <span className={styles.statVal}>{formData.vibe || 'BUILDING IDEAS. BREAKING LIMITS.'}</span>
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

            {/* Right Stats Column on Desktop */}
            <div className={styles.heroStatsColRight}>
              <div className={`${styles.heroStatCard} ${styles.statRight1}`}>
                <div className={styles.heroStatIcon} style={{ backgroundColor: 'rgba(245, 200, 0, 0.1)', color: 'var(--yellow)' }}>🔥</div>
                <div className={styles.heroStatInfo}>
                  <div className={styles.heroStatNum} style={{ color: 'var(--yellow)' }}>
                    <AnimatedNumber value="390" suffix="+" />
                  </div>
                  <div className={styles.heroStatLabel}>SELECTED HACKERS</div>
                </div>
              </div>

              <div className={`${styles.heroStatCard} ${styles.statRight2}`}>
                <div className={styles.heroStatIcon} style={{ backgroundColor: 'rgba(29, 107, 53, 0.2)', color: '#2a8a46' }}>💰</div>
                <div className={styles.heroStatInfo}>
                  <div className={styles.heroStatNum} style={{ color: '#2a8a46' }}>
                    <AnimatedNumber value="50" prefix="$" suffix="K+" />
                  </div>
                  <div className={styles.heroStatLabel}>BOUNTY POOL</div>
                </div>
              </div>
            </div>

          </div>

          {/* UPLOAD ACTION SECTION (Enlarged, Highlighted Dashboard Card) */}
          <div className={`${styles.uploadContainerBox} ${styles.scrollReveal}`}>
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
        
        {/* Timeline Side Decorations */}
        <div className={`${styles.sideDecorZone} ${styles.sideLeft} ${styles.journeySide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -6 } as React.CSSProperties}>
            <div className={styles.signalText}>
              🚀 DAY 01
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -16 } as React.CSSProperties}>
            <div className={styles.signalText}>
              🔥 DAY 02
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -22 } as React.CSSProperties}>
            <div className={styles.techLineWrapper}>
              <span className={styles.pulsingDot}>★</span>
              <span className={styles.techLine} />
              <span className={styles.pulsingDot}>⚡</span>
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -10 } as React.CSSProperties}>
            <div className={styles.signalText}>
              → GOA 2026
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -12 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerPink} ${styles.floatSlow}`}>
              <span>NO SLEEP</span>
            </div>
          </div>
        </div>

        <div className={`${styles.sideDecorZone} ${styles.sideRight} ${styles.journeySide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -8 } as React.CSSProperties}>
            <div className={styles.signalText}>
              💻 DAY 03
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -14 } as React.CSSProperties}>
            <div className={styles.signalText}>
              🏆 DAY 04
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -20 } as React.CSSProperties}>
            <div className={styles.dottedGrid} />
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -10 } as React.CSSProperties}>
            <div className={styles.signalText}>
              ★ BEACH VIBES
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -12 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerYellow} ${styles.floatMed}`}>
              <span>SHIP IT</span>
            </div>
          </div>
        </div>

        <div className={styles.sectionContainer}>
          
          <div className={styles.journeyHeader}>
            <span className={styles.journeyBadge}>EVENT TIMELINE</span>
            <h2 className={styles.journeyTitle}>4 DAYS. ONE RHYTHM.</h2>
            <p className={styles.journeySubtitle}>EVERYTHING INTENTIONAL.</p>
          </div>

          {/* Bamboo Roof Hanging Day Cards */}
          <div className={`${styles.bambooStructure} ${styles.scrollReveal}`}>
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
          <div className={`${styles.studioDeskScene} ${styles.scrollReveal}`}>
            
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
                      {historyLines.map((line, idx) => (
                        <div key={idx} className={styles.terminalLine}>
                          {line}
                        </div>
                      ))}
                      <div className={styles.terminalCursorLine}>
                        <span>{currentLine}</span>
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

                  {/* Typing Hands overlay nested inside laptop base */}
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
      <footer className={`${styles.footerSection} ${styles.scrollReveal}`}>
        
        {/* Footer Side Decorations */}
        <div className={`${styles.sideDecorZone} ${styles.sideLeft} ${styles.footerSide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -5 } as React.CSSProperties}>
            <div className={styles.signalText}>
              📍 Morjim Beach
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -12 } as React.CSSProperties}>
            <div className={styles.signalText}>
              15.6062° N, 73.7364° E
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -20 } as React.CSSProperties}>
            <div className={styles.dottedGrid} />
          </div>
        </div>

        <div className={`${styles.sideDecorZone} ${styles.sideRight} ${styles.footerSide}`} aria-hidden="true">
          <div className={styles.parallaxWrapper} style={{ '--depth': -6 } as React.CSSProperties}>
            <div className={styles.signalText}>
              🌴 GOA 2026
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -15 } as React.CSSProperties}>
            <div className={styles.signalText}>
              ★ 24/7 BUILD
            </div>
          </div>
          <div className={styles.parallaxWrapper} style={{ '--depth': -10 } as React.CSSProperties}>
            <div className={`${styles.sticker} ${styles.stickerYellow} ${styles.floatSlow}`}>
              <span>GOA</span>
            </div>
          </div>
        </div>

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

            {/* 2:47 PM Studio Badge Block */}
            <a href="https://247pm.studio" target="_blank" rel="noopener noreferrer" className={styles.footerStudioBadge}>
              <span className={styles.footerStudioLabel}>POWERED & CRAFTED BY</span>
              <div className={styles.footerStudioBrand}>
                <Image
                  src="/2-47.svg"
                  alt="2:47 PM Studio Logo"
                  width={28}
                  height={18}
                  className={styles.footerStudioImg}
                />
                <span className={styles.footerStudioName}>2:47 PM STUDIO</span>
              </div>
            </a>

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
              CRAFTED WITH 🌴 IN GOA BY{' '}
              <a href="https://247pm.studio" target="_blank" rel="noopener noreferrer" className={styles.footerBottomStudioLink}>
                <Image
                  src="/2-47.svg"
                  alt="2:47 PM Studio"
                  width={18}
                  height={11}
                  className={styles.footerCreditStudioImg}
                />
                <span>2:47 PM STUDIO</span>
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* Building transition overlay */}
      {isBuilding && (
        <div className={styles.buildingOverlay}>
          {/* Floating themed particles */}
          {['🌴', '🌺', '⚡', '💻', '🍍', '🔥', '🌴', '🌺', '⚡', '💻'].map((emoji, idx) => (
            <div
              key={idx}
              className={styles.buildingParticle}
              style={{
                left: `${(idx * 11) % 90 + 5}%`,
                animationDelay: `${idx * 0.15}s`,
                animationDuration: `${2.5 + (idx % 2)}s`,
              }}
            >
              {emoji}
            </div>
          ))}

          <div className={styles.buildingTitle}>BUILDING YOUR IDENTITY</div>
          <div className={styles.buildingScanner}>
            <div className={styles.buildingScannerBar} />
          </div>
          <div className={styles.buildingStatus}>
            {buildingStep}
          </div>
        </div>
      )}

    </main>
  );
}
