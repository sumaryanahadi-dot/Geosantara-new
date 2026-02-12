"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaMapMarkerAlt,
  FaTag,
  FaMoneyBillWave,
  FaUpload,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaExternalLinkAlt
} from 'react-icons/fa';

const ADMIN_EMAIL = "admin@geosantara.com";
const CATEGORIES = ['Gunung', 'Pantai', 'Sejarah', 'Taman Nasional'];

type Destination = {
  id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
};

export default function AdminDestinationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: 0,
    description: '',
    image_url: '',
    category: 'Gunung'
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const userEmail = session.user.email?.toLowerCase();
        const isAdminUser = userEmail === ADMIN_EMAIL.toLowerCase();
        
        if (!isAdminUser) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        await fetchDestinations();
        
      } catch (error) {
        console.error("Auth error:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch destinations
  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      alert('Gagal memuat data destinasi');
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Validasi file
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB');
        return;
      }

      // Upload ke Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `destinations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('destination-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('destination-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      alert('Gambar berhasil diupload!');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle add destination
  const handleAddDestination = async () => {
    if (!formData.name || !formData.location || !formData.description || formData.price <= 0) {
      alert('Harap isi semua field yang wajib');
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('destinations')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Destinasi berhasil ditambahkan!');
      setShowAddModal(false);
      resetForm();
      await fetchDestinations();
      
    } catch (error: any) {
      console.error('Error adding destination:', error);
      alert(`Gagal menambahkan destinasi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit destination
  const handleEditDestination = async () => {
    if (!selectedDestination) return;
    
    if (!formData.name || !formData.location || !formData.description || formData.price <= 0) {
      alert('Harap isi semua field yang wajib');
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('destinations')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDestination.id);

      if (error) throw error;

      alert('Destinasi berhasil diupdate!');
      setShowEditModal(false);
      resetForm();
      await fetchDestinations();
      
    } catch (error: any) {
      console.error('Error editing destination:', error);
      alert(`Gagal mengupdate destinasi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete destination
  const handleDeleteDestination = async () => {
    if (!selectedDestination) return;

    try {
      // Delete from destinations
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', selectedDestination.id);

      if (error) throw error;

      // Also delete from wishlist
      await supabase
        .from('wishlist')
        .delete()
        .eq('destination_id', selectedDestination.id);

      alert('Destinasi berhasil dihapus!');
      setShowDeleteModal(false);
      setSelectedDestination(null);
      await fetchDestinations();
      
    } catch (error: any) {
      console.error('Error deleting destination:', error);
      alert(`Gagal menghapus destinasi: ${error.message}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      price: 0,
      description: '',
      image_url: '',
      category: 'Gunung'
    });
  };

  // Open edit modal
  const openEditModal = (dest: Destination) => {
    setSelectedDestination(dest);
    setFormData({
      name: dest.name,
      location: dest.location,
      price: dest.price,
      description: dest.description,
      image_url: dest.image_url,
      category: dest.category
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (dest: Destination) => {
    setSelectedDestination(dest);
    setShowDeleteModal(true);
  };

  // Open preview modal
  const openPreviewModal = (dest: Destination) => {
    setSelectedDestination(dest);
    setShowPreviewModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Filter destinations
  const filteredDestinations = destinations.filter(dest => {
    const matchSearch = 
      dest.name.toLowerCase().includes(search.toLowerCase()) ||
      dest.location.toLowerCase().includes(search.toLowerCase()) ||
      dest.description.toLowerCase().includes(search.toLowerCase());
    
    const matchCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    
    return matchSearch && matchCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDestinations = filteredDestinations.slice(startIndex, startIndex + itemsPerPage);

  // Format helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading destinations...</p>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Destinasi</h1>
            <p className="text-gray-600">Manage travel destinations</p>
          </div>
          
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus />
            <span>Tambah Destinasi</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Total Destinasi</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{destinations.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <FaImage className="text-blue-600 sm:w-6 sm:h-6 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Kategori</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{CATEGORIES.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FaTag className="text-green-600 sm:w-6 sm:h-6 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Lokasi</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {[...new Set(destinations.map(d => d.location))].length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <FaMapMarkerAlt className="text-purple-600 sm:w-6 sm:h-6 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-medium">Avg Price</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {destinations.length > 0 
                    ? formatPrice(destinations.reduce((sum, d) => sum + d.price, 0) / destinations.length)
                    : formatPrice(0)
                  }
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <FaMoneyBillWave className="text-yellow-600 sm:w-6 sm:h-6 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari destinasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="all">Semua Kategori</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Destinations Table */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Destinasi
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Lokasi
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Harga
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Dibuat
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentDestinations.length > 0 ? (
                  currentDestinations.map((dest) => (
                    <tr key={dest.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={dest.image_url || '/placeholder.jpg'}
                              alt={dest.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{dest.name}</div>
                            <div className="text-sm text-gray-700 truncate max-w-[150px] sm:max-w-[200px]">
                              {dest.description.substring(0, 40)}...
                            </div>
                            <div className="text-sm text-gray-700 md:hidden">
                              {dest.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-900 hidden md:table-cell">{dest.location}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          dest.category === 'Gunung' ? 'bg-blue-100 text-blue-800' :
                          dest.category === 'Pantai' ? 'bg-green-100 text-green-800' :
                          dest.category === 'Sejarah' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dest.category}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 hidden lg:table-cell">
                        {formatPrice(dest.price)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm hidden sm:table-cell">
                        {formatDate(dest.created_at)}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => openPreviewModal(dest)}
                            className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Preview"
                          >
                            <FaEye size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(dest)}
                            className="p-1 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit"
                          >
                            <FaEdit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(dest)}
                            className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <FaTrash size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <Link
                            href={`/detaildestinasi/${dest.id}`}
                            target="_blank"
                            className="p-1 sm:p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                            title="View Public Page"
                          >
                            <FaExternalLinkAlt size={14} className="sm:w-4 sm:h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-700">
                        <FaImage className="mx-auto text-gray-300 mb-3 w-12 h-12" />
                        <p className="text-lg font-medium">Tidak ada destinasi</p>
                        <p className="text-sm mt-1">Belum ada data destinasi yang tersedia</p>
                        <button
                          onClick={openAddModal}
                          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Tambah Destinasi Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredDestinations.length)} dari {filteredDestinations.length} destinasi
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2 sm:px-3 py-1 rounded-lg text-sm ${
                          currentPage === i + 1
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FaChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============ MODALS ============ */}

      {/* Add Destination Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tambah Destinasi Baru</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                >
                  <FaTimes size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Destinasi
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {formData.image_url ? (
                        <Image
                          src={formData.image_url}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaImage size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 w-fit text-gray-700">
                          <FaUpload size={20} />
                          {uploading ? "Mengupload..." : "Pilih Gambar"}
                        </div>
                      </label>
                      <p className="text-sm text-gray-600 mt-2">
                        Ukuran maksimal 2MB. Format: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Destinasi *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    required
                    placeholder="Deskripsikan destinasi ini..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddDestination}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FaCheck size={20} />
                        Simpan Destinasi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Destination Modal */}
      {showEditModal && selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Destinasi</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                >
                  <FaTimes size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Destinasi
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {formData.image_url ? (
                        <Image
                          src={formData.image_url}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaImage size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 w-fit text-gray-700">
                          <FaUpload size={20} />
                          {uploading ? "Mengupload..." : "Ganti Gambar"}
                        </div>
                      </label>
                      <p className="text-sm text-gray-600 mt-2">
                        Ukuran maksimal 2MB. Format: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Destinasi *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                      min="0"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleEditDestination}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FaCheck size={20} />
                        Update Destinasi
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                  <FaExclamationTriangle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Hapus Destinasi</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Apakah Anda yakin ingin menghapus destinasi{" "}
                <span className="font-semibold text-gray-900">
                  {selectedDestination.name}
                </span>
                ? Tindakan ini tidak dapat dibatalkan dan akan menghapus dari wishlist pengguna.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteDestination}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <FaTrash size={18} />
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
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Preview Destinasi</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                >
                  <FaTimes size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image */}
                <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden">
                  <Image
                    src={selectedDestination.image_url || '/placeholder.jpg'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedDestination.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                      <FaMapMarkerAlt size={16} />
                      <span>{selectedDestination.location}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedDestination.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-700">Harga</div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatPrice(selectedDestination.price)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-700">Dibuat Pada</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(selectedDestination.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Link
                    href={`/detaildestinasi/${selectedDestination.id}`}
                    target="_blank"
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium"
                  >
                    Lihat Halaman Publik
                  </Link>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      openEditModal(selectedDestination);
                    }}
                    className="flex-1 px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium"
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