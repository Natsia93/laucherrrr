import React from "react";
import Link from "next/link";
import { Folder, Search, BookOpen, Plus, Clock, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { db } from "@/db";
import { documents as documentsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DashboardFadeIn } from "@/components/dashboard/DashboardAnimations";
import { AnimatedGreeting } from "@/components/dashboard/AnimatedGreeting";
import { DashboardNavbarActions } from "@/components/dashboard/DashboardNavbarActions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { DocumentTable } from "@/components/dashboard/DocumentTable";
import { DashboardSearchBar } from "@/components/dashboard/DashboardSearchBar";
import { DashboardFilter } from "@/components/dashboard/DashboardFilter";
import { Suspense } from "react";

export default async function DashboardPage(props: { searchParams: Promise<{ search?: string; category?: string }> }) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search || "";
  const categoryQuery = searchParams.category || "";
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const user = session.user;

  const realDocuments = await db.select()
    .from(documentsTable)
    .where(eq(documentsTable.userId, user.id))
    .orderBy(desc(documentsTable.createdAt));
  
  const availableCategories = Array.from(new Set(realDocuments.map(d => d.type)));
  
  const filteredDocuments = realDocuments.filter(doc => {
    const matchesSearch = searchQuery ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    
    let matchesCategory = true;
    if (categoryQuery) {
      if (categoryQuery === "CP") {
        matchesCategory = doc.type === "CP" || doc.type === "Capaian Pembelajaran (CP)";
      } else if (categoryQuery === "ATP") {
        matchesCategory = doc.type === "ATP" || doc.type === "Alur Tujuan Pembelajaran (ATP)";
      } else if (categoryQuery === "PROTA") {
        matchesCategory = doc.type === "PROTA" || doc.type === "Program Tahunan";
      } else if (categoryQuery === "PROSEM") {
        matchesCategory = doc.type === "PROSEM" || doc.type === "Program Semester";
      } else {
        matchesCategory = doc.type === categoryQuery;
      }
    }

    return matchesSearch && matchesCategory;
  });
  
  const displayDocuments = filteredDocuments.map(doc => ({
    id: doc.id,
    title: doc.title,
    type: doc.type,
    date: format(new Date(doc.createdAt), "dd MMM yyyy", { locale: id }),
    status: doc.status,
    size: doc.size || "0 KB"
  }));

  let totalStorageBytes = 0;
  realDocuments.forEach(doc => {
    if (doc.size) {
      const isMB = doc.size.toUpperCase().includes("MB");
      const numStr = doc.size.replace(/[^\d.]/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num)) {
        totalStorageBytes += isMB ? (num * 1024 * 1024) : (num * 1024);
      }
    }
  });

  const storageVal = totalStorageBytes > 1024 * 1024 
    ? (totalStorageBytes / (1024 * 1024)).toFixed(1)
    : Math.round(totalStorageBytes / 1024);
  const storageUnit = totalStorageBytes > 1024 * 1024 ? "MB" : "KB";

  return (
    <div className="min-h-screen bg-[#f4f3ed] dark:bg-[#080b06] text-[#1a2315] dark:text-[#e8eedd] flex flex-col font-sans selection:bg-[#4d7537]/30 selection:text-neutral-900 dark:selection:text-white transition-colors duration-300">
      <nav className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#dcdad1] dark:border-[#3f612d]/20 bg-[#f4f3ed]/90 dark:bg-[#080b06]/90 sticky top-0 z-50 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-[#1a2315] dark:text-[#f4f3ed]">
            <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="font-bricolage font-semibold text-lg hidden sm:block">Dekstorio</span>
          </Link>
        </div>

        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white dark:bg-[#10140d]/80 rounded-lg p-1 border border-[#dcdad1] dark:border-[#3f612d]/30 backdrop-blur-md">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-neutral-100 dark:bg-[#1a2315] text-neutral-900 dark:text-[#f4f3ed] hover:bg-neutral-200 dark:hover:bg-[#2c471c] hover:text-neutral-900 dark:hover:text-white rounded-md"
            >
              <Folder className="w-4 h-4 mr-2" />
              Penyimpanan File
            </Button>
          </Link>
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-neutral-500 dark:text-[#a2b591] hover:text-neutral-900 dark:hover:text-[#f4f3ed] hover:bg-neutral-100 dark:hover:bg-[#1a2315] rounded-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Suspense fallback={<div className="w-48 xl:w-64 h-9 bg-neutral-100 dark:bg-[#1a2315]/50 animate-pulse rounded-md" />}>
            <DashboardSearchBar />
          </Suspense>
          <DashboardNavbarActions user={user} />
        </div>
      </nav>

      <main className="flex-1 px-6 md:px-10 py-6 max-w-7xl mx-auto w-full space-y-8 relative z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4d7537]/5 dark:bg-[#3f612d]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
          <DashboardFadeIn delay={0.1}>
            <AnimatedGreeting name={user.name?.split(' ')[0] || 'Guru'} />
            <p className="text-neutral-600 dark:text-[#a2b591] mt-1 font-sans">
              Kelola dan unduh semua dokumen kurikulum yang pernah Anda buat.
            </p>
          </DashboardFadeIn>
          <div className="flex items-center gap-3">
            <Suspense fallback={<div className="h-10 w-24 bg-neutral-100 dark:bg-[#1a2315]/50 animate-pulse rounded-md" />}>
              <DashboardFilter availableCategories={availableCategories} />
            </Suspense>
            <Link href="/">
              <Button className="bg-[#4d7537] text-white hover:bg-[#5a8b41] shadow-lg shadow-black/5 dark:shadow-[#3f612d]/20 border border-[#4d7537] dark:border-[#6b9d4f]/50 cursor-pointer h-10 px-4">
                <Plus className="w-4 h-4 mr-2" />
                Generate Baru
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          <DashboardFadeIn delay={0.2}>
            <Card className="h-full bg-white dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 p-5 backdrop-blur-sm shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-2 text-neutral-500 dark:text-[#a2b591]">
                <span className="w-5 h-5 flex items-center justify-center text-[#4d7537] dark:text-[#89b867]">📄</span>
                <span className="font-sans font-medium">Total Dokumen</span>
              </div>
              <div className="font-bricolage text-3xl font-normal text-neutral-900 dark:text-[#f4f3ed]">{displayDocuments.length}</div>
            </Card>
          </DashboardFadeIn>
          <DashboardFadeIn delay={0.3}>
            <Card className="h-full bg-white dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 p-5 backdrop-blur-sm shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-2 text-neutral-500 dark:text-[#a2b591]">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="font-sans font-medium">Sisa Kuota Generate</span>
              </div>
              <div className="font-bricolage text-3xl font-normal text-neutral-900 dark:text-[#f4f3ed]">
                12 <span className="font-sans text-sm font-normal text-neutral-400 dark:text-[#6b7b59]"> / 50 bulan ini</span>
              </div>
            </Card>
          </DashboardFadeIn>
          <DashboardFadeIn delay={0.4}>
            <Card className="h-full bg-white dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 p-5 backdrop-blur-sm shadow-sm transition-colors">
              <div className="flex items-center gap-3 mb-2 text-neutral-500 dark:text-[#a2b591]">
                <Folder className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span className="font-sans font-medium">Penyimpanan Terpakai</span>
              </div>
              <div className="font-bricolage text-3xl font-normal text-neutral-900 dark:text-[#f4f3ed]">
                {storageVal} <span className="font-sans text-sm font-normal text-neutral-400 dark:text-[#6b7b59]">{storageUnit} / 1 GB</span>
              </div>
            </Card>
          </DashboardFadeIn>
        </div>

        <DashboardFadeIn delay={0.5}>
          <Card className="bg-white dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 overflow-hidden relative backdrop-blur-sm shadow-sm transition-colors">
            <DocumentTable documents={displayDocuments} />
          </Card>
        </DashboardFadeIn>
      </main>
    </div>
  );
}
