"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak sama");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      console.log("📝 Registering:", formData.email);
      
      // Register without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            username: formData.username || formData.email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        console.error("❌ Registration error:", error.message);
        
        if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
          setError("Terlalu banyak percobaan. Tunggu 30 menit");
        } else if (error.message.includes("already registered")) {
          setError("Email sudah terdaftar. Silakan login");
        } else {
          setError(error.message);
        }
        
        return;
      }

      console.log("✅ Registration successful:", data.user?.id);
      
      // Create profile in profiles table
      if (data.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            username: formData.username || data.user.email?.split('@')[0],
            created_at: new Date().toISOString()
          });
      }

      setSuccess("🎉 Registrasi berhasil! Anda akan diarahkan ke login...");
      
      // Auto login setelah register
      setTimeout(async () => {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (!loginError) {
          router.push('/destinasi');
          router.refresh();
        } else {
          router.push('/login');
        }
      }, 2000);

    } catch (err: any) {
      console.error("❌ Registration catch error:", err);
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#133740] to-[#0a1f26] pt-24 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Daftar Akun Baru</h1>
          <p className="text-gray-300">Bergabung dengan Geosantara</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-200 text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-200 text-center">{success}</p>
            </div>
          )}

          {/* Register Form */}
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

            {/* Username */}
            <div>
              <label className="block text-white mb-2">Username (opsional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E0B554] focus:border-transparent"
                  placeholder="username"
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
              <p className="text-white/50 text-xs mt-1">Minimal 6 karakter</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white mb-2">Konfirmasi Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E0B554] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E0B554] hover:bg-[#f5c96a] text-[#133740] rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Mendaftarkan...
                </span>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-white/70">
              Sudah punya akun?{" "}
              <Link 
                href="/login" 
                className="text-[#E0B554] hover:text-[#f5c96a] font-semibold"
              >
                Login disini
              </Link>
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            ⚡ Registrasi tanpa konfirmasi email
          </p>
          <p className="text-white/50 text-sm">
            🔐 Login otomatis setelah registrasi
          </p>
        </div>
      </div>
    </div>
  );
}