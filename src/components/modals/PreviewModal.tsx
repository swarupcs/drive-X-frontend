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
} from "lucide-react";
import { toast } from "sonner";
import { fileService } from "@/services/file.service";
import type { FileItem } from "@/types";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: FileItem | null;
  files?: FileItem[];
}

function ImagePreview({ file, signedUrl }: { file: FileItem; signedUrl: string | null }) {
  if (signedUrl) {
    return (
      <div className="w-full rounded-md overflow-hidden bg-muted flex items-center justify-center max-h-72">
        <img
          src={signedUrl}
          alt={file.name}
          className="max-w-full max-h-72 object-contain"
          data-testid="preview-image"
        />
      </div>
    );
  }
  const gradients: Record<string, string> = {
    jpg: "from-rose-400 via-fuchsia-500 to-indigo-500",
    png: "from-emerald-400 via-cyan-500 to-blue-500",
    gif: "from-amber-400 via-orange-500 to-red-500",
    svg: "from-violet-400 via-purple-500 to-fuchsia-500",
  };
  const gradient = gradients[file.type] || gradients.jpg;
  return (
    <div className={`relative w-full h-72 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <div className="relative text-center text-white">
        <FileIcon type={file.type} size="lg" className="mx-auto mb-2 !text-white" />
        <p className="text-sm font-medium opacity-90">{file.name}</p>
      </div>
    </div>
  );
}

function VideoPreview({ file, signedUrl }: { file: FileItem; signedUrl: string | null }) {
  if (signedUrl) {
    return (
      <div className="w-full rounded-md overflow-hidden bg-black" data-testid="preview-video">
        <video
          src={signedUrl}
          controls
          className="w-full max-h-72"
          data-testid="video-element"
        />
      </div>
    );
  }
  return (
    <div className="w-full h-72 rounded-md bg-black flex items-center justify-center" data-testid="preview-video">
      <div className="text-center">
        <FileIcon type="mp4" size="lg" className="mx-auto mb-2 !text-gray-400" />
        <p className="text-sm text-gray-300">{file.name}</p>
      </div>
    </div>
  );
}

function AudioPreview({ file, signedUrl }: { file: FileItem; signedUrl: string | null }) {
  return (
    <div className="w-full rounded-md bg-gradient-to-br from-violet-950 to-indigo-950 p-5" data-testid="preview-audio">
      <div className="text-center mb-4">
        <FileIcon type="mp3" size="lg" className="mx-auto mb-2 !text-violet-300" />
        <p className="text-sm text-violet-200 font-medium">{file.name}</p>
        <p className="text-xs text-violet-400 mt-0.5">{formatFileSize(file.size)}</p>
      </div>
      {signedUrl ? (
        <audio
          src={signedUrl}
          controls
          className="w-full"
          data-testid="audio-element"
        />
      ) : (
        <p className="text-center text-xs text-violet-400">Loading audio...</p>
      )}
    </div>
  );
}

function DocumentPreview({ file, signedUrl, docContent }: { file: FileItem; signedUrl: string | null; docContent: string | null }) {
  const isCode = ["json", "html", "csv"].includes(file.type);
  const lines = docContent ? docContent.split("\n") : null;

  return (
    <div className="w-full rounded-md border bg-card overflow-hidden" data-testid="preview-document">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
        <FileIcon type={file.type} size="sm" />
        <span className="text-xs text-muted-foreground font-medium truncate">{file.name}</span>
      </div>
      <div className={`p-4 max-h-64 overflow-y-auto ${isCode ? "font-mono text-xs" : "text-sm"}`}>
        {lines ? (
          lines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-muted-foreground/40 select-none w-5 text-right flex-shrink-0 text-xs leading-6">{i + 1}</span>
              <span className={`leading-6 ${line === "" ? "h-6" : ""} ${isCode ? "text-muted-foreground" : ""}`}>
                {line || "\u00A0"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            {signedUrl ? "Loading content..." : "Preview not available for this file type."}
          </p>
        )}
      </div>
    </div>
  );
}

export function PreviewModal({ open, onClose, file, files = [] }: PreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(file);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [docContent, setDocContent] = useState<string | null>(null);

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
      setSignedUrl(null);
      setDocContent(null);
    }
  }, [open]);

  // Fetch signed URL when current file changes (also updates accessedAt via GET /files/:id)
  useEffect(() => {
    if (!currentFile || currentFile.type === "folder") {
      setSignedUrl(null);
      setDocContent(null);
      return;
    }
    setSignedUrl(null);
    setDocContent(null);

    // Update accessedAt by fetching file metadata
    fileService.getFileById(currentFile.id).catch(() => {});

    const textTypes = ["txt", "csv", "json", "html"];
    fileService.getDownloadUrl(currentFile.id).then((url) => {
      setSignedUrl(url);
      if (textTypes.includes(currentFile.type)) {
        fetch(url)
          .then((r) => r.text())
          .then((text) => setDocContent(text))
          .catch(() => {});
      }
    }).catch(() => {});
  }, [currentFile?.id]);

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

  const handleDownload = async () => {
    try {
      const url = signedUrl || await fileService.getDownloadUrl(currentFile.id);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFile.name;
      a.click();
      toast.success("Download started", { description: `Downloading "${currentFile.name}"...` });
    } catch {
      toast.error("Download failed", { description: `Could not download "${currentFile.name}".` });
    }
  };

  const renderPreview = () => {
    if (isImage) return <ImagePreview file={currentFile} signedUrl={signedUrl} />;
    if (isVideo) return <VideoPreview file={currentFile} signedUrl={signedUrl} />;
    if (isAudio) return <AudioPreview file={currentFile} signedUrl={signedUrl} />;
    if (isDocument) return <DocumentPreview file={currentFile} signedUrl={signedUrl} docContent={docContent} />;
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
            <Button size="icon" variant="ghost" onClick={handleDownload} data-testid="button-preview-download">
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
