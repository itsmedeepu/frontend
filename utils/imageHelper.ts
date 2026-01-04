export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=300'; 
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${backendUrl}${normalizedPath}`;
};
