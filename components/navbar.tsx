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
  FaStar,
  FaGlobe,
  FaChevronRight,
  FaShieldAlt,
  FaHome,
  FaUsers,
  FaImage
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "admin@geosantara.com";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    totalDestinations: 0
  });
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    totalWishlist: 0,
    totalDestinations: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // ================= FETCH USER DATA =================
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Check if user is admin
          const userEmail = session.user.email?.toLowerCase();
          const isAdminUser = userEmail === ADMIN_EMAIL.toLowerCase();
          setIsAdmin(isAdminUser);
          
          // Fetch user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUserProfile({
              name: profile.full_name || session.user.email?.split('@')[0] || "User",
              username: profile.username || `@${session.user.email?.split('@')[0]}` || "@user",
              totalDestinations: 0
            });
          } else {
            // Fallback to email if no profile
            const username = session.user.email?.split('@')[0] || "user";
            setUserProfile({
              name: username.charAt(0).toUpperCase() + username.slice(1),
              username: `@${username}`,
              totalDestinations: 0
            });
          }

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
          
          // Fetch user's visited destinations count
          const { count: destinationsCount } = await supabase
            .from('user_destinations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
          
          setUserStats({
            totalReviews: reviewsCount || 0,
            totalWishlist: wishlistCount || 0,
            totalDestinations: destinationsCount || (isAdminUser ? 0 : 6) // Default 6 for non-admin
          });
          
          // Update userProfile with actual destinations count
          setUserProfile(prev => ({
            ...prev,
            totalDestinations: destinationsCount || (isAdminUser ? 0 : 6)
          }));
        } else {
          setUser(null);
          setIsAdmin(false);
          setWishlistCount(0);
          setUserStats({ totalReviews: 0, totalWishlist: 0, totalDestinations: 0 });
          setUserProfile({ name: "", username: "", totalDestinations: 0 });
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
          
          // Check if user is admin
          const userEmail = session.user.email?.toLowerCase();
          const isAdminUser = userEmail === ADMIN_EMAIL.toLowerCase();
          setIsAdmin(isAdminUser);
          
          await fetchUserData();
        } else {
          setUser(null);
          setIsAdmin(false);
          setWishlistCount(0);
          setUserStats({ totalReviews: 0, totalWishlist: 0, totalDestinations: 0 });
          setUserProfile({ name: "", username: "", totalDestinations: 0 });
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

  // Add admin menu items if user is admin
  if (isAdmin) {
    navItems.push({ name: "Admin Panel", path: "/admin" });
  }

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
                  transition-all duration-200 px-3 py-2 rounded-lg flex items-center gap-2
                  ${isActive(item.path)
                    ? "text-[#E0B554] font-semibold bg-[#E0B554]/10 border border-[#E0B554]/20"
                    : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/5"
                  }
                  ${item.name === "Admin Panel" ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20" : ""}
                `}
              >
                {item.name === "Admin Panel" && <FaShieldAlt className="w-4 h-4" />}
                {item.name}
              </Link>
            ))}
          </div>

          {/* DESKTOP ICONS */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin Badge */}
            {isAdmin && (
              <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full flex items-center gap-2">
                <FaShieldAlt className="w-4 h-4" />
                <span>ADMIN</span>
              </div>
            )}

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
                ${isAdmin ? "opacity-80" : ""}
              `}
              title={user ? "Wishlist" : "Login untuk melihat wishlist"}
              disabled={isAdmin}
            >
              {isIconActive("wishlist") ? (
                <FaHeart className="w-5 h-5 text-[#E0B554]" />
              ) : (
                <FaRegHeart className="w-5 h-5" />
              )}

              {user && !isAdmin && wishlistCount > 0 && (
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
                title={user ? (isAdmin ? "Admin Dashboard" : user.email) : "Login"}
              >
                {user ? (
                  <>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isAdmin 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                        : "bg-[#E0B554]"
                    }`}>
                      <span className="font-bold text-white text-sm">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium max-w-[120px] truncate">
                        {userProfile.name}
                      </div>
                      <div className="text-xs text-gray-300 truncate max-w-[120px]">
                        {isAdmin ? "Administrator" : user.email}
                      </div>
                    </div>
                  </>
                ) : (
                  <FaRegUser className="w-5 h-5" />
                )}
              </button>

              {/* Profile Popup */}
              {showProfilePopup && user && (
                <div 
                  className="absolute right-0 top-16 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-4 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header Profile */}
                  <div className="px-6 pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
                        isAdmin 
                          ? "bg-gradient-to-br from-purple-600 to-pink-600" 
                          : "bg-gradient-to-br from-[#E0B554] to-[#d4a845]"
                      }`}>
                        <span className="font-bold text-white text-xl">
                          {userProfile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg truncate">
                          {userProfile.name}
                          {isAdmin && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full">
                              ADMIN
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    {/* User Stats Row */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 mb-1">Wishlist</p>
                        <div className="flex items-center justify-center gap-1">
                          <FaHeart className={`${isAdmin ? "text-gray-400" : "text-red-500"}`} />
                          <span className="font-bold text-gray-800 text-lg">
                            {isAdmin ? "∞" : userStats.totalWishlist}
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 mb-1">Review</p>
                        <div className="flex items-center justify-center gap-1">
                          <FaStar className="text-yellow-500" />
                          <span className="font-bold text-gray-800 text-lg">{userStats.totalReviews}</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 mb-1">Destinasi</p>
                        <div className="flex items-center justify-center">
                          <span className="font-bold text-gray-800 text-lg">
                            {isAdmin ? "∞" : userStats.totalDestinations}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1 px-2">
                    {/* Admin Menu Items */}
                    {isAdmin && (
                      <>
                        <Link 
                          href="/admin" 
                          className="flex items-center gap-4 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 rounded-lg"
                          onClick={() => setShowProfilePopup(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                            <FaShieldAlt className="text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Admin Dashboard</p>
                            <p className="text-xs text-gray-500">Kelola sistem</p>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/admin/destinations" 
                          className="flex items-center gap-4 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 rounded-lg"
                          onClick={() => setShowProfilePopup(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                            <FaImage className="text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Kelola Destinasi</p>
                            <p className="text-xs text-gray-500">Tambah/edit destinasi</p>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/admin/users" 
                          className="flex items-center gap-4 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 rounded-lg"
                          onClick={() => setShowProfilePopup(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Kelola User</p>
                            <p className="text-xs text-gray-500">Lihat semua pengguna</p>
                          </div>
                        </Link>
                        
                        <div className="my-2 border-t border-gray-100"></div>
                      </>
                    )}

                    {/* Regular User Menu Items */}
                    {!isAdmin && (
                      <>
                        <Link 
                          href="/wishlist" 
                          className="flex items-center gap-4 px-4 py-3 text-left text-gray-700 hover:bg-[#E0B554]/10 rounded-lg"
                          onClick={() => setShowProfilePopup(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                            <FaHeart className="text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Wishlist</p>
                            <p className="text-xs text-gray-500">{userStats.totalWishlist} item tersimpan</p>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/reviews" 
                          className="flex items-center gap-4 px-4 py-3 text-left text-gray-700 hover:bg-[#E0B554]/10 rounded-lg"
                          onClick={() => setShowProfilePopup(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg flex items-center justify-center">
                            <FaStar className="text-yellow-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Review</p>
                            <p className="text-xs text-gray-500">{userStats.totalReviews} ulasan diberikan</p>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/destinasi" 
                          className="flex items-center gap-4 px-4 py-3 text-left text-gray-700 hover:bg-[#E0B554]/10 rounded-lg"
                          onClick={() => setShowProfilePopup(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                            <FaGlobe className="text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Destinasi</p>
                            <p className="text-xs text-gray-500">{userStats.totalDestinations} destinasi dikunjungi</p>
                          </div>
                        </Link>
                      </>
                    )}

                    {/* Common Menu Items */}
                    <Link 
                      href="/profile/settings" 
                      className="flex items-center gap-4 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setShowProfilePopup(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center">
                        <FaCog className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Pengaturan</p>
                        <p className="text-xs text-gray-500">Ubah profil & password</p>
                      </div>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100 px-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                        <FaSignOutAlt className="text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">Logout</p>
                        <p className="text-xs text-gray-500">Keluar dari akun</p>
                      </div>
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
                    py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                    ${
                      isActive(item.path)
                        ? "bg-[#E0B554]/20 text-[#E0B554] font-semibold border-l-4 border-[#E0B554]"
                        : "text-white hover:text-[#E0B554] hover:bg-[#E0B554]/10"
                    }
                    ${item.name === "Admin Panel" ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20" : ""}
                  `}
                >
                  {item.name === "Admin Panel" && <FaShieldAlt className="w-4 h-4" />}
                  {item.name}
                </Link>
              ))}

              <div className="flex justify-between items-center pt-6 border-t border-[#E0B554]/20">
                <div className="flex gap-4 items-center w-full">
                  {/* Admin Badge Mobile */}
                  {isAdmin && (
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full flex items-center gap-2">
                      <FaShieldAlt className="w-3 h-3" />
                      <span>ADMIN</span>
                    </div>
                  )}

                  {/* Mobile Wishlist */}
                  {!isAdmin && (
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
                  )}
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isAdmin 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                        : "bg-[#E0B554]"
                    }`}>
                      <span className="font-bold text-white text-sm">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <FaRegUser className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Mobile User Info if logged in */}
              {user && (
                <div className="mt-4 pt-4 border-t border-[#E0B554]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isAdmin 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                        : "bg-[#E0B554]"
                    }`}>
                      <span className="font-bold text-white text-lg">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{userProfile.name}</p>
                      {isAdmin && (
                        <p className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full inline-block mt-1">
                          ADMIN
                        </p>
                      )}
                      <p className="text-sm text-gray-300 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  {!isAdmin && (
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
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FaGlobe className="text-blue-400 text-sm" />
                          <span className="font-bold text-white">{userStats.totalDestinations}</span>
                        </div>
                        <p className="text-xs text-gray-300">Destinasi</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE PROFILE POPUP */}
      {showProfilePopup && isClient && user && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-50 pt-16">
          <div className="bg-white h-full rounded-t-3xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className={`text-white p-6 ${isAdmin 
              ? "bg-gradient-to-br from-purple-700 to-pink-700" 
              : "bg-gradient-to-br from-[#133740] to-[#1a4a5a]"
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Profile {isAdmin && "(Admin)"}</h3>
                <button
                  onClick={() => setShowProfilePopup(false)}
                  className="p-2 text-white hover:text-[#E0B554]"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                  isAdmin 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                    : "bg-gradient-to-br from-[#E0B554] to-[#d4a845]"
                }`}>
                  <span className="font-bold text-white text-2xl">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl mb-1">
                    {userProfile.name}
                    {isAdmin && (
                      <span className="ml-2 text-xs bg-white/30 text-white px-2 py-1 rounded-full">
                        ADMIN
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-200 truncate">{user.email}</p>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FaHeart className={isAdmin ? "text-gray-300" : "text-red-300"} />
                    <span className="font-bold text-xl">
                      {isAdmin ? "∞" : userStats.totalWishlist}
                    </span>
                  </div>
                  <p className="text-xs text-gray-200">Wishlist</p>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FaStar className="text-yellow-300" />
                    <span className="font-bold text-xl">{userStats.totalReviews}</span>
                  </div>
                  <p className="text-xs text-gray-200">Review</p>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FaGlobe className="text-blue-300" />
                    <span className="font-bold text-xl">
                      {isAdmin ? "∞" : userStats.totalDestinations}
                    </span>
                  </div>
                  <p className="text-xs text-gray-200">Destinasi</p>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="p-4 space-y-2">
              <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wider px-2 mb-2">
                {isAdmin ? "Admin Menu" : "Menu"}
              </h4>
              
              {/* Admin Menu Items */}
              {isAdmin && (
                <>
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-4 w-full p-4 bg-gray-50 rounded-xl hover:bg-purple-50"
                    onClick={() => setShowProfilePopup(false)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                      <FaShieldAlt className="text-purple-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Admin Dashboard</p>
                      <p className="text-xs text-gray-500">Kelola sistem Geosantara</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </Link>
                  
                  <Link 
                    href="/admin/destinations" 
                    className="flex items-center gap-4 w-full p-4 bg-gray-50 rounded-xl hover:bg-purple-50"
                    onClick={() => setShowProfilePopup(false)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <FaImage className="text-blue-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Kelola Destinasi</p>
                      <p className="text-xs text-gray-500">Tambah/edit destinasi wisata</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </Link>
                  
                  <div className="my-2 border-t border-gray-100"></div>
                </>
              )}

              {/* Regular User Menu Items */}
              {!isAdmin && (
                <>
                  <Link 
                    href="/wishlist" 
                    className="flex items-center gap-4 w-full p-4 bg-gray-50 rounded-xl hover:bg-[#E0B554]/10"
                    onClick={() => setShowProfilePopup(false)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                      <FaHeart className="text-red-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Wishlist</p>
                      <p className="text-xs text-gray-500">{userStats.totalWishlist} destinasi tersimpan</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </Link>
                  
                  <Link 
                    href="/reviews" 
                    className="flex items-center gap-4 w-full p-4 bg-gray-50 rounded-xl hover:bg-[#E0B554]/10"
                    onClick={() => setShowProfilePopup(false)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg flex items-center justify-center">
                      <FaStar className="text-yellow-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Review</p>
                      <p className="text-xs text-gray-500">{userStats.totalReviews} ulasan diberikan</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </Link>
                  
                  <Link 
                    href="/destinasi" 
                    className="flex items-center gap-4 w-full p-4 bg-gray-50 rounded-xl hover:bg-[#E0B554]/10"
                    onClick={() => setShowProfilePopup(false)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <FaGlobe className="text-blue-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Destinasi</p>
                      <p className="text-xs text-gray-500">{userStats.totalDestinations} destinasi dikunjungi</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </Link>
                </>
              )}

              {/* Common Menu Items */}
              <Link 
                href="/profile/settings" 
                className="flex items-center gap-4 w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
                onClick={() => setShowProfilePopup(false)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center">
                  <FaCog className="text-gray-500 w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Pengaturan</p>
                  <p className="text-xs text-gray-500">Ubah profil & password</p>
                </div>
                <FaChevronRight className="text-gray-400" />
              </Link>
            </div>
            
            {/* Logout Button */}
            <div className="p-4 mt-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                  <FaSignOutAlt className="text-red-500 w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Logout</p>
                  <p className="text-xs text-red-500">Keluar dari akun Anda</p>
                </div>
                <FaChevronRight className="text-red-400" />
              </button>
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