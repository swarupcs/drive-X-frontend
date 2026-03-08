import { useState } from "react";
import { useAppSelector } from "@/store";
import { FileIcon } from "./FileIcon";
import { formatFileSize, formatDateFull, formatRelativeDate } from "@/utils/formatters";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivityLog } from "@/hooks/api/useActivityLog";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/api/useComments";
import {
  X,
  Calendar,
  HardDrive,
  Clock,
  User,
  Users,
  Star,
  Share2,
  Info,
  FileText,
  Activity,
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  Shield,
} from "lucide-react";
import type { FileItem } from "@/types";

interface FileDetailsPanelProps {
  file: FileItem | null;
  onClose: () => void;
}

export function FileDetailsPanel({ file, onClose }: FileDetailsPanelProps) {
  const { data: activities } = useActivityLog(50);
  const currentUser = useAppSelector((s) => s.auth.user);
  const { data: comments, isLoading: commentsLoading } = useComments(file?.id ?? null);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [commentText, setCommentText] = useState("");

  if (!file) return null;

  const fileActivities = activities?.filter(
    (a) => a.targetName === file.name
  ).slice(0, 10);

  return (
    <div
      className="w-80 border-l bg-card flex flex-col h-full flex-shrink-0"
      data-testid="file-details-panel"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">Details</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onClose}
          data-testid="button-close-details"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* File identity header */}
      <div className="flex flex-col items-center text-center px-4 py-4 border-b">
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-3">
          <FileIcon type={file.type} size="lg" />
        </div>
        <h3
          className="text-sm font-semibold break-all px-2"
          data-testid="text-detail-name"
        >
          {file.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="secondary" className="text-xs uppercase">
            {file.type}
          </Badge>
          {file.starred && (
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          )}
          {file.shared && (
            <Share2 className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 mx-4 mt-2 flex-shrink-0">
          <TabsTrigger value="details" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            Details
          </TabsTrigger>
          <TabsTrigger value="comments" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Properties
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm">{file.mimeType}</p>
                    </div>
                  </div>

                  {file.type !== "folder" && (
                    <div className="flex items-start gap-2.5">
                      <HardDrive className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Size</p>
                        <p className="text-sm">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="text-sm">{file.ownerName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm">{formatDateFull(file.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Modified</p>
                      <p className="text-sm">{formatDateFull(file.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last opened</p>
                      <p className="text-sm">{formatRelativeDate(file.accessedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {file.sharedWith.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Shared with ({file.sharedWith.length})
                  </h4>
                  <div className="space-y-2">
                    {file.sharedWith.map((u) => (
                      <div
                        key={u.userId}
                        className="flex items-center gap-2"
                        data-testid={`detail-shared-user-${u.userId}`}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {u.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {u.permission}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="resize-none text-xs min-h-[60px]"
                  data-testid="input-comment"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && commentText.trim()) {
                      e.preventDefault();
                      addComment.mutate({ fileId: file.id, text: commentText.trim() });
                      setCommentText("");
                    }
                  }}
                />
              </div>
              <Button
                size="sm"
                variant="default"
                className="w-full"
                disabled={!commentText.trim() || addComment.isPending}
                onClick={() => {
                  if (commentText.trim()) {
                    addComment.mutate({ fileId: file.id, text: commentText.trim() });
                    setCommentText("");
                  }
                }}
                data-testid="button-add-comment"
              >
                {addComment.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span className="ml-1.5">Post</span>
              </Button>

              {commentsLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {comments && comments.length > 0 && (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-2 group"
                      data-testid={`comment-${comment.id}`}
                    >
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {comment.userName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium" data-testid={`text-comment-author-${comment.id}`}>
                            {comment.userName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 break-words" data-testid={`text-comment-body-${comment.id}`}>
                          {comment.text}
                        </p>
                      </div>
                      {currentUser && currentUser.id === comment.userId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="invisible group-hover:visible flex-shrink-0 h-6 w-6"
                          onClick={() => deleteComment.mutate({ commentId: comment.id, fileId: file.id })}
                          data-testid={`button-delete-comment-${comment.id}`}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {comments && comments.length === 0 && !commentsLoading && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No comments yet. Be the first to comment.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {fileActivities && fileActivities.length > 0 ? (
                <div className="space-y-2">
                  {fileActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-2 text-xs"
                      data-testid={`detail-activity-${act.id}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p>
                          <span className="font-medium">{act.userName}</span>{" "}
                          <span className="text-muted-foreground">
                            {act.action.replace("_", " ")}
                          </span>
                        </p>
                        {act.details && (
                          <p className="text-muted-foreground">{act.details}</p>
                        )}
                        <p className="text-muted-foreground text-[10px]">
                          {formatRelativeDate(act.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No activity for this file yet.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
