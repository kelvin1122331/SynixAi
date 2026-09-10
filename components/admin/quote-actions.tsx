"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

/**
 * Tombol aksi untuk dashboard admin.
 * Memanggil /api/admin/quotes (submit / cancel / sync) lalu menyegarkan data.
 */

async function callAdminApi(payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
  return data;
}

export function SubmitQuoteButton({ reference, token }: { reference: string; token: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const data = await callAdminApi({ token, action: "submit", reference });
      if (data.ok) {
        toast({ title: "Pesanan dikirim ke panel ✅", description: data.message, tone: "success" });
      } else {
        toast({ title: "Gagal mengirim ke panel", description: data.error, tone: "error" });
      }
      router.refresh();
    } catch (error) {
      toast({ title: "Kesalahan jaringan", description: (error as Error).message, tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="success" onClick={submit} disabled={loading}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      {loading ? "Mengirim…" : "Kirim ke panel"}
    </Button>
  );
}

export function CancelQuoteButton({ reference, token }: { reference: string; token: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    setLoading(true);
    try {
      const data = await callAdminApi({
        token,
        action: "cancel",
        reference,
        reason: "Dibatalkan oleh admin (pembayaran tidak diterima).",
      });
      toast({
        title: data.ok ? "Pesanan dibatalkan" : "Gagal membatalkan",
        description: data.message ?? data.error,
        tone: data.ok ? "info" : "error",
      });
      router.refresh();
    } catch (error) {
      toast({ title: "Kesalahan jaringan", description: (error as Error).message, tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="ghost" onClick={cancel} disabled={loading} title="Batalkan pesanan">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function SyncCatalogButton({ token, className }: { token: string; className?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function sync() {
    setLoading(true);
    try {
      const data = await callAdminApi({ token, action: "sync" });
      toast({
        title: data.ok ? "Sinkronisasi selesai" : "Sinkronisasi gagal",
        description: data.message ?? data.error,
        tone: data.ok ? "success" : "error",
      });
      router.refresh();
    } catch (error) {
      toast({ title: "Kesalahan jaringan", description: (error as Error).message, tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" size="md" onClick={sync} disabled={loading} className={cn(className)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      {loading ? "Menyinkronkan…" : "Sinkronkan katalog"}
    </Button>
  );
}
