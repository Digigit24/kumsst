import appLogo from '@/assets/app_logo-removebg-preview.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth.types';
import type { Chat, ConversationUser } from '@/types/communication.types';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ArrowLeft, Info, Paperclip, Phone, Send, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
    otherUser: ConversationUser | null;
    messages: Chat[];
    currentUser: User | null;
    onSendMessage: (text: string) => void;
    isLoading?: boolean;
    onBack?: () => void;
}

/** Compute a readable label for a date separator */
function getDateLabel(date: Date): string {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
}

/** Group messages and inject date separators + consecutive-sender grouping */
function groupMessagesWithDates(messages: Chat[]) {
    const items: Array<{ type: 'date'; label: string } | { type: 'message'; msg: Chat; showAvatar: boolean }> = [];
    let lastDate: Date | null = null;
    let lastSender: string | null = null;

    for (const msg of messages) {
        const msgDate = msg.created_at ? new Date(msg.created_at) : null;

        // Insert date separator if day changed
        if (msgDate && !isNaN(msgDate.getTime())) {
            if (!lastDate || !isSameDay(lastDate, msgDate)) {
                items.push({ type: 'date', label: getDateLabel(msgDate) });
                lastSender = null; // reset grouping across date boundaries
            }
            lastDate = msgDate;
        }

        // Group consecutive messages from same sender (hide avatar for sequential)
        const sender = String(msg.sender || '');
        const showAvatar = sender !== lastSender;
        lastSender = sender;

        items.push({ type: 'message', msg, showAvatar });
    }

    return items;
}

export const ChatWindow = ({
    otherUser,
    messages,
    currentUser,
    onSendMessage,
    isLoading,
    onBack,
}: ChatWindowProps) => {
    const [inputValue, setInputValue] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = inputValue.trim();
        if (!text) return;
        onSendMessage(text);
        setInputValue('');
    };

    const groupedItems = useMemo(() => groupMessagesWithDates(messages), [messages]);

    // Empty state - no conversation selected
    if (!otherUser) {
        return (
            <div className="relative w-full h-full flex items-center justify-center bg-muted/5 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.025] pointer-events-none select-none grayscale"
                    style={{
                        backgroundImage: `url(${appLogo})`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '18%',
                    }}
                />
                <div className="z-10 text-center px-8 py-10 max-w-sm">
                    <div className="w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Send className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Your messages</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Select a conversation to start chatting, or create a new message.
                    </p>
                </div>
            </div>
        );
    }

    const partnerName = otherUser.full_name || otherUser.username || 'Unknown';
    const isOnline = otherUser.is_online;
    const validUserId = (currentUser as any)?.id ? String((currentUser as any).id) : null;

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Subtle watermark */}
            <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none select-none grayscale"
                style={{
                    backgroundImage: `url(${appLogo})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '35%',
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-3 md:px-5 py-2.5 border-b border-border/50 z-20 bg-background/90 backdrop-blur-sm">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    {/* Back button — mobile only */}
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="md:hidden h-9 w-9 shrink-0 -ml-1 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <div className="relative shrink-0">
                        <Avatar className="w-9 h-9 border border-border/50">
                            <AvatarImage src={otherUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`} />
                            <AvatarFallback className="bg-primary/8 text-primary text-xs font-semibold">{partnerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-[1.5px] border-background rounded-full" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate">{partnerName}</h3>
                        <span className="text-[11px] text-muted-foreground">
                            {isOnline ? 'Active now' : 'Offline'}
                        </span>
                    </div>
                </div>

                <TooltipProvider delayDuration={300}>
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                                    <Phone className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">Audio call</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                                    <Video className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">Video call</TooltipContent>
                        </Tooltip>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                                    <Info className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">Details</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            {/* Messages Area - native scroll for best performance */}
            <div className="flex-1 overflow-y-auto overscroll-contain z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-muted-foreground">Loading messages...</p>
                    </div>
                ) : (
                    <div className="flex flex-col justify-end min-h-full py-4 px-4 md:px-6 max-w-4xl mx-auto">
                        {groupedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <p className="text-sm text-muted-foreground">No messages yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Send a message to start the conversation</p>
                            </div>
                        ) : (
                            groupedItems.map((item, i) => {
                                if (item.type === 'date') {
                                    return (
                                        <div key={`date-${i}`} className="flex justify-center my-4 first:mt-0">
                                            <span className="text-[10px] font-medium text-muted-foreground/60 bg-muted/40 px-3 py-1 rounded-full select-none">
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                }

                                const { msg, showAvatar } = item;
                                const sender = String(msg.sender || '');
                                const isMe = sender === validUserId;

                                return (
                                    <MessageBubble
                                        key={msg.id || i}
                                        message={msg}
                                        isMe={isMe}
                                        showAvatar={showAvatar}
                                    />
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 bg-background border-t border-border/50 z-20">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 max-w-4xl mx-auto bg-muted/40 rounded-2xl border border-border/50 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/5 transition-all pl-1 pr-1.5 py-1"
                >
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground rounded-xl"
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>

                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 min-h-[40px] bg-transparent border-none focus-visible:ring-0 shadow-none text-sm placeholder:text-muted-foreground/60"
                    />

                    <Button
                        type="submit"
                        size="icon"
                        disabled={!inputValue.trim()}
                        className={cn(
                            "h-9 w-9 shrink-0 rounded-xl transition-all",
                            inputValue.trim()
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                : "bg-transparent text-muted-foreground/40 cursor-default"
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
