"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  FaGlobe,
  FaUsers,
  FaHeart,
  FaStar,
  FaChevronRight,
  FaPlus,
  FaImage,
  FaCog
} from 'react-icons/fa';

const ADMIN_EMAIL = "admin@geosantara.com";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    destinations: 0,
    users: 0,
    wishlists: 0,
    reviews: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login?redirect=/admin');
          return;
        }

        // Cek apakah admin
        const adminCheck = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        
        if (!adminCheck) {
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
        
        // Fetch stats
        await fetchStats();
        
      } catch (error) {
        console.error("Auth error:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        // Fetch destinations count
        const { count: destCount } = await supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true });
        
        // Fetch users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch wishlists count
        const { count: wishlistCount } = await supabase
          .from('wishlist')
          .select('*', { count: 'exact', head: true });
        
        // Fetch reviews count
        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });
        
        setStats({
          destinations: destCount || 0,
          users: usersCount || 0,
          wishlists: wishlistCount || 0,
          reviews: reviewsCount || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Stats Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Destinations */}
          <Link 
            href="/admin/destinations" 
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-all hover:scale-[1.02] min-w-0"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-gray-600 text-sm font-medium">Destinasi</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.destinations}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                <FaGlobe className="text-blue-500 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total destinasi wisata</p>
            </div>
          </Link>
          
          {/* Users */}
          <Link 
            href="/admin/users" 
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-all hover:scale-[1.02] min-w-0"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-gray-600 text-sm font-medium">Pengguna</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.users}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg flex-shrink-0">
                <FaUsers className="text-green-500 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total pengguna terdaftar</p>
            </div>
          </Link>
          
          {/* Wishlists */}
          <Link 
            href="/admin/wishlist" 
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-all hover:scale-[1.02] min-w-0"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-gray-600 text-sm font-medium">Wishlist</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.wishlists}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg flex-shrink-0">
                <FaHeart className="text-red-500 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total wishlist pengguna</p>
            </div>
          </Link>
          
          {/* Reviews */}
          <Link 
            href="/admin/reviews" 
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-all hover:scale-[1.02] min-w-0"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-gray-600 text-sm font-medium">Review</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.reviews}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg flex-shrink-0">
                <FaStar className="text-yellow-500 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total ulasan pengguna</p>
            </div>
          </Link>
        </div>

        {/* Quick Actions Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-6">Kelola</h2>

        {/* Quick Actions Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/admin/destinations" 
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaGlobe className="text-blue-500 w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">Kelola Destinasi</h3>
                <p className="text-gray-600 mt-2">Tambah, edit, hapus destinasi wisata</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              <span>Lihat semua destinasi</span>
              <FaChevronRight className="ml-2 w-3 h-3" />
            </div>
          </Link>
          
          <Link 
            href="/admin/users" 
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <FaUsers className="text-green-500 w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">Kelola Pengguna</h3>
                <p className="text-gray-600 mt-2">Lihat dan kelola akun pengguna</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              <span>Lihat semua pengguna</span>
              <FaChevronRight className="ml-2 w-3 h-3" />
            </div>
          </Link>
          
          <Link 
            href="/admin/reviews" 
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FaStar className="text-yellow-500 w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600">Kelola Review</h3>
                <p className="text-gray-600 mt-2">Lihat dan kelola ulasan pengguna</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-yellow-600 text-sm font-medium">
              <span>Lihat semua review</span>
              <FaChevronRight className="ml-2 w-3 h-3" />
            </div>
          </Link>
        </div>

        {/* Aksi Cepat */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Aksi Cepat</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/destinations?action=add"
              className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaPlus className="text-blue-600 w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900">Destinasi Baru</p>
              <p className="text-sm text-gray-500 mt-1">Tambahkan destinasi baru</p>
            </Link>
            
            <Link 
              href="/admin/destinations"
              className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaImage className="text-green-600 w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900">Edit Destinasi</p>
              <p className="text-sm text-gray-500 mt-1">Edit destinasi yang ada</p>
            </Link>
            
            <Link 
              href="/admin/users"
              className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaUsers className="text-purple-600 w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900">Lihat Pengguna</p>
              <p className="text-sm text-gray-500 mt-1">Lihat semua pengguna</p>
            </Link>
            
            <Link 
              href="/admin/settings"
              className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all text-center hover:scale-[1.02]"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaCog className="text-gray-600 w-6 h-6" />
              </div>
              <p className="font-medium text-gray-900">Pengaturan</p>
              <p className="text-sm text-gray-500 mt-1">Ubah pengaturan sistem</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}