/**
 * Helper to get the correct image URL.
 * Handles:
 * 1. Absolute URLs (Cloudinary, External) -> returns as is
 * 2. Relative URLs (Local uploads) -> prepends backend URL
 * 3. Null/Undefined -> returns placeholder
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=300'; // Default placeholder
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Handle local uploads (legacy)
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  
  // Ensure path starts with / if not present
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${backendUrl}${normalizedPath}`;
};
