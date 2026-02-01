"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/destinasi';
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login for:", formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        console.error("❌ Login error:", error.message);
        
        // Tampilkan pesan error tanpa rate limiting
        if (error.message.includes("Invalid login credentials")) {
          setError("Email atau password salah. Silakan coba lagi.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Email belum dikonfirmasi. Silakan cek inbox Anda.");
        } else {
          setError(error.message);
        }
        
        return;
      }

      // Reset form on success
      setFormData({ email: "", password: "" });
      
      console.log("✅ Login successful:", data.user?.email);
      
      // Redirect based on previous page or default
      router.push(redirect);
      router.refresh();
      
    } catch (err: any) {
      console.error("❌ Login catch error:", err);
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Quick login for testing (optional)
  const handleQuickLogin = async (testEmail: string) => {
    setFormData({
      email: testEmail,
      password: "password123" // default password for testing
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#133740] to-[#0a1f26] pt-24 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Selamat Datang</h1>
          <p className="text-gray-300">Login untuk melanjutkan ke Geosantara</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-[#E0B554] hover:text-[#f5c96a] text-sm"
              >
                Lupa password?
              </Link>
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

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-white/50 text-sm">atau</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Quick Login for Testing (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6">
              <p className="text-white/70 text-sm mb-3">Test Accounts:</p>
              <div className="grid grid-cols-2 gap-2">
                {['test1@example.com', 'test2@example.com', 'user@example.com', 'demo@example.com'].map((email) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => handleQuickLogin(email)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-xs truncate"
                  >
                    {email.split('@')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Register Link */}
          <div className="text-center mt-8">
            <p className="text-white/70">
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

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            ⚡ Login tanpa batas percobaan
          </p>
          <p className="text-white/50 text-sm">
            🔒 Data Anda aman dengan enkripsi terbaru
          </p>
        </div>
      </div>
    </div>
  );
}