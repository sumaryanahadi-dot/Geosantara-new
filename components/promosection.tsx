"use client";

import Image from "next/image";
import { useState } from "react";

export default function PromoSection() {
  const [hoveredPromo, setHoveredPromo] = useState<number | null>(null);

  const promos = [
    {
      id: 1,
      title: "Rencanakan liburan bersama teman dan keluarga",
      subtitle: "Ciptakan momen tak terlupakan bersama orang tersayang",
      image: "/promo-1.jpg",
      color: "from-blue-600/30 to-emerald-600/30",
      buttonText: "Rencanakan Sekarang",
      link: "/rencana-liburan"
    },
    {
      id: 2,
      title: "Rekomendasi liburan autentik",
      subtitle: "Temukan pengalaman wisata yang otentik dan berkesan",
      image: "/promo-2.jpg",
      color: "from-amber-600/30 to-orange-600/30",
      buttonText: "Lihat Rekomendasi",
      link: "/rekomendasi"
    }
  ];

  const handlePromoClick = (link: string) => {
    // Navigasi ke halaman yang sesuai
    window.location.href = link;
  };

  return (
    <section className="max-w-7xl mx-auto flex flex-col gap-8 pb-16 px-4">
      {promos.map((promo) => (
        <div
          key={promo.id}
          className="relative h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-2xl overflow-hidden group cursor-pointer"
          onMouseEnter={() => setHoveredPromo(promo.id)}
          onMouseLeave={() => setHoveredPromo(null)}
          onClick={() => handlePromoClick(promo.link)}
        >
          {/* Shadow Layers */}
          <div className="absolute inset-0 rounded-2xl shadow-2xl z-10" />
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] z-20" />
          <div className="absolute inset-0 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.4)]" />
          
          {/* Image Container */}
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={promo.image}
              alt={`Promo ${promo.id}`}
              fill
              className={`
                object-cover transition-all duration-700 ease-out
                ${hoveredPromo === promo.id ? 'scale-110' : 'scale-100'}
              `}
              sizes="(max-width: 768px) 100vw, 100vw"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} opacity-70`} />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Highlight Border on Hover */}
            <div className={`
              absolute inset-0 rounded-2xl border-3 border-transparent
              transition-all duration-500
              ${hoveredPromo === promo.id 
                ? 'border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.2)]' 
                : ''
              }
            `} />
            
            {/* Glow Effect */}
            <div className={`
              absolute inset-0 rounded-2xl 
              bg-gradient-to-r from-white/0 via-white/10 to-white/0
              opacity-0 group-hover:opacity-100
              transition-opacity duration-700
            `} />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 md:p-10 z-30">
            {/* Top Badge */}
            <div className={`
              inline-flex items-center self-start px-4 py-2 rounded-full 
              bg-white/10 backdrop-blur-sm border border-white/20
              transition-all duration-500 transform
              ${hoveredPromo === promo.id 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-4 opacity-0'
              }
            `}>
              <div className={`w-2 h-2 rounded-full mr-2 ${promo.id === 1 ? 'bg-blue-400' : 'bg-amber-400'}`} />
              <span className="text-white/90 text-sm font-medium">
                {promo.id === 1 ? 'PROMO KHUSUS' : 'REKOMENDASI'}
              </span>
            </div>

            {/* Text Content */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className={`
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white
                transition-all duration-700
                ${hoveredPromo === promo.id 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-6 opacity-90'
                }
                drop-shadow-2xl leading-tight
              `}>
                {promo.title}
              </h3>
              
              <p className={`
                text-base sm:text-lg md:text-xl text-white/90
                transition-all duration-800
                ${hoveredPromo === promo.id 
                  ? 'translate-y-0 opacity-100 max-h-20' 
                  : 'translate-y-8 opacity-0 max-h-0'
                }
                drop-shadow-lg
              `}>
                {promo.subtitle}
              </p>
            </div>

            {/* Button */}
            <div className={`
              self-end
              transition-all duration-900
              ${hoveredPromo === promo.id 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
              }
            `}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePromoClick(promo.link);
                }}
                className={`
                  flex items-center gap-3
                  px-6 py-3 sm:px-8 sm:py-4
                  ${promo.id === 1 
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  }
                  text-white font-bold text-sm sm:text-base md:text-lg
                  rounded-full
                  shadow-xl hover:shadow-2xl
                  hover:scale-105 active:scale-95
                  transition-all duration-300
                  group/btn
                `}
              >
                <span>{promo.buttonText}</span>
                <svg 
                  className={`
                    w-5 h-5 sm:w-6 sm:h-6
                    transform transition-all duration-500
                    group-hover/btn:translate-x-2
                  `}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 8l4 4m0 0l-4 4m4-4H3" 
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`
                  absolute w-1 h-1 sm:w-2 sm:h-2 
                  ${promo.id === 1 ? 'bg-blue-400/50' : 'bg-amber-400/50'} 
                  rounded-full
                  transition-opacity duration-1000
                  ${hoveredPromo === promo.id ? 'opacity-100' : 'opacity-0'}
                `}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Bottom Glow Bar */}
          <div className={`
            absolute bottom-0 left-0 right-0 h-1
            ${promo.id === 1 
              ? 'bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400' 
              : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400'
            }
            opacity-0 group-hover:opacity-100
            transition-opacity duration-700
          `} />
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-15px) translateX(5px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.5);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}