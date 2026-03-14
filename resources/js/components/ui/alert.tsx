import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TrashIcon, AlertTriangleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple Alert primitives used by AlertError and other components
export function Alert({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'destructive' }) {
  const base = 'w-full rounded-md border p-3 flex items-start gap-3';
  const variantClass = variant === 'destructive'
    ? 'bg-red-50 border-red-200 text-red-900'
    : 'bg-gray-50 border-gray-200 text-gray-900';

  return (
    <div className={cn(base, variantClass)} role="alert">
      {children}
    </div>
  );
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-semibold leading-none">{children}</h4>
  );
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-muted-foreground">{children}</div>
  );
}

interface ConfirmDeleteModalProps {
  selectedCount: number
  onConfirm: () => void
  isLoading?: boolean
  title?: string
  description?: string
}

export function ConfirmDeleteModal({
  selectedCount,
  onConfirm,
  isLoading = false,
  title = "Apakah Anda yakin?",
  description,
}: ConfirmDeleteModalProps) {

  if (selectedCount === 0) return null

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          <TrashIcon className="mr-2 size-4" />
          Hapus ({selectedCount})
        </Button>
      </AlertDialogTrigger>

      {/* Menggunakan styling yang mirip dengan Alert Destructive Anda */}
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangleIcon className="size-5" />
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-sm text-muted-foreground">
            {description ||
              `Tindakan ini akan menghapus ${selectedCount} item secara permanen. Data yang sudah dihapus tidak dapat dikembalikan.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            // Menyesuaikan dengan warna destructive-foreground dari alert.tsx
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? "Menghapus..." : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 