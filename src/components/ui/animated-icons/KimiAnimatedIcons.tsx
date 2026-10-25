"use client";

import React, { useState, useRef } from "react";

interface AnimatedIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * 📽️ Kimi Slides Animated Icon (PptTimeline2Icon)
 * Exact 1:1 vector morphing projection screen from Kimi.ai
 */
export function KimiSlidesIcon({ className = "", size = 20, ...props }: AnimatedIconProps) {
  const [phase, setPhase] = useState<"idle" | "enter">("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setPhase("enter");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase("idle");
    }, 550);
  };

  return (
    <span
      data-animation-icon-wrapper="true"
      data-animation-phase={phase}
      onMouseEnter={handleMouseEnter}
      className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="PptTimeline2Icon-svg w-full h-full text-current"
        data-animation-icon="true"
        data-animation-icon-enter-duration="0.5"
        data-animation-icon-playback="trigger"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          [data-animation-icon-wrapper][data-animation-phase="idle"] .PptTimeline2Icon-svg * {
            animation: none !important;
          }
          [data-animation-icon-wrapper][data-animation-phase="enter"] .PptTimeline2Icon-svg *,
          .group:hover .PptTimeline2Icon-svg * {
            animation-direction: normal !important;
            animation-duration: 500ms !important;
            animation-iteration-count: 1 !important;
            animation-fill-mode: forwards !important;
          }
          [data-animation-icon-wrapper][data-animation-phase="idle"] [data-animation-icon-layer="enter"] {
            display: none !important;
          }
          .group:hover [data-animation-icon-layer="enter"],
          [data-animation-icon-wrapper][data-animation-phase="enter"] [data-animation-icon-layer="enter"] {
            display: block !important;
          }
          .group:hover [data-animation-icon-layer="idle"],
          [data-animation-icon-wrapper][data-animation-phase="enter"] [data-animation-icon-layer="idle"] {
            display: none !important;
          }
        ` }} />

        {/* IDLE LAYER */}
        <g data-animation-icon-layer="idle">
          <path
            d="M -1.25 -2.5 L 1.25 0 L -1.25 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1.057 0 0 1 12 10.5)"
          />
          <path
            d="M 5.484 1.948 C 5.484 1.948 7.678 4.455 7.678 4.455 C 8.005 4.829 7.966 5.397 7.593 5.724 C 7.219 6.052 6.65 6.015 6.322 5.641 C 6.322 5.641 3.092 1.948 3.092 1.948 L 0.908 1.948 C 0.908 1.948 -2.322 5.641 -2.322 5.641 C -2.65 6.015 -3.219 6.052 -3.593 5.724 C -3.967 5.397 -4.005 4.829 -3.678 4.455 C -3.678 4.455 -1.484 1.948 -1.484 1.948 L 0.908 1.948 L 3.092 1.948 L 5.484 1.948 Z"
            fill="currentColor"
            transform="matrix(1 0 0 1 9.9 14.853)"
          />
          <path
            d="M 9 0 L -9 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 12 5)"
          />
          <path
            d="M -7 -5 C -7 -5 -7 2 -7 2 C -7 3.657 -5.657 5 -4 5 C -4 5 4 5 4 5 C 5.657 5 7 3.657 7 2 C 7 2 7 -5 7 -5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 12 11)"
          />
        </g>

        {/* ENTER (ANIMATED) LAYER */}
        <g data-animation-icon-layer="enter">
          <path
            d="M -1.25 -2.5 L 1.25 0 L -1.25 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1.057 0 0 1 12 10.5)"
          >
            <animate
              attributeName="d"
              values="M -1.25 -2.5 L 1.25 0 L -1.25 2.5;M -1.25 -2.485 L 1.25 0.015 L -1.25 2.515;M -1.25 -2.431 L 1.25 0.069 L -1.25 2.569;M -1.25 -2.328 L 1.25 0.172 L -1.25 2.672;M -1.25 -2.167 L 1.25 0.333 L -1.25 2.833;M -1.25 -1.973 L 1.25 0.527 L -1.25 3.027;M -1.25 -1.793 L 1.25 0.707 L -1.25 3.207;M -1.25 -1.657 L 1.25 0.843 L -1.25 3.343;M -1.25 -1.566 L 1.25 0.934 L -1.25 3.434;M -1.25 -1.509 L 1.25 0.991 L -1.25 3.491;M -1.25 -1.48 L 1.25 1.02 L -1.25 3.52;M -1.25 -1.471 L 1.25 1.029 L -1.25 3.529;M -1.25 -1.479 L 1.25 1.021 L -1.25 3.521;M -1.25 -1.5 L 1.25 1 L -1.25 3.5;M -1.25 -1.5 L 1.25 1 L -1.25 3.5;M -1.25 -1.543 L 1.25 0.957 L -1.25 3.457;M -1.25 -1.707 L 1.25 0.793 L -1.25 3.293;M -1.25 -2.003 L 1.25 0.497 L -1.25 2.997;M -1.25 -2.281 L 1.25 0.219 L -1.25 2.719;M -1.25 -2.443 L 1.25 0.057 L -1.25 2.557;M -1.25 -2.515 L 1.25 -0.015 L -1.25 2.485;M -1.25 -2.528 L 1.25 -0.028 L -1.25 2.472;M -1.25 -2.5 L 1.25 0 L -1.25 2.5;M -1.25 -2.5 L 1.25 0 L -1.25 2.5"
              keyTimes="0;0.03333;0.06667;0.1;0.13333;0.16667;0.2;0.23333;0.26667;0.3;0.33333;0.36667;0.4;0.43333;0.56667;0.6;0.63333;0.66667;0.7;0.73333;0.76667;0.8;0.83333;1"
              dur="0.5s"
              repeatCount="1"
              fill="freeze"
            />
          </path>
          <path
            d="M 5.484 1.948 C 5.484 1.948 7.678 4.455 7.678 4.455 C 8.005 4.829 7.966 5.397 7.593 5.724 C 7.219 6.052 6.65 6.015 6.322 5.641 C 6.322 5.641 3.092 1.948 3.092 1.948 L 0.908 1.948 C 0.908 1.948 -2.322 5.641 -2.322 5.641 C -2.65 6.015 -3.219 6.052 -3.593 5.724 C -3.967 5.397 -4.005 4.829 -3.678 4.455 C -3.678 4.455 -1.484 1.948 -1.484 1.948 L 0.908 1.948 L 3.092 1.948 L 5.484 1.948 Z"
            fill="currentColor"
            transform="matrix(1 0 0 1 9.9 14.853)"
          />
          <path
            d="M 9 0 L -9 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 12 5)"
          />
          <path
            d="M -7 -5 C -7 -5 -7 2 -7 2 C -7 3.657 -5.657 5 -4 5 C -4 5 4 5 4 5 C 5.657 5 7 3.657 7 2 C 7 2 7 -5 7 -5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 12 11)"
          >
            <animate
              attributeName="d"
              values="M -7 -5 C -7 -5 -7 2 -7 2 C -7 3.657 -5.657 5 -4 5 C -4 5 4 5 4 5 C 5.657 5 7 3.657 7 2 C 7 2 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.017 -7 2.017 C -7 3.677 -5.657 5.024 -4 5.024 C -4 5.024 4 5.024 4 5.024 C 5.657 5.024 7 3.677 7 2.017 C 7 2.017 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.074 -7 2.074 C -7 3.749 -5.657 5.106 -4 5.106 C -4 5.106 4 5.106 4 5.106 C 5.657 5.106 7 3.749 7 2.074 C 7 2.074 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.187 -7 2.187 C -7 3.888 -5.657 5.268 -4 5.268 C -4 5.268 4 5.268 4 5.268 C 5.657 5.268 7 3.888 7 2.187 C 7 2.187 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.324 -7 2.324 C -7 4.053 -5.657 5.459 -4 5.459 C -4 5.459 4 5.459 4 5.459 C 5.657 5.459 7 4.053 7 2.324 C 7 2.324 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.474 -7 2.474 C -7 4.227 -5.657 5.663 -4 5.663 C -4 5.663 4 5.663 4 5.663 C 5.657 5.663 7 4.227 7 2.474 C 7 2.474 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.613 -7 2.613 C -7 4.385 -5.657 5.85 -4 5.85 C -4 5.85 4 5.85 4 5.85 C 5.657 5.85 7 4.385 7 2.613 C 7 2.613 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.716 -7 2.716 C -7 4.5 -5.657 5.986 -4 5.986 C -4 5.986 4 5.986 4 5.986 C 5.657 5.986 7 4.5 7 2.716 C 7 2.716 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.784 -7 2.784 C -7 4.576 -5.657 6.075 -4 6.075 C -4 6.075 4 6.075 4 6.075 C 5.657 6.075 7 4.576 7 2.784 C 7 2.784 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.822 -7 2.822 C -7 4.618 -5.657 6.124 -4 6.124 C -4 6.124 4 6.124 4 6.124 C 5.657 6.124 7 4.618 7 2.822 C 7 2.822 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.839 -7 2.839 C -7 4.636 -5.657 6.145 -4 6.145 C -4 6.145 4 6.145 4 6.145 C 5.657 6.145 7 4.636 7 2.839 C 7 2.839 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.842 -7 2.842 C -7 4.639 -5.657 6.148 -4 6.148 C -4 6.148 4 6.148 4 6.148 C 5.657 6.148 7 4.639 7 2.842 C 7 2.842 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.832 -7 2.832 C -7 4.628 -5.657 6.136 -4 6.136 C -4 6.136 4 6.136 4 6.136 C 5.657 6.136 7 4.628 7 2.832 C 7 2.832 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.812 -7 2.812 C -7 4.606 -5.657 6.11 -4 6.11 C -4 6.11 4 6.11 4 6.11 C 5.657 6.11 7 4.606 7 2.812 C 7 2.812 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.812 -7 2.812 C -7 4.606 -5.657 6.11 -4 6.11 C -4 6.11 4 6.11 4 6.11 C 5.657 6.11 7 4.606 7 2.812 C 7 2.812 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.766 -7 2.766 C -7 4.555 -5.657 6.05 -4 6.05 C -4 6.05 4 6.05 4 6.05 C 5.657 6.05 7 4.555 7 2.766 C 7 2.766 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.585 -7 2.585 C -7 4.354 -5.657 5.813 -4 5.813 C -4 5.813 4 5.813 4 5.813 C 5.657 5.813 7 4.354 7 2.585 C 7 2.585 7 -5 7 -5;M -7 -5 C -7 -5 -7 2.278 -7 2.278 C -7 4.004 -5.657 5.399 -4 5.399 C -4 5.399 4 5.399 4 5.399 C 5.657 5.399 7 4.004 7 2.278 C 7 2.278 7 -5 7 -5;M -7 -5 C -7 -5 -7 1.948 -7 1.948 C -7 3.619 -5.657 4.939 -4 4.939 C -4 4.939 4 4.939 4 4.939 C 5.657 4.939 7 3.619 7 1.948 C 7 1.948 7 -5 7 -5;M -7 -5 C -7 -5 -7 1.728 -7 1.728 C -7 3.359 -5.657 4.63 -4 4.63 C -4 4.63 4 4.63 4 4.63 C 5.657 4.63 7 3.359 7 1.728 C 7 1.728 7 -5 7 -5;M -7 -5 C -7 -5 -7 1.637 -7 1.637 C -7 3.251 -5.657 4.502 -4 4.502 C -4 4.502 4 4.502 4 4.502 C 5.657 4.502 7 3.251 7 1.637 C 7 1.637 7 -5 7 -5;M -7 -5 C -7 -5 -7 1.625 -7 1.625 C -7 3.236 -5.657 4.484 -4 4.484 C -4 4.484 4 4.484 4 4.484 C 5.657 4.484 7 3.236 7 1.625 C 7 1.625 7 -5 7 -5;M -7 -5 C -7 -5 -7 2 -7 2 C -7 3.657 -5.657 5 -4 5 C -4 5 4 5 4 5 C 5.657 5 7 3.657 7 2 C 7 2 7 -5 7 -5;M -7 -5 C -7 -5 -7 2 -7 2 C -7 3.657 -5.657 5 -4 5 C -4 5 4 5 4 5 C 5.657 5 7 3.657 7 2 C 7 2 7 -5 7 -5"
              keyTimes="0;0.03333;0.06667;0.1;0.13333;0.16667;0.2;0.23333;0.26667;0.3;0.33333;0.36667;0.4;0.43333;0.56667;0.6;0.63333;0.66667;0.7;0.73333;0.76667;0.8;0.83333;1"
              dur="0.5s"
              repeatCount="1"
              fill="freeze"
            />
          </path>
        </g>
      </svg>
    </span>
  );
}

/**
 * 🔬 Kimi Deep Research Animated Icon (MicroscopeTimeline1Icon)
 * Exact 1:1 vector rotation microscope from Kimi.ai
 */
export function KimiMicroscopeIcon({ className = "", size = 20, ...props }: AnimatedIconProps) {
  const [phase, setPhase] = useState<"idle" | "enter">("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setPhase("enter");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase("idle");
    }, 700);
  };

  return (
    <span
      data-animation-icon-wrapper="true"
      data-animation-phase={phase}
      onMouseEnter={handleMouseEnter}
      className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="MicroscopeTimeline1Icon-svg w-full h-full text-current"
        data-animation-icon="true"
        data-animation-icon-enter-duration="0.66667"
        data-animation-icon-playback="trigger"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          #microscope-enter-p0 {
            transform-box: view-box;
            transform-origin: 0 0;
            animation: microscope-keyframes-p0 0.6667s linear 1 forwards;
          }
          @keyframes microscope-keyframes-p0 {
            0% { transform: translate(81.25%, 41.66667%); }
            7.5% { transform: translate(81.25%, 41.66667%) rotate(1.5466deg); }
            15% { transform: translate(81.25%, 41.66667%) rotate(7.2387deg); }
            20% { transform: translate(81.25%, 41.66667%) rotate(9.8486deg); }
            25% { transform: translate(81.25%, 41.66667%) rotate(11.1863deg); }
            35% { transform: translate(81.25%, 41.66667%) rotate(12.0067deg); }
            47.5% { transform: translate(81.25%, 41.66667%) rotate(12.0067deg); }
            52.5% { transform: translate(81.25%, 41.66667%) rotate(10.9504deg); }
            60% { transform: translate(81.25%, 41.66667%) rotate(4.1877deg); }
            67.5% { transform: translate(81.25%, 41.66667%) rotate(0.7448deg); }
            100% { transform: translate(81.25%, 41.66667%); }
          }
          #microscope-enter-p1 {
            transform-box: view-box;
            transform-origin: 0 0;
            animation: microscope-keyframes-p1 0.6667s linear 1 forwards;
          }
          @keyframes microscope-keyframes-p1 {
            0% { transform: translate(26.66667%, 64.58333%) rotate(-133.0949deg); }
            7.5% { transform: translate(26.05833%, 63.07917%) rotate(-131.5146deg); }
            15% { transform: translate(24.2125%, 57.52917%) rotate(-125.8841deg); }
            20% { transform: translate(23.55417%, 54.925%) rotate(-123.2449deg); }
            27.5% { transform: translate(23.17917%, 53.17917%) rotate(-121.5437deg); }
            35% { transform: translate(23.09583%, 52.7375%) rotate(-121.1308deg); }
            47.5% { transform: translate(23.09583%, 52.7375%) rotate(-121.1308deg); }
            52.5% { transform: translate(23.30833%, 53.80417%) rotate(-122.1329deg); }
            60% { transform: translate(25.14583%, 60.5625%) rotate(-128.9104deg); }
            67.5% { transform: translate(26.375%, 63.87917%) rotate(-132.3662deg); }
            75% { transform: translate(26.66667%, 64.58333%) rotate(-133.0949deg); }
            100% { transform: translate(26.66667%, 64.58333%) rotate(-133.0949deg); }
          }
          [data-animation-icon-wrapper][data-animation-phase="idle"] .MicroscopeTimeline1Icon-svg * {
            animation: none !important;
          }
          [data-animation-icon-wrapper][data-animation-phase="enter"] .MicroscopeTimeline1Icon-svg * {
            animation-direction: normal !important;
            animation-duration: 667ms !important;
            animation-iteration-count: 1 !important;
            animation-fill-mode: forwards !important;
          }
          [data-animation-icon-wrapper][data-animation-phase="idle"] [data-animation-icon-layer="enter"] {
            display: none !important;
          }
          [data-animation-icon-wrapper][data-animation-phase="enter"] [data-animation-icon-layer="idle"] {
            display: none !important;
          }
          [data-animation-icon-wrapper][data-animation-phase="enter"] [data-animation-icon-layer="enter"] {
            display: block !important;
          }
        ` }} />

        {/* IDLE LAYER */}
        <g data-animation-icon-layer="idle">
          <path
            d="M -6.316 -5.501 C -5.947 -5.881 -5.369 -5.894 -4.981 -5.584 C -4.981 -5.584 -4.906 -5.518 -4.906 -5.518 L -4.884 -5.495 L -2.303 -2.779 C -2.303 -2.779 -2.264 -2.736 -2.264 -2.736 C -1.95 -2.36 -1.94 -1.78 -2.311 -1.396 C -2.311 -1.396 -7.811 4.306 -7.811 4.306 C -7.811 4.306 -7.816 4.312 -7.816 4.312 C -8.212 4.715 -8.859 4.707 -9.246 4.303 C -9.246 4.303 -9.248 4.301 -9.248 4.301 C -9.248 4.301 -11.823 1.593 -11.823 1.593 C -12.19 1.208 -12.195 0.595 -11.821 0.205 C -11.821 0.205 -11.819 0.203 -11.819 0.203 L -6.319 -5.499 C -6.319 -5.499 -6.316 -5.501 -6.316 -5.501 Z M -3.476 -6.798 C -3.103 -7.181 -2.508 -7.196 -2.116 -6.862 C -2.116 -6.862 -2.041 -6.791 -2.041 -6.791 L -2.041 -6.79 L -1.047 -5.745 C -1.047 -5.745 -1.043 -5.741 -1.043 -5.741 C -0.7 -5.376 -0.681 -4.817 -0.986 -4.432 C -0.986 -4.432 -1.052 -4.356 -1.052 -4.356 C -1.052 -4.356 -1.784 -3.598 -1.784 -3.598 C -1.955 -3.421 -2.19 -3.322 -2.436 -3.323 C -2.681 -3.324 -2.915 -3.425 -3.084 -3.603 C -3.084 -3.603 -4.215 -4.792 -4.215 -4.792 C -4.547 -5.141 -4.545 -5.691 -4.21 -6.038 C -4.21 -6.038 -3.478 -6.796 -3.478 -6.796 L -3.476 -6.799 C -3.476 -6.799 -3.476 -6.798 -3.476 -6.798 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transformBox: "view-box", transformOrigin: "0 0", transform: "translate(81.25%, 41.66667%)" }}
          />
          <path
            d="M 2.193 -0.002 L -2.193 0.002"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transformBox: "view-box", transformOrigin: "0 0", transform: "translate(26.66667%, 64.58333%) rotate(-133.0949deg)" }}
          />
          <path
            d="M 0.47 -5.5 C 0.47 -5.5 2.47 -4 2.759 -1.246 C 3.03 1.342 1.47 4.5 -3.03 5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="square"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 16.23 15.26)"
          />
          <path
            d="M -6.8 0 L 6.8 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 12.2 20.96)"
          />
        </g>

        {/* ENTER (ANIMATED) LAYER */}
        <g data-animation-icon-layer="enter">
          <path
            id="microscope-enter-p0"
            d="M -6.316 -5.501 C -5.947 -5.881 -5.369 -5.894 -4.981 -5.584 C -4.981 -5.584 -4.906 -5.518 -4.906 -5.518 L -4.884 -5.495 L -2.303 -2.779 C -2.303 -2.779 -2.264 -2.736 -2.264 -2.736 C -1.95 -2.36 -1.94 -1.78 -2.311 -1.396 C -2.311 -1.396 -7.811 4.306 -7.811 4.306 C -7.811 4.306 -7.816 4.312 -7.816 4.312 C -8.212 4.715 -8.859 4.707 -9.246 4.303 C -9.246 4.303 -9.248 4.301 -9.248 4.301 C -9.248 4.301 -11.823 1.593 -11.823 1.593 C -12.19 1.208 -12.195 0.595 -11.821 0.205 C -11.821 0.205 -11.819 0.203 -11.819 0.203 L -6.319 -5.499 C -6.319 -5.499 -6.316 -5.501 -6.316 -5.501 Z M -3.476 -6.798 C -3.103 -7.181 -2.508 -7.196 -2.116 -6.862 C -2.116 -6.862 -2.041 -6.791 -2.041 -6.791 L -2.041 -6.79 L -1.047 -5.745 C -1.047 -5.745 -1.043 -5.741 -1.043 -5.741 C -0.7 -5.376 -0.681 -4.817 -0.986 -4.432 C -0.986 -4.432 -1.052 -4.356 -1.052 -4.356 C -1.052 -4.356 -1.784 -3.598 -1.784 -3.598 C -1.955 -3.421 -2.19 -3.322 -2.436 -3.323 C -2.681 -3.324 -2.915 -3.425 -3.084 -3.603 C -3.084 -3.603 -4.215 -4.792 -4.215 -4.792 C -4.547 -5.141 -4.545 -5.691 -4.21 -6.038 C -4.21 -6.038 -3.478 -6.796 -3.478 -6.796 L -3.476 -6.799 C -3.476 -6.799 -3.476 -6.798 -3.476 -6.798 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            id="microscope-enter-p1"
            d="M 2.193 -0.002 L -2.193 0.002"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 0.47 -5.5 C 0.47 -5.5 2.47 -4 2.759 -1.246 C 3.03 1.342 1.47 4.5 -3.03 5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="square"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 16.23 15.26)"
          />
          <path
            d="M -6.8 0 L 6.8 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="matrix(1 0 0 1 12.2 20.96)"
          />
        </g>
      </svg>
    </span>
  );
}

