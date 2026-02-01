"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Calendar, Users, Heart, 
  ArrowLeft, Share2, Phone, Mail, Globe,
  Navigation, Clock, DollarSign, Shield,
  CheckCircle, ChevronRight, Mountain,
  Sun, CloudSnow, Map, ChevronLeft, ChevronRight as ChevronRightIcon, X,
  User, MessageSquare, Send
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  address?: string;
  category: string;
  image_url?: string;
  gallery_images?: string[];
  price: number;
  rating: number;
  total_reviews: number;
  difficulty?: string;
  best_time?: string;
  elevation?: string;
  facilities?: string[];
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  is_own_review?: boolean;
}

interface PriceTable {
  day_type: string;
  wni_price: number;
  wna_price: number;
}

interface NewReview {
  comment: string;
}

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const destinationId = params.id as string;
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarDestinations, setSimilarDestinations] = useState<Destination[]>([]);
  const [priceTable, setPriceTable] = useState<PriceTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'similar'>('overview');
  
  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState<NewReview>({
    comment: ""
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch destination details
      const { data: destData, error: destError } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', destinationId)
        .single();

      if (destError) {
        console.error("Error fetching destination:", destError);
        router.push("/destinasi");
        return;
      }

      setDestination(destData);

      // Setup gallery images
      const images = destData.gallery_images || [];
      if (destData.image_url) {
        setGalleryImages([destData.image_url, ...images]);
      } else {
        setGalleryImages(images);
      }

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('destination_id', destinationId)
        .order('created_at', { ascending: false });

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData);
      } else {
        // Fallback to mock reviews if no reviews table
        const mockReviews: Review[] = [
          {
            id: "1",
            user_id: "user1",
            user_name: "Jack Sparrow",
            rating: 5,
            comment: "Pengalaman sunrise di Bromo tidak terhapuskan. Berangkat dari penginapan jam 2 pagi, sampai di sini suasana masih sepi dan dingin, tapi begitu matahari mulai terbit, semua lelah terbayar. Pemandangan yang spektakuler!",
            created_at: "2024-01-15",
          },
          {
            id: "2",
            user_id: "user2",
            user_name: "Siti Nurhaliza",
            rating: 4,
            comment: "View sunrise yang sangat indah. Hanya saja cukup ramai di weekend, lebih baik datang weekdays. Dinginnya luar biasa, jangan lupa bawa jaket tebal!",
            created_at: "2024-01-10",
          },
          {
            id: "3",
            user_id: "user3",
            user_name: "Budi Pratama",
            rating: 5,
            comment: "Kedua kalinya kesini dan tetap mengesankan. Jeep tour menyenangkan, guide-nya ramah. Recomended banget untuk keluarga!",
            created_at: "2024-01-05",
          },
        ];
        setReviews(mockReviews);
      }

      // Fetch similar destinations
      const { data: similarData } = await supabase
        .from('destinations')
        .select('*')
        .eq('category', destData.category)
        .neq('id', destinationId)
        .limit(3);

      setSimilarDestinations(similarData || []);

      // Set price table
      setPriceTable([
        { day_type: "Hari Kerja", wni_price: destData.price || 54000, wna_price: 255000 },
        { day_type: "Hari Libur", wni_price: 79000, wna_price: 255000 },
      ]);

      // Check if in wishlist
      if (user) {
        const { data: wishlistData } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('destination_id', destinationId)
          .single();
        
        setIsInWishlist(!!wishlistData);
      }

    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      fetchData();
    }
  }, [destinationId, router, user]);

  // ================= TOGGLE WISHLIST =================
  const toggleWishlist = async () => {
    if (!user) {
      alert("Login dulu untuk menambahkan ke wishlist");
      router.push(`/login?redirect=/detaildestinasi/${destinationId}`);
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('destination_id', destinationId);

        if (error) throw error;
        setIsInWishlist(false);
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            destination_id: destinationId,
            notes: `Tertarik dengan ${destination?.name}`
          });

        if (error) throw error;
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Gagal update wishlist");
    }
  };

 
  // ================= GALLERY FUNCTIONS =================
  const nextImage = () => {
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1
      );
    }
  };

  // ================= FORMAT HARGA =================
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Destinasi Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Destinasi yang Anda cari tidak tersedia.</p>
          <Link
            href="/destinasi"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Destinasi
          </Link>
        </div>
      </div>
    );
  }

  // Calculate average rating (use default rating if no reviews)
  const averageRating = destination.rating || (reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 4.5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <div className="relative h-[70vh] min-h-[500px] bg-gray-900">
        {galleryImages.length > 0 ? (
          <Image
            src={galleryImages[0]}
            alt={destination.name}
            fill
            className="object-cover"
            priority
            quality={85}
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-600" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* OVERLAY CONTENT */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12">
          {/* BACK BUTTON */}
          <Link
            href="/destinasi"
            className="absolute top-8 left-4 inline-flex items-center gap-2 text-white hover:text-green-300 transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft size={20} />
            Kembali
          </Link>
          
          {/* ACTION BUTTONS */}
          <div className="absolute top-8 right-4 flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link berhasil disalin!");
              }}
              className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              title="Bagikan"
            >
              <Share2 size={20} />
            </button>
            
            <button
              onClick={toggleWishlist}
              className={`p-3 rounded-full transition-colors ${
                isInWishlist
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              }`}
              title={isInWishlist ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
            >
              <Heart 
                size={20} 
                className={isInWishlist ? "fill-white" : ""}
              />
            </button>
          </div>
          
          {/* DESTINATION INFO */}
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                {destination.category}
              </span>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin size={16} />
                <span>{destination.location}</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {destination.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">{averageRating.toFixed(1)}</span>
                <span className="text-white/80">({reviews.length} ulasan)</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/90">
                <Mountain size={20} />
                <span>{destination.elevation || "2,329 mdpl"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/90">
                <Sun size={20} />
                <span>{destination.best_time || "April - Oktober"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GALLERY THUMBNAILS */}
      {galleryImages.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {galleryImages.slice(0, 5).map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform"
              >
                <Image
                  src={img}
                  alt={`${destination.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                {index === 4 && galleryImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      +{galleryImages.length - 5}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - CONTENT */}
          <div className="lg:col-span-2">
            {/* TABS NAVIGATION */}
            <div className="flex border-b border-gray-200 mb-8 bg-white rounded-t-2xl p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-3 font-medium border-b-2 transition-all rounded-lg ${
                  activeTab === 'overview'
                    ? "border-green-600 text-green-600 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Gambaran Umum
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-6 py-3 font-medium border-b-2 transition-all rounded-lg ${
                  activeTab === 'reviews'
                    ? "border-green-600 text-green-600 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Ulasan ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={`flex-1 px-6 py-3 font-medium border-b-2 transition-all rounded-lg ${
                  activeTab === 'similar'
                    ? "border-green-600 text-green-600 bg-green-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Destinasi Serupa
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-lg overflow-hidden">
              {activeTab === 'overview' && (
                <div className="p-8">
                  {/* DESCRIPTION */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Tentang {destination.name}
                    </h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
                      <p>{destination.description}</p>
                      
                      <p>
                        <strong>{destination.name}</strong> adalah gunung api aktif di Jawa Timur yang terkenal dengan pemandangan matahari terbitnya dan berada di dalam kawasan Taman Nasional Bromo Tengger. Gunung ini memiliki ketinggian 2,329 meter di atas permukaan laut dan dikelilingi oleh "Laut Pasir" yang luas.
                      </p>
                      
                      <p>
                        Keunikan Bromo tidak hanya terletak pada keindahan alamnya, tetapi juga pada nilai budaya spiritual bagi masyarakat Suku Tengger, yang mengadakan upacara Yadnya Kasada di sana.
                      </p>
                      
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Letak dan Geografis</h3>
                      <p>
                        Gunung Bromo terletak dalam kawasan Kaldera Tengger dengan diameter sekitar 10 km. Dikelilingi oleh pegunungan seperti Gunung Batok (2,470 mdpl) dan Gunung Semeru (3,676 mdpl) sebagai gunung tertinggi di Pulau Jawa.
                      </p>
                    </div>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Mountain className="text-green-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Detail Gunung</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-green-100">
                          <span className="text-gray-600">Ketinggian</span>
                          <span className="font-bold text-green-700">2,329 mdpl</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-green-100">
                          <span className="text-gray-600">Tipe Gunung</span>
                          <span className="font-medium">Stratovolcano</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Letusan Terakhir</span>
                          <span className="font-medium">2016</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Sun className="text-yellow-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Waktu Terbaik</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-yellow-100">
                          <span className="text-gray-600">Musim Kunjungan</span>
                          <span className="font-bold text-yellow-700">April - Oktober</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-yellow-100">
                          <span className="text-gray-600">Sunrise View</span>
                          <span className="font-medium">04:30 - 06:00 WIB</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Suhu Rata-rata</span>
                          <span className="font-medium">5°C - 15°C</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FACILITIES */}
                  {destination.facilities && destination.facilities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-600" />
                        Fasilitas Tersedia
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {destination.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 hover:border-green-300 transition-colors"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="p-8">
                  {/* REVIEW HEADER */}
                  <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ulasan Pengunjung</h2>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
                          <span className="text-gray-500">• {reviews.length} ulasan</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center gap-2"
                      >
                        <MessageSquare size={20} />
                        Tambah Ulasan
                      </button>
                    </div>
                  </div>

                  {/* REVIEW FORM MODAL */}
                  {showReviewForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Tambah Ulasan</h3>
                            <button
                              onClick={() => setShowReviewForm(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={24} />
                            </button>
                          </div>
                          
                          <div className="space-y-6">
                            {/* Optional Name and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nama (opsional)
                                </label>
                                <input
                                  type="text"
                                  value={userName}
                                  onChange={(e) => setUserName(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Nama Anda"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email (opsional)
                                </label>
                                <input
                                  type="email"
                                  value={userEmail}
                                  onChange={(e) => setUserEmail(e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="email@contoh.com"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ulasan Anda *
                              </label>
                              <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows={5}
                                placeholder="Bagikan pengalaman Anda mengunjungi destinasi ini..."
                                maxLength={500}
                                required
                              />
                              <div className="text-right text-sm text-gray-500 mt-1">
                                {newReview.comment.length}/500 karakter
                              </div>
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-xl">
                              <p className="text-sm text-blue-800">
                                💡 Ulasan Anda akan dipublikasikan dengan nama yang Anda berikan. Jika tidak mengisi nama, akan menggunakan nama anonym.
                              </p>
                            </div>
                            
                            <div className="flex gap-3">
                              <button
                                onClick={() => setShowReviewForm(false)}
                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                disabled={submittingReview}
                              >
                                Batal
                              </button>
                              <button
                          onClick={() => {}}
                                disabled={submittingReview || !newReview.comment.trim()}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {submittingReview ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Mengirim...
                                  </>
                                ) : (
                                  <>
                                    <Send size={20} />
                                    Kirim Ulasan
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REVIEWS LIST */}
                  <div className="space-y-8">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="pb-8 border-b border-gray-200 last:border-0">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                                  <span className="font-bold text-green-700 text-lg">
                                    {review.user_name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">{review.user_name}</h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <p className="text-gray-700 text-lg leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Ulasan</h3>
                        <p className="text-gray-500 mb-6">
                          Jadilah yang pertama memberikan ulasan untuk {destination.name}
                        </p>
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
                        >
                          Tambah Ulasan Pertama
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'similar' && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Destinasi Serupa</h2>
                    <p className="text-gray-600">
                      Jelajahi destinasi lainnya yang serupa dengan {destination.name}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {similarDestinations.map((similar) => (
                      <div key={similar.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-green-500 transition-colors">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={similar.image_url || "/default-destination.jpg"}
                            alt={similar.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">{similar.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600">{similar.location}</span>
                              </div>
                            </div>
                            <div className="text-gray-600">
                              {similar.rating?.toFixed(1) || "4.5"}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {similar.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-green-700">
                              {formatPrice(similar.price)}
                              <span className="text-sm text-gray-500"> /orang</span>
                            </span>
                            <Link
                              href={`/detaildestinasi/${similar.id}`}
                              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                            >
                              Lihat Detail
                              <ChevronRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {similarDestinations.length === 0 && (
                    <div className="text-center py-12">
                      <CloudSnow className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Belum ada destinasi serupa</p>
                    </div>
                  )}

                  <Link
                    href="/destinasi"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
                  >
                    Jelajahi Semua Destinasi
                    <ChevronRight size={20} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="space-y-6">
            {/* PRICE TABLE CARD */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Harga Tiket Masuk</h3>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-200">
                        Hari
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-200">
                        WNI
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">
                        WNA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceTable.map((price, index) => (
                      <tr 
                        key={index}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="py-3 px-4 border-r border-gray-200 font-medium">
                          {price.day_type}
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className="font-bold text-green-700">
                            {formatPrice(price.wni_price)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-green-700">
                            {formatPrice(price.wna_price)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tips:</strong> Tiket bisa dibeli online atau di loket masuk. Diskon berlaku untuk pelajar dan kelompok besar.
                </p>
              </div>
            </div>

            {/* BOOKING CARD */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-green-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Pesan Sekarang</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Harga per orang</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatPrice(destination.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Rating</p>
                    <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (!user) {
                      alert("Login dulu untuk melakukan booking");
                      router.push(`/login?redirect=/detaildestinasi/${destinationId}`);
                      return;
                    }
                    // TODO: Implement booking
                    alert("Fitur booking akan segera hadir!");
                  }}
                  className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg"
                >
                  Booking Sekarang
                </button>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Shield className="text-green-600" size={24} />
                  <div>
                    <p className="font-medium text-green-800">Booking Aman</p>
                    <p className="text-sm text-green-700">Garansi uang kembali</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT & INFO */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Kontak</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Customer Service</p>
                    <p className="text-gray-600">1500-123</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">info@geosantara.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Globe className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Website</p>
                    <p className="text-gray-600">www.geosantara.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Map className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Alamat</p>
                    <p className="text-gray-600">Jl. Wisata No. 123, Malang</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => window.open('https://maps.google.com', '_blank')}
                  className="w-full py-3 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 font-medium flex items-center justify-center gap-2"
                >
                  <Navigation size={20} />
                  Buka di Google Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE LIGHTBOX MODAL */}
      {selectedImageIndex !== null && galleryImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
            <Image
              src={galleryImages[selectedImageIndex]}
              alt={`${destination.name} ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <button
            onClick={nextImage}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronRightIcon size={32} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full">
            {selectedImageIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </div>
  );
}