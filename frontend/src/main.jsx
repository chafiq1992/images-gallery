import React from 'react';
import ReactDOM from 'react-dom/client';
import Gallery from './Gallery.jsx';
import App from './App'
import './index.css' // ✅ Add this line to load Tailwind
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Gallery />
  </React.StrictMode>
);