/**
 * ⏰ Kimi Scheduled Animated Icon (ScheduledTasksAnimatedIcon)
 * Exact 1:1 ringing bell / clock checkmark animation from Kimi.ai
 */
export function KimiScheduledIcon({ className = "", size = 20, ...props }: AnimatedIconProps) {
  const [phase, setPhase] = useState<"idle" | "enter">("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setPhase("enter");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase("idle");
    }, 450);
  };

  return (
    <span
      data-animation-icon-wrapper="true"
      data-animation-phase={phase}
      onMouseEnter={handleMouseEnter}
      className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="ScheduledTasksAnimatedIcon-svg w-full h-full text-current"
        data-animation-icon="true"
        data-animation-icon-enter-duration="0.41667"
        data-animation-icon-playback="trigger"
        {...props}
      >
        <defs>
          <path id="scheduled-tick-line" d="M 0.836 -3.703 L -1.836 -1.297" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </defs>
        <style dangerouslySetInnerHTML={{ __html: `
          #scheduled-checkmark {
            transform-box: view-box;
            transform-origin: 0 0;
            animation: scheduled-p1-anim 0.4167s linear 1 forwards;
          }
          @keyframes scheduled-p1-anim {
            0% { transform: translate(50.8125%, 49.7875%); }
            32% { transform: translate(50%, 45.83333%) rotate(10.0019deg) scale(1.09971); }
            52% { transform: translate(50.14583%, 46.54583%) rotate(-1.9074deg) scale(1.0816); }
            68% { transform: translate(50.44583%, 48.0125%) rotate(-9.9762deg) scale(1.0448); }
            100% { transform: translate(50.8125%, 49.7875%); }
          }
          #scheduled-bell-l {
            transform-box: view-box;
            transform-origin: 0 0;
            animation: scheduled-bell-l-anim 0.4167s linear 1 forwards;
          }
          @keyframes scheduled-bell-l-anim {
            0% { transform: none; }
            32% { transform: translate(4.55%, -4.15833%) rotate(4.9921deg); }
            68% { transform: translate(-4.15833%, 4.55417%) rotate(-4.9921deg); }
            100% { transform: none; }
          }
          #scheduled-bell-r {
            transform-box: view-box;
            transform-origin: 0 0;
            animation: scheduled-bell-r-anim 0.4167s linear 1 forwards;
          }
          @keyframes scheduled-bell-r-anim {
            0% { transform: none; }
            32% { transform: translate(4.55833%, -4.15%) rotate(4.9921deg); }
            64% { transform: translate(-4.00833%, 4.31667%) rotate(-4.7589deg); }
            100% { transform: none; }
          }
          [data-animation-icon-wrapper][data-animation-phase="idle"] .ScheduledTasksAnimatedIcon-svg * {
            animation: none !important;
          }
          [data-animation-icon-wrapper][data-animation-phase="enter"] .ScheduledTasksAnimatedIcon-svg * {
            animation-direction: normal !important;
            animation-duration: 417ms !important;
            animation-iteration-count: 1 !important;
            animation-fill-mode: forwards !important;
          }
        ` }} />

        {/* Ring outer clock body */}
        <path
          d="M 0 -9.751 C 5.108 -9.751 9.249 -5.61 9.25 -0.502 C 9.25 -0.502 9.237 -0.025 9.237 -0.025 C 9.098 2.701 7.778 5.115 5.78 6.717 C 5.78 6.717 7.31 8.073 7.31 8.073 C 7.682 8.403 7.717 8.973 7.387 9.345 C 7.058 9.717 6.488 9.751 6.116 9.421 C 6.116 9.421 4.211 7.733 4.211 7.733 C 2.948 8.38 1.517 8.748 0 8.748 C 0 8.748 -0.476 8.736 -0.476 8.736 C -1.816 8.668 -3.081 8.313 -4.211 7.734 C -4.211 7.734 -6.116 9.421 -6.116 9.421 C -6.488 9.75 -7.057 9.717 -7.386 9.345 C -7.716 8.973 -7.682 8.403 -7.31 8.073 C -7.31 8.073 -5.781 6.717 -5.781 6.717 C -7.895 5.022 -9.249 2.419 -9.25 -0.502 C -9.249 -5.61 -5.109 -9.751 0 -9.751 Z M 0 -7.951 C -4.114 -7.951 -7.45 -4.616 -7.45 -0.502 C -7.449 3.612 -4.114 6.947 0 6.947 C 4.113 6.947 7.449 3.612 7.449 -0.502 C 7.449 -4.616 4.114 -7.951 0 -7.951 Z"
          transform="matrix(1 0 0 1 11.875 12.496)"
          fill="currentColor"
          fillRule="evenodd"
        />

        {/* Checkmark animates */}
        <path
          id="scheduled-checkmark"
          d="M 1.779 -2.17 C 2.13 -2.521 2.701 -2.521 3.052 -2.17 C 3.404 -1.819 3.403 -1.248 3.052 -0.897 C 3.052 -0.897 -0.102 2.258 -0.102 2.258 C -0.102 2.258 -0.17 2.319 -0.17 2.319 C -0.335 2.454 -0.537 2.521 -0.739 2.521 C -0.739 2.521 -0.825 2.516 -0.825 2.516 C -0.853 2.514 -0.882 2.51 -0.911 2.505 C -1.081 2.472 -1.244 2.389 -1.375 2.258 C -1.375 2.258 -3.052 0.58 -3.052 0.58 C -3.404 0.228 -3.404 -0.342 -3.052 -0.694 C -2.701 -1.045 -2.13 -1.045 -1.779 -0.694 C -1.779 -0.694 -0.739 0.347 -0.739 0.347 C -0.739 0.347 1.779 -2.17 1.779 -2.17 Z"
          fill="currentColor"
          style={{ transformBox: "view-box", transformOrigin: "0 0", transform: "translate(50.8125%, 49.7875%)" }}
        />

        {/* Left ear/bell */}
        <g id="scheduled-bell-l" style={{ transformBox: "view-box", transformOrigin: "0 0", transform: "none" }}>
          <use href="#scheduled-tick-line" transform="matrix(1 0 0 1 4.4 6)" />
        </g>

        {/* Right ear/bell */}
        <g id="scheduled-bell-r" style={{ transformBox: "view-box", transformOrigin: "0 0", transform: "none" }}>
          <use href="#scheduled-tick-line" transform="matrix(-0.104 -0.995 0.995 -0.104 22.234 2.742)" />
        </g>
      </svg>
    </span>
  );
}
