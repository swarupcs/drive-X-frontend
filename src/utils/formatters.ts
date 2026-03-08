import { format, formatDistanceToNow } from "date-fns";
import type { FileType, FilterType } from "@/types";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
}

export function formatDateFull(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeDate(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function getFileIcon(type: FileType): string {
  const icons: Record<FileType, string> = {
    pdf: "FileText",
    docx: "FileText",
    xlsx: "Sheet",
    pptx: "Presentation",
    jpg: "Image",
    png: "Image",
    gif: "Image",
    svg: "Image",
    mp4: "Video",
    mp3: "Music",
    zip: "Archive",
    txt: "FileText",
    csv: "Sheet",
    json: "FileCode",
    html: "FileCode",
    folder: "Folder",
  };
  return icons[type] || "File";
}

export function getFileColor(type: FileType): string {
  const colors: Record<string, string> = {
    pdf: "#ea4335",
    docx: "#4285f4",
    xlsx: "#34a853",
    pptx: "#fbbc04",
    jpg: "#ea4335",
    png: "#ea4335",
    gif: "#ea4335",
    svg: "#ff6d01",
    mp4: "#ea4335",
    mp3: "#8e24aa",
    zip: "#616161",
    txt: "#5f6368",
    csv: "#34a853",
    json: "#ff6d01",
    html: "#e37400",
    folder: "#5f6368",
  };
  return colors[type] || "#5f6368";
}

export function getMimeType(type: FileType): string {
  const mimes: Record<FileType, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    zip: "application/zip",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    html: "text/html",
    folder: "application/x-directory",
  };
  return mimes[type] || "application/octet-stream";
}

export function getFileTypeFromName(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mapping: Record<string, FileType> = {
    pdf: "pdf",
    doc: "docx",
    docx: "docx",
    xls: "xlsx",
    xlsx: "xlsx",
    ppt: "pptx",
    pptx: "pptx",
    jpg: "jpg",
    jpeg: "jpg",
    png: "png",
    gif: "gif",
    svg: "svg",
    mp4: "mp4",
    mov: "mp4",
    mp3: "mp3",
    wav: "mp3",
    zip: "zip",
    rar: "zip",
    "7z": "zip",
    txt: "txt",
    csv: "csv",
    json: "json",
    html: "html",
    htm: "html",
  };
  return mapping[ext || ""] || "txt";
}

export function getDaysUntilDeletion(trashedAt: string): number {
  const purgeDate = new Date(trashedAt).getTime() + 30 * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((purgeDate - Date.now()) / (24 * 60 * 60 * 1000)));
}

export function matchesFilter(type: FileType, filter: FilterType): boolean {
  if (filter === "all") return true;
  const groups: Record<FilterType, FileType[]> = {
    all: [],
    documents: ["pdf", "docx", "xlsx", "pptx", "txt", "csv"],
    images: ["jpg", "png", "gif", "svg"],
    videos: ["mp4"],
    audio: ["mp3"],
    archives: ["zip"],
    other: ["json", "html"],
  };
  return groups[filter]?.includes(type) ?? false;
}
