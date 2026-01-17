"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Star,
  Eye,
  Heart,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Image as ImageIcon,
  BarChart3,
  Settings,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { galleryAPI } from "@/lib/api";
import Image from "next/image";
import GalleryUpload from "@/components/admin/GalleryUpload";

interface GalleryImage {
  _id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  cloudinarySecureUrl: string;
  altText?: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    name: string;
    email: string;
  };
  dimensions: {
    width: number;
    height: number;
  };
  aspectRatio: number;
  sortOrder: number;
  originalFileName: string;
  format: string;
}

interface GalleryStats {
  overview: {
    totalImages: number;
  };
  categoryBreakdown: Array<{
    _id: string;
    count: number;
    featuredCount: number;
  }>;
  recentUploads: GalleryImage[];
  topImages: GalleryImage[];
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [bulkAction, setBulkAction] = useState("");

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "Hair", name: "Hair" },
    { id: "Skin", name: "Skin" },
    { id: "Nail", name: "Nail" },
    { id: "Bridal", name: "Bridal" },
  ];

  const statusOptions = [
    { id: "all", name: "All Status" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
  ];

  const featuredOptions = [
    { id: "all", name: "All" },
    { id: "featured", name: "Featured" },
    { id: "not-featured", name: "Not Featured" },
  ];

  const bulkActions = [
    { id: "feature", name: "Mark as Featured" },
    { id: "unfeature", name: "Remove from Featured" },
    { id: "activate", name: "Activate" },
    { id: "deactivate", name: "Deactivate" },
    { id: "delete", name: "Delete" },
  ];

  useEffect(() => {
    fetchImages();
    fetchStats();
  }, [selectedCategory, statusFilter, featuredFilter, searchQuery, sortBy, sortOrder, currentPage]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params: any = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
      };

      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      if (statusFilter !== "all") {
        params.isActive = statusFilter === "active";
      }

      if (featuredFilter !== "all") {
        params.featured = featuredFilter === "featured";
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await galleryAPI.getAllAdmin(params);
      
      if (response.success) {
        setImages(response.data.images);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.message || "Failed to fetch images");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching images");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await galleryAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchImages();
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await galleryAPI.delete(imageId);
      fetchImages();
      fetchStats(); // Refresh stats after deletion
    } catch (err: any) {
      setError(err.message || "Failed to delete image");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedImages.size === 0) return;

    try {
      const imageIds = Array.from(selectedImages);
      let updateData = {};

      switch (bulkAction) {
        case "feature":
          updateData = { isFeatured: true };
          break;
        case "unfeature":
          updateData = { isFeatured: false };
          break;
        case "activate":
          updateData = { isActive: true };
          break;
        case "deactivate":
          updateData = { isActive: false };
          break;
        case "delete":
          // Handle individual deletion
          for (const imageId of imageIds) {
            await galleryAPI.delete(imageId);
          }
          setSelectedImages(new Set());
          fetchImages();
          fetchStats(); // Refresh stats after deletion
          return;
      }

      if (Object.keys(updateData).length > 0) {
        // Update each image individually
        for (const imageId of imageIds) {
          await galleryAPI.updateAdmin(imageId, updateData);
        }
        setSelectedImages(new Set());
        fetchImages();
        fetchStats(); // Refresh stats after update
      }
    } catch (err: any) {
      setError(err.message || "Failed to perform bulk action");
    }
  };

  const handleToggleFeatured = async (imageId: string) => {
    try {
      await galleryAPI.toggleFeatured(imageId);
      fetchImages();
    } catch (err: any) {
      setError(err.message || "Failed to toggle featured status");
    }
  };


  const handleSelectImage = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img._id)));
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setStatusFilter("active");
    setFeaturedFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
            <p className="text-gray-600 mt-1">Manage your salon's image gallery</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Images
            </button>
            <button
              onClick={fetchImages}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Images</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalImages}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-800">
              Showing {statusFilter === "active" ? "active" : statusFilter === "inactive" ? "inactive" : "all"} images
              {selectedCategory !== "all" && ` in ${selectedCategory} category`}
              {featuredFilter === "featured" && " (featured only)"}
              {featuredFilter === "not-featured" && " (not featured)"}
            </span>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {featuredOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedImages.size > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Action</option>
                  {bulkActions.map(action => (
                    <option key={action.id} value={action.id}>{action.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedImages(new Set())}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-yellow-500" />
            <span className="ml-2 text-gray-600">Loading images...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-500 text-lg mb-2">Error loading images</div>
            <div className="text-gray-600">{error}</div>
            <button
              onClick={fetchImages}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 text-lg mb-2">No images found</div>
            <div className="text-gray-400 mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Upload some images to get started"}
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Upload Images
            </button>
          </div>
        ) : (
          <>
            {/* Gallery Grid/List */}
            <div className={`p-6 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}`}>
              {images.map((image) => (
                <div
                  key={image._id}
                  className={`group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    viewMode === "list" ? "flex" : ""
                  } ${!image.isActive ? "opacity-50" : ""}`}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image._id)}
                      onChange={() => handleSelectImage(image._id)}
                      className="w-4 h-4 text-yellow-500 bg-white border-gray-300 rounded focus:ring-yellow-500"
                    />
                  </div>

                  {viewMode === "grid" ? (
                    <>
                      <div className="relative h-48 w-full">
                        <Image
                          src={image.cloudinarySecureUrl}
                          alt={image.altText || image.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                        {image.isFeatured && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </div>
                        )}
                        {!image.isActive && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{image.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 capitalize">{image.category}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">
                              {new Date(image.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingImage(image)}
                            className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(image._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              image.isFeatured
                                ? "bg-yellow-500 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                            title={image.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image._id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={image.cloudinarySecureUrl}
                          alt={image.altText || image.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                        {image.isFeatured && (
                          <div className="absolute top-1 right-1 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs">
                            <Star className="w-2 h-2" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{image.description || "No description"}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="capitalize">{image.category}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(image.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingImage(image)}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(image._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                image.isFeatured
                                  ? "bg-yellow-500 text-white"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(image._id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, images.length)} of {images.length} images
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-yellow-500 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      <GalleryUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={() => {
          setShowUploadModal(false);
          fetchImages();
        }}
      />

      {/* Edit Modal Placeholder */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Image</h3>
            <p className="text-gray-600 mb-4">Edit functionality will be implemented here.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
