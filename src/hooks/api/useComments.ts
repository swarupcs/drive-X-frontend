import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/comment.service";
import { toast } from "sonner";

export function useComments(fileId: string | null) {
  return useQuery({
    queryKey: ["comments", fileId],
    queryFn: () => commentService.getComments(fileId!),
    enabled: !!fileId,
    staleTime: 30_000,
  });
}

export function useAddComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, text }: { fileId: string; text: string }) =>
      commentService.addComment(fileId, text),
    onSuccess: (_, { fileId }) => {
      qc.invalidateQueries({ queryKey: ["comments", fileId] });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; fileId: string }) =>
      commentService.deleteComment(commentId),
    onSuccess: (_, { fileId }) => {
      qc.invalidateQueries({ queryKey: ["comments", fileId] });
      toast.success("Comment deleted");
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}
