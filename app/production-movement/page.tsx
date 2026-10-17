"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, CircleHelp, CloudUpload, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  SUPPLIERS,
  WAREHOUSES,
  emptyLine,
  supplierName,
  warehouseName,
  type MovementAttachment,
  type MovementLine,
  type StockUnits,
} from "@/lib/store-production-movement";

const TABS = [
  { id: "info", label: "اطلاعات اولیه" },
  { id: "outputs", label: "اقلام خروجی" },
  { id: "inputs", label: "اقلام ورودی" },
  { id: "preview", label: "پیش‌نمایش" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const MAX_FILE_BYTES = 1024 * 1024 * 1024;
const PLACEHOLDER = "متن داخلی";

type CatalogProduct = { id: string; name: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function lineHasData(row: MovementLine) {
  return Boolean(row.productId || row.productName);
}

export default function ProductionMovementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [tab, setTab] = React.useState<TabId>("info");
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [fromWarehouseId, setFromWarehouseId] = React.useState("");
  const [toWarehouseId, setToWarehouseId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [attachments, setAttachments] = React.useState<MovementAttachment[]>([]);
  const [outputs, setOutputs] = React.useState<MovementLine[]>([emptyLine()]);
  const [inputs, setInputs] = React.useState<MovementLine[]>([emptyLine()]);
  const [products, setProducts] = React.useState<CatalogProduct[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [savedId, setSavedId] = React.useState("");

  React.useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [status, session, router]);

  React.useEffect(() => {
    fetch("/api/products?limit=100", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        setProducts(items.map((item: { id?: string; name?: string }) => ({ id: String(item.id), name: String(item.name || "") })));
      })
      .catch(() => setProducts([]));
  }, []);

  const updateLine = (kind: "outputs" | "inputs", id: string, patch: Partial<MovementLine>) => {
    const setter = kind === "outputs" ? setOutputs : setInputs;
    setter((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const updateStock = (kind: "outputs" | "inputs", id: string, key: keyof StockUnits, value: number) => {
    const setter = kind === "outputs" ? setOutputs : setInputs;
    setter((rows) =>
      rows.map((row) => (row.id === id ? { ...row, stock: { ...row.stock, [key]: value } } : row))
    );
  };

  const chooseProduct = (kind: "outputs" | "inputs", id: string, productId: string) => {
    const product = products.find((item) => item.id === productId);
    updateLine(kind, id, { productId, productName: product?.name || "" });
  };

  const chooseSupplier = (kind: "outputs" | "inputs", id: string, supplierId: string) => {
    updateLine(kind, id, { supplierId, supplierName: supplierName(supplierId) });
  };

  const onPickFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setError("");
    const next: MovementAttachment[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setError("حداکثر حجم مجاز فایل ۱ گیگابایت است.");
        continue;
      }
      let url = "";
      if (file.type.startsWith("image/")) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "production");
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json().catch(() => ({}));
          if (res.ok) url = String(data.url || "");
        } catch {
          url = "";
        }
      }
      next.push({ name: file.name, size: file.size, url });
    }
    if (next.length) setAttachments((current) => [...current, ...next]);
  };

  const usable = (rows: MovementLine[]) => rows.filter(lineHasData);

  const save = async () => {
    setError("");
    setSavedId("");
    if (!fromWarehouseId) {
      setTab("info");
      setError("انبار مبدأ را انتخاب کنید.");
      return;
    }
    if (!toWarehouseId) {
      setTab("info");
      setError("انبار مقصد را انتخاب کنید.");
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      setTab("info");
      setError("انبار مبدأ و مقصد نباید یکسان باشند.");
      return;
    }
    const outputLines = usable(outputs);
    const inputLines = usable(inputs);
    if (outputLines.length === 0 && inputLines.length === 0) {
      setTab("outputs");
      setError("حداقل یک قلم خروجی یا ورودی وارد کنید.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/production-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWarehouseId,
          toWarehouseId,
          description,
          attachments,
          outputs: outputLines,
          inputs: inputLines,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "ذخیره انتقال تولید انجام نشد.");
        return;
      }
      setSavedId(String(data.id || "ok"));
      setTab("preview");
    } catch {
      setError("ذخیره انتقال تولید انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setFromWarehouseId("");
    setToWarehouseId("");
    setDescription("");
    setAttachments([]);
    setOutputs([emptyLine()]);
    setInputs([emptyLine()]);
    setSavedId("");
    setError("");
    setTab("info");
  };

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">در حال بارگذاری...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef2f6] text-slate-800" dir="rtl">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <h1 className="text-[17px] font-extrabold text-slate-800">انتقال تولید</h1>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-[#3b5bdb]"
        >
          <CircleHelp className="h-4 w-4" />
          راهنما
        </button>
      </header>

      <div className="border-b border-slate-200 bg-white px-5">
        <div className="flex items-center justify-start gap-8">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`relative py-3 text-[13px] font-bold ${
                tab === item.id ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {item.label}
              {tab === item.id && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#3b5bdb]" />}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-5 py-4">
        {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>}
        {savedId && (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
            انتقال تولید با موفقیت ذخیره شد.
          </div>
        )}

        {tab === "info" && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-5 grid gap-4 md:grid-cols-2">
              <Field label="از انبار" required>
                <Select value={fromWarehouseId} onValueChange={setFromWarehouseId}>
                  <SelectTrigger className="h-10 bg-white shadow-none">
                    <SelectValue placeholder={PLACEHOLDER} />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSES.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="به انبار" required>
                <Select value={toWarehouseId} onValueChange={setToWarehouseId}>
                  <SelectTrigger className="h-10 bg-white shadow-none">
                    <SelectValue placeholder={PLACEHOLDER} />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSES.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="شرح">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={PLACEHOLDER} className="h-10 bg-white shadow-none" />
            </Field>
            <div className="mt-5">
              <div className="mb-2 text-[13px] font-bold text-slate-700">فایل پیوست</div>
              <div className="flex flex-wrap items-start justify-start gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex min-h-[150px] w-full max-w-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#f4f7fb] px-4 py-5 text-center"
                >
                  <CloudUpload className="mb-2 h-7 w-7 text-slate-400" />
                  <div className="text-[12px] font-semibold text-slate-500">فایل خود را اینجا آپلود کنید</div>
                  <div className="mb-3 mt-1 text-[11px] text-slate-400">حداکثر حجم مجاز فایل : ۱ گیگابایت</div>
                  <span className="rounded-md border border-[#3b5bdb] px-3 py-1.5 text-[12px] font-bold text-[#3b5bdb]">آپلود فایل</span>
                </button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={onPickFiles} />
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <span key={`${file.name}-${index}`} className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1 text-[12px]">
                      {file.url ? (
                        <a href={file.url} target="_blank" rel="noreferrer" className="font-semibold text-[#3b5bdb]">{file.name}</a>
                      ) : (
                        <span>{file.name}</span>
                      )}
                      <span className="text-slate-400">{formatSize(file.size)}</span>
                      <button type="button" onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))} aria-label="حذف فایل">
                        <X className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === "outputs" && (
          <ItemsPanel
            bannerTone="out"
            warehouseLabel={fromWarehouseId ? warehouseName(fromWarehouseId) : "نام انبار انتخابی در تب اول"}
            rows={outputs}
            products={products}
            onAdd={() => setOutputs((rows) => [...rows, emptyLine()])}
            onChange={(id, patch) => updateLine("outputs", id, patch)}
            onStock={(id, key, value) => updateStock("outputs", id, key, value)}
            onProduct={(id, productId) => chooseProduct("outputs", id, productId)}
            onSupplier={(id, supplierId) => chooseSupplier("outputs", id, supplierId)}
            onRemove={(id) => setOutputs((rows) => (rows.length === 1 ? [emptyLine()] : rows.filter((row) => row.id !== id)))}
          />
        )}

        {tab === "inputs" && (
          <ItemsPanel
            bannerTone="in"
            warehouseLabel={toWarehouseId ? warehouseName(toWarehouseId) : "نام انبار انتخابی در تب اول"}
            rows={inputs}
            products={products}
            onAdd={() => setInputs((rows) => [...rows, emptyLine()])}
            onChange={(id, patch) => updateLine("inputs", id, patch)}
            onStock={(id, key, value) => updateStock("inputs", id, key, value)}
            onProduct={(id, productId) => chooseProduct("inputs", id, productId)}
            onSupplier={(id, supplierId) => chooseSupplier("inputs", id, supplierId)}
            onRemove={(id) => setInputs((rows) => (rows.length === 1 ? [emptyLine()] : rows.filter((row) => row.id !== id)))}
          />
        )}

        {tab === "preview" && (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid gap-3 text-[13px] md:grid-cols-2">
              <PreviewRow label="از انبار" value={fromWarehouseId ? warehouseName(fromWarehouseId) : "—"} />
              <PreviewRow label="به انبار" value={toWarehouseId ? warehouseName(toWarehouseId) : "—"} />
              <PreviewRow label="شرح" value={description || "—"} />
              <PreviewRow label="پیوست‌ها" value={attachments.length ? attachments.map((file) => file.name).join("، ") : "—"} />
            </div>
            <PreviewLines title="اقلام خروجی" rows={usable(outputs)} />
            <PreviewLines title="اقلام ورودی" rows={usable(inputs)} />
          </section>
        )}
      </main>

      <footer dir="ltr" className="mt-auto flex items-center gap-4 border-t border-slate-200 bg-white px-5 py-3">
        <Button type="button" disabled={busy} onClick={save} className="h-9 min-w-[88px] bg-[#3b5bdb] font-bold hover:bg-[#334ec4]">
          {busy ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        <button type="button" onClick={() => (savedId ? resetForm() : router.push("/admin"))} className="text-[13px] font-semibold text-slate-500 hover:text-slate-800">
          انصراف
        </button>
        {savedId && (
          <button type="button" onClick={resetForm} className="text-[13px] font-semibold text-[#3b5bdb]">
            انتقال جدید
          </button>
        )}
        <Link href="/admin" className="ms-auto text-[12px] text-slate-400 hover:text-slate-600">بازگشت به پنل</Link>
      </footer>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setHelpOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-right shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold">راهنمای انتقال تولید</h2>
              <button type="button" onClick={() => setHelpOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <ol className="space-y-2 text-[13px] leading-7 text-slate-600">
              <li>۱. در اطلاعات اولیه، انبار مبدأ و مقصد را انتخاب کنید و در صورت نیاز شرح و فایل پیوست بگذارید.</li>
              <li>۲. در اقلام خروجی، کالاهایی که از انبار مبدأ خارج می‌شوند را وارد کنید.</li>
              <li>۳. در اقلام ورودی، کالاهای تولیدشده که وارد انبار مقصد می‌شوند را وارد کنید.</li>
              <li>۴. پیش‌نمایش را بررسی کنید و سپس ذخیره را بزنید.</li>
            </ol>
            <Button type="button" className="mt-4 bg-[#3b5bdb] hover:bg-[#334ec4]" onClick={() => setHelpOpen(false)}>متوجه شدم</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-bold text-slate-700">
        {label}
        {required ? <span className="mr-1 text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ItemsPanel({
  bannerTone,
  warehouseLabel,
  rows,
  products,
  onAdd,
  onChange,
  onStock,
  onProduct,
  onSupplier,
  onRemove,
}: {
  bannerTone: "in" | "out";
  warehouseLabel: string;
  rows: MovementLine[];
  products: CatalogProduct[];
  onAdd: () => void;
  onChange: (id: string, patch: Partial<MovementLine>) => void;
  onStock: (id: string, key: keyof StockUnits, value: number) => void;
  onProduct: (id: string, productId: string) => void;
  onSupplier: (id: string, supplierId: string) => void;
  onRemove: (id: string) => void;
}) {
  const isIn = bannerTone === "in";
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold ${
          isIn ? "bg-[#e8f7ef] text-[#1f7a4d]" : "bg-[#fff4e8] text-[#c56a1a]"
        }`}
      >
        <span className="text-base leading-none">{isIn ? "↓" : "↑"}</span>
        <span>
          {isIn ? "ورود به انبار" : "خروج از انبار"} ({warehouseLabel})
        </span>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[980px] border-collapse text-right text-[12px]">
          <thead>
            <tr className="text-slate-500">
              <th className="min-w-[180px] px-2 py-2 font-bold">کد/نام کالا</th>
              <th className="min-w-[140px] px-2 py-2 font-bold">تامین کننده</th>
              <th className="min-w-[150px] px-2 py-2 font-bold">تاریخ تولید/انقضا</th>
              <th className="min-w-[110px] px-2 py-2 font-bold">شماره بچ</th>
              <th className="px-2 py-2 font-bold" colSpan={4}>
                موجودی
              </th>
              <th className="min-w-[110px] px-2 py-2 font-bold">تعداد سفارش</th>
              <th className="w-12 px-2 py-2" aria-label="حذف" />
            </tr>
            <tr className="text-[11px] text-slate-400">
              <th />
              <th />
              <th />
              <th />
              <th className="w-[70px] px-1 py-1 font-semibold">پالت</th>
              <th className="w-[70px] px-1 py-1 font-semibold">کارتن</th>
              <th className="w-[70px] px-1 py-1 font-semibold">بسته</th>
              <th className="w-[70px] px-1 py-1 font-semibold">عدد</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="align-middle">
                <td className="px-2 py-2">
                  <Select value={row.productId} onValueChange={(value) => onProduct(row.id, value)}>
                    <SelectTrigger className="h-9 bg-white shadow-none">
                      <SelectValue placeholder={PLACEHOLDER} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-2">
                  <Select value={row.supplierId} onValueChange={(value) => onSupplier(row.id, value)}>
                    <SelectTrigger className="h-9 bg-white shadow-none">
                      <SelectValue placeholder={PLACEHOLDER} />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLIERS.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-2">
                  <div className="relative">
                    <Input
                      type="date"
                      value={row.expiryDate || row.productionDate}
                      onChange={(e) => onChange(row.id, { productionDate: e.target.value, expiryDate: e.target.value })}
                      className="h-9 pe-9 shadow-none"
                      placeholder={PLACEHOLDER}
                    />
                    <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={row.batchNumber}
                    onChange={(e) => onChange(row.id, { batchNumber: e.target.value })}
                    placeholder="8858585"
                    className="h-9 shadow-none"
                  />
                </td>
                <td className="px-1 py-2">
                  <Input
                    type="number"
                    min={0}
                    value={row.stock.pallet || ""}
                    onChange={(e) => onStock(row.id, "pallet", Number(e.target.value) || 0)}
                    className="h-9 px-1 text-center shadow-none"
                  />
                </td>
                <td className="px-1 py-2">
                  <Input
                    type="number"
                    min={0}
                    value={row.stock.carton || ""}
                    onChange={(e) => onStock(row.id, "carton", Number(e.target.value) || 0)}
                    className="h-9 px-1 text-center shadow-none"
                  />
                </td>
                <td className="px-1 py-2">
                  <Input
                    type="number"
                    min={0}
                    value={row.stock.pack || ""}
                    onChange={(e) => onStock(row.id, "pack", Number(e.target.value) || 0)}
                    className="h-9 px-1 text-center shadow-none"
                  />
                </td>
                <td className="px-1 py-2">
                  <Input
                    type="number"
                    min={0}
                    value={row.stock.unit || ""}
                    onChange={(e) => onStock(row.id, "unit", Number(e.target.value) || 0)}
                    className="h-9 px-1 text-center shadow-none"
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    value={row.orderQuantity || ""}
                    onChange={(e) => onChange(row.id, { orderQuantity: Number(e.target.value) || 0 })}
                    className="h-9 shadow-none"
                    placeholder={PLACEHOLDER}
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#e03131] hover:bg-red-50"
                    aria-label="حذف قلم"
                    title="حذف"
                  >
                    <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={onAdd}
          className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-[#3b5bdb] hover:text-[#334ec4]"
        >
          <Plus className="h-4 w-4" />
          ثبت کالای جدید
        </button>
      </div>
    </section>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-bold text-slate-400">{label}</div>
      <div className="font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function PreviewLines({ title, rows }: { title: string; rows: MovementLine[] }) {
  return (
    <div>
      <h3 className="mb-2 text-[13px] font-extrabold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[13px] text-slate-400">موردی ثبت نشده است.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[720px] text-right text-[13px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-3 py-2 font-bold">کالا</th>
                <th className="px-3 py-2 font-bold">تامین‌کننده</th>
                <th className="px-3 py-2 font-bold">بچ</th>
                <th className="px-3 py-2 font-bold">موجودی</th>
                <th className="px-3 py-2 font-bold">تعداد سفارش</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-3 py-2">{row.productName || "—"}</td>
                  <td className="px-3 py-2">{row.supplierName || "—"}</td>
                  <td className="px-3 py-2">{row.batchNumber || "—"}</td>
                  <td className="px-3 py-2">
                    {`پالت ${row.stock.pallet} / کارتن ${row.stock.carton} / بسته ${row.stock.pack} / عدد ${row.stock.unit}`}
                  </td>
                  <td className="px-3 py-2">{row.orderQuantity || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
