"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  FaHeart, 
  FaRegHeart, 
  FaUser, 
  FaRegUser,
  FaTimes,
  FaSignOutAlt,
  FaCog,
  FaHistory,
  FaStar
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    totalWishlist: 0
  });
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  // ================= FETCH USER DATA =================
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch wishlist count
          const { count: wishlistCount } = await supabase
            .from('wishlist')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
          
          setWishlistCount(wishlistCount || 0);

          // Fetch user reviews count
          const { count: reviewsCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
          
          setUserStats(prev => ({
            ...prev,
            totalReviews: reviewsCount || 0,
            totalWishlist: wishlistCount || 0
          }));
        } else {
          setUser(null);
          setWishlistCount(0);
          setUserStats({ totalReviews: 0, totalWishlist: 0 });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        setIsClient(true);
      }
    };

    fetchUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserData();
        } else {
          setUser(null);
          setWishlistCount(0);
          setUserStats({ totalReviews: 0, totalWishlist: 0 });
        }
      }
    );

    // Listen for scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ================= HANDLE LOGOUT =================
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setShowProfilePopup(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ================= HANDLE ICON CLICKS =================
  const handleIconClick = (type: string) => {
    switch (type) {
      case "wishlist": 
        if (!user) {
          router.push('/login?redirect=/wishlist');
        } else {
          router.push("/wishlist");
        }
        break;
      case "profile": 
        if (!user) {
          router.push('/login');
        } else {
          setShowProfilePopup(!showProfilePopup);
        }
        break;
    }
    setOpen(false);
  };

  const navItems = [
    { name: "Beranda", path: "/" },
    { name: "Destinasi", path: "/destinasi" },
  ];

  const isActive = (path: string) => pathname === path;
  const isIconActive = (page: string) => pathname === `/${page}`;

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <nav className="w-full fixed top-0 left-0 bg-[#133740] shadow z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="text-xl font-bold text-[#E0B554]">Geosantara</div>
          <div className="hidden md:flex gap-6">
            <div className="w-24 h-10 bg-[#E0B554]/20 rounded-lg animate-pulse"></div>
            <div className="w-24 h-10 bg-[#E0B554]/20 rounded-lg animate-pulse"></div>
          </div>
          <div className="hidden md:flex gap-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="md:hidden w-10 h-10 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={`
          w-full fixed top-0 left-0 z-50 transition-all duration-500 backdrop-blur-sm
          ${scrolled ? "bg-[#133740]/95 shadow-lg" : "bg-[#133740]"}
        `}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          {/* LOGO */}
          <Link 
            href="/" 
            className="text-xl font-bold text-[#E0B554] hover:opacity-90 transition-opacity"
          >
            Geosantara
          </Link>

          {/* DESKTOP NAV ITEMS */}
          <div className="hidden md:flex gap-6 font-medium">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  transition-all duration-200 px-3 py-2 rounded-lg
                  ${isActive(item.path)
                    ? "text-[#E0B554] font-semibold bg-[#E0B554]/10 border border-[#E0B554]/20"
                    : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/5"
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* DESKTOP ICONS */}
          <div className="hidden md:flex items-center gap-3">
            {/* Wishlist Icon */}
            <button
              onClick={() => handleIconClick("wishlist")}
              className={`
                p-3 rounded-full transition-all duration-300 relative
                ${
                  isIconActive("wishlist")
                    ? "text-[#E0B554] bg-[#E0B554]/10 border border-[#E0B554]/20"
                    : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/5"
                }
              `}
              title={user ? "Wishlist" : "Login untuk melihat wishlist"}
            >
              {isIconActive("wishlist") ? (
                <FaHeart className="w-5 h-5 text-[#E0B554]" />
              ) : (
                <FaRegHeart className="w-5 h-5" />
              )}

              {user && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Profile/Login Icon */}
            <div className="relative">
              <button
                onClick={() => handleIconClick("profile")}
                className={`
                  p-3 rounded-full transition-all duration-300 flex items-center gap-2
                  ${
                    showProfilePopup
                      ? "text-[#E0B554] bg-[#E0B554]/10 border border-[#E0B554]/20"
                      : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/5"
                  }
                `}
                title={user ? user.email : "Login"}
              >
                {user ? (
                  <>
                    <FaUser className="w-5 h-5" />
                    <span className="text-sm font-medium max-w-[120px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                  </>
                ) : (
                  <FaRegUser className="w-5 h-5" />
                )}
              </button>

              {/* Profile Popup */}
              {showProfilePopup && user && (
                <div 
                  className="absolute right-0 top-16 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E0B554] rounded-full flex items-center justify-center">
                        <span className="font-bold text-white text-lg">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FaHeart className="text-red-500 text-sm" />
                          <span className="font-bold text-gray-800">{userStats.totalWishlist}</span>
                        </div>
                        <p className="text-xs text-gray-500">Wishlist</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FaStar className="text-yellow-500 text-sm" />
                          <span className="font-bold text-gray-800">{userStats.totalReviews}</span>
                        </div>
                        <p className="text-xs text-gray-500">Ulasan</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-[#E0B554]/10"
                      onClick={() => setShowProfilePopup(false)}
                    >
                      <FaUser className="text-gray-500" />
                      <span>Profil Saya</span>
                    </Link>
                    
                    <Link 
                      href="/wishlist" 
                      className="flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-[#E0B554]/10"
                      onClick={() => setShowProfilePopup(false)}
                    >
                      <FaHeart className="text-red-500" />
                      <span>Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    
                    <Link 
                      href="/bookings" 
                      className="flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-[#E0B554]/10"
                      onClick={() => setShowProfilePopup(false)}
                    >
                      <FaHistory className="text-blue-500" />
                      <span>Pemesanan</span>
                    </Link>
                    
                    <Link 
                      href="/settings" 
                      className="flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-[#E0B554]/10"
                      onClick={() => setShowProfilePopup(false)}
                    >
                      <FaCog className="text-gray-500" />
                      <span>Pengaturan</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-2xl text-white hover:text-[#E0B554] transition-colors p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <FaTimes /> : "☰"}
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {open && (
          <div className="md:hidden bg-[#133740]">
            <div className="flex flex-col gap-1 p-4 font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`
                    py-3 px-4 rounded-lg transition-all duration-200
                    ${
                      isActive(item.path)
                        ? "bg-[#E0B554]/20 text-[#E0B554] font-semibold border-l-4 border-[#E0B554]"
                        : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/10"
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex justify-between items-center pt-6 border-t border-[#E0B554]/20">
                <div className="flex gap-4 items-center w-full">
                  {/* Mobile Wishlist */}
                  <button
                    onClick={() => handleIconClick("wishlist")}
                    className={`
                      p-3 rounded-full transition-all duration-300 relative
                      ${
                        isIconActive("wishlist")
                          ? "text-[#E0B554] bg-[#E0B554]/10"
                          : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/5"
                      }
                    `}
                  >
                    {isIconActive("wishlist") ? (
                      <FaHeart className="w-6 h-6 text-[#E0B554]" />
                    ) : (
                      <FaRegHeart className="w-6 h-6" />
                    )}
                    
                    {user && wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => handleIconClick("profile")}
                  className={`
                    p-3 rounded-full transition-all duration-300 ml-4
                    ${
                      showProfilePopup
                        ? "text-[#E0B554] bg-[#E0B554]/10"
                        : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/5"
                    }
                  `}
                >
                  {user ? (
                    <FaUser className="w-6 h-6" />
                  ) : (
                    <FaRegUser className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Mobile User Info if logged in */}
              {user && (
                <div className="mt-4 pt-4 border-t border-[#E0B554]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#E0B554] rounded-full flex items-center justify-center">
                      <span className="font-bold text-white text-lg">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.email?.split('@')[0]}</p>
                      <p className="text-sm text-gray-300">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FaHeart className="text-red-400 text-sm" />
                        <span className="font-bold text-white">{userStats.totalWishlist}</span>
                      </div>
                      <p className="text-xs text-gray-300">Wishlist</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="font-bold text-white">{userStats.totalReviews}</span>
                      </div>
                      <p className="text-xs text-gray-300">Ulasan</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE PROFILE POPUP */}
      {showProfilePopup && isClient && user && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 pt-16">
          <div className="bg-white h-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Profil</h3>
              <button
                onClick={() => setShowProfilePopup(false)}
                className="p-2 text-gray-500 hover:text-[#E0B554]"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 bg-[#E0B554] rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-2xl">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-800">
                  {user.email?.split('@')[0]}
                </h4>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="flex gap-6 mb-6 pb-6 border-b border-gray-200">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FaHeart className="text-red-500" />
                  <span className="text-xl font-bold text-gray-800">{userStats.totalWishlist}</span>
                </div>
                <p className="text-sm text-gray-500">Wishlist</p>
              </div>
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FaStar className="text-yellow-500" />
                  <span className="text-xl font-bold text-gray-800">{userStats.totalReviews}</span>
                </div>
                <p className="text-sm text-gray-500">Ulasan</p>
              </div>
            </div>

            <div className="space-y-1">
              <Link 
                href="/profile" 
                className="flex items-center gap-3 w-full p-4 rounded-xl text-left hover:bg-[#E0B554]/10"
                onClick={() => setShowProfilePopup(false)}
              >
                <FaUser className="text-gray-500" />
                <span>Profil Saya</span>
              </Link>
              
              <Link 
                href="/wishlist" 
                className="flex items-center gap-3 w-full p-4 rounded-xl text-left hover:bg-[#E0B554]/10"
                onClick={() => setShowProfilePopup(false)}
              >
                <FaHeart className="text-red-500" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              <Link 
                href="/bookings" 
                className="flex items-center gap-3 w-full p-4 rounded-xl text-left hover:bg-[#E0B554]/10"
                onClick={() => setShowProfilePopup(false)}
              >
                <FaHistory className="text-blue-500" />
                <span>Pemesanan</span>
              </Link>
              
              <Link 
                href="/settings" 
                className="flex items-center gap-3 w-full p-4 rounded-xl text-left hover:bg-[#E0B554]/10"
                onClick={() => setShowProfilePopup(false)}
              >
                <FaCog className="text-gray-500" />
                <span>Pengaturan</span>
              </Link>
              
              {/* LOGIN/LOGOUT BUTTON */}
                      {user ? (
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = "/";
                          }}
                          className="px-5 py-3 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          Logout
                        </button>
                      ) : (
                        <Link
                          href="/login?redirect=/destinasi"
                          className="px-5 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
                        >
                          Login
                        </Link>
                      )}
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL (if not logged in) */}
      {showProfilePopup && isClient && !user && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 pt-16">
          <div className="bg-white h-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Login</h3>
              <button
                onClick={() => setShowProfilePopup(false)}
                className="p-2 text-gray-500 hover:text-[#E0B554]"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#E0B554]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUser className="w-12 h-12 text-[#E0B554]" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Login untuk mengakses fitur lengkap
              </h4>
              <p className="text-gray-500 mb-8">
                Login untuk menambahkan wishlist, memberikan ulasan, dan melihat riwayat pemesanan.
              </p>

              <div className="space-y-4">
                <Link
                  href="/login"
                  className="block w-full py-3 bg-[#E0B554] text-white rounded-xl font-medium text-center hover:bg-[#d4a845]"
                  onClick={() => setShowProfilePopup(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full py-3 border-2 border-[#E0B554] text-[#E0B554] rounded-xl font-medium text-center hover:bg-[#E0B554]/10"
                  onClick={() => setShowProfilePopup(false)}
                >
                  Daftar Akun Baru
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP BACKDROP */}
      {showProfilePopup && isClient && (
        <div
          className="fixed inset-0 z-40 md:block hidden"
          onClick={() => setShowProfilePopup(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}