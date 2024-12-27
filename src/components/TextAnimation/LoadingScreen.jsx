import { useEffect } from "react";
import { gsap } from "gsap";

const LoadingScreen = () => {
  useEffect(() => {
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
    });
  }, []);

  return <div className="loader fixed inset-0 bg-red-600 z-40" />;
};

export default LoadingScreen;