"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, MapPin, Heart, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Hero from "@/components/hero";

const categories = ["Gunung", "Pantai", "Sejarah", "Taman Nasional"];

type Destination = {
  id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  image_url?: string;
  category: string;
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // ================= CEK USER LOGIN =================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        
        // Cek session dari Supabase langsung
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session from Supabase:", session);
        
        if (session?.user) {
          setUser(session.user);
          console.log("User set:", session.user.id);
          
          // Fetch wishlist untuk user ini
          await fetchUserWishlist(session.user.id);
        } else {
          console.log("No session found");
          setUser(null);
          setWishlistIds([]);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setDebugInfo("Auth error: " + (error as Error).message);
      }
    };

    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session?.user) {
          setUser(session.user);
          await fetchUserWishlist(session.user.id);
        } else {
          setUser(null);
          setWishlistIds([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ================= FETCH WISHLIST USER =================
  const fetchUserWishlist = async (userId: string) => {
    try {
      console.log("Fetching wishlist for user:", userId);
      
      const { data, error } = await supabase
        .from('wishlist')
        .select('destination_id')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching wishlist:", error);
        setDebugInfo("Wishlist fetch error: " + error.message);
        return;
      }

      console.log("Wishlist data received:", data);
      const ids = data?.map(item => item.destination_id) || [];
      setWishlistIds(ids);
      
    } catch (error) {
      console.error("Error in fetchUserWishlist:", error);
      setDebugInfo("Wishlist error: " + (error as Error).message);
    }
  };

  // ================= FETCH DESTINASI =================
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        console.log("Fetching destinations...");
        
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .order('name');

        if (error) {
          console.error("Supabase error fetching destinations:", error);
          setDebugInfo("Destinations error: " + error.message);
          
          // Fallback ke API
          const res = await fetch("/api/destinasi");
          if (!res.ok) throw new Error("API fallback failed");
          const apiData = await res.json();
          setDestinations(apiData);
          return;
        }

        console.log("Destinations fetched:", data?.length || 0);
        setDestinations(data || []);
        
      } catch (err) {
        console.error("Gagal fetch destinasi:", err);
        setDebugInfo("Fetch error: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // ================= TOGGLE WISHLIST =================
  const toggleWishlist = async (destinationId: string) => {
    console.log("=== TOGGLE WISHLIST START ===");
    console.log("Destination ID:", destinationId);
    console.log("Current user:", user?.id);
    console.log("Current wishlist IDs:", wishlistIds);
    console.log("Is in wishlist?", wishlistIds.includes(destinationId));

    // Validasi user
    if (!user) {
      console.log("No user found, redirecting to login");
      alert("Login dulu buat pakai wishlist");
      window.location.href = "/login?redirect=/destinasi";
      return;
    }

    // Validasi destinationId
    if (!destinationId) {
      console.error("Invalid destination ID");
      alert("ID destinasi tidak valid");
      return;
    }

    try {
      const isInWishlist = wishlistIds.includes(destinationId);
      
      if (isInWishlist) {
        // HAPUS dari wishlist
        console.log("Removing from wishlist...");
        const { error: deleteError } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_id', destinationId);

        if (deleteError) {
          console.error("Delete error:", deleteError);
          throw deleteError;
        }

        // Update state
        setWishlistIds(prev => prev.filter(id => id !== destinationId));
        console.log("Successfully removed from wishlist");
        
      } else {
        // TAMBAH ke wishlist
        console.log("Adding to wishlist...");
        
        // Cek dulu apakah destinasi ada
        const { data: destinationExists, error: checkError } = await supabase
          .from('destinations')
          .select('id')
          .eq('id', destinationId)
          .single();

        if (checkError || !destinationExists) {
          console.error("Destination not found:", checkError);
          throw new Error("Destinasi tidak ditemukan di database");
        }

        // Insert ke wishlist
        const { data: insertData, error: insertError } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            destination_id: destinationId,
            added_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          
          // Jika duplicate, mungkin sudah ditambah di tempat lain
          if (insertError.code === '23505') {
            // Refresh wishlist dan update state
            await fetchUserWishlist(user.id);
            return;
          }
          throw insertError;
        }

        console.log("Insert successful:", insertData);
        
        // Update state
        setWishlistIds(prev => [...prev, destinationId]);
        console.log("Successfully added to wishlist");
      }

      // Refresh wishlist dari database untuk memastikan sinkronisasi
      await fetchUserWishlist(user.id);
      
    } catch (error: any) {
      console.error("Toggle wishlist error:", {
        error,
        message: error.message,
        code: error.code,
        details: error.details
      });
      
      let errorMessage = "Gagal update wishlist";
      
      if (error.code === '23505') {
        errorMessage = "Destinasi sudah ada di wishlist";
      } else if (error.code === '23503') {
        errorMessage = "Destinasi tidak valid";
      } else if (error.code === '42501') {
        errorMessage = "Akses ditolak. Coba login ulang";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setDebugInfo("Error: " + errorMessage);
    }
  };

  // ================= FILTER =================
  const filtered = destinations.filter((d) => {
    const matchCategory = selectedCategory ? d.category === selectedCategory : true;
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  // ================= FORMAT HARGA =================
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // ================= DEBUG PANEL =================
  const showDebugPanel = false; // Set true untuk debugging

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 pt-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading destinasi...</p>
      </div>
    );
  }

  return (
    <>
      {/* HERO SECTION DI ATAS */}
      <Hero />
      
      <div className="max-w-7xl mx-auto p-4 pt-12">
        {/* DEBUG PANEL */}
        {showDebugPanel && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <h3 className="font-semibold text-yellow-800">Debug Info</h3>
            </div>
          </div>
        )}

        {/* HEADER - DIPINDAH KE KIRI (SEBELAH KIRI) */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Temukan Destinasi Impian Anda
              </h1>
              <p className="text-gray-600">
                Jelajahi berbagai destinasi wisata terbaik di Indonesia
              </p>
            </div>
            
            {/* COUNTER DESTINASI DI SEBELAH KANAN */}
            <div className="text-right">
              <span className="text-gray-600">
                Menampilkan {filtered.length} dari {destinations.length} destinasi
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH SECTION - TANPA "CARI DESTINASI FAVORIT ANDA" */}
        <div className="mb-10">
          {/* SEARCH BAR DAN FILTER DI SATU BARIS */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* SEARCH BAR - DI KIRI */}
            <div className="flex-1">
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari destinasi, lokasi, atau deskripsi..."
                  className="w-full px-6 py-4 rounded-full border-2 border-gray-200 outline-none focus:border-[#133740] focus:ring-2 focus:ring-[#133740] transition-all text-gray-800 placeholder-gray-500"
                />
                <Search className="absolute right-5 top-4 text-gray-400" size={20} />
              </div>
            </div>
            
            {/* KATEGORI FILTER - DI KANAN */}
            <div className="flex gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                  className={`px-6 py-3 rounded-full border-2 whitespace-nowrap transition-all font-medium ${
                    selectedCategory === cat
                      ? "bg-[#133740] text-white border-[#133740] shadow-lg"
                      : "bg-white border-gray-300 hover:border-[#133740] hover:[#133740] text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* INFO FILTER AKTIF */}
          {(search || selectedCategory) && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <span className="font-medium text-gray-700">Filter aktif:</span>
                {search && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Pencarian: "{search}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Kategori: {selectedCategory}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(null);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm"
                >
                  Hapus filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* HASIL DESTINASI */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => { 
              const isInWishlist = wishlistIds.includes(item.id);
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative h-56">
                    <Image
                      src={item.image_url || "/default-destination.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={false}
                    />

                    {/* TAG KATEGORI */}
                    <span className="absolute top-3 left-3 bg-[#E0B554] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      {item.category}
                    </span>

                    {/* HEART BUTTON */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all ${
                        isInWishlist 
                          ? "bg-red-50 hover:bg-red-100" 
                          : "bg-white/90 backdrop-blur-sm hover:bg-white"
                      }`}
                      title={isInWishlist ? "Hapus dari wishlist" : "Tambah ke wishlist"}
                    >
                      <Heart
                        size={20}
                        className={
                          isInWishlist
                            ? "fill-[#E0B554] text-[#E0B554]"
                            : "text-gray-600 hover:text-[#E0B554]"
                        }
                      />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="text-sm text-[#E0B554] flex items-center gap-1 mb-2">
                      <MapPin size={14} />
                      <span className="font-medium">{item.location}</span>
                    </div>

                    <h2 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">
                      {item.name}
                    </h2>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[40px]">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm bg-[#A9A9A9] text-white px-3 py-1.5 rounded-full font-semibold">
                        {formatPrice(item.price)}
                      </span>
                     
                      <Link
                        href={`/detaildestinasi/${item.id}`}
                        className="px-5 py-2 bg-[#E0B554] text-white rounded-full hover:bg-[#E0B554] font-medium transition-colors text-sm"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl my-10">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <Search size={96} className="mx-auto opacity-30" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              Destinasi tidak ditemukan
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {search || selectedCategory 
                ? `Tidak ada hasil untuk pencarian "${search || selectedCategory}"`
                : "Belum ada destinasi tersedia. Coba lagi nanti."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSearch("")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium"
              >
                Hapus Pencarian
              </button>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 font-medium"
              >
                Tampilkan Semua Destinasi
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}