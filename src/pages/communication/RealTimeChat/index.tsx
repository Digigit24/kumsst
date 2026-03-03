import { chatAPI } from '@/api/chatService';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useCreateChat, useConversation, useConversations } from '@/hooks/useCommunication';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { NewChatDialog } from './components/NewChatDialog';

export const RealTimeChat = () => {
    const { user } = useAuth();
    const { data: conversationsData, refetch: refetchConversations } = useConversations();
    const createMutation = useCreateChat();
    const [activeChatId, setActiveChatId] = useState<number | null>(null);

    // New Chat State
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [draftReceiver, setDraftReceiver] = useState<any | null>(null);

    // Optimistic UI State
    const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

    // Clear optimistic messages when changing chats
    useEffect(() => {
        setOptimisticMessages([]);
    }, [activeChatId]);

    // Mark messages as read when a chat is opened, then refresh sidebar unread counts
    useEffect(() => {
        if (!activeChatId || activeChatId < 0) return;
        chatAPI.markConversationAsRead(activeChatId)
            .then(() => refetchConversations())
            .catch(() => {}); // silent — badge is best-effort
    }, [activeChatId]);

    // WebSocket Integration via Context
    const { isConnected, messages: contextMessages } = useChat();
    const lastContextMsg = contextMessages[contextMessages.length - 1];

    // Prepare conversations list (sort by last message)
    const conversations = useMemo(() => {
        if (!conversationsData) return [];
        return [...conversationsData].sort((a, b) => {
            const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
        });
    }, [conversationsData]);

    // Determine Active Chat Object
    let activeChatObj = conversations.find((c) => c.conversation_id === activeChatId);

    if (!activeChatObj && draftReceiver) {
        activeChatObj = {
            conversation_id: -1,
            other_user: {
                id: draftReceiver.id,
                username: draftReceiver.username,
                full_name: draftReceiver.full_name || draftReceiver.username,
                avatar: draftReceiver.avatar,
                is_online: draftReceiver.is_online || false
            },
            last_message: null as any,
            unread_count: 0
        };
    }

    const otherUserId = activeChatObj ? activeChatObj.other_user.id : null;

    const {
        data: conversationData,
        isLoading: isConversationLoading,
        refetch: refetchConversation
    } = useConversation(otherUserId, 50);

    // Sort messages (Oldest -> Newest) and merge with optimistic
    const activeMessages = useMemo(() => {
        const apiMessages = conversationData?.messages ? [...conversationData.messages].reverse() : [];
        return [...apiMessages, ...optimisticMessages];
    }, [conversationData, optimisticMessages]);

    const headerUser = useMemo(() => {
        if (conversationData?.other_user) return conversationData.other_user;
        return activeChatObj?.other_user || null;
    }, [conversationData, activeChatObj]);

    // Real-time updates listener
    useEffect(() => {
        if (lastContextMsg) {
            refetchConversations();
            if (activeChatId && activeChatId > 0) {
                refetchConversation();
                // Auto-mark as read if the chat is currently open
                chatAPI.markConversationAsRead(activeChatId)
                    .then(() => refetchConversations())
                    .catch(() => {});
            }
        }
    }, [lastContextMsg, refetchConversations, refetchConversation, activeChatId]);

    const handleSendMessage = async (text: string) => {
        if (!activeChatObj) return;

        const tempId = `temp-${Date.now()}`;
        const tempMsg: any = {
            id: Date.now(),
            tempId,
            message: text,
            sender: (user as any)?.id,
            receiver: activeChatObj.other_user.id,
            created_at: new Date().toISOString(),
            is_read: false,
            status: 'sending',
            read_at: null,
            sender_name: (user as any)?.full_name || 'Me',
            sender_username: user?.username,
            sender_avatar: (user as any)?.avatar
        };

        setOptimisticMessages(prev => [...prev, tempMsg]);

        try {
            const response = await createMutation.mutateAsync({
                message: text,
                receiver_id: activeChatObj.other_user.id
            } as any);

            await refetchConversation();
            setOptimisticMessages(prev => prev.filter(m => m.tempId !== tempId));

            if (activeChatId === -1) {
                const data = (response as any).data || response;
                if (data?.conversation) {
                    setActiveChatId(data.conversation);
                }
            }
            setDraftReceiver(null);
        } catch (error) {
            toast.error('Failed to send message');
            setOptimisticMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, status: 'error' } : m));
        }
    };

    const handleNewChat = () => setIsNewChatOpen(true);

    const handleUserSelect = (selectedUser: any) => {
        const existing = conversations.find(c => c.other_user.id === selectedUser.id);
        if (existing) {
            setActiveChatId(existing.conversation_id);
            setDraftReceiver(null);
        } else {
            setDraftReceiver(selectedUser);
            setActiveChatId(-1);
        }
    };

    // On mobile: show sidebar OR chat (not both). On desktop: always show both.
    const hasChatOpen = activeChatId !== null;

    const handleBack = () => {
        setActiveChatId(null);
        setDraftReceiver(null);
    };

    return (
        <>
            <div className="flex h-full overflow-hidden bg-background md:rounded-2xl md:border md:border-border/50 md:shadow-sm">
                {/* Sidebar — full screen on mobile when no chat open, fixed width on desktop */}
                <div className={`
                    w-full md:w-[340px] md:shrink-0 md:block
                    ${hasChatOpen ? 'hidden' : 'block'}
                `}>
                    <ChatSidebar
                        conversations={conversations}
                        activeId={activeChatId}
                        onSelect={(id) => { setActiveChatId(id); setDraftReceiver(null); }}
                        onNewChat={handleNewChat}
                        isLoading={!conversationsData}
                    />
                </div>

                {/* Chat window — full screen on mobile when chat open, flex-1 on desktop */}
                <div className={`
                    w-full md:flex-1 md:min-w-0 md:block
                    ${hasChatOpen ? 'block' : 'hidden'}
                `}>
                    <ChatWindow
                        otherUser={headerUser as any}
                        messages={activeMessages}
                        currentUser={user as any}
                        onSendMessage={handleSendMessage}
                        isLoading={isConversationLoading}
                        onBack={handleBack}
                    />
                </div>
            </div>

            <NewChatDialog
                open={isNewChatOpen}
                onOpenChange={setIsNewChatOpen}
                onUserSelect={handleUserSelect}
            />
        </>
    );
};

export default RealTimeChat;
