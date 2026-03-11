import React, { useState, useEffect, useRef, useMemo } from 'react';
import logo from '../../assets/images/logo.svg';

/**
 * SplashScreen v3 — Fusion optimale v1 + v2 (3.2 s)
 *
 * Phases :
 *  idle     →  80ms  → enter   : logo scale-in + cercles décoratifs + lignes
 *  enter    → 700ms  → shine   : flash lumineux one-shot + particules + cercles rotatifs
 *  shine    → 1200ms → tagline : texte lettre par lettre (rotateX) + séparateur + sous-titre
 *  tagline  → 2500ms → exit    : fondu élégant
 *  exit     → 3200ms           : masqué + onComplete()
 *
 * Correctifs v3 vs v2 :
 *  - Fond blanc (pas de transition dark→blanc brutale)
 *  - Police Google Fonts via <link> JSX (pas @import dans <style>)
 *  - Deux wrappers séparés mount/float → zéro reset d'animation au changement de phase
 *  - will-change sur le container tagline uniquement (pas sur chaque <span>)
 *  - perspective: 400px sur le container pour que rotateX soit visible
 *  - animation: undefined (pas 'none') sur les éléments inactifs
 *  - spl-line-grow supprimé (code mort à syntaxe invalide)
 *  - color = '#fa7938' (charte de l'app)
 *  - TAGLINE_CHARS pré-calculé hors composant
 *  - useMemo sur les particules (stable entre renders)
 */

// ─── Config ────────────────────────────────────────────────────────────────
const TAGLINE       = "Savourez l'excellence";
const TAGLINE_CHARS = TAGLINE.split('');          // pré-calculé hors composant
const PARTICLE_COUNT = 16;

const DURATION = {
  enter  :   80,
  shine  :  700,
  tagline: 1200,
  exit   : 2500,
  done   : 3200,
};

// ─── Keyframes (stables, hors composant — pas d'@import) ───────────────────
const KEYFRAMES = `
  @keyframes spl-mount {
    0%   { opacity: 0; transform: translateY(28px) scale(0.90); }
    100% { opacity: 1; transform: translateY(0px)  scale(1); }
  }
  @keyframes spl-float {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-7px); }
  }
  @keyframes spl-shine {
    0%   { opacity: 0;   transform: scale(0.8); }
    30%  { opacity: 1;   transform: scale(1.3); }
    100% { opacity: 0;   transform: scale(2.0); }
  }
  @keyframes spl-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes spl-spin-reverse {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes spl-particle {
    0%   { opacity: 0;   transform: translate(0, 0) scale(0); }
    20%  { opacity: 1; }
    100% { opacity: 0;   transform: translate(var(--tx), var(--ty)) scale(0.3); }
  }
  @keyframes spl-dot {
    0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
    40%           { transform: scale(1);   opacity: 1; }
  }
`;

// ─── Helper ─────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : '250, 121, 56';
}

