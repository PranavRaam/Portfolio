import React, { useRef, useEffect } from 'react';
import TunnelEffectSection from '../components/TunnelShader/TunnelEffect';

const TunnelPage = () => {
  const uniformsRef = useRef({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2() },
    scrollOffset: { value: 0 },
  });

  useEffect(() => {
    const tickerCallback = (time) => {
      uniformsRef.current.iTime.value += 0.01;
    };

    const interval = setInterval(tickerCallback, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      uniformsRef.current.iResolution.value.set(window.innerWidth, window.innerHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-screen relative bg-black">
      <TunnelEffectSection uniformsRef={uniformsRef} />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <div className="text-center space-y-6 px-4 text-white">
          <h2 className="text-5xl md:text-6xl font-bold">Interactive Tunnel</h2>
          <p className="text-2xl md:text-3xl opacity-80 max-w-2xl">
            Experience the mesmerizing tunnel effect
          </p>
        </div>
      </div>
    </div>
  );
};

export default TunnelPage;