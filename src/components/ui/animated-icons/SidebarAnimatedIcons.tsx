"use client";

import React from "react";

export interface AnimatedIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * 1. 📊 Animated Overview Icon (LayoutDashboard)
 * Wave ripple pop across all 4 dashboard widgets on hover
 */
export function AnimatedOverviewIcon({ className = "", size = 18, ...props }: AnimatedIconProps) {
  return (
    <span className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
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
        className="w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .group:hover .dash-tile-1 { animation: tilePop 0.4s ease 0s forwards; }
          .group:hover .dash-tile-2 { animation: tilePop 0.4s ease 0.06s forwards; }
          .group:hover .dash-tile-3 { animation: tilePop 0.4s ease 0.12s forwards; }
          .group:hover .dash-tile-4 { animation: tilePop 0.4s ease 0.18s forwards; }
          @keyframes tilePop {
            0% { transform: scale(1); }
            40% { transform: scale(1.18); }
            100% { transform: scale(1); }
          }
        ` }} />
        <rect width="7" height="9" x="3" y="3" rx="1.5" className="dash-tile-1 origin-[6.5px_7.5px]" />
        <rect width="7" height="5" x="14" y="3" rx="1.5" className="dash-tile-2 origin-[17.5px_5.5px]" />
        <rect width="7" height="9" x="14" y="12" rx="1.5" className="dash-tile-3 origin-[17.5px_16.5px]" />
        <rect width="7" height="5" x="3" y="16" rx="1.5" className="dash-tile-4 origin-[6.5px_18.5px]" />
      </svg>
    </span>
  );
}

/**
 * 2. 🧭 Animated LLM Mode Icon (Compass)
 * Dynamic 360° needle spin with spring settling on hover
 */
export function AnimatedCompassIcon({ className = "", size = 18, ...props }: AnimatedIconProps) {
  return (
    <span className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
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
        className="w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .group:hover .compass-needle {
            animation: compassSpin 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 12px 12px;
          }
          .group:hover .compass-ring {
            animation: compassPulse 0.5s ease-out forwards;
            transform-origin: 12px 12px;
          }
          @keyframes compassSpin {
            0% { transform: rotate(0deg); }
            60% { transform: rotate(385deg); }
            80% { transform: rotate(355deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes compassPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.06); }
            100% { transform: scale(1); }
          }
        ` }} />
        <circle cx="12" cy="12" r="10" className="compass-ring" />
        <path
          d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"
          className="compass-needle"
        />
      </svg>
    </span>
  );
}

/**
 * 3. 📽️ Animated Deck Icon (Presentation)
 * Projector screen bounce + dynamic slide chart drawing on hover
 */
export { AnimatedDeckIcon } from "./AnimatedDeckIcon";

/**
 * 4. 📅 Animated Calendar Icon (Google Calendar)
 * Calendar page wiggle & header pin spring bounce on hover
 */
export function AnimatedCalendarIcon({ className = "", size = 18, ...props }: AnimatedIconProps) {
  return (
    <span className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
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
        className="w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .group:hover .cal-body {
            animation: calWiggle 0.5s ease-in-out forwards;
            transform-origin: 12px 4px;
          }
          .group:hover .cal-pin-l { animation: calPinJump 0.4s ease forwards; }
          .group:hover .cal-pin-r { animation: calPinJump 0.4s ease 0.08s forwards; }
          .group:hover .cal-dot-active {
            animation: calDotPulse 0.5s ease-out 0.2s forwards;
            transform-origin: 12px 14px;
          }
          @keyframes calWiggle {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            50% { transform: rotate(4deg); }
            75% { transform: rotate(-2deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes calPinJump {
            0% { transform: translateY(0); }
            40% { transform: translateY(-2px); }
            100% { transform: translateY(0); }
          }
          @keyframes calDotPulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.6); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        ` }} />
        <path d="M8 2v4" className="cal-pin-l" />
        <path d="M16 2v4" className="cal-pin-r" />
        <g className="cal-body">
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
          {/* Calendar date grid dots */}
          <circle cx="8" cy="14" r="0.9" fill="currentColor" className="stroke-none opacity-40" />
          <circle cx="12" cy="14" r="1.1" fill="currentColor" className="cal-dot-active stroke-none" />
          <circle cx="16" cy="14" r="0.9" fill="currentColor" className="stroke-none opacity-40" />
          <circle cx="8" cy="18" r="0.9" fill="currentColor" className="stroke-none opacity-40" />
          <circle cx="12" cy="18" r="0.9" fill="currentColor" className="stroke-none opacity-40" />
          <circle cx="16" cy="18" r="0.9" fill="currentColor" className="stroke-none opacity-40" />
        </g>
      </svg>
    </span>
  );
}

/**
 * 5. 💬 Animated Slack Icon (MessageSquare)
 * Speech bubble pop + sequential typing indicator bounce on hover
 */
export function AnimatedSlackIcon({ className = "", size = 18, ...props }: AnimatedIconProps) {
  return (
    <span className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
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
        className="w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .group:hover .chat-bubble {
            animation: chatPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 4px 18px;
          }
          .group:hover .chat-dot-1 { animation: chatDotBounce 0.45s ease 0.05s infinite alternate; }
          .group:hover .chat-dot-2 { animation: chatDotBounce 0.45s ease 0.15s infinite alternate; }
          .group:hover .chat-dot-3 { animation: chatDotBounce 0.45s ease 0.25s infinite alternate; }
          @keyframes chatPop {
            0% { transform: scale(1); }
            40% { transform: scale(1.12); }
            100% { transform: scale(1); }
          }
          @keyframes chatDotBounce {
            0% { transform: translateY(0); opacity: 0.4; }
            100% { transform: translateY(-2px); opacity: 1; }
          }
        ` }} />
        <path
          d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"
          className="chat-bubble"
        />
        {/* Typing indicator dots */}
        <circle cx="8" cy="11" r="1.1" fill="currentColor" className="chat-dot-1 stroke-none" />
        <circle cx="12" cy="11" r="1.1" fill="currentColor" className="chat-dot-2 stroke-none" />
        <circle cx="16" cy="11" r="1.1" fill="currentColor" className="chat-dot-3 stroke-none" />
      </svg>
    </span>
  );
}

