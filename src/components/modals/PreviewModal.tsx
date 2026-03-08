import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileIcon } from "@/components/files/FileIcon";
import { formatFileSize, formatDateFull } from "@/utils/formatters";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  HardDrive,
  MapPin,
  Users,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  SkipBack,
  SkipForward,
  Settings,
} from "lucide-react";
import type { FileItem } from "@/types";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
  files?: FileItem[];
}

function ImagePreview({ file }: { file: FileItem }) {
  const gradients: Record<string, string> = {
    jpg: "from-rose-400 via-fuchsia-500 to-indigo-500",
    png: "from-emerald-400 via-cyan-500 to-blue-500",
    gif: "from-amber-400 via-orange-500 to-red-500",
    svg: "from-violet-400 via-purple-500 to-fuchsia-500",
  };
  const gradient = gradients[file.type] || gradients.jpg;
  const dims = file.type === "svg" ? "512 x 512" : "1920 x 1080";

  return (
    <div className={`relative w-full h-72 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <div className="absolute inset-0 bg-black/10 rounded-md" />
      <div className="relative text-center text-white">
        <FileIcon type={file.type} size="lg" className="mx-auto mb-2 !text-white" />
        <p className="text-sm font-medium opacity-90">{file.name}</p>
        <p className="text-xs opacity-70 mt-1">{dims}</p>
      </div>
    </div>
  );
}

function VideoPreview({ file }: { file: FileItem }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  return (
    <div className="relative w-full h-72 rounded-md bg-black flex flex-col" data-testid="preview-video">
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        <div className="relative text-center">
          <FileIcon type="mp4" size="lg" className="mx-auto mb-2 !text-gray-400" />
          <p className="text-sm text-gray-300">{file.name}</p>
        </div>
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center"
            data-testid="button-video-play-overlay"
          >
            <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover-elevate">
              <Play className="h-7 w-7 text-white ml-1" />
            </div>
          </button>
        )}
      </div>
      <div className="bg-gray-900 px-3 py-2 rounded-b-md space-y-1.5">
        <div className="w-full h-1 bg-gray-700 rounded-full cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100));
        }}>
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:text-white" data-testid="button-video-skip-back">
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white hover:text-white"
              onClick={() => setPlaying(!playing)}
              data-testid="button-video-play"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:text-white" data-testid="button-video-skip-forward">
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-gray-400 ml-1">1:24 / 3:45</span>
          </div>
          <div className="flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-gray-400" />
            <Settings className="h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AudioPreview({ file }: { file: FileItem }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const bars = Array.from({ length: 48 }, (_, i) => {
    const h = Math.sin(i * 0.4) * 30 + Math.random() * 25 + 15;
    return Math.round(h);
  });

  return (
    <div className="w-full rounded-md bg-gradient-to-br from-violet-950 to-indigo-950 p-5" data-testid="preview-audio">
      <div className="text-center mb-4">
        <FileIcon type="mp3" size="lg" className="mx-auto mb-2 !text-violet-300" />
        <p className="text-sm text-violet-200 font-medium">{file.name}</p>
        <p className="text-xs text-violet-400 mt-0.5">{formatFileSize(file.size)}</p>
      </div>
      <div className="flex items-end justify-center gap-[2px] h-16 mb-4">
        {bars.map((h, i) => {
          const filled = i / bars.length * 100 < progress;
          return (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-colors ${filled ? "bg-violet-400" : "bg-violet-800"}`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
      <div className="w-full h-1 bg-violet-800 rounded-full mb-3 cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100));
      }}>
        <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-violet-400">0:58</span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-violet-300 hover:text-violet-200" data-testid="button-audio-skip-back">
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-violet-200 hover:text-white"
            onClick={() => setPlaying(!playing)}
            data-testid="button-audio-play"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-violet-300 hover:text-violet-200" data-testid="button-audio-skip-forward">
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
        <span className="text-xs text-violet-400">3:42</span>
      </div>
    </div>
  );
}

