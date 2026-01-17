// Image upload utility functions
// For now, we'll use placeholder images, but this can be extended to use cloud services like Cloudinary

export const uploadImage = async (file: File): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For now, return a placeholder URL
  // In production, you would upload to a cloud service like Cloudinary, AWS S3, etc.
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  return `https://picsum.photos/400/400?random=${timestamp}-${randomId}`;
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToServer(file));
  return Promise.all(uploadPromises);
};

// Upload to server endpoint
export const uploadToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }
    
    const data = await response.json();
    
    // Ensure we return a full URL
    let url = data.url;
    if (url && !url.startsWith('http')) {
      // If it's a relative path, make it absolute
      const baseUrl = window.location.origin;
      url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    
    return url;
  } catch (error) {
    console.error('Upload error:', error);
    // Fallback to placeholder
    return `https://picsum.photos/400/400?random=${Date.now()}`;
  }
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }
  
  return { valid: true };
};
