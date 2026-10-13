import { speciesLabel, type StorePet } from "@/lib/store-pet";

export type CareItem = {
  id: string;
  tone: "ok" | "warn" | "alert";
  title: string;
  text: string;
};

function faNum(value: number) {
  return value.toLocaleString("fa-IR");
}

export function petAge(birthday?: string) {
  if (!birthday) return null;
  const birth = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || birth > new Date()) return null;
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months };
}

export function petAgeLabel(birthday?: string) {
  const age = petAge(birthday);
  if (!age) return "سن ثبت نشده";
  if (age.years <= 0 && age.months <= 0) return "کمتر از یک ماه";
  if (age.years <= 0) return `${faNum(age.months)} ماه`;
  if (age.months <= 0) return `${faNum(age.years)} سال`;
  return `${faNum(age.years)} سال و ${faNum(age.months)} ماه`;
}

export function nextBirthdayInfo(birthday?: string) {
  if (!birthday) return null;
  const birth = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next.setFullYear(now.getFullYear() + 1);
  }
  const diff = Math.round((next.getTime() - now.setHours(0, 0, 0, 0)) / 86400000);
  return {
    date: next.toLocaleDateString("fa-IR"),
    days: diff,
    label: diff === 0 ? "امروز تولد است" : `${faNum(diff)} روز تا تولد بعدی`,
  };
}

const SPECIES_TIPS: Record<string, string[]> = {
  dog: ["معاینه عمومی و واکسن هاری را سالانه پیگیری کنید.", "پیاده‌روی روزانه و مسواک زدن دندان‌ها را در برنامه بگذارید."],
  cat: ["واکسن سه‌گانه و هاری را طبق نظر دامپزشک تمدید کنید.", "ظرف خاک تمیز و آب تازه همیشه در دسترس باشد."],
  rabbit: ["یونجه تازه بخش اصلی رژیم غذایی باشد.", "وضعیت دندان و ناخن را هر چند هفته بررسی کنید."],
  bird: ["قفس را در جای پرنور و بدون جریان باد شدید بگذارید.", "شن و مکمل مناسب گونه را فراموش نکنید."],
  fish: ["دمای آب و تعویض جزئی هفتگی را ثابت نگه دارید.", "از غذای مخصوص گونه و پرهیز از تغذیه بیش از حد استفاده کنید."],
  rodent: ["چرخ و اسباب‌بازی جویدنی برای سلامت دندان لازم است.", "رژیم غلات و سبزی تازه را متعادل نگه دارید."],
  other: ["برنامه معاینه دوره‌ای با دامپزشک متخصص گونه تنظیم کنید."],
};

export function profileCompleteness(pet: StorePet) {
  const checks = [
    Boolean(pet.photo),
    Boolean(pet.breed),
    Boolean(pet.province && pet.city),
    Boolean(pet.birthday),
    pet.weightKg != null,
    pet.gender !== "unknown",
    Boolean(pet.microchipNumber),
    Boolean(pet.emergencyContactName && pet.emergencyContactPhone),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function careDashboard(pet: StorePet) {
  const items: CareItem[] = [];
  const birthday = nextBirthdayInfo(pet.birthday);

  if (pet.allergies) {
    items.push({ id: "allergies", tone: "alert", title: "آلرژی", text: pet.allergies });
  }
  if (pet.dietaryRestrictions) {
    items.push({ id: "diet", tone: "warn", title: "محدودیت غذایی", text: pet.dietaryRestrictions });
  }
  if (pet.specialNeeds) {
    items.push({ id: "needs", tone: "warn", title: "نیاز ویژه", text: pet.specialNeeds });
  }
  if (!pet.microchipNumber) {
    items.push({ id: "chip", tone: "warn", title: "میکروچیپ", text: "شماره میکروچیپ ثبت نشده است." });
  } else {
    items.push({ id: "chip", tone: "ok", title: "میکروچیپ", text: pet.microchipNumber });
  }
  if (!pet.emergencyContactPhone) {
    items.push({ id: "emergency", tone: "warn", title: "مخاطب اضطراری", text: "نام و شماره اضطراری را کامل کنید." });
  } else {
    items.push({
      id: "emergency",
      tone: "ok",
      title: "مخاطب اضطراری",
      text: [pet.emergencyContactName, pet.emergencyContactPhone].filter(Boolean).join(" — "),
    });
  }
  if (birthday) {
    items.push({ id: "birthday", tone: birthday.days <= 14 ? "warn" : "ok", title: "تولد", text: birthday.label });
  }
  if (!pet.weightKg) {
    items.push({ id: "weight", tone: "warn", title: "وزن", text: "وزن به‌روز نشده است." });
  }
  if (!pet.photo) {
    items.push({ id: "photo", tone: "warn", title: "عکس", text: "برای شناسایی سریع‌تر، عکس اضافه کنید." });
  }
  const age = petAge(pet.birthday);
  if (age && age.years < 1) {
    items.push({
      id: "vax",
      tone: "warn",
      title: "واکسن",
      text: `${pet.name} هنوز به یک سالگی نرسیده؛ برنامه واکسن اولیه را با دامپزشک هماهنگ کنید.`,
    });
  }

  return {
    ageLabel: petAgeLabel(pet.birthday),
    nextCheckup: birthday ? `معاینه پیشنهادی بعدی حوالی ${birthday.date}` : "تاریخ تولد را برای یادآوری معاینه سالانه وارد کنید.",
    tips: SPECIES_TIPS[pet.species] || SPECIES_TIPS.other,
    items,
    species: speciesLabel(pet.species),
  };
}
