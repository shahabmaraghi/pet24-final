"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { fmt } from "@/lib/data";

export type AdminCategoryItem = {
  id: string;
  name: string;
  active: boolean;
  order: number;
};

function SortableCategoryRow({
  category,
  busy,
  onRequestActive,
  onRequestInactive,
}: {
  category: AdminCategoryItem;
  busy: boolean;
  onRequestActive: () => void;
  onRequestInactive: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-3 rounded-[10px] border bg-card px-3 py-3 ${
        isDragging ? "z-10 border-primary shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-accent active:cursor-grabbing"
        aria-label="جابه‌جایی دسته‌بندی"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{category.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className={`font-bold ${category.active ? "text-primary" : "text-muted-foreground"}`}>
            {category.active ? "فعال" : "غیرفعال"}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-muted-foreground">اولویت نمایش: {fmt(category.order + 1)}</span>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={busy || category.active}
          onClick={onRequestActive}
          className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${
            category.active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          فعال
        </button>
        <button
          type="button"
          disabled={busy || !category.active}
          onClick={onRequestInactive}
          className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${
            !category.active
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "text-muted-foreground"
          }`}
        >
          غیرفعال
        </button>
      </div>
    </div>
  );
}

export function AdminCategorySortable({
  categories,
  busy,
  onReorder,
  onRequestActive,
  onRequestInactive,
}: {
  categories: AdminCategoryItem[];
  busy: boolean;
  onReorder: (next: AdminCategoryItem[]) => void | Promise<void>;
  onRequestActive: (category: AdminCategoryItem) => void;
  onRequestInactive: (category: AdminCategoryItem) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((item) => item.id === active.id);
    const newIndex = categories.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(categories, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index,
    }));
    await onReorder(moved);
  };

  return (
    <div className="flex max-w-[640px] flex-col gap-2">
      <p className="mb-1 text-sm text-muted-foreground">
        برای تعیین اولویت نمایش در سایت، دسته‌ها را با گرفتن آیکون جابه‌جا کنید.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={categories.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {categories.map((category) => (
            <SortableCategoryRow
              key={category.id}
              category={category}
              busy={busy}
              onRequestActive={() => onRequestActive(category)}
              onRequestInactive={() => onRequestInactive(category)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
