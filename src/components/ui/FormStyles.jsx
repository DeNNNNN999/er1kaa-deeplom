import React, { useEffect } from 'react';

/**
 * Компонент, который добавляет глобальные стили для форм
 * Решает проблему белого текста на светлом фоне в полях ввода
 */
export default function FormStyles() {
  useEffect(() => {
    // Добавляем стили для всех полей ввода
    const style = document.createElement('style');
    style.innerHTML = `
      input, textarea, select {
        color: #374151 !important; /* text-gray-800 */
        background-color: #fff !important;
        border-color: #d1d5db !important; /* border-gray-300 */
      }
      
      input:focus, textarea:focus, select:focus {
        border-color: #3b82f6 !important; /* border-blue-500 */
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
      }
      
      input::placeholder, textarea::placeholder {
        color: #9ca3af !important; /* text-gray-400 */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null; // Этот компонент не рендерит ничего на странице
}