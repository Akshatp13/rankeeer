import React from 'react';

const BackgroundEffect = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid opacity-20"></div>
      
      {/* Animated Glow Blobs */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>
      <div className="glow-blob glow-blob-3"></div>
      
      {/* Subtle Overlay to ensure readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
    </div>
  );
};

export default BackgroundEffect;
