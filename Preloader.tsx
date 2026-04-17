"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";

export default function Preloader() {
  const [show, setShow] = useState(true);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoMainRef = useRef<HTMLDivElement>(null); // Container for logo
  const logoRef = useRef<HTMLDivElement>(null); // The filled logo
  const circleRef = useRef<SVGCircleElement>(null); // The mask circle

  useEffect(() => {
    // Logic: 
    // 1. New Visit (SessionStorage empty) -> Show
    // 2. Refresh on Home Page -> Show
    // 3. Otherwise -> Hide
    
    // We must check this inside useEffect to access window/sessionStorage
    const hasVisited = sessionStorage.getItem("hasVisited");
    const isHomePage = window.location.pathname === "/"; 
    
    const shouldShow = !hasVisited || isHomePage;

    if (!shouldShow) {
      // Use setTimeout to avoid synchronous setState warning during mount
      const timer = setTimeout(() => setShow(false), 0);
      return () => clearTimeout(timer);
    }

    // Mark as visited
    sessionStorage.setItem("hasVisited", "true");

    // Prevent scrolling while preloader is active
    document.body.style.overflow = "hidden";

    // Animation
    const ctx = gsap.context(() => {
      // Target radius is whichever is larger (width or height) to ensure coverage
      // multiplied by 1.5 to reach corners
      const targetRadius = Math.max(window.innerWidth, window.innerHeight) * 1.5;

      if (pathRef.current && logoRef.current && containerRef.current && circleRef.current) {
        const path = pathRef.current;
        const length = path.getTotalLength();

        // Initial States set via GSAP to ensure consistency
        // Start stroke completely hidden via offset
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 1 // Visible so we can see it draw
        });
        
        // Ensure filled logo is hidden
        gsap.set(logoRef.current, { opacity: 0 });
        
        // Ensure mask is closed (no hole yet)
        gsap.set(circleRef.current, { attr: { r: 0 } });

        const tl = gsap.timeline({
          onComplete: () => {
             // Ripple/Hole Reveal Animation via SVG Mask
             const exitTl = gsap.timeline({
               onComplete: () => {
                 setShow(false);
                 // Redundant unlock here just in case, but main unlock happens earlier
                 document.body.style.overflow = "";
               }
             });

             // 1. Hide Logo Container completely (fade out)
             exitTl.to(logoMainRef.current, {
                opacity: 0,
                duration: 0.5, // Faster fade out
                ease: "power2.in",
                onComplete: () => {
                    // Unlock scroll AS SOON AS logo is gone and content starts revealing
                    document.body.style.overflow = "";
                    // CRITICAL FIX: Ensure clicks pass through to Navbar/Content immediately
                    if (containerRef.current) {
                        containerRef.current.style.pointerEvents = "none";
                    }
                }
             });

             // 2. Expand the black circle (Mask) 
             // Very Slow Ripple (Calm exit)
             exitTl.to(circleRef.current, {
               attr: { r: targetRadius },
               duration: 6.0, 
               ease: "power2.out", 
             }, "-=0.2"); // Tighter overlap
          }
        });

        // 1. Stroke Animation
        // "Stroke berjalan" (Stroke walks/draws)
        tl.to(path, {
          strokeDashoffset: 0,
          duration: 2.0, // Faster drawing (2.5 -> 2.0)
          // Using 'sine.inOut' can sometimes be smoother visually for long strokes than power ease
          ease: "sine.inOut",
          autoRound: false // Vital for smooth updates on small viewboxes
        });

        // 2. Fade Fill In & Fill Up Effect - DURING the stroke animation
        // Starts towards the end of stroke
        // We use clipPath to make it look like it's "filling up" from bottom
        
        // Ensure clip-path is set initially (hidden from top)
        gsap.set(logoRef.current, { 
            clipPath: "inset(100% 0 0 0)",
            webkitClipPath: "inset(100% 0 0 0)" 
        });

        tl.to(logoRef.current, {
          opacity: 1,
          clipPath: "inset(0% 0 0 0)",
          webkitClipPath: "inset(0% 0 0 0)",
          duration: 0.8, 
          ease: "power2.out"
        }, "-=1.0"); // Overlap last 1.0s
        
        // 3. Fade Out Stroke - as finish touches
        tl.to(path, {
          opacity: 0, 
          duration: 0.4, 
          ease: "power2.out"
        }, "<"); // Run concurrently with fill complete
      }
    });

    return () => ctx.revert();
  }, []); // Run ONLY on mount

  if (!show) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999999] bg-transparent transform-gpu" // Force GPU
    >
        {/* SVG Background with Mask */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
                <mask id="holeMask">
                    {/* White rect = Visible part of the masked element */}
                    <rect width="100%" height="100%" fill="white" />
                    {/* Black circle = The "Hole" (Invisible part) */}
                    <circle ref={circleRef} cx="50%" cy="50%" r="0" fill="black" />
                </mask>
            </defs>
            {/* The Background Layer being masked */}
            <rect 
                width="100%" 
                height="100%" 
                fill="#396172" 
                mask="url(#holeMask)" 
            />
        </svg>

      {/* Centered Content */}
      <div 
        ref={logoMainRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      >
          {/* Reduced Logo Size Further */}
          <div className="relative w-12 h-12 md:w-20 md:h-20">
            {/* Stroke Animation Layer */}
            {/* Added shape-rendering="geometricPrecision" to help with smoothness */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 6.604 8.166" 
              className="absolute inset-0 w-full h-full z-10"
              style={{ overflow: 'visible' }}
              shapeRendering="geometricPrecision"
            >
              <path 
                ref={pathRef}
                fill="none" 
                stroke="#FFFFFF" 
                strokeWidth="0.15" // Slightly thicker for smoother anti-aliasing
                strokeLinecap="round"
                strokeLinejoin="round" 
                d="M0.489 8.14c0.227,-4.067 1.854,-2.967 4.347,-3.598 -0.506,1.742 -1.92,1.472 -3.087,2.099 -0.493,0.265 -0.942,0.691 -1.26,1.498zm5.912 -8.018c1.244,7.045 -6.731,0.612 -5.912,8.018 -0.83,-3.593 -0.328,-5.236 0.729,-6.096 1.361,-1.108 3.643,-0.917 5.183,-1.922z"
                style={{ opacity: 0, willChange: 'stroke-dashoffset' }} // Hide initially + performance hint
              />
            </svg>

            {/* Filled Logo Layer - White */}
            <div ref={logoRef} className="absolute inset-0 w-full h-full z-20 flex items-center justify-center pointer-events-none opacity-0">
                <Image 
                  src="/preloader/firoweb.svg" 
                  alt="Firoweb Loading" 
                  fill
                  className="object-contain brightness-0 invert" 
                  priority
                />
            </div>
          </div>
      </div>
    </div>
  );
}