// ─── Composant ───────────────────────────────────────────────────────────────
const SplashScreen = ({ onComplete, color = '#fa7938' }) => {
  const [phase, setPhase]         = useState('idle');
  const [isVisible, setIsVisible] = useState(true);
  const timersRef                 = useRef([]);
  const onCompleteRef             = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Particules pré-calculées une seule fois (géométrie stable entre renders)
  const particles = useMemo(() => (
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * 360;
      const dist  = 50 + Math.random() * 50;
      const rad   = (angle * Math.PI) / 180;
      return {
        id   : i,
        tx   : `${Math.cos(rad) * dist}px`,
        ty   : `${Math.sin(rad) * dist}px`,
        delay: `${Math.random() * 0.35}s`,
        size : 2 + Math.random() * 2.5,
      };
    })
  ), []);

  useEffect(() => {
    const add = (fn, delay) => {
      const id = setTimeout(fn, delay);
      timersRef.current.push(id);
    };

    add(() => setPhase('enter'),   DURATION.enter);
    add(() => setPhase('shine'),   DURATION.shine);
    add(() => setPhase('tagline'), DURATION.tagline);
    add(() => setPhase('exit'),    DURATION.exit);
    add(() => {
      setIsVisible(false);
      onCompleteRef.current?.();
    }, DURATION.done);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  if (!isVisible) return null;

  const rgb       = hexToRgb(color);
  const isEntered = phase !== 'idle';
  const isShine   = ['shine', 'tagline', 'exit'].includes(phase);
  const isTagline = ['tagline', 'exit'].includes(phase);
  const isExit    = phase === 'exit';

  return (
    <>
      {/* Police serif — chargement fiable via <link> (pas @import dans <style>) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300&family=Cinzel:wght@400&display=swap"
      />
      <style>{KEYFRAMES}</style>

      {/* ── Fond blanc + dégradé teinté (cohérent avec l'app) ── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          background: `
            radial-gradient(ellipse 70% 55% at 55% 38%, rgba(${rgb}, 0.09) 0%, transparent 65%),
            radial-gradient(ellipse 90% 80% at 30% 75%, rgba(${rgb}, 0.05) 0%, transparent 60%),
            #ffffff
          `,
          transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isExit ? 0 : 1,
          willChange: 'opacity',
        }}
      >
        {/* ── Ligne décorative haut ── */}
        <div style={{
          position: 'absolute', top: '9%', left: '50%',
          transform: 'translateX(-50%)',
          width: isEntered ? '110px' : '0px',
          height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.5), transparent)`,
          transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
          willChange: 'width',
        }} />

        {/* ── Ligne décorative bas ── */}
        <div style={{
          position: 'absolute', bottom: '9%', left: '50%',
          transform: 'translateX(-50%)',
          width: isTagline ? '180px' : '0px',
          height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.35), transparent)`,
          transition: 'width 1.0s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
          willChange: 'width',
        }} />

        {/* ── Cercle extérieur (déploiement à l'entrée) ── */}
        <div style={{
          position: 'absolute',
          width: '340px', height: '340px',
          borderRadius: '50%',
          border: `1px solid rgba(${rgb}, 0.11)`,
          transform: isEntered ? 'scale(1)' : 'scale(0.45)',
          opacity: isEntered ? 1 : 0,
          transition: 'transform 1.6s cubic-bezier(0.34, 1.1, 0.64, 1), opacity 1.3s ease',
          willChange: 'transform, opacity',
        }} />

        {/* ── Cercle rotatif horaire (animation: undefined = pas de couche GPU inutile) ── */}
        <div style={{
          position: 'absolute',
          width: '250px', height: '250px',
          borderRadius: '50%',
          border: `1px dashed rgba(${rgb}, 0.10)`,
          opacity: isShine && !isExit ? 0.8 : 0,
          transition: 'opacity 0.8s ease',
          animation: isShine && !isExit ? 'spl-spin 18s linear infinite' : undefined,
          willChange: 'transform, opacity',
        }} />

        {/* ── Cercle rotatif antihoraire ── */}
        <div style={{
          position: 'absolute',
          width: '185px', height: '185px',
          borderRadius: '50%',
          border: `1px solid rgba(${rgb}, 0.07)`,
          borderTopColor: `rgba(${rgb}, 0.32)`,
          opacity: isShine && !isExit ? 1 : 0,
          transition: 'opacity 0.6s ease 0.15s',
          animation: isShine && !isExit ? 'spl-spin-reverse 11s linear infinite' : undefined,
          willChange: 'transform, opacity',
        }} />

        {/* ── Particules (one-shot, retrait propre du DOM) ── */}
        {isShine && !isExit && particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: '50%',
              background: `rgba(${rgb}, 0.85)`,
              '--tx': p.tx,
              '--ty': p.ty,
              animation: `spl-particle 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${p.delay} forwards`,
              willChange: 'transform, opacity',
            }}
          />
        ))}

        {/* ── Contenu central ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem', position: 'relative' }}>

          {/* ── LOGO ── */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Flash shine one-shot (retiré du DOM quand inactif) */}
            {isShine && !isExit && (
              <div style={{
                position: 'absolute',
                width: '135px', height: '135px',
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(${rgb}, 0.42) 0%, transparent 65%)`,
                animation: 'spl-shine 1.0s ease-out forwards',
                pointerEvents: 'none',
                willChange: 'transform, opacity',
              }} />
            )}

            {/*
              Wrapper 1 : entrée (scale + opacity via transition CSS)
              Wrapper 2 : flottement (translateY via animation CSS pure)
              → séparés pour éviter tout reset d'animation au changement de phase
            */}
            <div style={{
              transition: 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease',
              transform: isEntered ? 'scale(1)' : 'scale(0.52)',
              opacity: isEntered ? 1 : 0,
              willChange: 'transform, opacity',
            }}>
              <div style={{
                animation: isShine && !isExit ? 'spl-float 3.5s ease-in-out infinite' : undefined,
                willChange: 'transform',
              }}>
                {/* Carte logo — style raffiné */}
                <div style={{
                  width: '110px', height: '110px',
                  borderRadius: '26px',
                  background: `linear-gradient(145deg, rgba(${rgb}, 0.12) 0%, rgba(${rgb}, 0.04) 100%)`,
                  border: `1px solid rgba(${rgb}, 0.22)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 0 1px rgba(${rgb}, 0.07), 0 16px 48px rgba(${rgb}, 0.18), 0 4px 16px rgba(0,0,0,0.07)`,
                }}>
                  <img
                    src={logo}
                    alt="Logo"
                    style={{
                      width: '66px', height: '66px',
                      filter: `drop-shadow(0 4px 14px rgba(${rgb}, 0.50))`,
                      userSelect: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Séparateur ◆ ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            opacity: isTagline ? 1 : 0,
            transform: isTagline ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform, opacity',
          }}>
            <div style={{ width: '36px', height: '1px', background: `rgba(${rgb}, 0.35)` }} />
            <div style={{
              width: '4px', height: '4px',
              borderRadius: '1px',
              background: `rgba(${rgb}, 0.65)`,
              transform: 'rotate(45deg)',
            }} />
            <div style={{ width: '36px', height: '1px', background: `rgba(${rgb}, 0.35)` }} />
          </div>

          {/* ── Tagline lettre par lettre avec effet rotateX ── */}
          {/*
            perspective sur le container pour que rotateX soit visible (correction v2).
            will-change sur le <p> uniquement — pas sur chaque <span> (évite 21 couches GPU).
          */}
          <div style={{ perspective: '400px', textAlign: 'center', overflow: 'hidden', minHeight: '1.8rem' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 4vw, 1.2rem)',
              fontWeight: 300,
              color: `rgba(${rgb}, 0.88)`,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              margin: 0, lineHeight: 1.2,
              willChange: 'transform, opacity',
            }}>
              {TAGLINE_CHARS.map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: isTagline ? 1 : 0,
                    transform: isTagline
                      ? 'translateY(0) rotateX(0deg)'
                      : 'translateY(14px) rotateX(50deg)',
                    transition: `opacity 0.4s ease ${i * 0.04}s, transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) ${i * 0.04}s`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </p>
          </div>

          {/* ── Sous-titre "Menu Digital" ── */}
          <p style={{
            fontFamily: "'Cinzel', 'Times New Roman', serif",
            fontSize: 'clamp(0.55rem, 2vw, 0.65rem)',
            fontWeight: 400,
            color: `rgba(${rgb}, 0.42)`,
            letterSpacing: '5px',
            textTransform: 'uppercase',
            margin: 0,
            opacity: isTagline ? 1 : 0,
            transition: 'opacity 0.8s ease 0.9s',
            willChange: 'opacity',
          }}>
            Menu Digital
          </p>

          {/* ── Dots indicateurs ── */}
          <div style={{
            display: 'flex', gap: '6px',
            opacity: isTagline ? 0.55 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '5px', height: '5px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  animation: isTagline && !isExit
                    ? `spl-dot 1.4s ease-in-out ${i * 0.22}s infinite`
                    : undefined,
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default SplashScreen;
