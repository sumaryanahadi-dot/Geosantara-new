"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Check,
  X,
  MapPin,
  ExternalLink,
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Destination = {
  id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export default function AdminDestinationsContent() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: 0,
    description: "",
    image_url: "",
    category: "Gunung"
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  
  // Categories
  const categories = ["all", "Gunung", "Pantai", "Sejarah", "Taman Nasional"];

  // Fetch destinations
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      alert("Gagal memuat data destinasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Filter destinations
  const filteredDestinations = destinations.filter((d) => {
    const matchSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    
    const matchCategory = selectedCategory === "all" || d.category === selectedCategory;
    
    return matchSearch && matchCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDestinations = filteredDestinations.slice(startIndex, startIndex + itemsPerPage);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Validasi file
      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar");
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB
        alert("Ukuran gambar maksimal 2MB");
        return;
      }

      // Upload ke Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `destinations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('destination-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('destination-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(URL.createObjectURL(file));
      alert("Gambar berhasil diupload!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal upload gambar. Pastikan storage bucket sudah dibuat.");
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.name.trim()) {
      alert("Nama destinasi harus diisi");
      return;
    }
    
    if (!formData.location.trim()) {
      alert("Lokasi harus diisi");
      return;
    }
    
    if (!formData.description.trim()) {
      alert("Deskripsi harus diisi");
      return;
    }
    
    if (formData.price <= 0) {
      alert("Harga harus lebih dari 0");
      return;
    }

    setSaving(true);
    
    try {
      if (isEditing && selectedDestination) {
        // Update destination
        const { error } = await supabase
          .from("destinations")
          .update({
            ...formData,
            price: Number(formData.price),
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedDestination.id);

        if (error) throw error;
        alert("Destinasi berhasil diupdate!");
      } else {
        // Create new destination
        const { error } = await supabase
          .from("destinations")
          .insert([{
            ...formData,
            price: Number(formData.price),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        alert("Destinasi berhasil ditambahkan!");
      }

      // Reset form and refresh data
      resetForm();
      fetchDestinations();
    } catch (error: any) {
      console.error("Error saving destination:", error);
      alert(`Gagal menyimpan destinasi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit
  const handleEdit = (destination: Destination) => {
    setFormData({
      name: destination.name,
      location: destination.location,
      price: destination.price,
      description: destination.description,
      image_url: destination.image_url || "",
      category: destination.category
    });
    setImagePreview(destination.image_url || "");
    setIsEditing(true);
    setShowForm(true);
    setSelectedDestination(destination);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDestination) return;

    try {
      // Delete from destinations
      const { error } = await supabase
        .from("destinations")
        .delete()
        .eq("id", selectedDestination.id);

      if (error) throw error;

      // Delete from wishlist
      await supabase
        .from("wishlist")
        .delete()
        .eq("destination_id", selectedDestination.id);

      setShowDeleteModal(false);
      setSelectedDestination(null);
      alert("Destinasi berhasil dihapus!");
      fetchDestinations();
    } catch (error: any) {
      console.error("Error deleting destination:", error);
      alert(`Gagal menghapus destinasi: ${error.message}`);
    }
  };

  // Handle preview
  const handlePreview = (destination: Destination) => {
    setSelectedDestination(destination);
    setShowPreviewModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      price: 0,
      description: "",
      image_url: "",
      category: "Gunung"
    });
    setImageFile(null);
    setImagePreview("");
    setIsEditing(false);
    setSelectedDestination(null);
    setShowForm(false);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{destinations.length}</div>
          <div className="text-gray-600 text-sm">Total Destinasi</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {destinations.filter(d => d.category === "Gunung").length}
          </div>
          <div className="text-gray-600 text-sm">Destinasi Gunung</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {destinations.filter(d => d.category === "Pantai").length}
          </div>
          <div className="text-gray-600 text-sm">Destinasi Pantai</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">
            {destinations.filter(d => d.category === "Sejarah").length}
          </div>
          <div className="text-gray-600 text-sm">Destinasi Sejarah</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari destinasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Semua Kategori" : cat}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              <span className="hidden md:inline">Tambah Destinasi</span>
              <span className="md:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Memuat data destinasi...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destinasi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedDestinations.map((destination) => (
                    <tr key={destination.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={destination.image_url || "/default-destination.jpg"}
                              alt={destination.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[200px]">
                              {destination.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {destination.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-900">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {destination.location}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          destination.category === "Gunung" ? "bg-blue-100 text-blue-800" :
                          destination.category === "Pantai" ? "bg-green-100 text-green-800" :
                          destination.category === "Sejarah" ? "bg-purple-100 text-purple-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {destination.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">{formatPrice(destination.price)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(destination.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(destination)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(destination)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDestination(destination);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                          <Link
                            href={`/detaildestinasi/${destination.id}`}
                            target="_blank"
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Lihat Halaman Publik"
                          >
                            <ExternalLink size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredDestinations.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                  <ImageIcon size={96} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada destinasi ditemukan
                </h3>
                <p className="text-gray-500 mb-4">
                  {search || selectedCategory !== "all"
                    ? "Coba ubah pencarian atau filter Anda"
                    : "Belum ada destinasi yang ditambahkan"}
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                    setCurrentPage(1);
                  }}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Reset filter
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredDestinations.length)} dari {filteredDestinations.length} destinasi
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === i + 1
                            ? "bg-green-600 text-white"
                            : "border hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? "Edit Destinasi" : "Tambah Destinasi Baru"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar Destinasi
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 justify-center">
                            <Upload size={20} />
                            <span>{uploading ? "Mengupload..." : "Pilih Gambar"}</span>
                          </div>
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Ukuran maksimal 2MB. Format: JPG, PNG, WebP
                        </p>
                        {formData.image_url && (
                          <p className="text-sm text-green-600 mt-1">
                            Gambar sudah dipilih
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Destinasi *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        placeholder="Contoh: Gunung Bromo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {categories.filter(cat => cat !== "all").map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokasi *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        placeholder="Contoh: Jawa Timur, Indonesia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga (IDR) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      placeholder="Deskripsikan destinasi ini..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Check size={20} />
                      )}
                      {saving ? "Menyimpan..." : isEditing ? "Update Destinasi" : "Simpan Destinasi"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Hapus Destinasi</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus destinasi{" "}
                <span className="font-semibold text-gray-900">
                  {selectedDestination.name}
                </span>
                ? Tindakan ini tidak dapat dibatalkan dan akan menghapus dari wishlist pengguna.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDestination(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 justify-center transition-colors"
                >
                  <Trash2 size={18} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Preview Destinasi</h2>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedDestination(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image */}
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <Image
                    src={selectedDestination.image_url || "/default-destination.jpg"}
                    alt={selectedDestination.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedDestination.category}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedDestination.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin size={16} />
                      <span>{selectedDestination.location}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedDestination.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Harga</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(selectedDestination.price)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Dibuat Pada</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(selectedDestination.created_at)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Terakhir Diupdate</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(selectedDestination.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Link
                    href={`/detaildestinasi/${selectedDestination.id}`}
                    target="_blank"
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium transition-colors"
                  >
                    Lihat Halaman Publik
                  </Link>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleEdit(selectedDestination);
                    }}
                    className="flex-1 px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
                  >
                    Edit Destinasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}