function DocumentPreview({ file }: { file: FileItem }) {
  const docContents: Record<string, string[]> = {
    pdf: [
      "Section 1: Introduction",
      "",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "",
      "Section 2: Background",
      "",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ],
    docx: [
      "Document Title",
      "",
      "Author: John Smith",
      "Date: January 15, 2024",
      "",
      "This document provides an overview of the project requirements and milestones. Key deliverables include:",
      "",
      "  1. Initial prototype completion",
      "  2. User testing phase",
      "  3. Final review and deployment",
    ],
    txt: [
      "Meeting Notes - Q4 Planning",
      "============================",
      "",
      "Attendees: Alice, Bob, Charlie",
      "",
      "Action items:",
      "- Review budget allocation",
      "- Finalize timeline for launch",
      "- Schedule follow-up meeting",
    ],
    csv: [
      "Name,Email,Role,Department",
      "Alice Johnson,alice@example.com,Manager,Engineering",
      "Bob Smith,bob@example.com,Developer,Engineering",
      "Charlie Brown,charlie@example.com,Designer,Design",
      "Diana Prince,diana@example.com,PM,Product",
      "Eve Adams,eve@example.com,Analyst,Data",
    ],
    json: [
      '{',
      '  "name": "DriveX",',
      '  "version": "1.0.0",',
      '  "description": "Cloud storage application",',
      '  "features": [',
      '    "file-management",',
      '    "sharing",',
      '    "collaboration"',
      '  ],',
      '  "active": true',
      '}',
    ],
    html: [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <title>My Page</title>',
      '</head>',
      '<body>',
      '  <h1>Hello World</h1>',
      '  <p>Welcome to our website.</p>',
      '</body>',
      '</html>',
    ],
  };

  const lines = docContents[file.type] || docContents.txt;
  const isCode = ["json", "html", "csv"].includes(file.type);

  return (
    <div className="w-full rounded-md border bg-card overflow-hidden" data-testid="preview-document">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
        <FileIcon type={file.type} size="sm" />
        <span className="text-xs text-muted-foreground font-medium truncate">{file.name}</span>
      </div>
      <div className={`p-4 max-h-64 overflow-y-auto ${isCode ? "font-mono text-xs" : "text-sm"}`}>
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-muted-foreground/40 select-none w-5 text-right flex-shrink-0 text-xs leading-6">{i + 1}</span>
            <span className={`leading-6 ${line === "" ? "h-6" : ""} ${isCode ? "text-muted-foreground" : ""}`}>
              {line || "\u00A0"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreviewModal({ open, onClose, file, files = [] }: PreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(file);

  const navigableFiles = files.filter((f) => f.type !== "folder");

  const currentIndex = currentFile ? navigableFiles.findIndex((f) => f.id === currentFile.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < navigableFiles.length - 1;

  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  useEffect(() => {
    if (!open) {
      setIsFullscreen(false);
    }
  }, [open]);

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      setCurrentFile(navigableFiles[currentIndex - 1]);
    }
  }, [hasPrev, navigableFiles, currentIndex]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentFile(navigableFiles[currentIndex + 1]);
    }
  }, [hasNext, navigableFiles, currentIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToPrev, goToNext]);

  if (!currentFile) return null;

  const isImage = ["jpg", "png", "gif", "svg"].includes(currentFile.type);
  const isVideo = currentFile.type === "mp4";
  const isAudio = currentFile.type === "mp3";
  const isDocument = ["pdf", "docx", "txt", "csv", "json", "html"].includes(currentFile.type);

  const renderPreview = () => {
    if (isImage) return <ImagePreview file={currentFile} />;
    if (isVideo) return <VideoPreview file={currentFile} />;
    if (isAudio) return <AudioPreview file={currentFile} />;
    if (isDocument) return <DocumentPreview file={currentFile} />;
    return (
      <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
        <div className="text-center">
          <FileIcon type={currentFile.type} size="lg" />
          <p className="text-sm text-muted-foreground mt-2">No preview available for .{currentFile.type} files</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`overflow-y-auto ${isFullscreen ? "sm:max-w-[95vw] max-h-[95vh]" : "sm:max-w-2xl max-h-[85vh]"}`}
        data-testid="preview-modal"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon type={currentFile.type} size="sm" />
            <h2 className="text-base font-semibold truncate" data-testid="text-preview-title">{currentFile.name}</h2>
          </div>
          <div className="flex items-center gap-1">
            {navigableFiles.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!hasPrev}
                  onClick={goToPrev}
                  data-testid="button-preview-prev"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums" data-testid="text-preview-index">
                  {currentIndex + 1} / {navigableFiles.length}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!hasNext}
                  onClick={goToNext}
                  data-testid="button-preview-next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              data-testid="button-preview-fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-preview-download">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-preview-close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {renderPreview()}

          <Separator />

          <div className="grid gap-3">
            <h4 className="text-sm font-medium">File details</h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Size</p>
                  <p>{formatFileSize(currentFile.size)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="uppercase">{currentFile.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p>{formatDateFull(currentFile.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Modified</p>
                  <p>{formatDateFull(currentFile.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {currentFile.ownerName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-muted-foreground text-xs">Owner</p>
                <p>{currentFile.ownerName}</p>
              </div>
            </div>

            {currentFile.sharedWith.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Shared with {currentFile.sharedWith.length} people</p>
                </div>
                <div className="flex -space-x-1">
                  {currentFile.sharedWith.map((u) => (
                    <Avatar key={u.userId} className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {u.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