/**
 * 6. ⚡ Animated Automation Icon (Workflow)
 * Flowing data pulse line + node scale pop on hover
 */
export function AnimatedWorkflowIcon({ className = "", size = 18, ...props }: AnimatedIconProps) {
  return (
    <span className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
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
        className="w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .group:hover .wf-node-top {
            animation: wfNodePop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 7px 7px;
          }
          .group:hover .wf-node-bottom {
            animation: wfNodePop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
            transform-origin: 17px 17px;
          }
          .group:hover .wf-flow-line {
            stroke-dasharray: 4, 3;
            animation: wfFlow 0.6s linear infinite;
          }
          @keyframes wfNodePop {
            0% { transform: scale(1); }
            45% { transform: scale(1.18); }
            100% { transform: scale(1); }
          }
          @keyframes wfFlow {
            from { stroke-dashoffset: 14; }
            to { stroke-dashoffset: 0; }
          }
        ` }} />
        <rect width="8" height="8" x="3" y="3" rx="2" className="wf-node-top" />
        <path d="M7 11v4a2 2 0 0 0 2 2h4" className="wf-flow-line" />
        <rect width="8" height="8" x="13" y="13" rx="2" className="wf-node-bottom" />
      </svg>
    </span>
  );
}

/**
 * 7. ⚙️ Animated Settings Icon (Settings)
 * Smooth 90° mechanical gear rotation on hover
 */
export function AnimatedSettingsIcon({ className = "", size = 18, ...props }: AnimatedIconProps) {
  return (
    <span className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
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
        className="w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .group:hover .settings-gear {
            animation: spinGear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 12px 12px;
          }
          @keyframes spinGear {
            0% { transform: rotate(0deg); }
            70% { transform: rotate(98deg); }
            100% { transform: rotate(90deg); }
          }
        ` }} />
        <g className="settings-gear">
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
          <circle cx="12" cy="12" r="3" />
        </g>
      </svg>
    </span>
  );
}

/**
 * 8. 🚪 Animated Logout Icon (LogOut)
 * Exit arrow slides out to the right with spring return on hover
 */
export function AnimatedLogoutIcon({ className = "", size = 18, ...props }: AnimatedIconProps) {
  return (
    <span className={`inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
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
        className="w-full h-full overflow-visible"
        {...props}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .group:hover .logout-arrow,
          button:hover .logout-arrow {
            animation: logoutArrowSlide 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .group:hover .logout-door,
          button:hover .logout-door {
            animation: logoutDoorNudge 0.4s ease-in-out forwards;
          }
          @keyframes logoutArrowSlide {
            0% { transform: translateX(0); }
            35% { transform: translateX(3.5px); }
            65% { transform: translateX(-1px); }
            100% { transform: translateX(0); }
          }
          @keyframes logoutDoorNudge {
            0% { transform: translateX(0); }
            40% { transform: translateX(-1.5px); }
            100% { transform: translateX(0); }
          }
        ` }} />
        {/* Door frame */}
        <path
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
          className="logout-door"
        />
        {/* Exit arrow */}
        <g className="logout-arrow">
          <path d="M21 12H9" />
          <path d="m16 17 5-5-5-5" />
        </g>
      </svg>
    </span>
  );
}

