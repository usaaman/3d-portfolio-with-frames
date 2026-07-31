export async function uploadFileToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Fallback simulator if environment variables are not set yet
  if (!cloudName || !uploadPreset) {
    console.warn('Cloudinary VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET is missing. Simulating local upload...');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Return a mock path or asset frame path
    const mockPaths = [
      '/frames/frame-138.webp',
      '/frames/frame-081.webp'
    ];
    return mockPaths[Math.floor(Math.random() * mockPaths.length)];
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
}
