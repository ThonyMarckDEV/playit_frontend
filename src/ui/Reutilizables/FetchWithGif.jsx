import React from 'react';
import loadingGif from '../../assets/loading.gif';

const FetchWithGif = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center z-[9999]">
      <img
        src={loadingGif}
        alt="Loading..."
        className="w-40 h-40 object-contain"
      />
    </div>
  );
};

export default FetchWithGif;