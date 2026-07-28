"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      {/* 
        Ambient Background Animation
        Soft, slow-moving glow shapes in toxic green, deep blue, and warm gold.
      */}
      
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-20 bg-toxic"
        animate={{
          x: ["0%", "10%", "-5%", "0%"],
          y: ["0%", "5%", "-10%", "0%"],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[150px] opacity-15 bg-blue-600"
        animate={{
          x: ["0%", "-15%", "5%", "0%"],
          y: ["0%", "-10%", "15%", "0%"],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.08] bg-amber-500"
        animate={{
          x: ["0%", "20%", "-15%", "0%"],
          y: ["0%", "-20%", "10%", "0%"],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Subtle grid overlay to ground the blobs */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 mix-blend-overlay" />
    </div>
  );
}
