// src/components/Navbar.jsx
export default function Navbar() {
    return (
      <nav className="fixed w-full p-8 flex justify-between items-center mix-blend-exclusion z-20">
        <div className="flex gap-8">
          <a href="#" className="text-white uppercase font-mono text-sm">Work</a>
          <a href="#" className="text-white uppercase font-mono text-sm">Archive</a>
        </div>
        <div className="flex justify-center">
          <a href="#" className="text-white font-serif text-5xl font-light">Tunnel Vision</a>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-white uppercase font-mono text-sm">Info</a>
          <a href="#" className="text-white uppercase font-mono text-sm">Contact</a>
        </div>
      </nav>
    );
  }
  
  // src/components/Footer.jsx
  export default function Footer() {
    return (
      <footer className="fixed bottom-0 w-full p-8 flex justify-between items-center mix-blend-exclusion z-20">
        <p className="text-white uppercase font-mono text-sm">Watch Showreel</p>
        <p className="text-white uppercase font-mono text-sm">Launching 2025</p>
      </footer>
    );
  }
  
  // src/components/Slider.jsx
  import { useEffect } from 'react';
  import gsap from 'gsap';
  import ScrollTrigger from 'gsap/ScrollTrigger';
  
  export default function Slider({ slides, uniformsRef }) {
    useEffect(() => {
      const totalSlides = slides.length;
      const zStep = 2500;
      const initialZ = -22500;
  
      function mapRange(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
      }
  
      const slideElements = document.querySelectorAll('.slide');
      slideElements.forEach((slide, i) => {
        const zPosition = initialZ + i * zStep;
        const xPosition = i % 2 === 0 ? "30%" : "70%";
        const opacity = i === totalSlides - 1 ? 1 : i === totalSlides - 2 ? 0.5 : 0;
  
        gsap.set(slide, {
          top: "50%",
          left: xPosition,
          xPercent: -50,
          yPercent: -50,
          z: zPosition,
          opacity: opacity
        });
      });
  
      ScrollTrigger.create({
        trigger: ".container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          if (uniformsRef.current) {
            uniformsRef.current.scrollOffset.value = self.progress;
          }
        }
      });
  
      slideElements.forEach((slide) => {
        const initialZ = gsap.getProperty(slide, "z");
  
        ScrollTrigger.create({
          trigger: ".container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const zIncrement = progress * 22500;
            const currentZ = initialZ + zIncrement;
  
            let opacity;
            if (currentZ >= -2500) {
              opacity = mapRange(currentZ, -2500, 0, 0, 1);
            } else {
              opacity = mapRange(currentZ, -5000, -2500, 0, 0);
            }
  
            slide.style.opacity = opacity;
            slide.style.transform = `translate(-50%, -50%) translateZ(${currentZ}px)`;
          }
        });
      });
    }, [slides, uniformsRef]);
  
    return (
      <div className="slider fixed top-0 w-screen h-screen transform-gpu preserve-3d perspective-500 overflow-hidden z-20">
        {slides.map((slide, index) => (
          <div key={slide.id} className="slide absolute w-[400px] h-[500px]">
            <div className="slide-img w-full h-full p-2 bg-white/10 border border-white/20 backdrop-blur-lg">
              <img src={`./assets/img${index + 1}.jpg`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="slide-copy absolute w-full -bottom-6 flex justify-between">
              <p className="text-white uppercase font-mono text-sm">{slide.title}</p>
              <p className="text-white uppercase font-mono text-sm">{slide.id}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }