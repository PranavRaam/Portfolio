import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Music2 } from 'lucide-react';
import { vertexShader, fragmentShader } from '../../shaders';

const spotifyTracks = [
  { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
  { title: "Stay With Me", artist: "Calvin Harris", duration: "3:42" },
  { title: "As It Was", artist: "Harry Styles", duration: "2:47" },
  { title: "Bad Habit", artist: "Steve Lacy", duration: "3:52" },
  { title: "About Damn Time", artist: "Lizzo", duration: "3:11" },
  { title: "Break My Soul", artist: "Beyoncé", duration: "4:38" },
];

const SongCard = ({ title, artist, duration }) => (
  <div className="w-64 p-4 rounded-xl backdrop-blur-lg bg-white/10 border border-white/20">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
        <Music2 className="w-6 h-6 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{title}</h3>
        <p className="text-white/70 text-sm truncate">{artist}</p>
      </div>
      <span className="text-white/50 text-sm">{duration}</span>
    </div>
  </div>
);

export default function TunnelEffectSection() {
  const uniformsRef = useRef({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2() },
    scrollOffset: { value: 0 }
  });
  
  return (
    <section className="w-full h-screen relative">
      <TunnelEffect uniformsRef={uniformsRef} />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <div className="text-center space-y-6 px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-white">Explore My Work</h2>
          <p className="text-2xl md:text-3xl text-white/80 max-w-2xl">
            Discover my projects and creative process
          </p>
        </div>
      </div>
    </section>
  );
}

function TunnelEffect({ uniformsRef }) {
  const canvasRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let renderer, scene, camera;

    // Three.js setup
    const initThree = () => {
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0.1,
        10
      );

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasRef.current,
        alpha: true,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        uniforms: uniformsRef.current,
        vertexShader,
        fragmentShader,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    };

    const updateSize = () => {
      if (!renderer) return;
      
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      uniformsRef.current.iResolution.value.set(window.innerWidth, window.innerHeight);
    };

    initThree();
    updateSize();
    window.addEventListener('resize', updateSize);

    // Animation loop
    let lastTime = 0;
    function animate(time) {
      const deltaTime = time - lastTime;
      lastTime = time;
      uniformsRef.current.iTime.value += deltaTime * 0.001;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    // Initialize cards
    const initializeCards = () => {
      spotifyTracks.forEach((_, index) => {
        const card = cardsContainerRef.current?.children[index];
        if (!card) return;

        gsap.set(card, {
          z: -2000 - index * 1000,
          opacity: index === 0 ? 1 : 0.3,
          scale: 1 - index * 0.1,
        });
      });
    };

    initializeCards();
    animate(0);

    const handleWheel = (e) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(activeIndex + direction, spotifyTracks.length - 1));
      
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        animateCards(newIndex);
      }
    };

    const animateCards = (newIndex) => {
      spotifyTracks.forEach((_, index) => {
        const card = cardsContainerRef.current?.children[index];
        if (!card) return;

        gsap.to(card, {
          z: -2000 - (index - newIndex) * 1000,
          opacity: index === newIndex ? 1 : 0.3,
          scale: 1 - Math.abs(index - newIndex) * 0.1,
          duration: 0.8,
          ease: "power2.out"
        });
      });

      gsap.to(uniformsRef.current.scrollOffset, {
        value: newIndex * 0.1,
        duration: 0.8,
        ease: "power2.out"
      });
    };

    canvasRef.current?.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('resize', updateSize);
      canvasRef.current?.removeEventListener('wheel', handleWheel);
      renderer?.dispose();
    };
  }, [uniformsRef, activeIndex]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      <div 
        ref={cardsContainerRef}
        className="absolute inset-0 flex items-center justify-center [perspective:2000px]"
      >
        {spotifyTracks.map((track, index) => (
          <div
            key={index}
            className="absolute cursor-pointer"
            onClick={() => {
              if (index !== activeIndex) {
                setActiveIndex(index);
                gsap.to(uniformsRef.current.scrollOffset, {
                  value: index * 0.1,
                  duration: 0.8,
                  ease: "power2.out"
                });
              }
            }}
            style={{
              transform: `translateZ(${-2000 - index * 1000}px) scale(${1 - index * 0.1})`,
              opacity: index === 0 ? 1 : 0.3,
              transition: 'transform 0.8s ease-out',
            }}
          >
            <SongCard {...track} />
          </div>
        ))}
      </div>
    </div>
  );
}