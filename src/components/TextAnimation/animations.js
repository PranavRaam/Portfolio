import { gsap } from "gsap";
import SplitType from 'split-type';

export const setupScrollAnimations = () => {
  // Initial hero text animation
  gsap.from('.char', {
    y: 100,
    opacity: 0,
    rotationX: -80,
    stagger: 0.02,
    duration: 1,
    ease: "power4.out",
  });

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
  reveals.forEach((text) => {
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
};