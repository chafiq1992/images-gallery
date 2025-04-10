import React, { useEffect, useState } from 'react';

export default function Gallery() {
  const [groupedImages, setGroupedImages] = useState({});
  const [selected, setSelected] = useState([]);
  const [expandedSize, setExpandedSize] = useState(null);
  const [expandedGender, setExpandedGender] = useState(null);

  useEffect(() => {
    fetch('https://images-gallery-backend.onrender.com/r2-images')
      .then(res => res.json())
      .then(data => {
        const grouped = {};

        data.forEach(url => {
          try {
            const parts = new URL(url).pathname.split('/');
            if (parts.length >= 4) {
              const size = decodeURIComponent(parts[1]);
              const gender = decodeURIComponent(parts[2]);

              if (!grouped[size]) grouped[size] = {};
              if (!grouped[size][gender]) grouped[size][gender] = [];
              grouped[size][gender].push(url);
            }
          } catch (e) {
            console.warn("Invalid URL:", url);
          }
        });

        setGroupedImages(grouped);
      });
  }, []);

  const toggleSelect = (url, e) => {
    if (e.ctrlKey || e.metaKey) {
      setSelected(prev =>
        prev.includes(url)
          ? prev.filter(u => u !== url)
          : [...prev, url]
      );
    } else {
      setSelected([url]);
    }
  };

  const copyImages = async () => {
    const items = await Promise.all(selected.map(async (url) => {
      const blob = await fetch(url).then(res => res.blob());
      return new ClipboardItem({ [blob.type]: blob });
    }));
    await navigator.clipboard.write(items);
    alert(`📋 ${selected.length} image(s) copied!`);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selected.length > 0) {
        e.preventDefault();
        copyImages();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🖼️ Irrakids Folder Explorer</h1>

      <button
        onClick={copyImages}
        disabled={selected.length === 0}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        Copy Selected ({selected.length})
      </button>

      {/* FOLDER STRUCTURE */}
      <div className="space-y-4">
        {Object.entries(groupedImages).map(([size, genders]) => (
          <div key={size}>
            <button
              className="font-semibold text-left text-lg w-full"
              onClick={() =>
                setExpandedSize(prev => (prev === size ? null : size))
              }
            >
              📁 {size}
            </button>

            {expandedSize === size && (
              <div className="pl-4 space-y-2">
                {Object.entries(genders).map(([gender, urls]) => (
                  <div key={gender}>
                    <button
                      className="text-left w-full text-md text-blue-700"
                      onClick={() =>
                        setExpandedGender(prev =>
                          prev === size + gender ? null : size + gender
                        )
                      }
                    >
                      └── {gender}
                    </button>

                    {expandedGender === size + gender && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pl-4 mt-2">
                        {urls.map((url) => (
                          <div
                            key={url}
                            className={`border-4 rounded cursor-pointer overflow-hidden ${
                              selected.includes(url)
                                ? 'border-blue-500'
                                : 'border-transparent'
                            }`}
                            onClick={(e) => toggleSelect(url, e)}
                            draggable
                            onDragStart={(e) => {
                              const toDrag = selected.includes(url)
                                ? selected
                                : [url];
                              e.dataTransfer.setData(
                                'text/uri-list',
                                toDrag.join('\n')
                              );
                            }}
                          >
                            <img
                              src={url}
                              alt="Product"
                              className="w-full max-w-[200px] max-h-[200px] object-cover mx-auto"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://via.placeholder.com/300x300?text=Image+Error';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
