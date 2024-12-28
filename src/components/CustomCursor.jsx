// CustomCursor.jsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import "./CustomCursor.css"

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let posX = 0;
    let posY = 0;

    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        posX += (mouseX - posX) * 0.1;
        posY += (mouseY - posY) * 0.1;
        gsap.set(follower, {
          x: posX - 12,
          y: posY - 12
        });
        gsap.set(cursor, {
          x: mouseX,
          y: mouseY
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    const mouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const addHoverClass = () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    };

    const removeHoverClass = () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    };

    requestRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', mouseMove);
    document.querySelectorAll('a, button, .cursor-hover').forEach(el => {
      el.addEventListener('mouseenter', addHoverClass);
      el.addEventListener('mouseleave', removeHoverClass);
    });

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', mouseMove);
      document.querySelectorAll('a, button, .cursor-hover').forEach(el => {
        el.removeEventListener('mouseenter', addHoverClass);
        el.removeEventListener('mouseleave', removeHoverClass);
      });
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor"></div>
      <div ref={followerRef} className="cursor-follower"></div>
    </>
  );
};

export default CustomCursor;
