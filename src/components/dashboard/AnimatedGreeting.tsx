"use client";

import { motion } from "framer-motion";

interface AnimatedGreetingProps {
  name: string;
}

export function AnimatedGreeting({ name }: AnimatedGreetingProps) {
  const greetingText = `Halo, ${name}!`;
  
  return (
    <h1 className="font-bricolage text-3xl font-medium tracking-tight text-neutral-900 dark:text-[#f4f3ed] flex">
      {greetingText.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ 
            duration: 0.5, 
            delay: 0.2 + (index * 0.04),
            ease: "easeOut"
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </h1>
  );
}
