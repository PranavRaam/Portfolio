import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from 'split-type';
import CustomCursor from '../CustomCursor';
// import LoadingScreen from './LoadingScreen';
import HeroSection from './HeroSection';
import AnimatedSections from './AnimatedSections';
import { setupScrollAnimations } from './animations';

gsap.registerPlugin(ScrollTrigger);

const TextReveal = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Split text into characters
    const titles = document.querySelectorAll('.split-text');
    titles.forEach(title => {
      new SplitType(title, { types: 'chars' });
    });

    // Setup animations
    setupScrollAnimations();
  }, []);

  return (
    <>
      <CustomCursor />
      {/* <LoadingScreen /> */}
      <div ref={containerRef} className="min-h-[400vh] bg-black text-white overflow-hidden">
        <HeroSection />
        <AnimatedSections />
      </div>
    </>
  );
};

export default TextReveal;