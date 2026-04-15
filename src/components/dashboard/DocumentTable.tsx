"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Folder, Trash2, CheckCircle2 } from "lucide-react";
import { DashboardTableRow } from "./DashboardAnimations";
import { DocumentActions } from "./DocumentActions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/ActionModal";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  status?: string | null;
}

interface DocumentTableProps {
  documents: Document[];
}

export function DocumentTable({ documents }: DocumentTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map((doc) => doc.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/documents/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response.ok) {
        setSelectedIds([]);
        setShowBulkDeleteModal(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Gagal menghapus dokumen");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-3 px-6 bg-[#4d7537] text-white rounded-lg shadow-lg border border-[#4d7537]/20"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-sans font-medium text-sm">
                {selectedIds.length} Dokumen terpilih
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIds([])}
                className="text-white hover:bg-white/10 text-xs"
              >
                Batal
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowBulkDeleteModal(true)}
                className="!bg-[#ff0000] hover:!bg-[#cc0000] text-white border-none text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all active:scale-95 font-bold rounded-md px-4"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto scrollbar-hide">
        <Table>
          <TableHeader className="bg-neutral-50 dark:bg-[#1a2315]/50 border-b border-[#dcdad1] dark:border-[#3f612d]/30">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[50px] px-6">
                <Checkbox 
                  checked={selectedIds.length === documents.length && documents.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-neutral-300 dark:border-[#3f612d]/50 data-[state=checked]:bg-[#4d7537] data-[state=checked]:border-[#4d7537]"
                />
              </TableHead>
              <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-4">Nama Dokumen</TableHead>
              <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-4">Kategori</TableHead>
              <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-4">Tanggal</TableHead>
              <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans px-4 whitespace-nowrap">Ukuran</TableHead>
              <TableHead className="text-[#4d7537] dark:text-[#89b867] font-medium font-sans text-right px-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-neutral-400 dark:text-[#6b7b59] font-sans">
                  <div className="flex flex-col items-center gap-2">
                    <Folder className="w-10 h-10 opacity-20" />
                    <p>Belum ada dokumen. Mulai buat perangkat ajar pertama Anda!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc, idx) => (
                <DashboardTableRow key={doc.id} index={idx} className={selectedIds.includes(doc.id) ? "bg-[#4d7537]/5 dark:bg-[#4d7537]/10" : ""}>
                  <TableCell className="px-6">
                    <Checkbox 
                      checked={selectedIds.includes(doc.id)}
                      onCheckedChange={() => toggleSelect(doc.id)}
                      className="border-neutral-300 dark:border-[#3f612d]/50 data-[state=checked]:bg-[#4d7537] data-[state=checked]:border-[#4d7537]"
                    />
                  </TableCell>
                  <TableCell className="font-sans font-medium text-neutral-900 dark:text-[#e8eedd] flex items-center gap-3 py-4 px-4 max-w-[400px] xl:max-w-[600px]">
                    <div className="shrink-0 w-8 h-8 rounded bg-neutral-100 dark:bg-[#1a2315] flex items-center justify-center border border-neutral-200 dark:border-[#3f612d]/30 group-hover:border-[#4d7537]/50 dark:group-hover:border-[#6b9d4f]/50 transition-colors">
                      <FileText className="w-4 h-4 text-[#4d7537] dark:text-[#89b867]" />
                    </div>
                    <span className="translate-y-[1px] truncate">{doc.title}</span>
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

      <ActionModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        isLoading={isDeleting}
        title={`Hapus ${selectedIds.length} Dokumen?`}
        description={`Semua dokumen yang terpilih akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        confirmText="Hapus Sekarang"
        cancelText="Batal"
      />
    </div>
  );
}
