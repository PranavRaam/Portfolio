import React, { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import confetti from 'canvas-confetti';
import { 
  Music, Brain, Wand2, Terminal, GitBranch, Code2,
  Sparkles, Palette, Gamepad2, Moon, Sun, Cloud,
  Zap, Globe, Compass
} from 'lucide-react';

// Lazy loaded components
const Board = React.lazy(() => import('./components/GridLayout/Board'));
const TunnelEffect = React.lazy(() => import('./components/TunnelShader/TunnelEffect'));
const TextRevealSection = React.lazy(() => import('./components/TextAnimation/TextRevealSection'));
const CustomCursor = React.lazy(() => import('./components/CustomCursor'));

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Theme configurations
const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  CYBER: 'cyber',
  RETRO: 'retro',
  NATURE: 'nature',
  SPACE: 'space'
};

const THEME_CONFIGS = {
  [THEMES.DARK]: {
    background: 'bg-black',
    text: 'text-white',
    accent: 'text-red-500',
    hover: 'hover:text-red-400'
  },
  [THEMES.LIGHT]: {
    background: 'bg-white',
    text: 'text-black',
    accent: 'text-blue-500',
    hover: 'hover:text-blue-400'
  },
  [THEMES.CYBER]: {
    background: 'bg-gray-900',
    text: 'text-cyan-400',
    accent: 'text-purple-500',
    hover: 'hover:text-purple-400'
  },
  [THEMES.RETRO]: {
    background: 'bg-amber-100',
    text: 'text-amber-900',
    accent: 'text-orange-600',
    hover: 'hover:text-orange-500'
  },
  [THEMES.NATURE]: {
    background: 'bg-green-900',
    text: 'text-emerald-200',
    accent: 'text-yellow-400',
    hover: 'hover:text-yellow-300'
  },
  [THEMES.SPACE]: {
    background: 'bg-indigo-950',
    text: 'text-violet-200',
    accent: 'text-fuchsia-500',
    hover: 'hover:text-fuchsia-400'
  }
};

// Custom hooks
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

const useTheme = (initialTheme = THEMES.DARK) => {
  const [theme, setTheme] = useState(initialTheme);
  const [achievements, setAchievements] = useState(new Set());

  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    
    // Track theme usage and unlock achievement if all themes tried
    setAchievements(prev => {
      const newAchievements = new Set(prev);
      newAchievements.add(`theme_${newTheme}`);
      
      if (newAchievements.size === Object.keys(THEMES).length) {
        confetti({
          particleCount: 100,
          spread: 160,
          origin: { y: 0.6 }
        });
        newAchievements.add('theme_master');
      }
      
      return newAchievements;
    });
  }, []);

  return {
    theme,
    changeTheme,
    currentTheme: THEME_CONFIGS[theme],
    achievements
  };
};

const useKonamiCode = (callback) => {
  const [sequence, setSequence] = useState([]);
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newSequence = [...sequence, e.keyCode];
      if (newSequence.length > konamiCode.length) {
        newSequence.shift();
      }
      setSequence(newSequence);

      if (newSequence.join(',') === konamiCode.join(',')) {
        callback();
        setSequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence, callback]);
};

// Components
const EasterEggButton = React.memo(({ icon: Icon, isActive, onClick, tooltip }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      className={`p-3 rounded-full transform transition-all duration-300 ${
        isActive ? 'bg-red-500' : 'bg-gray-800'
      } hover:bg-red-600 hover:scale-105 active:scale-95 hover:rotate-12`}
    >
      <Icon className="w-6 h-6 text-white" />
    </button>
    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black px-2 py-1 rounded text-xs text-white whitespace-nowrap">
      {tooltip}
    </span>
  </div>
));

const ThemeSelector = React.memo(({ theme, handleThemeChange }) => (
  <div className="fixed top-4 right-4 flex gap-2 z-50">
    {Object.entries(THEMES).map(([key, value]) => (
      <button
        key={key}
        onClick={() => handleThemeChange(value)}
        className={`p-2 rounded-full transition-all duration-300 ${
          theme === value ? 'scale-110 ring-2 ring-white' : 'opacity-70'
        }`}
        title={`Switch to ${key.toLowerCase()} theme`}
      >
        {value === THEMES.DARK && <Moon className="w-6 h-6 text-gray-200" />}
        {value === THEMES.LIGHT && <Sun className="w-6 h-6 text-yellow-400" />}
        {value === THEMES.CYBER && <Zap className="w-6 h-6 text-cyan-400" />}
        {value === THEMES.RETRO && <Globe className="w-6 h-6 text-orange-400" />}
        {value === THEMES.NATURE && <Cloud className="w-6 h-6 text-green-400" />}
        {value === THEMES.SPACE && <Compass className="w-6 h-6 text-purple-400" />}
      </button>
    ))}
  </div>
));

