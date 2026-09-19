"use client";

import dynamic from "next/dynamic";

const PostEditorInner = dynamic(() => import("./post-editor-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[280px] items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
      در حال بارگذاری ویرایشگر...
    </div>
  ),
});

export function PostEditor({
  initialData,
  disabled,
  onChange,
}: {
  initialData: string;
  disabled?: boolean;
  onChange: (html: string) => void;
}) {
  return <PostEditorInner initialData={initialData} disabled={disabled} onChange={onChange} />;
}
