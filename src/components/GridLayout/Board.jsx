import { useState, useRef, useEffect, forwardRef } from 'react';
import { gsap } from 'gsap';

const ROWS = 6;
const COLS = 6;
const BLOCK_SIZE = 50;
const COOLDOWN = 300;
const SCROLL_THRESHOLD = 300;
const SCROLL_DEBOUNCE = 1000;

// Tile Component
const Tile = forwardRef(({ rowIndex, colIndex, isFlipped, onAnimate, getTiltAngle, index }, ref) => {
  const lastEnterTime = useRef(0);
  const bgPosition = `${colIndex * 20}% ${rowIndex * 20}%`;

  const handleMouseEnter = () => {
    const currentTime = Date.now();
    if (currentTime - lastEnterTime.current > COOLDOWN) {
      lastEnterTime.current = currentTime;
      onAnimate(ref.current, getTiltAngle());
    }
  };

  return (
    <div
      ref={ref}
      className="tile flex-1 relative preserve-3d will-change-transform cursor-pointer"
      onMouseEnter={handleMouseEnter}
    >
      <div className="tile-front absolute w-full h-full backface-hidden">
        <div 
          className="tile-content absolute inset-0"
          style={{ 
            backgroundImage: "url('/LandingImage-1/1.png')",
            backgroundSize: '600% 600%',
            backgroundPosition: bgPosition
          }}
        />
      </div>
      <div className="tile-back absolute w-full h-full backface-hidden rotate-y-180">
        <div 
          className="tile-content absolute inset-0"
          style={{ 
            backgroundImage: "url('/LandingImage-1/2.png')",
            backgroundSize: '600% 600%',
            backgroundPosition: bgPosition
          }}
        />
      </div>
    </div>
  );
});

const BlockOverlay = () => {
  const [blocks, setBlocks] = useState([]);
  const [highlightedBlock, setHighlightedBlock] = useState(null);
  const containerRef = useRef(null);
  const throttleRef = useRef(false);

  useEffect(() => {
    const updateBlocks = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const numCols = Math.ceil(screenWidth / BLOCK_SIZE);
      const numRows = Math.ceil(screenHeight / BLOCK_SIZE);
      const totalBlocks = numRows * numCols;
      
      setBlocks(Array(totalBlocks).fill(0));
    };

    updateBlocks();
    window.addEventListener('resize', updateBlocks);
    return () => window.removeEventListener('resize', updateBlocks);
  }, []);

  const handleMouseMove = (e) => {
    if (throttleRef.current || !containerRef.current) return;
    throttleRef.current = true;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / BLOCK_SIZE);
    const row = Math.floor(y / BLOCK_SIZE);
    const numCols = Math.ceil(rect.width / BLOCK_SIZE);
    const index = row * numCols + col;

    setHighlightedBlock(index);
    setTimeout(() => {
      setHighlightedBlock(null);
    }, 250);

    setTimeout(() => {
      throttleRef.current = false;
    }, 16);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
    >
      {blocks.map((_, index) => (
        <div
          key={index}
          className={`absolute w-[50px] h-[50px] transition-opacity duration-200 ${
            highlightedBlock === index ? 'bg-white opacity-20' : 'opacity-0'
          }`}
          style={{
            left: `${(index % Math.ceil(window.innerWidth / BLOCK_SIZE)) * BLOCK_SIZE}px`,
            top: `${Math.floor(index / Math.ceil(window.innerWidth / BLOCK_SIZE)) * BLOCK_SIZE}px`,
          }}
        />
      ))}
    </div>
  );
};

// Board Component
export default function Board() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const tilesRef = useRef([]);
  const lastScrollY = useRef(0);
  const lastFlipTime = useRef(0);
  const scrollTimeout = useRef(null);

  const getTiltAngle = (index) => {
    const position = index % 6;
    const tiltAngles = [-40, -20, -10, 10, 20, 40];
    return tiltAngles[position];
  };

  const animateTile = (tile, tiltY) => {
    if (isAnimating) return;
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
  };

  const flipAllTiles = () => {
    if (isAnimating) return;

    const currentTime = Date.now();
    if (currentTime - lastFlipTime.current < SCROLL_DEBOUNCE) return;
    
    lastFlipTime.current = currentTime;
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    
    gsap.to(tilesRef.current, {
      rotateX: !isFlipped ? 180 : 0,
      duration: 0.6,
      stagger: {
        amount: 0.3,
        from: "random"
      },
      ease: "power2.inOut",
      onComplete: () => setIsAnimating(false)
    });
  };

  useEffect(() => {
    let accumulatedScroll = 0;
    let lastScrollTime = Date.now();

    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const currentTime = Date.now();
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);
      
      if (currentTime - lastScrollTime > 200) {
        accumulatedScroll = 0;
      }
      
      accumulatedScroll += scrollDiff;
      lastScrollTime = currentTime;

      if (accumulatedScroll > SCROLL_THRESHOLD) {
        flipAllTiles();
        accumulatedScroll = 0;
      }

      scrollTimeout.current = setTimeout(() => {
        lastScrollY.current = currentScrollY;
      }, 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFlipped]);

  return (
    <>
      <div className="w-screen h-screen p-1 flex flex-col gap-1 perspective bg-black">
        {Array.from({ length: ROWS }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex-1 flex gap-1">
            {Array.from({ length: COLS }).map((_, colIndex) => {
              const index = rowIndex * COLS + colIndex;
              return (
                <Tile
                  key={`${rowIndex}-${colIndex}`}
                  ref={el => tilesRef.current[index] = el}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  isFlipped={isFlipped}
                  onAnimate={animateTile}
                  getTiltAngle={() => getTiltAngle(index)}
                  index={index}
                />
              );
            })}
          </div>
        ))}
      </div>
      <BlockOverlay />
    </>
  );
}
