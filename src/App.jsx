import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Music, Brain, Wand2,} from 'lucide-react';
import Board from './components/GridLayout/Board';
import TunnelEffect from './components/TunnelShader/TunnelEffect';
import TextRevealSection from './components/TextAnimation/TextRevealSection';


gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const uniformsRef = useRef({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2() },
    scrollOffset: { value: 0 },
  });

  const appRef = useRef(null);
  const lenisRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEasterEgg, redsetActiveEasterEgg] = useState(null);
  const { width, height } = useWindowSize();

  // Konami code implementation
  const [konamiCode, setKonamiCode] = useState([]);
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    const handleKeyPress = (e) => {
      const newCode = [...konamiCode, e.key];
      if (newCode.length > konamiSequence.length) {
        newCode.shift();
      }
      setKonamiCode(newCode);

      if (newCode.join('') === konamiSequence.join('')) {
        triggerMatrixEffect();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiCode]);

  const triggerMatrixEffect = () => {
    const chars = 'YOUHAVEBEENRICKROLLED@#$%^&*';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1000';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const cols = Math.floor(w / 20);
    const ypos = Array(cols).fill(0);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const matrix = () => {
      ctx.fillStyle = '#0001';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0f0';
      ctx.font = '15pt monospace';

      ypos.forEach((y, ind) => {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = ind * 20;
        ctx.fillText(text, x, y);
        if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
        else ypos[ind] = y + 20;
      });
    };

    const interval = setInterval(matrix, 50);
    setTimeout(() => {
      clearInterval(interval);
      document.body.removeChild(canvas);
    }, 5000);
  };

  // Audio visualization easter egg
  const initAudioVisualization = () => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
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
      }, 1000);
    }
  };

  useEffect(() => {
    lenisRef.current = new Lenis({
      lerp: 0.075,
      smooth: true,
      direction: 'vertical',
      gestureOrientation: 'vertical',
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
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    uniformsRef.current.iResolution.value.set(width, height);
  }, [width, height]);


  const initializeSectionAnimations = () => {
    // // Initial Banner Animation
    const initialBannerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '+=50%',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    initialBannerTimeline
      .fromTo(
        '.red-banner',
        {
          clipPath: 'inset(50% 50%)',
          opacity: 0
        },
        {
          clipPath: 'inset(0% 0%)',
          opacity: 0.15,
          duration: 1.5,
          ease: 'power3.inOut'
        }
      )
      .to('.hero-content', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      });

    // Grid Animation
    const gridTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: '15% top',
        end: '+=100%',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    gridTimeline
      .fromTo('.grid-container', {
        opacity: 0,
        scale: 0.8,
      }, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out'
      })
      .to('.grid-tile', {
        rotationY: 180,
        stagger: {
          amount: 1.5,
          grid: [10, 10],
          from: 'center',
          ease: 'power2.inOut',
        },
      });

    // Final Banner Animation
    const finalBannerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: '50% center',
        end: '+=75%',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    finalBannerTimeline
      .to('.red-banner', {
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut'
      })
      .to('.grid-container', {
        opacity: 0,
        scale: 1.2,
        duration: 1,
        ease: 'power2.in'
      }, '-=0.5');

    // Text Reveal Animation
    const textTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.text-reveal-section',
        start: 'top center',
        end: '+=200%',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      },
    });

    textTimeline
      .to('.reveal-circle', {
        scale: 35,
        duration: 1.5,
        ease: 'power2.inOut',
      })
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

    // Tunnel Effect Animation
    const tunnelTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.tunnel-section',
        start: 'top bottom',
        end: 'center center',
        scrub: 1.5,
      },
    });

    tunnelTimeline
      .fromTo('.tunnel-section',
        {
          opacity: 0,
          scale: 0.95
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: 'power2.out'
        }
      );

  //   const particles = [];
  //   const particleCount = 100;

  //   for (let i = 0; i < particleCount; i++) {
  //     particles.push({
  //       x: Math.random() * width,
  //       y: Math.random() * height,
  //       size: Math.random() * 3 + 1,
  //       speedX: Math.random() * 2 - 1,
  //       speedY: Math.random() * 2 - 1
  //     });
  //   }

  //   const canvas = document.createElement('canvas');
  //   canvas.style.position = 'fixed';
  //   canvas.style.top = '0';
  //   canvas.style.left = '0';
  //   canvas.style.pointerEvents = 'none';
  //   canvas.style.zIndex = '1';
  //   canvas.width = width;
  //   canvas.height = height;

  //   document.body.appendChild(canvas);
  //   const ctx = canvas.getContext('2d');

  //   const animateParticles = () => {
  //     ctx.clearRect(0, 0, width, height);
  //     ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';

  //     particles.forEach(particle => {
  //       particle.x += particle.speedX;
  //       particle.y += particle.speedY;

  //       if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
  //       if (particle.y < 0 || particle.y > height) particle.speedY *= -1;

  //       ctx.beginPath();
  //       ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  //       ctx.fill();
  //     });

  //     requestAnimationFrame(animateParticles);
  //   };

  //   animateParticles();


  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-red-500 transition-all duration-150"
          style={{ width: 'var(--scroll-progress, 0%)' }}
        />
      </div>

      {/* Easter Egg Trigger Buttons */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
        <button
          onClick={() => {
            initAudioVisualization();
            setActiveEasterEgg('music');
          }}
          className={`p-3 rounded-full ${activeEasterEgg === 'music' ? 'bg-red-500' : 'bg-gray-800'
            } hover:bg-red-600 transition-all duration-300`}
        >
          <Music size={24} />
        </button>
        <button
          onClick={() => {
            triggerMatrixEffect();
            setActiveEasterEgg('ai');
          }}
          className={`p-3 rounded-full ${activeEasterEgg === 'ai' ? 'bg-red-500' : 'bg-gray-800'
            } hover:bg-red-600 transition-all duration-300`}
        >
          <Brain size={24} />
        </button>
        <button
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
          className={`p-3 rounded-full ${activeEasterEgg === 'magic' ? 'bg-red-500' : 'bg-gray-800'
            } hover:bg-red-600 transition-all duration-300`}
        >
          <Wand2 size={24} />
        </button>
      </div>

      <div ref={appRef} className="relative bg-black text-white">
        {/* Existing sections remain the same */}
        <section className="hero-section w-full h-screen relative overflow-hidden">
          <div className="red-banner absolute inset-0 bg-red-500 z-20"></div>

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
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
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

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};