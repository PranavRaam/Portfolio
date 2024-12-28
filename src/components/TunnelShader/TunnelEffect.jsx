import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../../shaders';

export default function TunnelEffect({ uniformsRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      0.1,
      10
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
      alpha: true,
    });

    const updateSize = () => {
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Ensure iResolution is defined before accessing
      if (!uniformsRef.current.iResolution) {
        uniformsRef.current.iResolution = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
      } else {
        uniformsRef.current.iResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: uniformsRef.current,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let lastTime = 0;
    function animate(time) {
      const deltaTime = time - lastTime;
      lastTime = time;
      if (uniformsRef.current.iTime) {
        uniformsRef.current.iTime.value += deltaTime * 0.001;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate(0);

    return () => {
      window.removeEventListener('resize', updateSize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [uniformsRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}
