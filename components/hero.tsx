"use client";

import { useState, useEffect, useRef } from "react";

const slides = [
  {
    video: "/hero1.mp4",
    title: "Temukan Keindahan Indonesia",
    subtitle: "Jelajahi pesona alam dan budaya yang memukau",
  },
];

export default function Hero() {
  const [currentIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [textAnimation, setTextAnimation] = useState({
    title: false,
    subtitle: false,
    line: false,
  });
  const videoRef = useRef<HTMLVideoElement>(null);



  useEffect(() => {
    if (hasInteracted) {
      startTextAnimation();
    }
  }, [hasInteracted]);

  const startTextAnimation = () => {
    setHasInteracted(true);
    
    // Animate title
    setTimeout(() => {
      setTextAnimation((prev) => ({ ...prev, title: true }));
    }, 200);
    
    // Animate line
    setTimeout(() => {
      setTextAnimation((prev) => ({ ...prev, line: true }));
    }, 600);
    
    // Animate subtitle
    setTimeout(() => {
      setTextAnimation((prev) => ({ ...prev, subtitle: true }));
    }, 800);
  };

  const handleInteraction = () => {
    if (!hasInteracted) {
      startTextAnimation();
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 150;
    const y = (e.clientY / window.innerHeight - 0.5) * 150;
    setParallax({ x, y });
  };

  const onTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!isMobile) return;
    const t = e.touches[0];
    if (!t) return;

    const x = (t.clientX / window.innerWidth - 0.5) * 15;
    const y = (t.clientY / window.innerHeight - 0.5) * 15;
    setParallax({ x, y });
  };

  return (
    <section
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      className="relative w-full h-screen overflow-hidden select-none cursor-pointer"
    >
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src={slides[currentIndex].video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            transform: `translate(${parallax.x}px, ${parallax.y}px) scale(1.12)`,
            transition: isMobile ? "transform 0.25s ease-out" : "none",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]" />
      </div>
      {!hasInteracted && (
        <div className="absolute bottom-10 left-0 right-0 text-center z-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-pulse">
            <span className="text-white/90 text-sm md:text-base">
              Selamat Datang Di Geosantara Klik Disini!!
            </span>
            <svg
              className="w-5 h-5 text-white/90 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      )}

      {/* TEXT CONTENT */}
      <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
        <div className="text-center max-w-4xl">
          {/* TITLE - Slide Up dengan Fade */}
          <h2
            className={`
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6
            transform transition-all duration-1000 ease-out
            ${textAnimation.title 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
            }
          `}
          >
            <span className="block">Temukan Keindahan</span>
            <span className="block mt-2">Indonesia</span>
          </h2>
          
          {/* DECORATIVE LINE - Scale In */}
          <div
            className={`
            h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-8
            transform transition-all duration-800 ease-out origin-center
            ${textAnimation.line 
              ? "opacity-100 scale-x-100" 
              : "opacity-0 scale-x-0"
            }
          `}
            style={{ width: "200px" }}
          />
          
          {/* SUBTITLE - Fade In */}
          <p
            className={`
            text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto
            transform transition-all duration-1000 ease-out
            ${textAnimation.subtitle 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-6"
            }
          `}
          >
            {slides[currentIndex].subtitle}
          </p>
          
          <div
            className={`
            mt-12
            transform transition-all duration-1200 ease-out
            ${textAnimation.subtitle 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
            }
          `}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/destinasi";
              }}
              className="
                inline-flex items-center gap-3 
                px-8 py-4 
                bg-gradient-to-r from-yellow-500 to-amber-500 
                text-white font-semibold 
                rounded-full 
                shadow-lg shadow-yellow-500/30
                hover:shadow-xl hover:shadow-yellow-500/40 
                hover:scale-105 
                active:scale-95
                transition-all duration-300 
                cursor-pointer pointer-events-auto
              "
            >
              <span className="text-lg">Mulai Petualangan</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}