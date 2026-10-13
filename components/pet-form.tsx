"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PET_GENDERS, PET_SPECIES, type StorePet } from "@/lib/store-pet";
import type { StoreBreed } from "@/lib/store-breed";
import { IRAN_PROVINCES, citiesForProvince, provinceForCity } from "@/lib/iran-locations";

const petSchema = z.object({
  name: z.string().trim().min(2, "نام حیوان را وارد کنید"),
  photo: z.string().optional().default(""),
  species: z.enum(["dog", "cat", "rabbit", "bird", "fish", "rodent", "other"], {
    errorMap: () => ({ message: "گونه را انتخاب کنید" }),
  }),
  breed: z.string().optional().default(""),
  province: z.string().optional().default(""),
  city: z.string().optional().default(""),
  birthday: z.string().optional().default(""),
  weightKg: z.string().optional().default(""),
  gender: z.enum(["male", "female", "unknown"]),
  allergies: z.string().optional().default(""),
  dietaryRestrictions: z.string().optional().default(""),
  specialNeeds: z.string().optional().default(""),
  microchipNumber: z.string().optional().default(""),
  emergencyContactName: z.string().optional().default(""),
  emergencyContactPhone: z
    .string()
    .trim()
    .refine((value) => !value || /^0\d{10}$/.test(value), "شماره تماس معتبر نیست"),
});

export type PetFormValues = z.infer<typeof petSchema>;

function toFormValues(pet?: Partial<StorePet> | null): PetFormValues {
  return {
    name: pet?.name || "",
    photo: pet?.photo || "",
    species: pet?.species || "dog",
    breed: pet?.breed || "",
    province: pet?.province || provinceForCity(pet?.city) || "",
    city: pet?.city || "",
    birthday: pet?.birthday || "",
    weightKg: pet?.weightKg != null ? String(pet.weightKg) : "",
    gender: pet?.gender || "unknown",
    allergies: pet?.allergies || "",
    dietaryRestrictions: pet?.dietaryRestrictions || "",
    specialNeeds: pet?.specialNeeds || "",
    microchipNumber: pet?.microchipNumber || "",
    emergencyContactName: pet?.emergencyContactName || "",
    emergencyContactPhone: pet?.emergencyContactPhone || "",
  };
}

