"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner,
  FaCheckCircle,
  FaArrowRight,
  FaGlobe,
  FaLeaf
} from "react-icons/fa";

const ADMIN_EMAIL = "admin@geosantara.com";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoginSuccess(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email atau password salah.");
        } else {
          setError(`Error: ${error.message}`);
        }
        return;
      }

      setLoginSuccess(true);
      setSuccess("Login berhasil! Mengarahkan...");

      setTimeout(() => {
        const userEmail = data.user?.email?.toLowerCase();
        const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
        
        if (isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = redirect;
        }
      }, 1500);

    } catch (err: any) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#133740] to-[#0a1f26] px-4">
      {/* Hero Section */}
      <div className="pt-16 pb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Selamat Datang di <span className="text-[#E0B554]">Geosantara</span>
        </h1>
        <p className="text-gray-300 max-w-md mx-auto">
          Temukan keindahan alam Indonesia dan rencanakan petualangan Anda
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Success Message */}
        {loginSuccess && (
          <div className="mb-6 p-6 bg-green-500/20 border border-green-500/30 rounded-xl">
            <div className="flex flex-col items-center text-center">
              <FaCheckCircle className="text-green-400 text-4xl mb-3 animate-bounce" />
              <h3 className="text-xl font-bold text-green-200 mb-2">Login Berhasil! </h3>
              <p className="text-green-300 mb-4">Mengarahkan ke dashboard...</p>
              <div className="w-64 bg-green-900/30 rounded-full h-2 overflow-hidden mb-4">
                <div className="bg-green-400 h-full rounded-full animate-progress"></div>
              </div>
              <button
                onClick={() => {
                  const isAdmin = formData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                  window.location.href = isAdmin ? '/admin' : '/';
                }}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 animate-pulse"
              >
                <span>Lanjut Sekarang</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Tampilkan form hanya jika belum login success */}
        {!loginSuccess && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Masuk ke Akun Anda</h2>
              <p className="text-gray-300">Akses fitur lengkap Geosantara</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-200 text-center">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-white mb-2">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E0B554] focus:border-transparent"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-white mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E0B554] focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#E0B554] hover:bg-[#f5c96a] text-[#133740] rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Belum punya akun?{" "}
                <Link 
                  href="/register" 
                  className="text-[#E0B554] hover:text-[#f5c96a] font-semibold"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaGlobe className="text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-1">Destinasi Lengkap</h4>
            <p className="text-gray-300 text-sm">Temukan berbagai destinasi wisata</p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaLeaf className="text-green-400" />
            </div>
            <h4 className="text-white font-semibold mb-1">Alam Terjaga</h4>
            <p className="text-gray-300 text-sm">Nikmati keindahan alam Indonesia</p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaEnvelope className="text-yellow-400" />
            </div>
            <h4 className="text-white font-semibold mb-1">Akses Mudah</h4>
            <p className="text-gray-300 text-sm">Login untuk akses fitur lengkap</p>
          </div>
        </div>
      </div>
      
      {/* Tambah CSS */}
      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}