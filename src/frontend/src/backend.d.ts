import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ChatMessage {
    id: bigint;
    message: string;
    timestamp: bigint;
    senderName: string;
    replies: Array<ChatMessage>;
    image?: ExternalBlob;
}
export interface Watch {
    id: bigint;
    published: boolean;
    name: string;
    description: string;
    image: ExternalBlob;
    price: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    contactInfo: string;
    watchId: bigint;
    note: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addWatch(name: string, description: string, price: bigint, image: ExternalBlob): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteWatch(id: bigint): Promise<void>;
    getAllMessages(): Promise<Array<ChatMessage>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWatchById(id: bigint): Promise<Watch>;
    getWatches(): Promise<Array<Watch>>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, contactInfo: string, watchId: bigint, note: string): Promise<bigint>;
    replyToMessage(messageId: bigint, replyText: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(senderName: string, message: string, image: ExternalBlob | null): Promise<bigint>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateWatch(id: bigint, name: string, description: string, price: bigint, published: boolean): Promise<void>;
}
