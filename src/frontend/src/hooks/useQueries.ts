import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Watch, Order, ChatMessage, OrderStatus } from "../backend";
import { ExternalBlob } from "../backend";

// ── Watches ──────────────────────────────────────────────────────────────────

export function useGetWatches() {
  const { actor, isFetching } = useActor();
  return useQuery<Watch[]>({
    queryKey: ["watches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddWatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      image,
    }: {
      name: string;
      description: string;
      price: bigint;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addWatch(name, description, price, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watches"] });
    },
  });
}

export function useUpdateWatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      price,
      published,
    }: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      published: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateWatch(id, name, description, price, published);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watches"] });
    },
  });
}

export function useDeleteWatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteWatch(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watches"] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useGetOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerName,
      contactInfo,
      watchId,
      note,
    }: {
      customerName: string;
      contactInfo: string;
      watchId: bigint;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(customerName, contactInfo, watchId, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: bigint;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ── Chat Messages ─────────────────────────────────────────────────────────────

export function useGetAllMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      senderName,
      message,
      image,
    }: {
      senderName: string;
      message: string;
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(senderName, message, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useReplyToMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId,
      replyText,
    }: {
      messageId: bigint;
      replyText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.replyToMessage(messageId, replyText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
