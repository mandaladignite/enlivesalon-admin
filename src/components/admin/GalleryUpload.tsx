"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Star,
  Tag,
  FileText,
  Camera,
  Settings,
  Clock
} from "lucide-react";
import { galleryAPI } from "@/lib/api";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  altText: string;
  isFeatured: boolean;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface GalleryUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export default function GalleryUpload({ isOpen, onClose, onUploadComplete }: GalleryUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('multiple');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bulkSettings, setBulkSettings] = useState({
    category: 'Hair',
    subcategory: '',
    tags: '',
    isFeatured: false
  });

  useEffect(() => {
  }, [bulkSettings]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'Hair', name: 'Hair Styling' },
    { id: 'Skin', name: 'Skin Care' },
    { id: 'Nail', name: 'Nail Art' },
    { id: 'Body', name: 'Body Care' },
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    const uploadFiles: UploadFile[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      title: file.name.split('.')[0],
      description: '',
      category: bulkSettings.category || 'Hair',
      subcategory: bulkSettings.subcategory || '',
      tags: bulkSettings.tags ? bulkSettings.tags.split(',').map(tag => tag.trim()) : [],
      altText: file.name.split('.')[0],
      isFeatured: bulkSettings.isFeatured,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const applyBulkSettings = () => {
    setFiles(prev => prev.map(file => ({
      ...file,
      category: bulkSettings.category,
      subcategory: bulkSettings.subcategory,
      tags: bulkSettings.tags ? bulkSettings.tags.split(',').map(tag => tag.trim()) : [],
      isFeatured: bulkSettings.isFeatured
    })));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      if (uploadMode === 'single' && files.length === 1) {
        await uploadSingleFile(files[0]);
      } else {
        await uploadMultipleFiles();
      }
      
      onUploadComplete?.();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadSingleFile = async (file: UploadFile) => {
    updateFile(file.id, { status: 'uploading' });

    try {
      const formData = new FormData();
      formData.append('image', file.file);
      formData.append('title', file.title);
      formData.append('description', file.description);
      formData.append('category', file.category);
      formData.append('subcategory', file.subcategory);
      formData.append('tags', file.tags.join(','));
      formData.append('altText', file.altText);
      formData.append('isFeatured', file.isFeatured.toString());

      const response = await galleryAPI.upload(formData);
      
      if (response.success) {
        updateFile(file.id, { status: 'success' });
      } else {
        updateFile(file.id, { status: 'error', error: response.message });
      }
    } catch (error: any) {
      updateFile(file.id, { status: 'error', error: error.message });
    }
  };

  const uploadMultipleFiles = async () => {
    
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('images', file.file);
      formData.append(`title_${index}`, file.title);
      formData.append(`description_${index}`, file.description);
      formData.append(`altText_${index}`, file.altText);
    });

    // Ensure category is set, fallback to 'Hair' if undefined
    const category = bulkSettings.category || 'Hair';
    
    // Validate category before sending
    const validCategories = ['Hair', 'Skin', 'Nail', 'Body'];
    const finalCategory = validCategories.includes(category) ? category : 'Hair';
    
    formData.append('category', finalCategory);
    formData.append('subcategory', bulkSettings.subcategory || '');
    formData.append('tags', bulkSettings.tags || '');
    formData.append('isFeatured', bulkSettings.isFeatured.toString());
    
    // Log all form data entries

    // Update all files to uploading status
    files.forEach(file => {
      updateFile(file.id, { status: 'uploading' });
    });

    try {
      const response = await galleryAPI.upload(formData);
      
      if (response.success) {
        files.forEach(file => {
          updateFile(file.id, { status: 'success' });
        });
      } else {
        files.forEach(file => {
          updateFile(file.id, { status: 'error', error: response.message });
        });
      }
    } catch (error: any) {
      files.forEach(file => {
        updateFile(file.id, { status: 'error', error: error.message });
      });
    }
  };

  const clearFiles = () => {
    files.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Images</h2>
            <p className="text-sm text-gray-600">Add new images to your gallery</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Upload Area */}
          <div className="w-full lg:w-1/2 p-4 lg:p-6 border-r border-gray-200 overflow-y-auto">
            {/* Upload Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">Upload Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUploadMode('single')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    uploadMode === 'single' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setUploadMode('multiple')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    uploadMode === 'multiple' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  Multiple
                </button>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              ref={dropRef}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={uploadMode === 'multiple'}
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {dragActive ? 'Drop images here' : 'Drag & drop images here'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    or <button className="text-yellow-500 hover:text-yellow-600">browse files</button>
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Supports JPG, PNG, GIF, WebP up to 10MB each
                </div>
              </div>
            </div>

            {/* Bulk Settings */}
            {files.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Bulk Settings</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Category</label>
                      <select
                        value={bulkSettings.category}
                        onChange={(e) => setBulkSettings(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={bulkSettings.subcategory}
                        onChange={(e) => setBulkSettings(prev => ({ ...prev, subcategory: e.target.value }))}
                        placeholder="Optional"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={bulkSettings.tags}
                      onChange={(e) => setBulkSettings(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="e.g., bridal, elegant, natural"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bulk-featured"
                      checked={bulkSettings.isFeatured}
                      onChange={(e) => setBulkSettings(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="bulk-featured" className="ml-2 text-xs text-gray-700">
                      Mark as featured
                    </label>
                  </div>
                  <button
                    onClick={applyBulkSettings}
                    className="w-full px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Apply to All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* File Preview */}
          <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Files ({files.length})
              </h3>
              {files.length > 0 && (
                <button
                  onClick={clearFiles}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No files selected</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-full overflow-y-auto">
                {files.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    onUpdate={(updates) => updateFile(file.id, updates)}
                    onRemove={() => removeFile(file.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 lg:p-6 border-t border-gray-200 bg-gray-50 gap-3">
          <div className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} ready to upload
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
              className="flex-1 sm:flex-none px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {files.length} file{files.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface FilePreviewProps {
  file: UploadFile;
  onUpdate: (updates: Partial<UploadFile>) => void;
  onRemove: () => void;
}

function FilePreview({ file, onUpdate, onRemove }: FilePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (file.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'pending':
        return 'bg-gray-100';
      case 'uploading':
        return 'bg-blue-100';
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <img
            src={file.preview}
            alt={file.title}
            className="w-full h-full object-cover rounded"
          />
          <div className="absolute -top-1 -right-1">
            {getStatusIcon()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {file.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Edit details"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={onRemove}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Remove file"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>


          {file.status === 'error' && file.error && (
            <p className="text-xs text-red-600 mt-1 break-words">{file.error}</p>
          )}

          {isExpanded && (
            <div className="mt-3 space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={file.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Description</label>
                <textarea
                  value={file.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Category</label>
                  <select
                    value={file.category}
                    onChange={(e) => onUpdate({ category: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="Hair">Hair Styling</option>
                    <option value="Skin">Skin Care</option>
                    <option value="Nail">Nail Art</option>
                    <option value="Body">Body Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={file.subcategory}
                    onChange={(e) => onUpdate({ subcategory: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={file.tags.join(', ')}
                  onChange={(e) => onUpdate({ tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  placeholder="e.g., bridal, elegant, natural"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={file.altText}
                  onChange={(e) => onUpdate({ altText: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`featured-${file.id}`}
                  checked={file.isFeatured}
                  onChange={(e) => onUpdate({ isFeatured: e.target.checked })}
                  className="w-3 h-3 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor={`featured-${file.id}`} className="ml-2 text-xs text-gray-700">
                  Mark as featured
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
