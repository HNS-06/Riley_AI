import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Conversation, Message, UserPreferences, CodeExecutionResult } from '../backend';

export function useStartConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topic: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.startConversation(topic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      sender,
      content,
      isCodeSnippet,
    }: {
      conversationId: string;
      sender: string;
      content: string;
      isCodeSnippet: boolean;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.sendMessage(conversationId, sender, content, isCodeSnippet);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useGetAllConversations() {
  const { actor, isFetching } = useActor();

  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllConversations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversationMessages(conversationId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor || !conversationId) return [];
      return await actor.getConversationMessages(conversationId);
    },
    enabled: !!actor && !isFetching && !!conversationId,
  });
}

export function useSaveUserPreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ theme, notificationsEnabled }: { theme: string; notificationsEnabled: boolean }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.saveUserPreferences(theme, notificationsEnabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });
}

export function useGetUserPreferences() {
  const { actor, isFetching } = useActor();

  return useQuery<UserPreferences | null>({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getUserPreferences();
      } catch (error) {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCodeExecutionResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, output, success }: { code: string; output: string; success: boolean }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.saveCodeExecutionResult(code, output, success);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codeExecutionResults'] });
    },
  });
}

export function useGetCodeExecutionResults() {
  const { actor, isFetching } = useActor();

  return useQuery<CodeExecutionResult[]>({
    queryKey: ['codeExecutionResults'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getCodeExecutionResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteConversation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useEditMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, conversationId, newContent }: { id: string; conversationId: string; newContent: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.editMessage(id, conversationId, newContent);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
