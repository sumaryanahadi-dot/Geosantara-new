"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Clock, 
  TrendingUp,
  Award,
  Compass,
  Sun,
  Cloud,
  Umbrella,
  Coffee,
  Mountain,
  Waves,
  Castle,
  TreePine,
  Filter,
  ChevronRight,
  Heart,
  Navigation,
  Shield,
  Wallet
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Destination = {
  id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  image_url?: string;
  category: string;
  rating?: number;
  duration?: string;
  best_season?: string;
  popularity?: number;
  tags?: string[];
};

export default function RekomendasiPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  // Warna tema
  const primaryColor = "#133740";
  const primaryLight = "#1a4a5a";
  const primaryLighter = "#2a6b80";
  const accentColor = "#E0B554";
  
  // Duration options
  const durationOptions = [
    { value: "all", label: "Semua Durasi" },
    { value: "1-2", label: "1-2 Hari" },
    { value: "3-4", label: "3-4 Hari" },
    { value: "5+", label: "5 Hari atau Lebih" }
  ];

  // Season options
  const seasonOptions = [
    { value: "all", label: "Semua Musim" },
    { value: "summer", label: "Musim Panas" },
    { value: "rainy", label: "Musim Hujan" },
    { value: "dry", label: "Musim Kemarau" }
  ];

  // Featured destinations
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);

  // ================= CEK USER =================
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserWishlist(session.user.id);
      }
    };
    checkAuth();
  }, []);

  // ================= FETCH WISHLIST =================
  const fetchUserWishlist = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('wishlist')
        .select('destination_id')
        .eq('user_id', userId);

      const ids = data?.map(item => item.destination_id) || [];
      setWishlistIds(ids);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  // ================= FETCH DESTINATIONS =================
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');

        if (error) throw error;

        // Enhanced data with additional properties
        const enhancedData: Destination[] = (data || []).map((dest, index) => {
          const categories = ["Gunung", "Pantai", "Sejarah", "Taman Nasional"];
          const seasons = ["summer", "rainy", "dry"];
          const durations = ["1-2", "3-4", "5+"];
          
          // Generate tags based on category
          const tagMap: Record<string, string[]> = {
            "Gunung": ["Pendakian", "Alam", "Petualangan", "Pemandangan"],
            "Pantai": ["Watersport", "Snorkeling", "Sunset", "Relaksasi"],
            "Sejarah": ["Budaya", "Arsitektur", "Edukasi", "Fotografi"],
            "Taman Nasional": ["Wildlife", "Konservasi", "Tracking", "Flora Fauna"]
          };

          return {
            ...dest,
            rating: 4.0 + Math.random() * 1.0,
            duration: durations[index % 3],
            best_season: seasons[index % 3],
            popularity: 50 + Math.random() * 50,
            tags: tagMap[dest.category] || ["Wisata", "Alam", "Budaya"]
          };
        });

        setDestinations(enhancedData);
        
        // Set featured destinations (top rated and popular)
        const featured = enhancedData
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 4);
        setFeaturedDestinations(featured);
        
      } catch (error) {
        console.error("Error fetching destinations:", error);
        
        // Fallback data
        const fallbackData: Destination[] = [
          {
            id: "1",
            name: "Gunung Bromo",
            location: "Malang, Jawa Timur",
            price: 54000,
            description: "Menyaksikan matahari terbit di atas lautan pasir Bromo dengan pemandangan yang spektakuler.",
            image_url: "/gunung-bromo.jpg",
            category: "Gunung",
            rating: 4.8,
            duration: "1-2",
            best_season: "dry",
            popularity: 95,
            tags: ["Pendakian", "Alam", "Petualangan", "Sunrise"]
          },
          {
            id: "2",
            name: "Pantai Kuta",
            location: "Bali",
            price: 35000,
            description: "Pantai terkenal untuk berselancar dan menikmati sunset dengan suasana yang hidup.",
            image_url: "/kuta.jpg",
            category: "Pantai",
            rating: 4.5,
            duration: "3-4",
            best_season: "summer",
            popularity: 90,
            tags: ["Watersport", "Snorkeling", "Sunset", "Relaksasi"]
          },
          {
            id: "3",
            name: "Candi Borobudur",
            location: "Magelang, Jawa Tengah",
            price: 50000,
            description: "Candi Buddha terbesar di dunia dengan arsitektur megah dan nilai sejarah yang tinggi.",
            image_url: "/borobudur.jpg",
            category: "Sejarah",
            rating: 4.9,
            duration: "1-2",
            best_season: "dry",
            popularity: 88,
            tags: ["Budaya", "Arsitektur", "Edukasi", "Fotografi"]
          },
          {
            id: "4",
            name: "Danau Toba",
            location: "Sumatera Utara",
            price: 45000,
            description: "Danau vulkanik terbesar di dunia dengan pulau Samosir di tengahnya.",
            image_url: "/toba.jpg",
            category: "Taman Nasional",
            rating: 4.7,
            duration: "3-4",
            best_season: "summer",
            popularity: 85,
            tags: ["Wildlife", "Danau", "Tracking", "Budaya Batak"]
          },
          {
            id: "5",
            name: "Raja Ampat",
            location: "Papua Barat",
            price: 1200000,
            description: "Surga bawah laut dengan keanekaragaman hayati terbaik di dunia.",
            image_url: "/raja-ampat.jpg",
            category: "Pantai",
            rating: 4.9,
            duration: "5+",
            best_season: "summer",
            popularity: 92,
            tags: ["Diving", "Snorkeling", "Konservasi", "Alam"]
          },
          {
            id: "6",
            name: "Prambanan",
            location: "Yogyakarta",
            price: 40000,
            description: "Kompleks candi Hindu terbesar di Indonesia dengan relief yang menakjubkan.",
            image_url: "/prambanan.jpg",
            category: "Sejarah",
            rating: 4.6,
            duration: "1-2",
            best_season: "dry",
            popularity: 82,
            tags: ["Sejarah", "Arsitektur", "Budaya", "Fotografi"]
          },
          {
            id: "7",
            name: "Gunung Rinjani",
            location: "Lombok, NTB",
            price: 75000,
            description: "Gunung berapi aktif dengan danau kawah Segara Anak yang indah.",
            image_url: "/rinjani.jpg",
            category: "Gunung",
            rating: 4.8,
            duration: "3-4",
            best_season: "dry",
            popularity: 87,
            tags: ["Pendakian", "Petualangan", "Alam", "Danau"]
          },
          {
            id: "8",
            name: "Taman Nasional Komodo",
            location: "Nusa Tenggara Timur",
            price: 25000,
            description: "Habitat asli komodo, hewan purba yang masih hidup sampai sekarang.",
            image_url: "/komodo.jpg",
            category: "Taman Nasional",
            rating: 4.7,
            duration: "3-4",
            best_season: "summer",
            popularity: 89,
            tags: ["Wildlife", "Konservasi", "Pulau", "Petualangan"]
          }
        ];

        setDestinations(fallbackData);
        setFeaturedDestinations(fallbackData.slice(0, 4));
        
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // ================= TOGGLE WISHLIST =================
  const toggleWishlist = async (destinationId: string) => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menggunakan fitur wishlist");
      window.location.href = "/login?redirect=/rekomendasi";
      return;
    }

    try {
      const isInWishlist = wishlistIds.includes(destinationId);
      
      if (isInWishlist) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_id', destinationId);
        
        setWishlistIds(prev => prev.filter(id => id !== destinationId));
      } else {
        await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            destination_id: destinationId,
            added_at: new Date().toISOString()
          });
        
        setWishlistIds(prev => [...prev, destinationId]);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Gagal memperbarui wishlist");
    }
  };

  // ================= FILTERED DESTINATIONS =================
  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = 
      dest.name.toLowerCase().includes(search.toLowerCase()) ||
      dest.location.toLowerCase().includes(search.toLowerCase()) ||
      dest.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "all" || dest.category === selectedCategory;
    const matchesDuration = selectedDuration === "all" || dest.duration === selectedDuration;
    const matchesSeason = selectedSeason === "all" || dest.best_season === selectedSeason;

    return matchesSearch && matchesCategory && matchesDuration && matchesSeason;
  });

  // ================= FORMAT PRICE =================
  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    
    if (price > 1000000) {
      return `Rp ${(price / 1000000).toFixed(1)} juta`;
    }
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // ================= SEASON ICON =================
  const getSeasonIcon = (season: string) => {
    switch (season) {
      case "summer": return <Sun className="text-yellow-500" size={16} />;
      case "rainy": return <Umbrella className="text-blue-500" size={16} />;
      case "dry": return <Cloud className="text-orange-500" size={16} />;
      default: return <Sun size={16} />;
    }
  };

  // ================= SEASON LABEL =================
  const getSeasonLabel = (season: string) => {
    switch (season) {
      case "summer": return "Musim Panas";
      case "rainy": return "Musim Hujan";
      case "dry": return "Musim Kemarau";
      default: return "Semua Musim";
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
          <p className="text-gray-500 mt-4">Memuat rekomendasi liburan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HERO SECTION */}
      <div className="relative" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xl font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                REKOMENDASI LIBURAN TERBAIK
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Temukan Destinasi Impian Anda
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Jelajahi rekomendasi destinasi terbaik yang disesuaikan dengan preferensi liburan Anda
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="Cari destinasi, lokasi, atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              />
              <div className="absolute right-2 top-2">
                <button className="px-6 py-2 rounded-full text-white font-medium transition-all hover:scale-105" 
                        style={{ backgroundColor: accentColor }}>
                  Cari
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WAVE DIVIDER */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 112.5C120 105 240 90 360 90C480 90 600 105 720 105C840 105 960 90 1080 82.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-8">
        {/* FEATURED DESTINATIONS */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Destinasi Unggulan</h2>
              <p className="text-gray-600">Rekomendasi terbaik berdasarkan rating dan popularitas</p>
            </div>
            <div className="flex items-center gap-2 font-medium" style={{ color: primaryColor }}>
              <span>Terpilih Khusus</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((dest) => {
              const isInWishlist = wishlistIds.includes(dest.id);
              
              return (
                <div
                  key={dest.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                >
                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={dest.image_url || "/default-destination.jpg"}
                      alt={dest.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    
                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* CATEGORY BADGE */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                        <span className="text-sm font-medium text-gray-800">{dest.category}</span>
                      </div>
                    </div>
                    
                    {/* WISHLIST BUTTON */}
                    <button
                      onClick={() => toggleWishlist(dest.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                        isInWishlist 
                          ? "bg-red-50 text-red-500" 
                          : "bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        size={20}
                        className={isInWishlist ? "fill-current" : ""}
                      />
                    </button>
                    
                    {/* RATING */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-800">{dest.rating?.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    {/* LOCATION */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <MapPin size={14} style={{ color: primaryColor }} />
                      <span>{dest.location}</span>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                      {dest.name}
                    </h3>

                    {/* TAGS - Diperbaiki warna background */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dest.tags?.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 text-xs rounded-full font-medium"
                          style={{ 
                            backgroundColor: `${primaryColor}20`, // 20% opacity
                            color: primaryColor 
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* INFO ROW */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{dest.duration} hari</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getSeasonIcon(dest.best_season || "summer")}
                          <span>
                            {getSeasonLabel(dest.best_season || "summer")}
                          </span>
                        </div>
                      </div>
                      {dest.popularity && dest.popularity > 80 && (
                        <div className="flex items-center gap-1" style={{ color: primaryColor }}>
                          <TrendingUp size={14} />
                          <span className="font-medium">{dest.popularity}%</span>
                        </div>
                      )}
                    </div>

                    {/* PRICE & BUTTON */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <div className="font-bold text-xl" style={{ color: primaryColor }}>
                          {formatPrice(dest.price)}
                        </div>
                        <div className="text-xs text-gray-500">Harga mulai dari</div>
                      </div>
                      
                      <Link
                        href={`/detaildestinasi/${dest.id}`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors text-white"
                        style={{ backgroundColor: primaryColor }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryLight}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                      >
                        <Navigation size={16} />
                        Jelajahi
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Filter className="text-gray-700" size={24} />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Sesuaikan Pencarian</h3>
              <p className="text-gray-600">Filter destinasi berdasarkan preferensi Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* CATEGORY FILTER */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Jenis Destinasi
              </label>
              <div className="space-y-3">
                {["all", "Gunung", "Pantai", "Sejarah", "Taman Nasional"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all border ${
                      selectedCategory === category
                        ? "border-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category 
                        ? `${primaryColor}15` 
                        : "white"
                    }}
                  >
                    <span className={`font-medium ${
                      selectedCategory === category 
                        ? "text-gray-800" 
                        : "text-gray-700"
                    }`}>
                      {category === "all" ? "Semua Jenis" : category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* DURATION FILTER */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Lama Perjalanan
              </label>
              <div className="space-y-3">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all border ${
                      selectedDuration === option.value
                        ? "border-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{
                      backgroundColor: selectedDuration === option.value 
                        ? `${primaryColor}15` 
                        : "white"
                    }}
                  >
                    <span className={`font-medium ${
                      selectedDuration === option.value 
                        ? "text-gray-800" 
                        : "text-gray-700"
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SEASON FILTER */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Musim Terbaik
              </label>
              <div className="space-y-3">
                {seasonOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSeason(option.value)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all border ${
                      selectedSeason === option.value
                        ? "border-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{
                      backgroundColor: selectedSeason === option.value 
                        ? `${primaryColor}15` 
                        : "white"
                    }}
                  >
                    <span className={`font-medium ${
                      selectedSeason === option.value 
                        ? "text-gray-800" 
                        : "text-gray-700"
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* STATISTICS */}
            <div className="rounded-2xl p-6" style={{ 
              backgroundColor: `${primaryColor}10`,
              border: `1px solid ${primaryColor}20`
            }}>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {filteredDestinations.length}
                </div>
                <div className="text-gray-600 mb-4">Destinasi Tersedia</div>
                
                <div className="space-y-4">
                  <div className="text-left">
                    <div className="text-sm text-gray-500">Budget Terjangkau</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-800">
                        {destinations.filter(d => d.price < 100000).length}
                      </div>
                      <Wallet style={{ color: primaryColor }} size={18} />
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-sm text-gray-500">Rating Tinggi</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-800">
                        {destinations.filter(d => (d.rating || 0) >= 4.5).length}
                      </div>
                      <Award style={{ color: primaryColor }} size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTERS */}
          {(selectedCategory !== "all" || selectedDuration !== "all" || selectedSeason !== "all") && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Filter Aktif:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor 
                        }}>
                    {selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory("all")}
                      className="ml-1 hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedDuration !== "all" && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor 
                        }}>
                    <Calendar size={14} />
                    {durationOptions.find(d => d.value === selectedDuration)?.label}
                    <button 
                      onClick={() => setSelectedDuration("all")}
                      className="ml-1 hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedSeason !== "all" && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor 
                        }}>
                    {getSeasonIcon(selectedSeason)}
                    {seasonOptions.find(s => s.value === selectedSeason)?.label}
                    <button 
                      onClick={() => setSelectedSeason("all")}
                      className="ml-1 hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(selectedCategory !== "all" || selectedDuration !== "all" || selectedSeason !== "all") && (
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedDuration("all");
                      setSelectedSeason("all");
                    }}
                    className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hapus Semua Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ALL DESTINATIONS */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Semua Destinasi</h3>
              <p className="text-gray-600">
                Menampilkan {filteredDestinations.length} destinasi dari {destinations.length} total
              </p>
            </div>
            <Link
              href="/destinasi"
              className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
              style={{ color: primaryColor }}
            >
              Lihat Semua Destinasi
              <ChevronRight size={18} />
            </Link>
          </div>

          {filteredDestinations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <Compass size={96} className="mx-auto opacity-30" />
              </div>
              <h4 className="text-2xl font-bold text-gray-700 mb-3">
                Tidak Ada Destinasi Ditemukan
              </h4>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Tidak ada destinasi yang sesuai dengan filter pencarian Anda. Coba ubah filter atau kata kunci pencarian.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedDuration("all");
                  setSelectedSeason("all");
                  setSearch("");
                }}
                className="px-8 py-3 rounded-full text-white font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Tampilkan Semua Destinasi
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((dest) => {
                const isInWishlist = wishlistIds.includes(dest.id);
                
                return (
                  <div
                    key={dest.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* IMAGE */}
                    <div className="relative h-48">
                      <Image
                        src={dest.image_url || "/default-destination.jpg"}
                        alt={dest.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* CATEGORY */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <span className="text-xs font-medium text-gray-800">{dest.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">
                            {dest.name}
                          </h4>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin size={14} style={{ color: primaryColor }} />
                            <span>{dest.location}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleWishlist(dest.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Heart
                            size={18}
                            className={
                              isInWishlist
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400 hover:text-red-500"
                            }
                          />
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {dest.description}
                      </p>

                      {/* INFO ROW */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" />
                            <span className="font-medium">{dest.rating?.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{dest.duration} hari</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getSeasonIcon(dest.best_season || "summer")}
                          <span className="text-xs">
                            {dest.best_season === "summer" ? "Panas" : 
                             dest.best_season === "rainy" ? "Hujan" : "Kemarau"}
                          </span>
                        </div>
                      </div>

                      {/* TAGS - Diperbaiki warna */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dest.tags?.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 text-xs rounded-full font-medium"
                            style={{ 
                              backgroundColor: `${primaryColor}15`,
                              color: primaryColor 
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* PRICE & BUTTON */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div>
                          <div className="font-bold" style={{ color: primaryColor }}>
                            {formatPrice(dest.price)}
                          </div>
                          <div className="text-xs text-gray-500">Harga mulai</div>
                        </div>
                        <Link
                          href={`/detaildestinasi/${dest.id}`}
                          className="px-5 py-2 rounded-lg text-white font-medium transition-colors text-sm hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WHY CHOOSE US */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih Rekomendasi Kami?</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Kami menganalisis berbagai faktor untuk memberikan rekomendasi liburan yang sesuai dengan preferensi Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{ backgroundColor: `${primaryColor}15` }}>
                <Star style={{ color: primaryColor }} size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Rating Terverifikasi</h4>
              <p className="text-gray-600">
                Semua destinasi memiliki rating dari pengunjung sebelumnya, memastikan kualitas pengalaman
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{ backgroundColor: `${primaryColor}15` }}>
                <Shield style={{ color: primaryColor }} size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Analisis Musiman</h4>
              <p className="text-gray-600">
                Rekomendasi berdasarkan musim terbaik untuk mengunjungi setiap destinasi
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{ backgroundColor: `${primaryColor}15` }}>
                <Users style={{ color: primaryColor }} size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Data Pengunjung</h4>
              <p className="text-gray-600">
                Berdasarkan preferensi dan pengalaman ribuan traveler sebelumnya
              </p>
            </div>
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: primaryColor }}>
          <div className="p-12 text-white text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mb-6">
                Siap Merencanakan Liburan Anda?
              </h3>
              <p className="text-lg text-gray-100 mb-8 leading-relaxed">
                Dapatkan rekomendasi personal dengan menceritakan preferensi liburan Anda. 
                Tim ahli kami akan membantu merencanakan perjalanan yang sempurna.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/destinasi"
                  className="px-8 py-4 bg-white rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                  style={{ color: primaryColor }}
                >
                  Jelajahi Semua Destinasi
                </Link>
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                  Konsultasi Gratis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}