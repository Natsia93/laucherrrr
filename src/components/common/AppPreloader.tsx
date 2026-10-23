"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AppPreloader() {
  const [show, setShow] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Show on entry pages (/login, /register, /) or if first time in session
    const isEntryPage = pathname === "/" || pathname === "/login" || pathname === "/register";
    const hasSeen = sessionStorage.getItem("launcher_preloader_seen");

    if (isEntryPage || !hasSeen) {
      setShow(true);
      sessionStorage.setItem("launcher_preloader_seen", "true");
    }
  }, [pathname]);

  useEffect(() => {
    if (!show) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 0.0s - 1.2s: Stroke draws smoothly
    // 0.8s - 1.4s: ReVOU Logo pure fade-in
    // 1.4s - 2.8s: Hold logo so user sees it clearly
    // 2.8s       : Start smooth fade out of the entire preloader
    // 3.6s       : Unmount & restore scroll
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2800);

    const unmountTimer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = prevOverflow;
    }, 3600);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] flex items-center justify-center select-none pointer-events-auto"
          style={{
            background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F6F7F9 55%, #E6E9EF 100%)",
          }}
        >
          {/* Logo & Stroke Container - Identical size with zero outer margin */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {/* SVG Animated Yellow Stroke - Fits directly on the perimeter of the ReVOU logo */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10"
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Animated Stroke drawing smoothly from 0 to 100% */}
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                stroke="#FFDE3C"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                }}
                transition={{
                  pathLength: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.2 },
                }}
                style={{
                  filter: "drop-shadow(0 0 3px rgba(255, 222, 60, 0.5))",
                }}
              />
            </svg>

            {/* ReVOU Logo - PURE FADE IN ONLY (NO scale, NO zoom) */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center pointer-events-none z-0 p-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.75, ease: "easeInOut" }}
            >
              <Image
                src="/logo/Logo_revou.png"
                alt="RevoU"
                fill
                sizes="96px"
                priority
                className="object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
