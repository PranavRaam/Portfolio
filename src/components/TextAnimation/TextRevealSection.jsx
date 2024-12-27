import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from 'split-type';
import { Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TextReveal = () => {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    // Custom cursor animation
    const cursor = cursorRef.current;
    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out"
      });
    };
    window.addEventListener('mousemove', moveCursor);

    // Split text into characters
    const titles = document.querySelectorAll('.split-text');
    titles.forEach(title => {
      new SplitType(title, { types: 'chars' });
    });

    // Initial loading animation
    const tl = gsap.timeline();
    
    tl.from('.loader', {
      scaleY: 0,
      duration: 1.5,
      ease: "power4.inOut"
    })
    .to('.loader', {
      scaleY: 0,
      transformOrigin: "top",
      duration: 1.5,
      ease: "power4.inOut"
    })
    .from('.char', {
      y: 100,
      opacity: 0,
      rotationX: -80,
      stagger: 0.02,
      duration: 1,
      ease: "power4.out",
    }, "-=1");

    // Parallax sections
    const sections = gsap.utils.toArray('.parallax-section');
    sections.forEach((section) => {
      gsap.to(section, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    // Text reveal animations
    const reveals = gsap.utils.toArray('.reveal-text');
    reveals.forEach((text, i) => {
      const chars = new SplitType(text, { types: 'chars' });
      
      gsap.from(chars.chars, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        stagger: 0.02,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: text,
          start: "top center+=100",
          end: "top center-=100",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <>
      {/* Custom Cursor */}
      <div ref={cursorRef} className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference">
        <div className="w-full h-full bg-white rounded-full" />
      </div>

      {/* Loading Screen */}
      {/* <div className="loader fixed inset-0 bg-red-600 z-40" /> */}

      <div ref={containerRef} className="min-h-[400vh] bg-black text-white overflow-hidden">
        {/* Hero Section */}
        <div className="h-screen flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
          <h1 className="split-text text-9xl md:text-[12rem] font-black tracking-tighter text-center mix-blend-difference">
            DIGITAL
            <br />
            EVOLUTION
          </h1>
        </div>

        {/* Animated Sections */}
        <div className="space-y-[50vh] px-8 py-32 relative">
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-red-600/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `scale(${Math.random() * 2 + 1})`,
                  animation: `float ${Math.random() * 5 + 5}s infinite`
                }}
              />
            ))}
          </div>

          <div className="parallax-section max-w-7xl mx-auto">
            <div className="reveal-text">
              <h2 className="text-6xl md:text-9xl font-black text-red-600 mb-8">
                WE CREATE
              </h2>
              <p className="text-4xl md:text-7xl font-bold text-white leading-tight">
                IMMERSIVE DIGITAL EXPERIENCES
              </p>
            </div>
          </div>

          <div className="parallax-section max-w-7xl mx-auto">
            <div className="reveal-text">
              <h2 className="text-6xl md:text-9xl font-black text-white mb-8">
                WE DELIVER
              </h2>
              <p className="text-4xl md:text-7xl font-bold text-red-600 leading-tight">
                CUTTING-EDGE SOLUTIONS
              </p>
            </div>
          </div>

          <div className="parallax-section max-w-7xl mx-auto">
            <div className="reveal-text">
              <h2 className="text-6xl md:text-9xl font-black text-red-600 mb-8">
                WE PUSH
              </h2>
              <p className="text-4xl md:text-7xl font-bold text-white leading-tight">
                CREATIVE BOUNDARIES
              </p>
            </div>
          </div>

          <div className="parallax-section max-w-7xl mx-auto">
            <div className="reveal-text">
              <h2 className="text-6xl md:text-9xl font-black text-white mb-8">
                WE BUILD
              </h2>
              <p className="text-4xl md:text-7xl font-bold text-red-600 leading-tight">
                THE FUTURE OF WEB
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextReveal;
