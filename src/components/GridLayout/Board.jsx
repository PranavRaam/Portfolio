import { useState, useRef, useEffect, forwardRef, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';

// Constants
const CONFIG = {
  ROWS: 6,
  COLS: 6,
  BLOCK_SIZE: 50,
  COOLDOWN: 300,
  SCROLL_THRESHOLD: 300,
  SCROLL_DEBOUNCE: 1000,
  ANIMATION_DURATION: 0.6,
  STAGGER_DELAY: 0.05,
  TILT_ANGLES: [-40, -20, -10, 10, 20, 40],
  IMAGES: {
    FRONT: '/LandingImage-1/1.png',
    BACK: '/LandingImage-1/2.png'
  }
};

// Custom hooks remain the same as previous version...
const useThrottle = (callback, delay) => {
  const throttleRef = useRef(false);
  
  return useCallback((...args) => {
    if (throttleRef.current) return;
    throttleRef.current = true;
    
    callback(...args);
    
    setTimeout(() => {
      throttleRef.current = false;
    }, delay);
  }, [callback, delay]);
};

const useTileAnimation = (isFlipped, setIsAnimating) => {
  return useCallback((tile, tiltY) => {
    setIsAnimating(true);
    
    gsap.timeline({
      onComplete: () => setIsAnimating(false),
      defaults: { duration: 0.3, ease: "power2.out" }
    })
    .set(tile, {
      rotateX: isFlipped ? 180 : 0,
      rotateY: 0,
      willChange: "transform"
    })
    .to(tile, {
      rotateX: isFlipped ? 450 : 270,
      rotateY: tiltY,
      duration: 0.4
    })
    .to(tile, {
      rotateX: isFlipped ? 540 : 360,
      rotateY: 0,
      duration: 0.4
    }, "-=0.2");
  }, [isFlipped]);
};

// TileContent component remains the same...
const TileContent = ({ image, position }) => (
  <div 
    className="tile-content absolute inset-0"
    style={{ 
      backgroundImage: `url('${image}')`,
      backgroundSize: '600% 600%',
      backgroundPosition: position
    }}
  />
);


// Enhanced Tile Component with animation progress indicator
const Tile = forwardRef(({ rowIndex, colIndex, isFlipped, onAnimate, getTiltAngle, animationProgress }, ref) => {
  const lastEnterTime = useRef(0);
  const bgPosition = useMemo(() => 
    `${colIndex * 20}% ${rowIndex * 20}%`, 
    [rowIndex, colIndex]
  );

  const handleMouseEnter = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastEnterTime.current > CONFIG.COOLDOWN) {
      lastEnterTime.current = currentTime;
      onAnimate(ref.current, getTiltAngle());
    }
  }, [onAnimate, getTiltAngle]);


  return (
    <div
      ref={ref}
      className={`tile flex-1 relative preserve-3d will-change-transform cursor-pointer 
                 transition-transform duration-300 hover:scale-105`}
      onMouseEnter={handleMouseEnter}
      style={{
        opacity: animationProgress ? 1 : 0.8
      }}
    >
      <div className="tile-front absolute w-full h-full backface-hidden">
        <TileContent image={CONFIG.IMAGES.FRONT} position={bgPosition} />
      </div>
      <div className="tile-back absolute w-full h-full backface-hidden rotate-y-180">
        <TileContent image={CONFIG.IMAGES.BACK} position={bgPosition} />
      </div>
    </div>
  );
});


