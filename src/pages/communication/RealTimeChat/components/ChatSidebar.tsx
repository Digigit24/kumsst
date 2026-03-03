import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ConversationListResponse } from '@/types/communication.types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquarePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ChatSidebarProps {
    conversations: ConversationListResponse[];
    activeId: number | null;
    onSelect: (id: number) => void;
    onNewChat: () => void;
    isLoading?: boolean;
}

export const ChatSidebar = ({
    conversations,
    activeId,
    onSelect,
    onNewChat,
    isLoading
}: ChatSidebarProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        if (!searchQuery) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter(c => {
            const name = c.other_user.full_name || '';
            const username = c.other_user.username || '';
            return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
        });
    }, [conversations, searchQuery]);

    return (
        <div className="flex flex-col h-full border-r border-border/50">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 space-y-3.5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Messages</h2>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onNewChat}
                        className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    >
                        <MessageSquarePlus className="w-[18px] h-[18px]" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-9 h-9 text-sm bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring/20 rounded-lg transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
                {isLoading ? (
                    <div className="space-y-1 px-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 bg-muted animate-pulse rounded w-28" />
                                    <div className="h-3 bg-muted/60 animate-pulse rounded w-40" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 pt-16 text-center">
                        <div className="w-12 h-12 bg-muted/60 rounded-xl flex items-center justify-center mb-3">
                            <Search className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-foreground/70">
                            {searchQuery ? 'No results found' : 'No conversations yet'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {searchQuery ? 'Try a different search' : 'Start a new chat to begin'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {filtered.map((chat) => {
                            const otherUser = chat.other_user;
                            const displayName = otherUser.full_name || otherUser.username || 'Unknown';
                            const isActive = activeId === chat.conversation_id;
                            const lastMsg = chat.last_message;
                            const hasUnread = chat.unread_count > 0;

                            let timeLabel = '';
                            if (lastMsg?.created_at) {
                                const ts = new Date(lastMsg.created_at);
                                if (!isNaN(ts.getTime())) {
                                    timeLabel = formatDistanceToNow(ts, { addSuffix: false });
                                }
                            }

                            return (
                                <button
                                    key={chat.conversation_id}
                                    onClick={() => onSelect(chat.conversation_id)}
                                    className={cn(
                                        "flex items-center gap-3 w-full p-2.5 rounded-xl text-left transition-colors",
                                        isActive
                                            ? "bg-primary/8 text-foreground"
                                            : "hover:bg-muted/60 text-foreground/80"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className={cn(
                                            "w-10 h-10 border transition-colors",
                                            isActive ? "border-primary/20" : "border-transparent"
                                        )}>
                                            <AvatarImage src={otherUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} />
                                            <AvatarFallback className={cn(
                                                "text-xs font-semibold",
                                                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                            )}>
                                                {displayName.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {otherUser.is_online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <span className={cn(
                                                "text-sm truncate",
                                                hasUnread || isActive ? "font-semibold" : "font-medium"
                                            )}>
                                                {displayName}
                                            </span>
                                            {timeLabel && (
                                                <span className={cn(
                                                    "text-[10px] shrink-0 tabular-nums",
                                                    hasUnread ? "text-primary font-semibold" : "text-muted-foreground"
                                                )}>
                                                    {timeLabel}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-xs truncate",
                                                hasUnread ? "text-foreground/70 font-medium" : "text-muted-foreground"
                                            )}>
                                                {lastMsg?.message || 'No messages yet'}
                                            </p>
                                            {hasUnread && (
                                                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shrink-0">
                                                    {chat.unread_count > 99 ? '99+' : chat.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
