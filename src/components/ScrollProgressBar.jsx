import React, { useEffect } from 'react';

export const ScrollProgressBar = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      document.documentElement.style.setProperty('--scroll-progress', `${scrollPercent}%`);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // To set initial value on load

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
      <div
        className="h-full bg-red-500 transition-all duration-150"
        style={{ width: 'var(--scroll-progress, 0%)' }}
      />
    </div>
  );
};
