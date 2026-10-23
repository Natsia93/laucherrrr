"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, Eye, EyeOff, User, Mail, Lock, ArrowRight, LogOut, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";

function LoginPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  // Mode: Sign In vs Sign Up
  const [isSignUp, setIsSignUp] = useState(pathname === "/register");
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  // Intro Preloader & Shared Transition States
  const [introActive, setIntroActive] = useState(true);
  const [logoCentered, setLogoCentered] = useState(true);
  const [logoLanded, setLogoLanded] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(true);
  const [targetInfo, setTargetInfo] = useState<{
    targetX: number;
    targetY: number;
    deltaX: number;
    deltaY: number;
    scale: number;
    size: number;
  } | null>(null);

  const desktopLogoRef = useRef<HTMLDivElement>(null);
  const mobileLogoRef = useRef<HTMLDivElement>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Check if user came from a logout action
  useEffect(() => {
    if (searchParams.get("loggedOut") === "true") {
      setJustLoggedOut(true);
      // Clean cookies & sign out in background
      try {
        if (typeof window !== "undefined") {
          document.cookie = "better-auth.session_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "better-auth.session_data=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        authClient.signOut().catch(() => {});
      } catch {
        // ignore
      }
      setSuccessMsg("You have successfully signed out.");
    }
  }, [searchParams]);

  // Orchestrate Preloader to Login Page Shared Transition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const computeTarget = () => {
      const isDesktop = window.innerWidth >= 1024;
      const targetEl = isDesktop ? desktopLogoRef.current : mobileLogoRef.current;
      if (!targetEl) return;

      const rect = targetEl.getBoundingClientRect();
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;

      // Exactly matches AppPreloader: 96px on desktop (w-24), 80px on mobile (w-20)
      const initialLogoSize = isDesktop ? 96 : 80;
      const targetSize = rect.width || (isDesktop ? 32 : 24);
      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;

      setTargetInfo({
        targetX: targetCenterX,
        targetY: targetCenterY,
        deltaX: screenCenterX - targetCenterX,
        deltaY: screenCenterY - targetCenterY,
        scale: initialLogoSize / targetSize,
        size: targetSize,
      });
    };

    computeTarget();
    const raf = requestAnimationFrame(computeTarget);
    window.addEventListener("resize", computeTarget);

    const travelTimer = setTimeout(() => {
      setBackdropVisible(false);
      setLogoCentered(false);
    }, 3200);

    const landTimer = setTimeout(() => {
      setLogoLanded(true);
    }, 4100);

    const doneTimer = setTimeout(() => {
      setIntroActive(false);
    }, 4950);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", computeTarget);
      clearTimeout(travelTimer);
      clearTimeout(landTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  // Sync tab state if pathname changes
  useEffect(() => {
    if (pathname === "/register") {
      setIsSignUp(true);
    } else if (pathname === "/login") {
      setIsSignUp(false);
    }
  }, [pathname]);

  // Handle explicit sign out
  const handleExplicitSignOut = async () => {
    setSignOutLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_daily_mood");
        sessionStorage.removeItem("user_mood_checked_session");
        sessionStorage.removeItem("overview_charts_animated");
        document.cookie = "better-auth.session_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "better-auth.session_data=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      await authClient.signOut();
    } catch {
      // ignore
    } finally {
      setJustLoggedOut(true);
      setSignOutLoading(false);
      setSuccessMsg("Session ended successfully. Please sign in to your account.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("user_mood_checked_session");
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Please enter your First Name and Last Name.");
        setLoading(false);
        return;
      }
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      try {
        await authClient.signUp.email(
          {
            name: fullName,
            email: cleanEmail,
            password,
          },
          {
            onSuccess: () => {
              router.push("/overview");
            },
            onError: (ctx) => {
              setError(ctx.error?.message || "Failed to create account. Email might already be registered.");
              setLoading(false);
            },
          }
        );
      } catch (err: any) {
        setError(err?.message || "Sign up failed. Please check your connection.");
        setLoading(false);
      }
    } else {
      try {
        await authClient.signIn.email(
          {
            email: cleanEmail,
            password,
            rememberMe,
            callbackURL: "/overview",
          },
          {
            onSuccess: () => {
              router.push("/overview");
            },
            onError: (ctx) => {
              setError(ctx.error?.message || "Invalid email or password.");
              setLoading(false);
            },
          }
        );
      } catch (err: any) {
        setError(err?.message || "Failed to sign in.");
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: "/overview",
        },
        {
          onError: (ctx) => {
            setError(ctx.error?.message || "Google Sign-In failed.");
            setGoogleLoading(false);
          },
        }
      );
    } catch (err: any) {
      setError(err?.message || "Google Sign-In requires GOOGLE_CLIENT_ID configuration.");
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#faf9f6] text-neutral-900 font-sans antialiased selection:bg-[#FFE54C] selection:text-neutral-950 light"
      style={{ colorScheme: "light" }}
    >
      {/* 1. Preloader Backdrop: Smooth radial gradient */}
      <AnimatePresence>
        {backdropVisible && (
          <motion.div
            key="preloader-backdrop"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 z-50 pointer-events-none select-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F6F7F9 55%, #E6E9EF 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. Floating Shared ReVOU Logo: Fades in in center with yellow stroke, then glides smoothly & shrinks to Header */}
      {introActive && targetInfo && (
        <motion.div
          className="fixed z-[70] pointer-events-none select-none"
          style={{
            left: targetInfo.targetX - targetInfo.size / 2,
            top: targetInfo.targetY - targetInfo.size / 2,
            width: targetInfo.size,
            height: targetInfo.size,
            transformOrigin: "center center",
          }}
          initial={{
            x: targetInfo.deltaX,
            y: targetInfo.deltaY,
            scale: targetInfo.scale,
            opacity: 1,
          }}
          animate={
            logoCentered
              ? {
                  x: targetInfo.deltaX,
                  y: targetInfo.deltaY,
                  scale: targetInfo.scale,
                  opacity: 1,
                }
              : {
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: 1,
                }
          }
          transition={{
            x: logoCentered
              ? { duration: 0 }
              : { type: "spring", stiffness: 135, damping: 20, mass: 0.8 },
            y: logoCentered
              ? { duration: 0 }
              : { type: "spring", stiffness: 115, damping: 19, mass: 0.85 },
            scale: logoCentered
              ? { duration: 0 }
              : { type: "spring", stiffness: 150, damping: 22, mass: 0.75 },
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* SVG Animated Yellow Stroke - Fits directly on the perimeter of the ReVOU logo with dynamic ring release */}
            <motion.svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10"
              viewBox="0 0 100 100"
              fill="none"
              animate={
                logoCentered
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 1.14 }
              }
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <defs>
                <linearGradient id="revouStrokeGradient" x1="100%" y1="15%" x2="0%" y2="85%">
                  <stop offset="0%" stopColor="#FFE853" stopOpacity="0.08" />
                  <stop offset="15%" stopColor="#FFE853" stopOpacity="0.35" />
                  <stop offset="40%" stopColor="#FFDE3C" stopOpacity="0.75" />
                  <stop offset="80%" stopColor="#FFDE3C" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#F5C400" stopOpacity="1" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                stroke="url(#revouStrokeGradient)"
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
                  filter: "drop-shadow(0 0 4px rgba(255, 222, 60, 0.45))",
                }}
              />
            </motion.svg>

            {/* ReVOU Logo - PURE FADE IN ONLY (NO scale, NO zoom) */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center pointer-events-none z-0 p-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.75, ease: "easeInOut" }}
            >
              <Image
                src="/logo/Logo_revou.png"
                alt="RevoU Logo"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* LEFT SIDE: Minimalist Yellow Gradient Brand Showcase */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] h-full bg-gradient-to-br from-[#F5C400] via-[#FFE853] to-[#F5C400] text-neutral-950 p-10 xl:p-14 flex-col justify-between relative overflow-hidden select-none">
        
        {/* Subtle Ambient Glow Shapes: Gelap di sudut, kuning muda di tengah */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#D4A800]/40 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FEF08A]/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#D4A800]/40 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center">
          <div ref={desktopLogoRef} className="relative w-8 h-8 shrink-0 p-[2px]">
            <Image
              src="/logo/Logo_revou.png"
              alt="RevoU Logo"
              fill
              sizes="32px"
              className={`object-contain transition-opacity duration-200 ${
                introActive && !logoLanded ? "opacity-0" : "opacity-100"
              }`}
              priority
            />
          </div>
          <div className="overflow-hidden ml-3 py-1 flex items-center">
            <motion.span
              className="font-lora font-medium text-xl tracking-tight text-neutral-950 inline-block whitespace-nowrap"
              initial={{ opacity: 0, x: -60 }}
              animate={
                logoLanded
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -60 }
              }
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 20,
                mass: 0.75,
              }}
            >
              Launcher OS
            </motion.span>
          </div>
        </div>

        {/* Center: Editorial Hero Text */}
        <div className="relative z-10 space-y-4 max-w-sm select-none">
          <h1 className="font-lora text-3xl xl:text-4xl font-normal leading-[1.2] tracking-tight text-neutral-950">
            <span className="block overflow-hidden pb-0.5">
              <motion.span
                className="block"
                initial={{ y: "115%", opacity: 0, filter: "blur(4px)" }}
                animate={
                  logoLanded
                    ? { y: 0, opacity: 1, filter: "blur(0px)" }
                    : { y: "115%", opacity: 0, filter: "blur(4px)" }
                }
                transition={{
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08,
                }}
              >
                The intelligent
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-0.5">
              <motion.span
                className="block"
                initial={{ y: "115%", opacity: 0, filter: "blur(4px)" }}
                animate={
                  logoLanded
                    ? { y: 0, opacity: 1, filter: "blur(0px)" }
                    : { y: "115%", opacity: 0, filter: "blur(4px)" }
                }
                transition={{
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.18,
                }}
              >
                operating system for
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-0.5">
              <motion.span
                className="block"
                initial={{ y: "115%", opacity: 0, filter: "blur(4px)" }}
                animate={
                  logoLanded
                    ? { y: 0, opacity: 1, filter: "blur(0px)" }
                    : { y: "115%", opacity: 0, filter: "blur(4px)" }
                }
                transition={{
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.28,
                }}
              >
                modern execution.
              </motion.span>
            </span>
          </h1>

          <p className="text-sm text-neutral-900/75 leading-relaxed">
            <span className="block overflow-hidden pb-0.5">
              <motion.span
                className="block"
                initial={{ y: "115%", opacity: 0, filter: "blur(3px)" }}
                animate={
                  logoLanded
                    ? { y: 0, opacity: 1, filter: "blur(0px)" }
                    : { y: "115%", opacity: 0, filter: "blur(3px)" }
                }
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.38,
                }}
              >
                Orchestrate autonomous workflows, executive
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-0.5">
              <motion.span
                className="block"
                initial={{ y: "115%", opacity: 0, filter: "blur(3px)" }}
                animate={
                  logoLanded
                    ? { y: 0, opacity: 1, filter: "blur(0px)" }
                    : { y: "115%", opacity: 0, filter: "blur(3px)" }
                }
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.46,
                }}
              >
                presentations, and intelligent collaboration with unified AI
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-0.5">
              <motion.span
                className="block"
                initial={{ y: "115%", opacity: 0, filter: "blur(3px)" }}
                animate={
                  logoLanded
                    ? { y: 0, opacity: 1, filter: "blur(0px)" }
                    : { y: "115%", opacity: 0, filter: "blur(3px)" }
                }
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.54,
                }}
              >
                precision.
              </motion.span>
            </span>
          </p>
        </div>

        {/* Bottom Spacer */}
        <div className="relative z-10" />
      </div>

      {/* RIGHT SIDE: Dedicated Portal (Always Crisp Light Editorial) */}
      <div className="flex-1 h-full flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-y-auto relative bg-[#faf9f6]">
        
        {/* Top Bar: Mobile Brand */}
        <div className="w-full flex items-center justify-between">
          <div className="lg:hidden flex items-center">
            <div ref={mobileLogoRef} className="relative w-6 h-6 shrink-0 p-[1.5px]">
              <Image
                src="/logo/Logo_revou.png"
                alt="RevoU Logo"
                fill
                sizes="24px"
                className={`object-contain transition-opacity duration-200 ${
                  introActive && !logoLanded ? "opacity-0" : "opacity-100"
                }`}
              />
            </div>
            <div className="overflow-hidden ml-2.5 py-0.5 flex items-center">
              <motion.span
                className="font-lora font-medium text-lg text-neutral-950 inline-block whitespace-nowrap"
                initial={{ opacity: 0, x: -45 }}
                animate={
                  logoLanded
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -45 }
                }
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 20,
                  mass: 0.75,
                }}
              >
                Launcher OS
              </motion.span>
            </div>
          </div>
        </div>

        {/* Content Container - Always clean editorial login portal */}
        <div className="w-full max-w-[410px] mx-auto my-auto space-y-6">
          {/* Sign In vs Sign Up Tabs Switcher */}
          <div className="flex p-1 bg-neutral-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                !isSignUp
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer ${
                isSignUp
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Header */}
          <div className="space-y-1.5 text-center">
            <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-neutral-950 leading-tight">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h2>
            <p className="text-sm font-medium text-neutral-500">
              {isSignUp
                ? "Enter your details below to create your profile"
                : "Enter your credentials to continue to Launcher OS"}
            </p>
          </div>

          {/* Notifications */}
          {error && (
            <div className="p-3 rounded-[7px] bg-red-500/10 border border-red-500/20 text-xs sm:text-[13px] text-red-600">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-[7px] bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-[13px] text-emerald-600 font-medium">
              {successMsg}
            </div>
          )}

          {/* Form (Email & Password First) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name and Last Name fields (Sign Up only) */}
            {isSignUp && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[13.5px] font-medium text-neutral-700">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Muhammad"
                      required={isSignUp}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-[7px] border border-neutral-300 bg-white text-base font-normal text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-colors shadow-2xs"
                    />
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13.5px] font-medium text-neutral-700">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Fiqiy"
                      required={isSignUp}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-[7px] border border-neutral-300 bg-white text-base font-normal text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-colors shadow-2xs"
                    />
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[13.5px] font-medium text-neutral-700">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="nama@revou.co"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-[7px] border border-neutral-300 bg-white text-base font-normal text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-colors shadow-2xs"
                />
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13.5px] font-medium text-neutral-700">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert("Please contact your administrator to reset your password.")}
                    className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-[7px] border border-neutral-300 bg-white text-base font-normal text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-colors shadow-2xs"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me (Sign In only) */}
            {!isSignUp && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-[4px] border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-[13px] text-neutral-600 cursor-pointer select-none"
                >
                  Remember this device
                </label>
              </div>
            )}

            {/* Primary Yellow Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-[7px] bg-[#FFE54C] hover:bg-[#FFDE3C] active:bg-[#FCD526] text-neutral-950 font-bold text-sm sm:text-[15px] border border-[#E5BC10] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>{isSignUp ? "Creating account..." : "Signing in..."}</span>
                </>
              ) : (
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
              )}
            </button>
          </form>

          {/* Social Google Sign-In with Divider below form */}
          <div className="space-y-3 pt-1">
            {/* Clean Thin Divider */}
            <div className="relative py-1 flex items-center justify-center">
              <div className="w-full border-t border-neutral-200" />
              <span className="absolute bg-[#faf9f6] px-2.5 text-xs text-neutral-400 font-normal uppercase tracking-wider">
                or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-11 px-4 rounded-[7px] border border-neutral-300/90 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        {/* Empty bottom spacer for balance */}
        <div />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#faf9f6]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFE54C]" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