// Enhanced BlockOverlay Component
const BlockOverlay = () => {
  const [blocks, setBlocks] = useState([]);
  const [highlightedBlock, setHighlightedBlock] = useState(null);
  const containerRef = useRef(null);

  const updateBlocks = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const numCols = Math.ceil(screenWidth / CONFIG.BLOCK_SIZE);
    const numRows = Math.ceil(screenHeight / CONFIG.BLOCK_SIZE);
    setBlocks(Array(numRows * numCols).fill(0));
  }, []);

  useEffect(() => {
    updateBlocks();
    window.addEventListener('resize', updateBlocks);
    return () => window.removeEventListener('resize', updateBlocks);
  }, [updateBlocks]);

  const handleMouseMove = useThrottle((e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / CONFIG.BLOCK_SIZE);
    const row = Math.floor(y / CONFIG.BLOCK_SIZE);
    const numCols = Math.ceil(rect.width / CONFIG.BLOCK_SIZE);
    const index = row * numCols + col;

    setHighlightedBlock(index);
    setTimeout(() => setHighlightedBlock(null), 250);
  }, 16);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
    >
      {blocks.map((_, index) => (
        <div
          key={index}
          className={`absolute w-[50px] h-[50px] transition-all duration-200 
                     ${highlightedBlock === index ? 'bg-white opacity-20 scale-110' : 'opacity-0'}`}
          style={{
            left: `${(index % Math.ceil(window.innerWidth / CONFIG.BLOCK_SIZE)) * CONFIG.BLOCK_SIZE}px`,
            top: `${Math.floor(index / Math.ceil(window.innerWidth / CONFIG.BLOCK_SIZE)) * CONFIG.BLOCK_SIZE}px`,
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Board Component
export default function Board() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down');
  const tilesRef = useRef([]);
  const lastScrollY = useRef(0);
  const lastFlipTime = useRef(0);
  const scrollTimeout = useRef(null);

  const getTiltAngle = useCallback((index) => {
    const position = index % CONFIG.COLS;
    return CONFIG.TILT_ANGLES[position];
  }, []);

  const animateTile = useTileAnimation(isFlipped, setIsAnimating);

  const getAnimationOrder = useCallback((index, direction) => {
    const row = Math.floor(index / CONFIG.COLS);
    const col = index % CONFIG.COLS;
    
    if (direction === 'down') {
      return row + col; // Diagonal wave from top-left to bottom-right
    } else if (direction === 'up') {
      return (CONFIG.ROWS - 1 - row) + col; // Diagonal wave from bottom-left to top-right
    } else if (direction === 'left') {
      return col + row; // Diagonal wave from right to left
    } else {
      return (CONFIG.COLS - 1 - col) + row; // Diagonal wave from left to right
    }
  }, []);

  const flipAllTiles = useCallback(() => {
    if (isAnimating) return;

    const currentTime = Date.now();
    if (currentTime - lastFlipTime.current < CONFIG.SCROLL_DEBOUNCE) return;
    
    lastFlipTime.current = currentTime;
    setIsAnimating(true);
    setIsFlipped(prev => !prev);
    
    tilesRef.current.forEach((tile, index) => {
      const delay = getAnimationOrder(index, scrollDirection) * CONFIG.STAGGER_DELAY;
      
      gsap.to(tile, {
        rotateX: !isFlipped ? 180 : 0,
        duration: CONFIG.ANIMATION_DURATION,
        delay,
        ease: "power2.inOut",
        onComplete: index === tilesRef.current.length - 1 ? () => setIsAnimating(false) : undefined
      });
    });
  }, [isAnimating, isFlipped, scrollDirection, getAnimationOrder]);

  useEffect(() => {
    let accumulatedScroll = 0;
    let lastScrollTime = Date.now();

    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const currentTime = Date.now();
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;
      
      // Update scroll direction
      setScrollDirection(scrollDiff > 0 ? 'down' : 'up');
      
      if (currentTime - lastScrollTime > 200) {
        accumulatedScroll = 0;
      }
      
      accumulatedScroll += Math.abs(scrollDiff);
      lastScrollTime = currentTime;

      if (accumulatedScroll > CONFIG.SCROLL_THRESHOLD) {
        flipAllTiles();
        accumulatedScroll = 0;
      }

      scrollTimeout.current = setTimeout(() => {
        lastScrollY.current = currentScrollY;
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [flipAllTiles]);

  const tiles = useMemo(() => 
    Array.from({ length: CONFIG.ROWS }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex-1 flex gap-1">
        {Array.from({ length: CONFIG.COLS }).map((_, colIndex) => {
          const index = rowIndex * CONFIG.COLS + colIndex;
          const animationOrder = getAnimationOrder(index, scrollDirection);
          
          return (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              ref={el => tilesRef.current[index] = el}
              rowIndex={rowIndex}
              colIndex={colIndex}
              isFlipped={isFlipped}
              onAnimate={animateTile}
              getTiltAngle={() => getTiltAngle(index)}
              animationProgress={!isAnimating || (animationOrder / (CONFIG.ROWS * CONFIG.COLS))}
            />
          );
        })}
      </div>
    )), [isFlipped, animateTile, getTiltAngle, scrollDirection, isAnimating, getAnimationOrder]);

  return (
    <div className="relative">
      <div className="w-screen h-screen p-1 flex flex-col gap-1 perspective bg-black">
        {tiles}
      </div>
      <BlockOverlay />
      
      {/* Optional: Visual indicator for scroll direction */}
      <div className="fixed bottom-4 right-4 bg-white/10 px-4 py-2 rounded-full text-white text-sm">
        {scrollDirection === 'down' ? '↓' : '↑'} Scroll to flip
      </div>
    </div>
  );
}