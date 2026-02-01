"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Categories() {
  const router = useRouter();
  
  const categories = [
    { 
      name: "Taman Nasional", 
      image: "/cat-1.jpg",
      description: "Jelajahi keindahan alam yang masih alami",
      slug: "taman-nasional"
    },
    { 
      name: "Pantai", 
      image: "/cat-2.jpg",
      description: "Pasir putih dan ombak yang menenangkan",
      slug: "pantai"
    },
    { 
      name: "Gunung", 
      image: "/cat-3.jpg",
      description: "Puncak indah dengan pemandangan spektakuler",
      slug: "gunung"
    },
    { 
      name: "Sejarah", 
      image: "/cat-4.jpeg",
      description: "Wisata sejarah dan arsitektur klasik",
      slug: "sejarah"
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const itemsPerView = 3; 

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= categories.length - itemsPerView ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? categories.length - itemsPerView : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleCardClick = (slug: string) => {
    // Redirect ke halaman destinasi dengan query parameter category
    router.push(`/destinasi?category=${slug}`);
    
    // Alternatif: Jika Anda menggunakan route terpisah untuk kategori
    // router.push(`/destinasi/kategori/${slug}`);
  };

  return (
    <section className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-7xl font-bold text-gray-800">Kategori Wisata</h2>
          <p className="text-3xl text-gray-600 mt-2">Temukan destinasi sesuai minat Anda</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-[#133740] text-white hover:bg-[#E0B554] hover:text-gray-800 transition-all duration-300 shadow-md"
            aria-label="Slide sebelumnya"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-[#133740] text-white hover:bg-[#E0B554] hover:text-gray-800 transition-all duration-300 shadow-md"
            aria-label="Slide berikutnya"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/3"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <div
                className="relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => handleCardClick(category.slug)}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className={`
                      object-cover transition-all duration-500
                      ${isHovered === index ? 'scale-110' : 'scale-100'}
                    `}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className={`
                      text-2xl font-bold mb-2 transition-all duration-300
                      ${isHovered === index ? 'text-[#E0B554] scale-105' : 'text-white'}
                      drop-shadow-lg
                    `}>
                      {category.name}
                    </h3>
                    <p className={`
                      text-sm transition-all duration-300 overflow-hidden
                      ${isHovered === index ? 'text-[#E0B554] max-h-20' : 'text-gray-200 max-h-0'}
                    `}>
                      {category.description}
                    </p>
                    
                    <div className={`
                      mt-4 flex items-center transition-all duration-300
                      ${isHovered === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}>
                      <span className="text-[#E0B554] font-semibold mr-2">Jelajahi</span>
                      <svg 
                        className="w-5 h-5 text-[#E0B554] transform group-hover:translate-x-2 transition-transform duration-300"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                
                  <div className={`
                    absolute inset-0 bg-[#E0B554]/10 transition-opacity duration-300
                    ${isHovered === index ? 'opacity-100' : 'opacity-0'}
                  `} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: categories.length - itemsPerView + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${currentIndex === index ? 'bg-[#E0B554] w-8' : 'bg-gray-300'}
            `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}