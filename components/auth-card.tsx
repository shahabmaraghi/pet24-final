import Link from "next/link";
import { PawLogo } from "@/components/paw-logo";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-[400px] rounded-[18px] border bg-card p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="mx-auto mb-3 flex w-fit" aria-label="Pet24">
            <PawLogo size={48} />
          </Link>
          <div className="text-lg font-extrabold text-primary">{title}</div>
          {subtitle ? <div className="mt-1.5 text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}
