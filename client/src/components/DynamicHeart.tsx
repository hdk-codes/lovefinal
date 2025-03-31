
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const DynamicHeart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heartScale = useSpring(1, { stiffness: 300, damping: 30 });
  const heartRotateX = useTransform(mouseY, [-300, 300], [30, -30]);
  const heartRotateY = useTransform(mouseX, [-300, 300], [-30, 30]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        mouseX.set(e.gamma * 10);
        mouseY.set(e.beta * 10);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="perspective-1000 relative w-full h-full">
      <motion.div
        className="heart-container"
        style={{
          scale: heartScale,
          rotateX: heartRotateX,
          rotateY: heartRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="heart pulse-love floating">❤️</div>
      </motion.div>
    </div>
  );
};
