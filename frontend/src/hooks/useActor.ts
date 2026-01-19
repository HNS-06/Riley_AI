import { Conversation, Message, UserPreferences, CodeExecutionResult } from '../backend';

interface Actor {
    startConversation: (topic: string) => Promise<string>;
    sendMessage: (conversationId: string, sender: string, content: string, isCodeSnippet: boolean) => Promise<void>;
    getAllConversations: () => Promise<Conversation[]>;
    getConversationMessages: (conversationId: string) => Promise<Message[]>;
    saveUserPreferences: (theme: string, notificationsEnabled: boolean) => Promise<void>;
    getUserPreferences: () => Promise<UserPreferences>;
    saveCodeExecutionResult: (code: string, output: string, success: boolean) => Promise<void>;
    getCodeExecutionResults: () => Promise<CodeExecutionResult[]>;
    deleteConversation: (id: string) => Promise<void>;
    editMessage: (id: string, conversationId: string, newContent: string) => Promise<void>;
}

// Helper to handle BigInt serialization
const replacer = (key: string, value: any) => {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
};

const reviver = (key: string, value: any) => {
    if (typeof value === 'string' && /^\d+$/.test(value) && (key.endsWith('at') || key === 'timestamp')) {
        return BigInt(value);
    }
    return value;
};

// Mock Data
let conversations: Conversation[] = [];
let messages: Record<string, Message[]> = {};

// Load from localStorage
try {
    const storedConversations = localStorage.getItem('riley_conversations');
    if (storedConversations) {
        conversations = JSON.parse(storedConversations, reviver);
    } else {
        conversations = [
            {
                id: '1',
                topic: 'General',
                created_at: BigInt(Date.now()),
                updated_at: BigInt(Date.now()),
                startedAt: BigInt(Date.now() * 1000000),
                messages: []
            }
        ];
    }

    const storedMessages = localStorage.getItem('riley_messages');
    if (storedMessages) {
        messages = JSON.parse(storedMessages, reviver);
    } else {
        messages = {
            '1': [
                {
                    id: 'm1',
                    conversation_id: '1',
                    sender: 'Riley',
                    content: 'Hello! I am Riley. How can I help you code today?',
                    timestamp: BigInt(Date.now() * 1000000),
                    isCodeSnippet: false
                }
            ]
        };
    }
} catch (e) {
    console.error("Failed to load history", e);
}

const saveData = () => {
    localStorage.setItem('riley_conversations', JSON.stringify(conversations, replacer));
    localStorage.setItem('riley_messages', JSON.stringify(messages, replacer));
};

const mockActor: Actor = {
    startConversation: async (topic: string) => {
        const id = Date.now().toString();
        const newConv = {
            id,
            topic,
            created_at: BigInt(Date.now()),
            updated_at: BigInt(Date.now()),
            startedAt: BigInt(Date.now() * 1000000),
            messages: []
        };
        conversations = [...conversations, newConv];
        messages[id] = [];
        saveData();
        return id;
    },
    sendMessage: async (conversationId, sender, content, isCodeSnippet) => {
        if (!messages[conversationId]) messages[conversationId] = [];
        const newMsg = {
            id: Date.now().toString(),
            conversation_id: conversationId,
            sender,
            content,
            isCodeSnippet,
            timestamp: BigInt(Date.now() * 1000000)
        };
        messages[conversationId] = [...messages[conversationId], newMsg];

        // Update conversation messages reference if needed
        const convIndex = conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
            conversations[convIndex].messages = messages[conversationId];
        }

        saveData();
    },
    getAllConversations: async () => conversations,
    getConversationMessages: async (id) => messages[id] || [],
    saveUserPreferences: async () => { },
    getUserPreferences: async () => ({ theme: 'dark', notificationsEnabled: true }),
    saveCodeExecutionResult: async () => { },
    getCodeExecutionResults: async () => [],
    deleteConversation: async (id: string) => {
        conversations = conversations.filter(c => c.id !== id);
        delete messages[id];
        saveData();
    },
    editMessage: async (id: string, conversationId: string, newContent: string) => {
        if (messages[conversationId]) {
            messages[conversationId] = messages[conversationId].map(msg =>
                msg.id === id ? { ...msg, content: newContent } : msg
            );
            saveData();
        }
    }
};

export const useActor = () => {
    return { actor: mockActor, isFetching: false };
};
