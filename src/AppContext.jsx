import React, { createContext, useContext, useState, useRef } from 'react';
import * as THREE from 'three';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const uniformsRef = useRef({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2() },
    scrollOffset: { value: 0 },
  });

  const appRef = useRef(null);
  const lenisRef = useRef(null);
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEasterEgg, setActiveEasterEgg] = useState(null);
  const [konamiCode, setKonamiCode] = useState([]);

  const triggerMatrixEffect = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const chars = 'YOUHAVEBEENRICKROLLED@#$%^&*';
    
    canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:1000;pointer-events:none;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const cols = Math.floor(canvas.width / 20);
    const ypos = Array(cols).fill(0);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const matrix = () => {
      ctx.fillStyle = '#0001';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f0';
      ctx.font = '15pt monospace';

      ypos.forEach((y, ind) => {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, ind * 20, y);
        ypos[ind] = y > 100 + Math.random() * 10000 ? 0 : y + 20;
      });
    };

    const interval = setInterval(matrix, 50);
    setTimeout(() => {
      clearInterval(interval);
      document.body.removeChild(canvas);
    }, 5000);
  };

  const initAudioVisualization = () => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioRef.current = new AudioContext();
      
      const oscillator = audioRef.current.createOscillator();
      const gainNode = audioRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioRef.current.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioRef.current.currentTime);

      oscillator.start();
      setIsPlaying(true);

      setTimeout(() => {
        oscillator.stop();
        setIsPlaying(false);
        audioRef.current = null;
      }, 1000);
    }
  };

  const value = {
    uniformsRef,
    appRef,
    lenisRef,
    audioRef,
    isPlaying,
    setIsPlaying,
    activeEasterEgg,
    setActiveEasterEgg,
    konamiCode,
    setKonamiCode,
    triggerMatrixEffect,
    initAudioVisualization,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};