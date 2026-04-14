"use client";

import React, { useState } from "react";
import { Download, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DocumentActionsProps {
  docId: string;
  title: string;
}

export function DocumentActions({ docId, title }: DocumentActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus dokumen "${title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });

      if (response.ok) {
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

  const handleEdit = () => {
    // Redirect to workspace for editing
    router.push(`/workspace?id=${docId}`);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <a 
        href={`/api/export-docx?id=${docId}`} 
        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-neutral-500 hover:text-[#4d7537] hover:bg-[#4d7537]/10 dark:hover:text-[#89b867] transition-colors"
        title="Download Word"
      >
        <Download className="w-4 h-4" />
      </a>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-neutral-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        title="Edit Dokumen"
        onClick={handleEdit}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        disabled={isDeleting}
        title="Hapus Dokumen"
        onClick={handleDelete}
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}
