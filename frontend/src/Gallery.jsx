import React, { useEffect, useState } from 'react';

export default function Gallery() {
  const [groupedImages, setGroupedImages] = useState({});
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch('https://images-gallery-backend.onrender.com/r2-images')
      .then(res => res.json())
      .then(data => {
        const grouped = {};

        data.forEach(url => {
          try {
            const [, size, gender, filename] = new URL(url).pathname.split('/');
            if (!grouped[size]) grouped[size] = {};
            if (!grouped[size][gender]) grouped[size][gender] = [];
            grouped[size][gender].push(url);
          } catch (e) {
            console.warn("Invalid image path:", url);
          }
        });

        setGroupedImages(grouped);
      });
  }, []);

  const toggleSelect = (url) => {
    setSelected(prev =>
      prev.includes(url)
        ? prev.filter(u => u !== url)
        : [...prev, url]
    );
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
      <h1 className="text-xl font-bold mb-4">🖼️ Irrakids Image Gallery</h1>
      <button
        onClick={copyImages}
        disabled={selected.length === 0}
        className="mb-4 px-4 py-2 rounded text-white bg-blue-600 disabled:bg-gray-400"
      >
        Copy Selected ({selected.length})
      </button>

      {Object.entries(groupedImages).map(([size, genders]) => (
        <div key={size} className="mb-8">
          {Object.entries(genders).map(([gender, urls]) => (
            <div key={gender} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">📁 {size} › {gender}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {urls.map(url => (
                  <div
                    key={url}
                    className={`border-4 rounded cursor-pointer overflow-hidden ${
                      selected.includes(url) ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => toggleSelect(url)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/uri-list', url)}
                  >
                    <img
                      src={url}
                      alt="Product"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x300?text=Image+Error";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
