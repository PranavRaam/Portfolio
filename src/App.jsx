import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Music, Brain, Wand2 } from 'lucide-react';
import Board from './components/GridLayout/Board';
import TunnelEffect from './components/TunnelShader/TunnelEffect';
import TextRevealSection from './components/TextAnimation/TextRevealSection';

gsap.registerPlugin(ScrollTrigger);

const useWindowSize = () => {
  const [size, setSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};

const EasterEggButton = ({ icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-full ${
      isActive ? 'bg-red-500' : 'bg-gray-800'
    } hover:bg-red-600 transition-all duration-300`}
  >
    <Icon size={24} className="text-white" />
  </button>
);

const App = () => {
  const uniformsRef = useRef({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2() },
    scrollOffset: { value: 0 },
  });

  const appRef = useRef(null);
  const lenisRef = useRef(null);
  const audioRef = useRef(null);
  const { width, height } = useWindowSize();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEasterEgg, setActiveEasterEgg] = useState(null);
  const [konamiCode, setKonamiCode] = useState([]);
  
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

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

  const initializeSectionAnimations = () => {
    // Hero Section Animation
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '+=50%',
        scrub: 1,
      },
    })
    .fromTo('.red-banner', 
      { clipPath: 'inset(50% 50%)', opacity: 0 },
      { clipPath: 'inset(0% 0%)', opacity: 0.15, duration: 1.5, ease: 'power3.inOut' }
    )
    .to('.hero-content', { opacity: 0, duration: 0.5, ease: 'power2.in' });

    // Grid Animation
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: '15% top',
        end: '+=100%',
        scrub: 1,
      },
    })
    .fromTo('.grid-container', 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
    )
    .to('.grid-tile', {
      rotationY: 180,
      stagger: { amount: 1.5, grid: [10, 10], from: 'center', ease: 'power2.inOut' },
    });

    // Text Reveal Animation
    gsap.timeline({
      scrollTrigger: {
        trigger: '.text-reveal-section',
        start: 'top center',
        end: '+=200%',
        pin: true,
        scrub: 1.2,
      },
    })
    .to('.reveal-circle', { scale: 35, duration: 1.5, ease: 'power2.inOut' })
    .from('.text-line', {
      y: 120,
      opacity: 0,
      stagger: 0.25,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.8')
    .to('.text-line', {
      y: -120,
      opacity: 0,
      stagger: 0.25,
      duration: 0.8,
      ease: 'power2.in',
    }, '+=1');
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      const newCode = [...konamiCode, e.key];
      if (newCode.length > konamiSequence.length) newCode.shift();
      setKonamiCode(newCode);

      if (newCode.join('') === konamiSequence.join('')) {
        triggerMatrixEffect();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiCode]);

  useEffect(() => {
    lenisRef.current = new Lenis({
      lerp: 0.075,
      smooth: true,
      direction: 'vertical',
      smoothWheel: true,
      smoothTouch: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 0.8,
    });

    const handleScroll = (e) => {
      ScrollTrigger.update();
      uniformsRef.current.scrollOffset.value = e.animatedScroll / 1000;
      const progress = e.progress * 100;
      document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
    };

    lenisRef.current.on('scroll', handleScroll);

    const tickerCallback = (time) => {
      lenisRef.current?.raf(time * 1000);
      uniformsRef.current.iTime.value += 0.01;
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    initializeSectionAnimations();

    return () => {
      lenisRef.current?.destroy();
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    uniformsRef.current.iResolution.value.set(width, height);
  }, [width, height]);

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-red-500 transition-all duration-150"
          style={{ width: 'var(--scroll-progress, 0%)' }}
        />
      </div>

      {/* Easter Egg Buttons */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
        <EasterEggButton
          icon={Music}
          isActive={activeEasterEgg === 'music'}
          onClick={() => {
            initAudioVisualization();
            setActiveEasterEgg('music');
          }}
        />
        <EasterEggButton
          icon={Brain}
          isActive={activeEasterEgg === 'ai'}
          onClick={() => {
            triggerMatrixEffect();
            setActiveEasterEgg('ai');
          }}
        />
        <EasterEggButton
          icon={Wand2}
          isActive={activeEasterEgg === 'magic'}
          onClick={() => {
            setActiveEasterEgg('magic');
            gsap.to('.hero-content', {
              rotation: 360,
              scale: 1.2,
              duration: 1,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: 1
            });
          }}
        />
      </div>

      <div ref={appRef} className="relative bg-black text-white">
        <section className="hero-section w-full h-screen relative overflow-hidden">
          <div className="red-banner absolute inset-0 bg-red-500 z-20" />
          <div className="hero-content absolute inset-0 flex flex-col items-center justify-center z-30">
            <h1 className="text-7xl md:text-8xl font-bold text-center mb-8 tracking-tight">
              Welcome to My Portfolio
            </h1>
            <p className="text-xl md:text-2xl opacity-80 max-w-2xl text-center px-4 mb-12">
              Where AI meets Music • Try the Konami Code!
            </p>
            <div className="animate-bounce">
              <div className="w-8 h-12 border-2 border-white rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-white rounded-full animate-scroll" />
              </div>
            </div>
          </div>
        </section>

        <Board />
        <TextRevealSection />

        <section className="tunnel-section w-full h-screen relative">
          <TunnelEffect uniformsRef={uniformsRef} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-center space-y-6 px-4">
              <h2 className="text-5xl md:text-6xl font-bold">Explore My Work</h2>
              <p className="text-2xl md:text-3xl opacity-80 max-w-2xl">
                Discover my projects and creative process
              </p>
            </div>
          </div>
        </section>

        <section className="w-full min-h-screen bg-gradient-to-b from-black to-gray-900 py-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">Featured Projects</h2>
              <p className="text-2xl opacity-80 max-w-2xl mx-auto">
                A collection of my best work and creative experiments
              </p>
            </div>
          </div>
        </section>

        <section className="w-full min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-4xl w-full text-center space-y-10">
            <h2 className="text-6xl md:text-7xl font-bold">Let's Connect</h2>
            <p className="text-2xl md:text-3xl opacity-80 max-w-2xl mx-auto">
              Ready to start a project together? Let's create something amazing.
            </p>
            <div className="mt-12">
              <button className="px-8 py-4 bg-red-500 text-white rounded-lg text-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105">
                Get in Touch
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default App;