const TunnelRoute = React.memo(() => {
  const tunnelUniformsRef = useRef({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    scrollOffset: { value: 0 },
  });

  const [isExiting, setIsExiting] = useState(false);

  return (
    <div className={`tunnel-section w-full h-screen relative ${isExiting ? 'fade-out' : ''}`}>
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <TunnelEffect uniformsRef={tunnelUniformsRef} />
      </Suspense>
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <Link
          to="/"
          className="text-xl font-bold text-red-500 underline hover:text-red-400 transition-colors"
          onClick={() => setIsExiting(true)}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
});

const App = () => {
  const { theme, changeTheme, currentTheme, achievements } = useTheme();
  const { width, height } = useWindowSize();
  const lenisRef = useRef(null);
  const audioContextRef = useRef(null);

  const [state, setState] = useState({
    isPlaying: false,
    showSecret: false,
    debugMode: false,
    matrixMode: false,
    gameActive: false,
    currentQuote: 0,
    developerQuotes: [
      "I don't always test my code, but when I do, I do it in production",
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Git push --force: Because sometimes, history needs a little rewriting",
      "The best code is no code at all",
      "It works on my machine ¯\\_(ツ)_/¯"
    ]
  });

  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smooth: true,
      direction: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Handle audio visualization
  const initAudioVisualization = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);

      oscillator.start();
      setState(prev => ({ ...prev, isPlaying: true }));

      setTimeout(() => {
        oscillator.stop();
        setState(prev => ({ ...prev, isPlaying: false }));
        audioContextRef.current = null;
      }, 1000);
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }, []);

  // Konami code handler
  useKonamiCode(() => {
    setState(prev => ({ ...prev, gameActive: true }));
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.6 }
    });
  });

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>
      <ThemeSelector theme={theme} handleThemeChange={changeTheme} />
      <Routes>
        <Route path="/tunnel" element={<TunnelRoute />} />
        <Route 
          path="/" 
          element={
            <div className={`relative ${currentTheme.background} ${currentTheme.text} min-h-screen transition-colors duration-500`}>
              {/* Hero Section */}
              <section className="hero-section h-screen relative overflow-hidden">
                <div className="hero-content absolute inset-0 flex flex-col items-center justify-center z-30">
                  <h1 className={`text-7xl md:text-8xl font-bold text-center mb-8 tracking-tight 
                    ${currentTheme.accent} ${currentTheme.hover} transition-colors ${state.gameActive ? 'animate-bounce' : ''}`}>
                    {state.debugMode ? "console.log('Hello World');" : "Welcome to the Matrix"}
                  </h1>

                  {/* Easter Egg Buttons */}
                  <div className="flex flex-wrap justify-center gap-4">
                    <EasterEggButton
                      icon={Terminal}
                      isActive={state.debugMode}
                      onClick={() => setState(prev => ({ ...prev, debugMode: !prev.debugMode }))}
                      tooltip="Toggle debug mode"
                    />
                    <EasterEggButton
                      icon={GitBranch}
                      isActive={false}
                      onClick={() => confetti()}
                      tooltip="Git push --force"
                    />
                    <EasterEggButton
                      icon={Music}
                      isActive={state.isPlaying}
                      onClick={initAudioVisualization}
                      tooltip="Make some noise!"
                    />
                    <EasterEggButton
                      icon={Sparkles}
                      isActive={state.matrixMode}
                      onClick={() => setState(prev => ({ ...prev, matrixMode: !prev.matrixMode }))}
                      tooltip="Toggle Matrix mode"
                    />
                  </div>

                  {/* Developer Quote */}
                  <div 
                    className={`text-xl font-medium mt-8 cursor-pointer ${currentTheme.accent} ${currentTheme.hover}`}
                    onClick={() => setState(prev => ({
                      ...prev,
                      currentQuote: (prev.currentQuote + 1) % prev.developerQuotes.length
                    }))}
                  >
                    {state.developerQuotes[state.currentQuote]}
                  </div>
                </div>
              </section>

              {/* Board Section */}
              <Suspense fallback={<div className="w-full h-screen bg-black" />}>
                <Board />
              </Suspense>

              {/* Text Reveal Section */}
              <Suspense fallback={<div className="w-full h-screen bg-black" />}>
                <TextRevealSection />
              </Suspense>

              {/* Tunnel Link Section */}
              <section className="w-full min-h-screen flex items-center justify-center p-8">
                <Link
                  to="/tunnel"
                  className={`text-xl font-bold ${currentTheme.accent} ${currentTheme.hover} transition-colors underline`}
                >
                  Explore the Tunnel Effect
                </Link>
              </section>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;