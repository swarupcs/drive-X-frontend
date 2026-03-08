import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Folder,
  FileCode,
  Sheet,
  Presentation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileType } from "@/types";

export function getFileBgGradient(type: FileType | string): string {
  const map: Record<string, string> = {
    folder: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20",
    pdf: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20",
    docx: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20",
    xlsx: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20",
    csv: "from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/20",
    pptx: "from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20",
    jpg: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20",
    png: "from-pink-50 to-fuchsia-50 dark:from-pink-950/30 dark:to-fuchsia-950/20",
    gif: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20",
    svg: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20",
    mp4: "from-gray-700 to-gray-900",
    mp3: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20",
    zip: "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20",
    txt: "from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/20",
    json: "from-slate-50 to-zinc-50 dark:from-slate-950/30 dark:to-zinc-950/20",
    html: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20",
  };
  return map[type] ?? "from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/20";
}

const iconMap: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  xlsx: Sheet,
  csv: Sheet,
  pptx: Presentation,
  jpg: Image,
  png: Image,
  gif: Image,
  svg: Image,
  mp4: Video,
  mp3: Music,
  zip: Archive,
  json: FileCode,
  html: FileCode,
  folder: Folder,
};

const colorMap: Record<string, string> = {
  folder: "text-amber-500",
  pdf: "text-red-500",
  docx: "text-blue-500",
  xlsx: "text-green-500",
  csv: "text-emerald-500",
  pptx: "text-orange-500",
  jpg: "text-pink-500",
  png: "text-pink-500",
  gif: "text-purple-500",
  svg: "text-violet-500",
  mp4: "text-white",
  mp3: "text-violet-500",
  zip: "text-amber-500",
  txt: "text-slate-500",
  json: "text-slate-500",
  html: "text-orange-500",
};

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
};

interface FileIconProps {
  type: FileType | string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function FileIcon({ type, size = "md", className }: FileIconProps) {
  const Icon = iconMap[type] ?? File;
  return (
    <Icon
      className={cn(sizeMap[size], colorMap[type] ?? "text-muted-foreground", className)}
    />
  );
}
