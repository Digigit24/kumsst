import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/communication.types';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, RefreshCcw } from 'lucide-react';

interface MessageBubbleProps {
    message: Chat;
    isMe: boolean;
    /** Whether to show avatar (false for consecutive messages from same sender) */
    showAvatar?: boolean;
}

export const MessageBubble = ({ message, isMe, showAvatar = true }: MessageBubbleProps) => {
    const senderName = message.sender_name || 'Unknown';

    const timeDisplay = message.created_at
        ? format(new Date(message.created_at), 'p')
        : '';

    const isSending = message.status === 'sending';
    const isError = message.status === 'error';
    // Message confirmed by server = no optimistic status (came from API, not optimistic state)
    const isServerConfirmed = !isSending && !isError;

    return (
        <div className={cn(
            "flex w-full gap-2",
            isMe ? "justify-end" : "justify-start",
            showAvatar ? "mt-3 first:mt-0" : "mt-0.5",
            isSending && "opacity-60"
        )}>
            {/* Avatar slot for received messages */}
            {!isMe && (
                <div className="w-7 shrink-0">
                    {showAvatar ? (
                        <Avatar className="w-7 h-7 border border-border/50">
                            <AvatarImage src={message.sender_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${senderName}`} />
                            <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-semibold">
                                {senderName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    ) : null}
                </div>
            )}

            <div className={cn("flex flex-col max-w-[75%] md:max-w-[65%]", isMe && "items-end")}>
                {/* Sender name - only for received, only on first of group */}
                {!isMe && showAvatar && (
                    <span className="text-[10px] text-muted-foreground/70 font-medium ml-1 mb-0.5">
                        {senderName}
                    </span>
                )}

                <div
                    className={cn(
                        "relative px-3.5 py-2 text-[14px] leading-relaxed",
                        // Bubble shape: full radius except the corner closest to avatar
                        isMe
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                            : "bg-muted/60 text-foreground rounded-2xl rounded-bl-md",
                        // Tighten top radius for grouped (consecutive) messages
                        !showAvatar && isMe && "rounded-tr-md",
                        !showAvatar && !isMe && "rounded-tl-md",
                        isError && "ring-1 ring-destructive/40 bg-destructive/5"
                    )}
                >
                    <p className="whitespace-pre-wrap break-words">{message.message}</p>

                    {/* Timestamp + read receipts */}
                    <div className={cn(
                        "flex items-center gap-1 justify-end mt-0.5 select-none",
                        isMe ? "text-primary-foreground/60" : "text-muted-foreground/50",
                        isError && "text-destructive/70"
                    )}>
                        <span className="text-[10px] tabular-nums">
                            {isSending ? 'Sending' : timeDisplay}
                        </span>
                        {isMe && (
                            <span className="flex items-center">
                                {isSending ? (
                                    /* Still uploading to server */
                                    <Clock className="w-3 h-3" />
                                ) : isError ? (
                                    /* Failed to send */
                                    <RefreshCcw className="w-3 h-3" />
                                ) : (message.is_read || !!message.read_at) ? (
                                    /* Receiver has read it — blue double tick */
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-300" strokeWidth={2.5} />
                                ) : (isServerConfirmed || !!message.delivered_at) ? (
                                    /* Server confirmed / delivered — grey double tick.
                                       API often returns delivered_at=null for history so we
                                       fall back to isServerConfirmed (any non-optimistic msg). */
                                    <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                                ) : (
                                    /* Optimistic only — single tick */
                                    <Check className="w-3 h-3" strokeWidth={2.5} />
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {isError && (
                    <span className="text-[10px] text-destructive mt-0.5 px-1">Failed to send</span>
                )}
            </div>
        </div>
    );
};
