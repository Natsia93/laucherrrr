"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface AnimatedDeckIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * 📽️ Custom Animated Deck Icon (Presentation / Slides)
 * Built with Framer Motion for Launcher OS.
 * Features:
 * - Spring-loaded projector screen pull down
 * - Animated presentation chart line drawing
 * - Responsive to direct hover AND parent .group:hover
 */
export function AnimatedDeckIcon({ className = "", size = 18, ...props }: AnimatedDeckIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="deck-animated-icon w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          /* CSS fallback & trigger when parent .group is hovered */
          .group:hover .deck-screen-rect,
          .deck-animated-icon:hover .deck-screen-rect {
            animation: deckScreenBounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 12px 3px;
          }

          .group:hover .deck-chart-line,
          .deck-animated-icon:hover .deck-chart-line {
            animation: deckChartDraw 0.5s ease-out forwards;
          }

          .group:hover .deck-chart-dot,
          .deck-animated-icon:hover .deck-chart-dot {
            animation: deckDotPop 0.4s ease-out 0.2s forwards;
          }

          .group:hover .deck-pull-cord,
          .deck-animated-icon:hover .deck-pull-cord {
            animation: deckCordPull 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          @keyframes deckScreenBounce {
            0% { transform: scaleY(1); }
            35% { transform: scaleY(1.15) translateY(0.5px); }
            65% { transform: scaleY(0.96); }
            85% { transform: scaleY(1.02); }
            100% { transform: scaleY(1); }
          }

          @keyframes deckCordPull {
            0% { transform: translateY(0); }
            35% { transform: translateY(2.5px); }
            65% { transform: translateY(-0.8px); }
            85% { transform: translateY(0.3px); }
            100% { transform: translateY(0); }
          }

          @keyframes deckChartDraw {
            0% { stroke-dashoffset: 20; opacity: 0.3; }
            50% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }

          @keyframes deckDotPop {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.4); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        ` }} />

        {/* Top projector rod / hanger */}
        <line x1="2" y1="3" x2="22" y2="3" className="stroke-current opacity-90" />

        {/* Projector Screen Body */}
        <path
          className="deck-screen-rect stroke-current"
          d="M 21 3 v 10 a 2 2 0 0 1 -2 2 H 5 a 2 2 0 0 1 -2 -2 V 3"
        />

        {/* Slide presentation chart line inside screen (draws on hover) */}
        <path
          className="deck-chart-line stroke-current"
          d="M 7 11 L 10 8.5 L 13 10 L 17 6.5"
          strokeWidth="1.6"
          strokeDasharray="20"
          strokeDashoffset="0"
          style={{ opacity: 0.85 }}
        />

        {/* Growth dot at the tip of the chart */}
        <circle
          cx="17"
          cy="6.5"
          r="1.2"
          className="deck-chart-dot fill-current stroke-none"
          style={{ transformOrigin: "17px 6.5px" }}
        />

        {/* Pull tab / ring at the bottom center of the screen */}
        <g className="deck-pull-cord">
          <circle cx="12" cy="17" r="1.2" className="stroke-current fill-none" strokeWidth="1.4" />
        </g>

        {/* Tripod Easel Stand Legs */}
        <path
          d="m 8 21 4 -4 4 4"
          className="stroke-current opacity-70"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );
}

export default AnimatedDeckIcon;
