"use client";

import React, { useState } from "react";
import { Download, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ActionModal } from "@/components/ui/ActionModal";

interface DocumentActionsProps {
  docId: string;
  title: string;
  onDeleteOptimistic: (id: string) => void;
}

export function DocumentActions({ docId, title, onDeleteOptimistic }: DocumentActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Save current list for potential rollback isn't easily done here since state is in parent
    // but the parent handles refresh. For single delete, we call optimistic first.
    onDeleteOptimistic(docId);
    setShowDeleteModal(false);

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete document");
        // For simple rollback we can just refresh to get state back
        router.refresh();
      }
    } catch (error) {
      alert("A system error occurred");
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
        title="Edit Document"
        onClick={handleEdit}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        disabled={isDeleting}
        title="Delete Document"
        onClick={() => setShowDeleteModal(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Document?"
        description={`Document "${title}" will be permanently removed from your storage. This action cannot be undone.`}
        type="danger"
        confirmText="Delete Now"
        cancelText="Cancel"
      />
    </div>
  );
}

