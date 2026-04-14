"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Cek apakah email sudah terdaftar di database
      const checkRes = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const checkData = await checkRes.json();

      if (!checkData.exists) {
        // Email belum terdaftar
        setError("Email belum terdaftar. Silakan register terlebih dahulu.");
        setLoading(false);
        return;
      }

      // Step 2: Email ada, coba login
      await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
      }, {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          // Email sudah terdaftar tapi gagal login = password salah
          setError("Password salah. Silakan coba lagi.");
        }
      });
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi nanti.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans bg-[#f4f3ed] dark:bg-[#080b06]">
      {/* Background Grid & Glow Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Rectangular Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:160px_80px]"></div>
        {/* Glow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/3 w-[600px] h-[400px] bg-[#4d7537]/10 dark:bg-[#3f612d]/20 rounded-full blur-[120px]"></div>
      </div>
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center">
          <BookOpen className="text-white w-5 h-5" />
        </div>
        <span className="font-bricolage font-semibold text-lg tracking-tight text-[#1a2315] dark:text-[#f4f3ed]">EduAuto</span>
      </Link>

      <Card className="w-full max-w-md bg-white/90 dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 shadow-none relative z-10 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-[#f4f3ed] dark:bg-[#1a2315] border border-[#dcdad1] dark:border-[#3f612d]/40 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-[#4d7537] dark:text-[#89b867]" />
          </div>
          <CardTitle className="font-bricolage text-2xl font-normal tracking-tight text-[#1a2315] dark:text-[#f4f3ed]">Selamat Datang Kembali</CardTitle>
          <CardDescription className="text-neutral-600 dark:text-[#a2b591]">
            Masuk ke akun Anda untuk melihat dan men-generate kurikulum.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-neutral-50 dark:bg-[#1a2315]/50 border-[#dcdad1] dark:border-[#3f612d]/30 focus-visible:ring-[#4d7537]/50 text-[#1a2315] dark:text-[#f4f3ed]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Kata Sandi</Label>
                <Link href="#" className="text-xs text-[#4d7537] dark:text-[#89b867] hover:underline">Lupa sandi?</Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-neutral-50 dark:bg-[#1a2315]/50 border-[#dcdad1] dark:border-[#3f612d]/30 focus-visible:ring-[#4d7537]/50 text-[#1a2315] dark:text-[#f4f3ed] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#4d7537] text-white hover:bg-[#5a8b41] mt-6 py-6 text-base font-medium rounded-md shadow-sm transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Masuk <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#dcdad1] dark:border-[#3f612d]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#10140d] px-2 text-neutral-500 dark:text-[#a2b591]">Atau lanjutkan dengan</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={async () => {
              setLoading(true);
              try {
                await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/",
                });
              } catch (err) {
                setError("Gagal masuk dengan Google.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full bg-transparent border-[#dcdad1] dark:border-[#3f612d]/30 hover:bg-neutral-100 dark:hover:bg-[#1a2315] text-[#1a2315] dark:text-[#f4f3ed]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-[#dcdad1] dark:border-[#3f612d]/20 pt-6">
          <p className="text-sm text-neutral-600 dark:text-[#a2b591]">
            Belum punya akun? <Link href="/register" className="text-[#4d7537] dark:text-[#89b867] hover:underline font-medium">Daftar sekarang</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
