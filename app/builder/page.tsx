'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

export default function BuilderPage() {
  const router = useRouter();

  // Photo state
  const [photoSrc, setPhotoSrc] = useState<string>('');

  // Pass Type & Team Members
  const [passType, setPassType] = useState<'solo' | 'team'>('solo');
  const [teamMemberCount, setTeamMemberCount] = useState<number>(2);
  const [teamMembers, setTeamMembers] = useState([
    { name: '', photo: '' },
    { name: '', photo: '' },
    { name: '', photo: '' },
  ]);
  const [activeCameraMember, setActiveCameraMember] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step state (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Format & Theme states
  const [activeFormat, setActiveFormat] = useState<'card' | 'pfp'>('card');
  const [pfpStyle, setPfpStyle] = useState<'badge' | 'polaroid' | 'cyber'>('badge');
  const [cardTheme, setCardTheme] = useState<'emerald' | 'sunset' | 'ocean' | 'obsidian'>('emerald');

  const renderPhotoOrCollage = (isPfp = false) => {
    if (passType === 'solo') {
      return photoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoSrc} alt={formData.name || 'Builder Photo'} className={isPfp ? styles.pfpUserPhoto : styles.userPhoto} />
      ) : (
        <div className={styles.photoPlaceholder}>
          <span className={styles.placeholderIcon}>👤</span>
          <span className={styles.placeholderText}>NO PHOTO</span>
        </div>
      );
    } else {
      if (isPfp) {
        if (teamMemberCount === 2) {
          return (
            <div className={styles.pfpTeamAvatars2}>
              {teamMembers.slice(0, 2).map((member, idx) => (
                <div key={idx} className={styles.pfpTeamAvatarBox2}>
                  <div className={styles.pfpTeamAvatarCircle}>
                    {member.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photo} alt={member.name || `Member ${idx + 1}`} className={styles.pfpTeamAvatarImg} />
                    ) : (
                      <span className={styles.pfpAvatarPlaceholderIcon}>👤</span>
                    )}
                  </div>
                  <span className={styles.pfpTeamAvatarName}>
                    {member.name ? member.name.toUpperCase() : `MEMBER ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          );
        } else {
          return (
            <div className={styles.pfpTeamAvatars3}>
              {teamMembers.slice(0, 3).map((member, idx) => (
                <div key={idx} className={`${styles.pfpTeamAvatarBox3} ${styles[`pfpTeamAvatarPos${idx}`]}`}>
                  <div className={styles.pfpTeamAvatarCircle}>
                    {member.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photo} alt={member.name || `Member ${idx + 1}`} className={styles.pfpTeamAvatarImg} />
                    ) : (
                      <span className={styles.pfpAvatarPlaceholderIcon}>👤</span>
                    )}
                  </div>
                  <span className={styles.pfpTeamAvatarName}>
                    {member.name ? member.name.toUpperCase() : `MEMBER ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          );
        }
      } else {
        if (teamMemberCount === 2) {
          return (
            <div className={styles.pfpTeamCollage2}>
              <div className={styles.pfpTeamSlice}>
                {teamMembers[0]?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamMembers[0].photo} alt={teamMembers[0].name || 'Member 1'} className={styles.userPhoto} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <span className={styles.placeholderIcon}>👤</span>
                    <span className={styles.placeholderText}>MEMBER 1</span>
                  </div>
                )}
              </div>
              <div className={styles.pfpTeamSlice}>
                {teamMembers[1]?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamMembers[1].photo} alt={teamMembers[1].name || 'Member 2'} className={styles.userPhoto} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <span className={styles.placeholderIcon}>👤</span>
                    <span className={styles.placeholderText}>MEMBER 2</span>
                  </div>
                )}
              </div>
            </div>
          );
        } else {
          return (
            <div className={styles.pfpTeamCollage3}>
              <div className={styles.pfpTeamSliceMain}>
                {teamMembers[0]?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamMembers[0].photo} alt={teamMembers[0].name || 'Member 1'} className={styles.userPhoto} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <span className={styles.placeholderIcon}>👤</span>
                    <span className={styles.placeholderText}>M1</span>
                  </div>
                )}
              </div>
              <div className={styles.pfpTeamSliceSub}>
                {teamMembers[1]?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamMembers[1].photo} alt={teamMembers[1].name || 'Member 2'} className={styles.userPhoto} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <span className={styles.placeholderIcon}>👤</span>
                    <span className={styles.placeholderText}>M2</span>
                  </div>
                )}
              </div>
              <div className={styles.pfpTeamSliceSub}>
                {teamMembers[2]?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamMembers[2].photo} alt={teamMembers[2].name || 'Member 3'} className={styles.userPhoto} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <span className={styles.placeholderIcon}>👤</span>
                    <span className={styles.placeholderText}>M3</span>
                  </div>
                )}
              </div>
            </div>
          );
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Failed to start webcam:', err);
      alert('Could not access camera. Please upload an image instead.');
      setActiveCameraMember(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (activeCameraMember !== null) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeCameraMember]);

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const croppedUrl = await autoCropToDataUrl(dataUrl);

    if (activeCameraMember === -1) {
      setPhotoSrc(croppedUrl);
      sessionStorage.setItem('hh_cropped_photo', croppedUrl);
    } else if (activeCameraMember !== null) {
      setTeamMembers((prev) => {
        const next = [...prev];
        next[activeCameraMember] = { ...next[activeCameraMember], photo: croppedUrl };
        return next;
      });
    }
    setActiveCameraMember(null);
  };

  const handleFileChangeForMember = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let processFile = file;

    if (
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif') ||
      file.type === 'image/heic' ||
      file.type === 'image/heif'
    ) {
      try {
        const heic2any = (await import('heic2any')).default;
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
        const blobToUse = Array.isArray(converted) ? converted[0] : converted;
        processFile = new File([blobToUse], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (err) {
        console.error('HEIC conversion failed:', err);
      }
    }

    try {
      const dataUrl = await compressFileToDataUrl(processFile);
      const croppedUrl = await autoCropToDataUrl(dataUrl);

      if (idx === -1) {
        setPhotoSrc(croppedUrl);
        sessionStorage.setItem('hh_cropped_photo', croppedUrl);
      } else {
        setTeamMembers((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], photo: croppedUrl };
          return next;
        });
      }
    } catch (err) {
      console.error('File processing failed:', err);
    }
  };

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
    const savedFormat = sessionStorage.getItem('hh_active_format') as 'card' | 'pfp' | null;
    const savedPfpStyle = sessionStorage.getItem('hh_pfp_style') as 'badge' | 'polaroid' | 'cyber' | null;
    const savedTheme = sessionStorage.getItem('hh_card_theme') as 'emerald' | 'sunset' | 'ocean' | 'obsidian' | null;
    const savedData = sessionStorage.getItem('hh_builder_data');
    const savedPassType = sessionStorage.getItem('hh_pass_type') as 'solo' | 'team' | null;
    const savedMemberCount = sessionStorage.getItem('hh_team_member_count');
    const savedTeamMembers = sessionStorage.getItem('hh_team_members');

    setTimeout(() => {
      if (cropped) {
        setPhotoSrc(cropped);
      } else if (raw) {
        setPhotoSrc(raw);
      }
      if (savedFormat) {
        setActiveFormat(savedFormat);
      }
      if (savedPfpStyle) {
        setPfpStyle(savedPfpStyle);
      }
      if (savedTheme) {
        setCardTheme(savedTheme);
      }
      if (savedPassType) {
        setPassType(savedPassType);
      }
      if (savedMemberCount) {
        setTeamMemberCount(parseInt(savedMemberCount, 10));
      }
      if (savedTeamMembers) {
        try {
          setTeamMembers(JSON.parse(savedTeamMembers));
        } catch {
          // ignore
        }
      }
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
    }, 0);
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
    sessionStorage.setItem('hh_active_format', activeFormat);
    sessionStorage.setItem('hh_pfp_style', pfpStyle);
    sessionStorage.setItem('hh_card_theme', cardTheme);
    sessionStorage.setItem('hh_pass_type', passType);
    sessionStorage.setItem('hh_team_member_count', teamMemberCount.toString());
    sessionStorage.setItem('hh_team_members', JSON.stringify(teamMembers));
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

          {/* ── Pass Type Selector Toggle Bar ── */}
          <div className={styles.passTypeToggleBar}>
            <button
              type="button"
              className={`${styles.passTypeToggleBtn} ${passType === 'solo' ? styles.passTypeActive : ''}`}
              onClick={() => {
                setPassType('solo');
                sessionStorage.setItem('hh_pass_type', 'solo');
              }}
            >
              👤 Solo Pass
            </button>
            <button
              type="button"
              className={`${styles.passTypeToggleBtn} ${passType === 'team' ? styles.passTypeActive : ''}`}
              onClick={() => {
                setPassType('team');
                sessionStorage.setItem('hh_pass_type', 'team');
              }}
            >
              👥 Team Pass
            </button>
          </div>

          {/* ── Format Selector Toggle Bar ── */}
          <div className={styles.formatToggleBar}>
            <button
              type="button"
              className={`${styles.formatToggleBtn} ${activeFormat === 'pfp' ? styles.formatToggleActive : ''}`}
              onClick={() => {
                setActiveFormat('pfp');
                sessionStorage.setItem('hh_active_format', 'pfp');
              }}
            >
              🖼️ Format A: PFP Frame
            </button>
            <button
              type="button"
              className={`${styles.formatToggleBtn} ${activeFormat === 'card' ? styles.formatToggleActive : ''}`}
              onClick={() => {
                setActiveFormat('card');
                sessionStorage.setItem('hh_active_format', 'card');
              }}
            >
              💳 Format B: Builder Card (Main)
            </button>
          </div>

          {/* ── PFP Frame Style Sub-selector (Visible when Format A is active) ── */}
          {activeFormat === 'pfp' && (
            <div className={styles.themeSelectorBar} style={{ marginBottom: '0.65rem' }}>
              <span className={styles.themeSelectorLabel}>🖼️ SELECT PFP FRAME VARIANT:</span>
              <div className={styles.variantPillsRow}>
                <button
                  type="button"
                  className={`${styles.themePill} ${pfpStyle === 'badge' ? styles.themePillActive : ''}`}
                  onClick={() => { setPfpStyle('badge'); sessionStorage.setItem('hh_pfp_style', 'badge'); }}
                >
                  <span>✨ Circular Seal</span>
                </button>
                <button
                  type="button"
                  className={`${styles.themePill} ${pfpStyle === 'polaroid' ? styles.themePillActive : ''}`}
                  onClick={() => { setPfpStyle('polaroid'); sessionStorage.setItem('hh_pfp_style', 'polaroid'); }}
                >
                  <span>📸 Polaroid Frame</span>
                </button>
                <button
                  type="button"
                  className={`${styles.themePill} ${pfpStyle === 'cyber' ? styles.themePillActive : ''}`}
                  onClick={() => { setPfpStyle('cyber'); sessionStorage.setItem('hh_pfp_style', 'cyber'); }}
                >
                  <span>⚡ Cyber Shield</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Interactive Frame Theme Selector ── */}
          <div className={styles.themeSelectorBar}>
            <span className={styles.themeSelectorLabel}>🎨 SELECT COLOR THEME:</span>
            <div className={styles.themePillsRow}>
              <button
                type="button"
                className={`${styles.themePill} ${cardTheme === 'emerald' ? styles.themePillActive : ''}`}
                onClick={() => { setCardTheme('emerald'); sessionStorage.setItem('hh_card_theme', 'emerald'); }}
              >
                <span className={styles.themeDot} style={{ background: '#2a8a46' }} />
                <span>Goan Emerald</span>
              </button>
              <button
                type="button"
                className={`${styles.themePill} ${cardTheme === 'sunset' ? styles.themePillActive : ''}`}
                onClick={() => { setCardTheme('sunset'); sessionStorage.setItem('hh_card_theme', 'sunset'); }}
              >
                <span className={styles.themeDot} style={{ background: 'linear-gradient(135deg, #ff2d78, #ff7b00)' }} />
                <span>Cyber Sunset</span>
              </button>
              <button
                type="button"
                className={`${styles.themePill} ${cardTheme === 'ocean' ? styles.themePillActive : ''}`}
                onClick={() => { setCardTheme('ocean'); sessionStorage.setItem('hh_card_theme', 'ocean'); }}
              >
                <span className={styles.themeDot} style={{ background: 'linear-gradient(135deg, #00f0ff, #0077b6)' }} />
                <span>Arabian Wave</span>
              </button>
              <button
                type="button"
                className={`${styles.themePill} ${cardTheme === 'obsidian' ? styles.themePillActive : ''}`}
                onClick={() => { setCardTheme('obsidian'); sessionStorage.setItem('hh_card_theme', 'obsidian'); }}
              >
                <span className={styles.themeDot} style={{ background: 'linear-gradient(135deg, #ffd700, #333333)' }} />
                <span>Obsidian Gold</span>
              </button>
            </div>
          </div>

          <div className={styles.cardScaler}>
            {activeFormat === 'pfp' ? (
              /* ── FORMAT A: 3 RICH PFP FRAME VARIANTS ── */
              pfpStyle === 'polaroid' ? (
                /* Variant 2: Tropical Polaroid Frame */
                <div className={`${styles.pfpPolaroidOuter} ${cardTheme === 'sunset' ? styles.themeCyberSunset : cardTheme === 'ocean' ? styles.themeArabianWave : cardTheme === 'obsidian' ? styles.themeObsidianGold : styles.themeEmerald}`}>
                  <div className={styles.pfpPolaroidTape}>
                    <span>★ HACKER 🌴 BUILDER ★</span>
                  </div>
                  <div className={styles.pfpPolaroidInner}>
                    {renderPhotoOrCollage(true)}
                  </div>
                  <div className={styles.pfpPolaroidFooter}>
                    <div className={styles.pfpPolaroidInfo}>
                      <div className={styles.pfpPolaroidName}>
                        {formData.name ? formData.name.toUpperCase() : 'HACKER BUILDER'}
                      </div>
                      <div className={styles.pfpPolaroidRole}>
                        {formData.builderTitle || formData.role || 'BUILDER @ GOA'}
                      </div>
                    </div>
                    <div className={styles.pfpPolaroidStamp}>#FRAMEINGOA</div>
                  </div>
                </div>
              ) : pfpStyle === 'cyber' ? (
                /* Variant 3: Cyber Shield Frame */
                <div className={`${styles.pfpCyberOuter} ${cardTheme === 'sunset' ? styles.themeCyberSunset : cardTheme === 'ocean' ? styles.themeArabianWave : cardTheme === 'obsidian' ? styles.themeObsidianGold : styles.themeEmerald}`}>
                  <div className={styles.pfpCyberCornerTL} />
                  <div className={styles.pfpCyberCornerTR} />
                  <div className={styles.pfpCyberCornerBL} />
                  <div className={styles.pfpCyberCornerBR} />
                  <div className={styles.pfpCyberHeader}>
                    HH_GOA_2026 // MORJIM
                  </div>
                  <div className={styles.pfpCyberInner}>
                    {renderPhotoOrCollage(true)}
                  </div>
                  <div className={styles.pfpCyberFooter}>
                    <span className={styles.pfpCyberDot} />
                    <span>{formData.name ? formData.name.toUpperCase() : 'ACTIVE BUILDER'}{" // "}{formData.builderTitle || 'SHIPPING'}</span>
                  </div>
                </div>
              ) : (
                /* Variant 1: Circular Avatar Seal */
                <div className={`${styles.pfpFrameOuter} ${cardTheme === 'sunset' ? styles.themeCyberSunset : cardTheme === 'ocean' ? styles.themeArabianWave : cardTheme === 'obsidian' ? styles.themeObsidianGold : styles.themeEmerald}`}>
                  <div className={styles.pfpFrameInner}>
                    {renderPhotoOrCollage(true)}
                    
                    {/* Tropical Border Graphic Overlay */}
                    <div className={styles.pfpOverlayGraphic}>
                      <div className={styles.pfpTopBadge}>
                        ★ HH GOA 2026 ★
                      </div>
                      <div className={styles.pfpBottomBadgeWrap}>
                        <div className={styles.pfpBottomBadge}>
                          <span>#FRAMEINGOA</span>
                          <span>🌴</span>
                        </div>
                        {formData.name && (
                           <span className={styles.pfpNameTag}>{formData.name.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* ── FORMAT B: BUILDER BADGE CARD (MAIN) ── */
              <>
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
                <div className={`${styles.cardFrame} ${cardTheme === 'sunset' ? styles.themeCyberSunset : cardTheme === 'ocean' ? styles.themeArabianWave : cardTheme === 'obsidian' ? styles.themeObsidianGold : styles.themeEmerald}`}>
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
                <div className={passType === 'team' ? `${styles.cardMainGrid} ${styles.teamMainGrid}` : styles.cardMainGrid}>
                  {/* Left Column: Photo(s) & Builder Title */}
                  {passType === 'solo' ? (
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
                  ) : (
                    <div className={styles.photoCol}>
                      <div className={styles.teamMembersRow}>
                        {teamMembers.slice(0, teamMemberCount).map((member, idx) => (
                          <div key={idx} className={styles.teamMemberBox}>
                            <div className={styles.teamPhotoFrameOuter}>
                              <div className={styles.teamPhotoFrameInner}>
                                {member.photo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={member.photo} alt={member.name || `Member ${idx + 1}`} className={styles.userPhoto} />
                                ) : (
                                  <div className={styles.photoPlaceholder}>
                                    <span className={styles.placeholderIcon}>👤</span>
                                    <span className={styles.placeholderText}>MEMBER {idx + 1}</span>
                                  </div>
                                )}
                              </div>
                              <div className={styles.teamMemberSeal}>🌴</div>
                            </div>
                            <div className={styles.teamMemberName}>
                              {member.name ? member.name.toUpperCase() : `MEMBER ${idx + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Builder Title Box */}
                      <div className={styles.builderTitleBox}>
                        <span className={styles.builderTitleBadge}>TEAM TITLE</span>
                        <div className={styles.builderTitleText}>
                          <span>{formData.builderTitle ? formData.builderTitle.toUpperCase() : 'THE CODE ARCHITECT'}</span>
                          <span className={styles.titlePalm}>🌴</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right Column: Name & Details List */}
                  <div className={styles.infoCol}>
                    {/* Name Header */}
                    <div className={styles.nameRow}>
                      <span className={styles.nameSparkle}>✦</span>
                      <h2 className={`${styles.cardName} ${!formData.name ? styles.dimmedText : ''}`}>
                        {formData.name ? formData.name.toUpperCase() : (passType === 'team' ? 'TEAM NAME' : 'YOUR NAME')}
                      </h2>
                      <span className={styles.nameSparkle}>✦</span>
                    </div>

                    {/* Role / Subtitle */}
                    <div className={`${styles.cardRole} ${!formData.role ? styles.dimmedText : ''}`}>
                      {formData.role ? formData.role.toUpperCase() : (passType === 'team' ? 'TEAM OF BUILDERS' : 'FULL STACK DEVELOPER')}
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
          </>
        )}
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
                passType === 'solo' ? (
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
                          <div className={styles.photoSummaryButtons}>
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById('solo-file-input');
                                input?.click();
                              }}
                              className={styles.memberPhotoBtn}
                            >
                              📁 Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveCameraMember(-1)}
                              className={styles.memberPhotoBtn}
                            >
                              📷 Camera
                            </button>
                            <input
                              type="file"
                              id="solo-file-input"
                              accept="image/*"
                              onChange={(e) => handleFileChangeForMember(e, -1)}
                              style={{ display: 'none' }}
                            />
                          </div>
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
                ) : (
                  <div className={styles.fieldsGrid}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>
                        TEAM NAME <span className={styles.req}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. The Pixel Pioneers"
                        className={styles.input}
                        maxLength={30}
                        autoFocus
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>TEAM SUBTITLE</label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="e.g. Hacker House Builders"
                        className={styles.input}
                        maxLength={35}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>TEAM LOCATION</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Bangalore & Goa"
                        className={styles.input}
                        maxLength={30}
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>TEAM SIZE (2 - 3 MEMBERS)</label>
                      <div className={styles.memberCountRow}>
                        <button
                          type="button"
                          className={`${styles.memberCountBtn} ${teamMemberCount === 2 ? styles.memberCountBtnActive : ''}`}
                          onClick={() => setTeamMemberCount(2)}
                        >
                          2 Members
                        </button>
                        <button
                          type="button"
                          className={`${styles.memberCountBtn} ${teamMemberCount === 3 ? styles.memberCountBtnActive : ''}`}
                          onClick={() => setTeamMemberCount(3)}
                        >
                          3 Members
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>TEAM MEMBERS REGISTER</label>
                      <div className={styles.teamMembersFields}>
                        {Array.from({ length: teamMemberCount }).map((_, idx) => (
                          <div key={idx} className={styles.teamMemberFormGroup}>
                            <h4 className={styles.memberFormTitle}>MEMBER 0{idx + 1}</h4>
                            <div className={styles.memberFormRow}>
                              <div className={styles.memberFormInputCol}>
                                <label className={styles.label}>FULL NAME</label>
                                <input
                                  type="text"
                                  placeholder={`Member ${idx + 1} Name`}
                                  value={teamMembers[idx]?.name || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTeamMembers((prev) => {
                                      const next = [...prev];
                                      next[idx] = { ...next[idx], name: val };
                                      return next;
                                    });
                                  }}
                                  className={styles.input}
                                  maxLength={25}
                                />
                              </div>

                              <div className={styles.memberFormPhotoCol}>
                                <label className={styles.label}>PHOTO</label>
                                <div className={styles.memberPhotoControls}>
                                  <div className={styles.memberPhotoThumb}>
                                    {teamMembers[idx]?.photo ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={teamMembers[idx].photo} alt="Member thumb" className={styles.memberThumbImg} />
                                    ) : (
                                      <span className={styles.memberThumbPlaceholder}>👤</span>
                                    )}
                                  </div>
                                  <div className={styles.memberPhotoButtons}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const input = document.getElementById(`member-file-${idx}`);
                                        input?.click();
                                      }}
                                      className={styles.memberPhotoBtn}
                                    >
                                      📁 Upload
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveCameraMember(idx);
                                      }}
                                      className={styles.memberPhotoBtn}
                                    >
                                      📷 Camera
                                    </button>
                                    <input
                                      type="file"
                                      id={`member-file-${idx}`}
                                      accept="image/*"
                                      onChange={(e) => handleFileChangeForMember(e, idx)}
                                      style={{ display: 'none' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
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

      {/* 📸 CAMERA CAPTURE MODAL */}
      {activeCameraMember !== null && (
        <div className={styles.cameraModal}>
          <div className={styles.cameraModalContent}>
            <h3>📸 CAPTURE MEMBER PHOTO</h3>
            <div className={styles.cameraPreviewContainer}>
              <video ref={videoRef} autoPlay playsInline muted className={styles.cameraVideo} />
            </div>
            <div className={styles.cameraModalActions}>
              <button type="button" onClick={handleCapturePhoto} className={styles.captureBtn}>
                📸 SNAP PHOTO
              </button>
              <button type="button" onClick={() => setActiveCameraMember(null)} className={styles.cancelBtn}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
