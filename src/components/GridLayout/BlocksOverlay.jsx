// src/components/BlocksOverlay.jsx
import { useState, useEffect, useCallback } from 'react';

const BLOCK_SIZE = 50;

export default function BlocksOverlay() {
  const [blocks, setBlocks] = useState({ numCols: 0, numBlocks: 0 });
  const [highlightedBlock, setHighlightedBlock] = useState(null);

  useEffect(() => {
    const calculateBlocks = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const numCols = Math.ceil(screenWidth / BLOCK_SIZE);
      const numRows = Math.ceil(screenHeight / BLOCK_SIZE);
      setBlocks({ numCols, numBlocks: numRows * numCols });
    };

    calculateBlocks();
    window.addEventListener('resize', calculateBlocks);
    return () => window.removeEventListener('resize', calculateBlocks);
  }, []);

  const handleMouseMove = useCallback((event) => {
    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / BLOCK_SIZE);
    const row = Math.floor(y / BLOCK_SIZE);
    const index = row * blocks.numCols + col;
    setHighlightedBlock(index);
    
    setTimeout(() => {
      if (highlightedBlock === index) {
        setHighlightedBlock(null);
      }
    }, 250);
  }, [blocks.numCols, highlightedBlock]);

  return (
    <div 
      className="fixed top-0 left-0 w-screen h-screen flex flex-wrap pointer-events-none z-2 will-change-contents"
      onMouseMove={handleMouseMove}
    >
      {Array.from({ length: blocks.numBlocks }).map((_, index) => (
        <div
          key={index}
          className={`w-[50px] h-[50px] border border-solid transition-colors duration-200 will-change-[border-color] ${
            highlightedBlock === index ? 'border-white' : 'border-transparent'
          }`}
        />
      ))}
    </div>
  );
}