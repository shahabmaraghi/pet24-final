import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  className,
  iconClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} className={cn("object-cover", className)} />;
  }
  return (
    <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
      <ImageIcon className={cn("h-5 w-5", iconClassName)} />
    </div>
  );
}
