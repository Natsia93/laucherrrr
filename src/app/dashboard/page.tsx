import React from "react";
import Link from "next/link";
import { Folder, FileText, Search, BookOpen, Download, Pencil, Trash2, Plus, Clock, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/ThemeToggle";
import { db } from "@/db";
import { documents as documentsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DashboardFadeIn, DashboardTableRow, DashboardContainer } from "@/components/dashboard/DashboardAnimations";
import { AnimatedGreeting } from "@/components/dashboard/AnimatedGreeting";
import { DashboardNavbarActions } from "@/components/dashboard/DashboardNavbarActions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { DocumentActions } from "@/components/dashboard/DocumentActions";


export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect("/login");
  }

  const user = session.user;

  // Ambil data langsung dari Supabase menggunakan Drizzle, difilter berdasarkan userId
  const realDocuments = await db.select()
    .from(documentsTable)
    .where(eq(documentsTable.userId, user.id))
    .orderBy(desc(documentsTable.createdAt));
  
  // Format data untuk tabel
  const displayDocuments = realDocuments.map(doc => ({
    id: doc.id,
    title: doc.title,
    type: doc.type,
    date: format(new Date(doc.createdAt), "dd MMM yyyy", { locale: id }),
    status: doc.status,
    size: doc.size || "0 KB"
  }));

  // Hitung penggunaan penyimpanan terpakai
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
      {/* Navbar Minimalis Dashboard */}
      <nav className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#dcdad1] dark:border-[#3f612d]/20 bg-[#f4f3ed]/90 dark:bg-[#080b06]/90 sticky top-0 z-50 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-[#1a2315] dark:text-[#f4f3ed]">
            <div className="w-8 h-8 rounded bg-[#4d7537] flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="font-bricolage font-semibold text-lg hidden sm:block">EduAuto</span>
          </Link>
        </div>

        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white dark:bg-[#10140d]/80 rounded-lg p-1 border border-[#dcdad1] dark:border-[#3f612d]/30 backdrop-blur-md">
            <Link href="/dashboard" passHref>
              <Button variant="ghost" size="sm" className="bg-neutral-100 dark:bg-[#1a2315] text-neutral-900 dark:text-[#f4f3ed] hover:bg-neutral-200 dark:hover:bg-[#2c471c] hover:text-neutral-900 dark:hover:text-white rounded-md">
                <Folder className="w-4 h-4 mr-2" />
                Penyimpanan File
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button variant="ghost" size="sm" className="text-neutral-500 dark:text-[#a2b591] hover:text-neutral-900 dark:hover:text-[#f4f3ed] hover:bg-neutral-100 dark:hover:bg-[#1a2315] rounded-md">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </Link>
          </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative hidden xl:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-[#6b7b59]" />
            <Input 
              placeholder="Cari dokumen..." 
              className="w-48 xl:w-64 pl-9 bg-white dark:bg-[#1a2315]/50 border-[#dcdad1] dark:border-[#3f612d]/30 text-sm focus-visible:ring-[#4d7537]/50 text-neutral-900 dark:text-[#f4f3ed] placeholder:text-neutral-400 dark:placeholder:text-[#6b7b59]"
            />
          </div>
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
            <Button variant="outline" className="bg-white dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 text-neutral-700 dark:text-[#d4e4c8] hover:bg-neutral-50 dark:hover:bg-[#1a2315] hover:text-neutral-900 dark:hover:text-white cursor-pointer">
              <Filter className="w-4 h-4 mr-2 text-[#4d7537] dark:text-[#89b867]" />
              Filter
            </Button>
            <Link href="/">
              <Button className="bg-[#4d7537] text-white hover:bg-[#5a8b41] shadow-lg shadow-black/5 dark:shadow-[#3f612d]/20 border border-[#4d7537] dark:border-[#6b9d4f]/50 cursor-pointer">
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
                <FileText className="w-5 h-5 text-[#4d7537] dark:text-[#89b867]" />
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

        {/* File Table */}
        <DashboardFadeIn delay={0.5}>
          <Card className="bg-white dark:bg-[#10140d]/80 border-[#dcdad1] dark:border-[#3f612d]/30 overflow-hidden relative backdrop-blur-sm shadow-sm transition-colors">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* ... sisanya tetap sama ... */}
              <Table>
                <TableHeader className="bg-neutral-50 dark:bg-[#1a2315]/50 border-b border-[#dcdad1] dark:border-[#3f612d]/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-6">Nama Dokumen</TableHead>
                    <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-4">Kategori</TableHead>
                    <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-4">Tanggal</TableHead>
                    <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-4 whitespace-nowrap">Ukuran</TableHead>
                    <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans text-right px-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-neutral-400 dark:text-[#6b7b59] font-sans">
                        <div className="flex flex-col items-center gap-2">
                          <Folder className="w-10 h-10 opacity-20" />
                          <p>Belum ada dokumen. Mulai buat perangkat ajar pertama Anda!</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayDocuments.map((doc, idx) => (
                      <DashboardTableRow key={doc.id} index={idx}>
                        <TableCell className="font-sans font-medium text-neutral-900 dark:text-[#e8eedd] flex items-center gap-3 py-4 px-6">
                          <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-[#1a2315] flex items-center justify-center border border-neutral-200 dark:border-[#3f612d]/30 group-hover:border-[#4d7537]/50 dark:group-hover:border-[#6b9d4f]/50 transition-colors">
                            <FileText className="w-4 h-4 text-[#4d7537] dark:text-[#89b867]" />
                          </div>
                          <span className="translate-y-[1px]">{doc.title}</span>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge variant="outline" className="bg-neutral-50 dark:bg-[#080b06]/50 border-neutral-200 dark:border-[#3f612d]/30 text-neutral-600 dark:text-[#a2b591] font-normal font-sans">
                            {doc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-500 dark:text-[#a2b591] text-sm font-sans px-4">{doc.date}</TableCell>
                        <TableCell className="text-neutral-500 dark:text-[#a2b591] text-sm font-sans px-4">{doc.size}</TableCell>
                        <TableCell className="text-right px-6">
                          <DocumentActions docId={doc.id} title={doc.title} />
                        </TableCell>
                      </DashboardTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </DashboardFadeIn>
      </main>
    </div>
  );
}
