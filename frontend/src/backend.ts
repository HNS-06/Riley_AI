export interface Conversation {
    id: string;
    topic: string;
    created_at: bigint;
    updated_at: bigint;
    startedAt: bigint; // Added for UI compatibility
    messages: Message[]; // Added for UI compatibility
}

export interface Message {
    id: string;
    conversation_id: string;
    sender: string;
    content: string;
    timestamp: bigint;
    isCodeSnippet: boolean;
}

export interface UserPreferences {
    theme: string;
    notificationsEnabled: boolean;
}

export interface CodeExecutionResult {
    id: string;
    code: string;
    output: string;
    success: boolean;
    timestamp: bigint;
}