export function petPayload(values: PetFormValues) {
  const weight = Number(values.weightKg.replace(",", "."));
  return {
    name: values.name.trim(),
    photo: values.photo || "",
    species: values.species,
    breed: values.breed.trim(),
    province: values.province.trim(),
    city: values.city.trim(),
    birthday: values.birthday || "",
    weightKg: Number.isFinite(weight) && weight > 0 ? weight : null,
    gender: values.gender,
    allergies: values.allergies.trim(),
    dietaryRestrictions: values.dietaryRestrictions.trim(),
    specialNeeds: values.specialNeeds.trim(),
    microchipNumber: values.microchipNumber.trim(),
    emergencyContactName: values.emergencyContactName.trim(),
    emergencyContactPhone: values.emergencyContactPhone.trim(),
  };
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PetForm({
  pet,
  submitLabel,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  pet?: Partial<StorePet> | null;
  submitLabel: string;
  busy?: boolean;
  error?: string;
  onSubmit: (values: PetFormValues) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: toFormValues(pet),
  });

  const photo = watch("photo") || "";
  const species = watch("species");
  const province = watch("province");
  const speciesRegister = register("species");
  const provinceRegister = register("province");
  const [breeds, setBreeds] = React.useState<StoreBreed[]>([]);
  const [breedsBusy, setBreedsBusy] = React.useState(false);

  const loadBreeds = React.useCallback(async (nextSpecies: string) => {
    setBreedsBusy(true);
    setBreeds([]);
    try {
      const res = await fetch(`/api/breeds?species=${encodeURIComponent(nextSpecies)}`, { cache: "no-store" });
      const items = res.ok ? await res.json() : [];
      setBreeds(Array.isArray(items) ? items : []);
    } catch {
      setBreeds([]);
    } finally {
      setBreedsBusy(false);
    }
  }, []);

  React.useEffect(() => {
    const values = toFormValues(pet);
    reset(values);
    void loadBreeds(values.species);
  }, [pet, reset, loadBreeds]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3.5 rounded-2xl border bg-card p-5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]"
    >
      <ImageUploader
        values={photo ? [photo] : []}
        onChange={(urls) => setValue("photo", urls[0] || "", { shouldDirty: true })}
        max={1}
        folder="pets"
        label="عکس حیوان خانگی"
        disabled={busy}
      />
      <div className="flex flex-col gap-1.5">
        <Label>نام</Label>
        <Input {...register("name")} placeholder="مثلاً لوکا" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>گونه</Label>
        <select
          {...speciesRegister}
          className={selectClass}
          onChange={(event) => {
            speciesRegister.onChange(event);
            setValue("breed", "");
            void loadBreeds(event.target.value);
          }}
        >
          {PET_SPECIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        {errors.species && <span className="text-xs text-destructive">{errors.species.message}</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>نژاد</Label>
        <select key={species} {...register("breed")} className={selectClass} disabled={breedsBusy || busy}>
          <option value="">{breedsBusy ? "در حال بارگذاری نژادها..." : "انتخاب نژاد"}</option>
          {breeds.map((item) => (
            <option key={item.id} value={item.title}>
              {item.title}
              {item.nameEn ? ` — ${item.nameEn}` : ""}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-muted-foreground">
          {breedsBusy
            ? "لیست نژاد در حال به‌روزرسانی است."
            : breeds.length > 0
              ? `${breeds.length.toLocaleString("fa-IR")} نژاد ${PET_SPECIES.find((item) => item.id === species)?.label || ""}`
              : "نژادی برای این گونه ثبت نشده است."}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>استان</Label>
        <select
          {...provinceRegister}
          className={selectClass}
          onChange={(event) => {
            provinceRegister.onChange(event);
            setValue("city", "");
          }}
        >
          <option value="">انتخاب استان</option>
          {IRAN_PROVINCES.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>شهر</Label>
        <select key={province || "city"} {...register("city")} className={selectClass} disabled={!province}>
          <option value="">{province ? "انتخاب شهر" : "ابتدا استان را انتخاب کنید"}</option>
          {citiesForProvince(province).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>تاریخ تولد</Label>
        <Input type="date" {...register("birthday")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>وزن (کیلوگرم)</Label>
        <Input type="number" min="0" step="0.1" {...register("weightKg")} placeholder="مثلاً ۴.۵" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>جنسیت</Label>
        <select {...register("gender")} className={selectClass}>
          {PET_GENDERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-full flex flex-col gap-1.5">
        <Label>آلرژی‌ها</Label>
        <Textarea rows={2} {...register("allergies")} placeholder="مثلاً مرغ، گرده گل" />
      </div>
      <div className="col-span-full flex flex-col gap-1.5">
        <Label>محدودیت غذایی</Label>
        <Textarea rows={2} {...register("dietaryRestrictions")} placeholder="غذاهایی که نباید داده شود" />
      </div>
      <div className="col-span-full flex flex-col gap-1.5">
        <Label>نیازهای ویژه</Label>
        <Textarea rows={2} {...register("specialNeeds")} placeholder="دارو، معلولیت، مراقبت خاص" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>شماره میکروچیپ</Label>
        <Input {...register("microchipNumber")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>نام مخاطب اضطراری</Label>
        <Input {...register("emergencyContactName")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>شماره اضطراری</Label>
        <Input {...register("emergencyContactPhone")} placeholder="0912xxxxxxx" />
        {errors.emergencyContactPhone && (
          <span className="text-xs text-destructive">{errors.emergencyContactPhone.message}</span>
        )}
      </div>
      {error && <div className="col-span-full text-[13px] text-destructive">{error}</div>}
      <div className="col-span-full flex gap-2.5">
        <Button type="submit" disabled={busy} className="font-bold">
          {busy ? "در حال ذخیره..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            انصراف
          </Button>
        )}
      </div>
    </form>
  );
}
