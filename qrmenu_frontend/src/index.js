import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './styles/tailwind.css';

import React from 'react';
import ReactDOM from 'react-dom';
import './styles';
import App from './App';
import './config/i18n'; // Ajout de l'initialisation i18next

// Initialize theme before rendering
(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const root = document.documentElement;
  
  if (savedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
    if (!savedTheme) {
      localStorage.setItem('theme', 'light');
    }
  }
})();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


