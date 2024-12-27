import { useState } from 'react';
import { animate } from 'framer-motion';

export const useFlipAnimation = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flip = (element) => {
    setIsFlipped((prev) => !prev);
    animate(element, { rotateY: isFlipped ? 0 : 180 }, { duration: 0.6, ease: "easeOut" });
  };

  return { isFlipped, flip };
};
