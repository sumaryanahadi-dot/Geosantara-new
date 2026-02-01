"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Trash2, Heart, AlertCircle, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Destination {
  id: string;
  name: string;
  location: string;
  price: number;
  image_url?: string;
  category: string;
  rating: number;
  description: string;
}

interface WishlistItem {
  id: string;
  user_id: string;
  destination_id: string;
  added_at: string;
  notes?: string;
  destinations: Destination;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // ================= FETCH WISHLIST =================
  const fetchWishlist = useCallback(async (userId: string) => {
    try {
      console.log("🔍 Fetching wishlist for user:", userId);
      
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          destinations (*)
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error("❌ Error fetching wishlist:", error);
        setError("Gagal mengambil data wishlist");
        return;
      }

      console.log("✅ Wishlist data received:", data?.length || 0, "items");
      
      // Type assertion dengan safety check
      if (data) {
        const typedData = data.map(item => ({
          ...item,
          destinations: Array.isArray(item.destinations) 
            ? item.destinations[0] 
            : item.destinations
        })) as WishlistItem[];
        
        setWishlist(typedData);
      } else {
        setWishlist([]);
      }
      
    } catch (err) {
      console.error("❌ Fetch wishlist error:", err);
      setError("Terjadi kesalahan saat mengambil wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= CEK AUTH & LOAD DATA =================
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        console.log("🔐 Checking authentication...");
        
        // 1. Cek session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("📋 Session:", session?.user?.email);
        
        if (!mounted) return;
        
        if (!session?.user) {
          console.log("🚫 No user, redirecting to login");
          setLoading(false);
          window.location.href = "/login?redirect=/wishlist";
          return;
        }
        
        // 2. Set user
        setUser(session.user);
        
        // 3. Fetch wishlist
        await fetchWishlist(session.user.id);
        
      } catch (err) {
        console.error("❌ Initialize error:", err);
        if (mounted) {
          setError("Gagal memeriksa autentikasi");
          setLoading(false);
        }
      }
    };

    initialize();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, [fetchWishlist]);

  // ================= LISTEN FOR AUTH CHANGES =================
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event);
        
        if (session?.user) {
          setUser(session.user);
          await fetchWishlist(session.user.id);
        } else {
          setUser(null);
          setWishlist([]);
          if (event === 'SIGNED_OUT') {
            window.location.href = "/login?redirect=/wishlist";
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchWishlist]);

  // ================= HAPUS DARI WISHLIST =================
  const removeFromWishlist = async (destinationId: string) => {
    if (!user) return;

    try {
      console.log("🗑️ Removing from wishlist:", destinationId);
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('destination_id', destinationId);

      if (error) {
        console.error("❌ Delete error:", error);
        alert("Gagal menghapus dari wishlist");
        return;
      }

      // Optimistic update
      setWishlist(prev => 
        prev.filter(item => item.destination_id !== destinationId)
      );
      
      console.log("✅ Successfully removed from wishlist");
      
    } catch (err) {
      console.error("❌ Remove error:", err);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  // ================= HELPER FUNCTIONS =================
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 pt-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-500">Memuat wishlist...</p>
          <p className="text-sm text-gray-400 mt-2">User: {user?.email || "Checking..."}</p>
        </div>
      </div>
    );
  }

  // ================= ERROR STATE =================
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 pt-24">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-500" size={24} />
            <h2 className="text-xl font-semibold text-red-800">Error</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => user && fetchWishlist(user.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Coba Lagi
            </button>
            <Link
              href="/destinasi"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Ke Destinasi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= EMPTY STATE =================
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-4 pt-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="text-gray-400" size={64} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Akses Ditolak
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md">
            Anda perlu login untuk melihat wishlist.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login?redirect=/wishlist"
              className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 font-medium"
            >
              Login
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 font-medium"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 pt-24">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Heart className="text-gray-400" size={64} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Wishlist Kamu Kosong
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md">
            Belum ada destinasi yang disimpan. Jelajahi destinasi menarik dan tambahkan ke wishlist!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/destinasi"
              className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 font-medium"
            >
              Jelajahi Destinasi
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 font-medium"
            >
              Kembali ke Beranda
            </Link>
          </div>
          
          
        </div>
      </div>
    );
  }

  // ================= MAIN CONTENT =================
  return (
    <div className="max-w-7xl mx-auto p-4 pt-24">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Wishlist Saya
            </h1>
            <p className="text-gray-600">
              {wishlist.length} destinasi tersimpan
            </p>
          </div>
          
          <div className="flex items-center gap-3">
          </div>
        </div>
      </div>

      {/* GRID WISHLIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* IMAGE */}
            <div className="relative h-48">
              <Image
                src={item.destinations.image_url || "/default-destination.jpg"}
                alt={item.destinations.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* BADGE */}
              <span className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium">
                {item.destinations.category}
              </span>
              
              {/* DATE */}
              <span className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {formatDate(item.added_at)}
              </span>
              
              {/* RATING */}
              <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                ⭐ {item.destinations.rating?.toFixed(1) || "4.5"}
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-5">
              <div className="text-sm text-green-600 flex items-center gap-1 mb-1">
                <MapPin size={14} />
                {item.destinations.location}
              </div>

              <h2 className="text-xl font-bold mb-2 line-clamp-1">
                {item.destinations.name}
              </h2>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {item.destinations.description}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-700">
                  {formatPrice(item.destinations.price)}
                  <span className="text-sm text-gray-500"> /orang</span>
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => removeFromWishlist(item.destination_id)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm font-medium">Hapus</span>
                  </button>
                  
                  <Link
                    href={`/detaildestinasi/${item.destination_id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600">
            <p className="font-medium">Total: {wishlist.length} destinasi</p>
          </div>
          
          <div className="flex gap-4">
            <Link
              href="/destinasi"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              <ShoppingBag size={16} className="inline mr-2" />
              Tambah Lagi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}