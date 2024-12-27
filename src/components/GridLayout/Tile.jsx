import { forwardRef, useRef, useState } from 'react';

const Tile = forwardRef(({ rowIndex, colIndex, isFlipped, onAnimate, getTiltAngle, index }, ref) => {
  const lastEnterTime = useRef(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const bgPosition = `${colIndex * 20}% ${rowIndex * 20}%`;

  const handleMouseMove = (e) => {
    if (!isHovered) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    
    setPosition({ x, y });
  };

  const handleMouseEnter = (e) => {
    const currentTime = Date.now();
    if (currentTime - lastEnterTime.current > 300) {
      lastEnterTime.current = currentTime;
      onAnimate(ref.current, getTiltAngle());
      setIsHovered(true);
      handleMouseMove(e);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      className="flex-1 relative preserve-3d will-change-transform cursor-pointer transition-all duration-300"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

Tile.displayName = 'Tile';
export default Tile;