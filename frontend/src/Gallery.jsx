import React, { useEffect, useState } from 'react';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);

  // Load all image URLs from your R2 bucket
  useEffect(() => {
    fetch('https://images-gallery-backend.onrender.com/r2-images') // Static list or API with your image URLs
      .then(res => res.json())
      .then(setImages);
  }, []);

  const toggleSelect = (url) => {
    setSelected(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const copyImages = async () => {
    for (const url of selected) {
      const blob = await fetch(url).then(res => res.blob());
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
    }
    alert('Copied to clipboard!');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Image Gallery</h1>
      <div className="mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={copyImages} disabled={!selected.length}>
          Copy Selected ({selected.length})
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url) => (
          <div
            key={url}
            className={`border-4 rounded cursor-pointer overflow-hidden ${selected.includes(url) ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => toggleSelect(url)}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/uri-list', url)}
          >
            <img src={url} alt="Product" className="w-full h-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
