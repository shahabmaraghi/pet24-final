"use client";

import * as React from "react";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

async function uploadFile(file: File, folder: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "بارگذاری تصویر انجام نشد.");
  return String(data.url);
}

export function ImageUploader({
  values,
  onChange,
  max = 6,
  folder = "products",
  label = "تصاویر محصول",
  disabled = false,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  folder?: string;
  label?: string;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;
    const remaining = Math.max(0, max - values.length);
    const selected = files.slice(0, remaining);
    setBusy(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        uploaded.push(await uploadFile(file, folder));
      }
      onChange([...values, ...uploaded].slice(0, max));
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری تصویر انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col-span-full flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex flex-wrap items-center gap-2.5">
        {values.map((url) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-[10px] border bg-muted">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => onChange(values.filter((item) => item !== url))}
              className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-white"
              aria-label="حذف تصویر"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {values.length < max && (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-[10px] border-[1.5px] border-dashed bg-muted text-muted-foreground",
              (disabled || busy) && "opacity-60"
            )}
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{busy ? "..." : "افزودن"}</span>
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">JPG، PNG، WEBP یا GIF — حداکثر ۵ مگابایت{max > 1 ? `، تا ${max.toLocaleString("fa-IR")} تصویر` : ""}</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={max > 1}
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
