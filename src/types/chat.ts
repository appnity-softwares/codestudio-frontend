// Chat system types following production-grade best practices

export interface ChatMessage {
    // Server ID (assigned after server ACK)
    id?: string;
    ID?: string; // Go GORM format

    // Client ID (always present, used for deduplication and optimistic UI)
    clientMessageId: string;

    // Conversation context
    conversationId?: string;
    ConversationID?: string;

    // Participants
    senderId: string;
    SenderID?: string;
    recipientId: string;
    RecipientID?: string;

    // Content
    content: string;
    Content?: string;
    type: 'text' | 'code' | 'image' | 'system';

    // Delivery status (client-owned, updated via ACKs)
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

    // Read tracking
    isRead?: boolean;
    IsRead?: boolean;
    readAt?: string;

    // Timestamps
    createdAt: string;
    CreatedAt?: string;
    editedAt?: string;
    deletedAt?: string;

    // Retry tracking (client-side only)
    retryCount?: number;

    // Threading
    replyToId?: string;
    replyTo?: ChatMessage;

    // Metadata (JSON string for code language, reactions, etc.)
    metadata?: string;

    // Relations (populated by server)
    sender?: any;
    Sender?: any;
    recipient?: any;
    Recipient?: any;
}

// Helper to normalize message from server (Go uses PascalCase, we use camelCase)
export function normalizeMessage(msg: any): ChatMessage {
    return {
        id: msg.id || msg.ID,
        clientMessageId: msg.clientMessageId || msg.id || msg.ID,
        conversationId: msg.conversationId || msg.ConversationID,
        senderId: msg.senderId || msg.SenderID,
        recipientId: msg.recipientId || msg.RecipientID,
        content: msg.content || msg.Content,
        type: msg.type || 'text',
        status: msg.status || 'sent',
        isRead: msg.isRead || msg.IsRead || false,
        readAt: msg.readAt || msg.ReadAt,
        createdAt: msg.createdAt || msg.CreatedAt,
        editedAt: msg.editedAt || msg.EditedAt,
        deletedAt: msg.deletedAt || msg.DeletedAt,
        retryCount: msg.retryCount || 0,
        replyToId: msg.replyToId || msg.ReplyToID,
        metadata: msg.metadata || msg.Metadata,
        sender: msg.sender || msg.Sender,
        recipient: msg.recipient || msg.Recipient,
    };
}

// Helper to get the display ID (prefer clientMessageId for UI stability)
export function getMessageKey(msg: ChatMessage): string {
    return msg.clientMessageId || msg.id || msg.ID || `temp-${Date.now()}`;
}

// Max retry attempts before giving up
export const MAX_RETRY_COUNT = 3;

// ============================================
// PHASE 7: REACTIONS
// ============================================

export interface MessageReaction {
    id: string;
    messageId: string;
    userId: string;
    emoji: string;
    createdAt: string;
    user?: any;
}

// Allowed reaction emojis (must match backend)
export const ALLOWED_REACTION_EMOJIS = [
    '👍', '👎', '❤️', '😂', '😮', '😢', '🔥', '🎉', '🚀', '👀'
] as const;

export type ReactionEmoji = typeof ALLOWED_REACTION_EMOJIS[number];

