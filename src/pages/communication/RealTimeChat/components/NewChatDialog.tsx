import api from "@/api/apiClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from "@/config/api.config";
import { Search, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SelectableUser {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
}

interface NewChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserSelect: (user: any) => void;
}

export const NewChatDialog = ({ open, onOpenChange, onUserSelect }: NewChatDialogProps) => {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<SelectableUser[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Fetch users when dialog opens
    useEffect(() => {
        if (open) {
            fetchUsers("");
            setSearch("");
        }
    }, [open]);

    const fetchUsers = async (query: string) => {
        setLoading(true);
        try {
            const response = await api.get(API_ENDPOINTS.users.list, {
                params: { search: query, page_size: 20 }
            });
            setUsers(response.data.results || response.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchUsers(val), 300);
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden rounded-2xl">
                <DialogHeader className="px-5 pt-5 pb-4">
                    <DialogTitle className="text-base">New conversation</DialogTitle>
                </DialogHeader>

                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                        <Input
                            placeholder="Search by name or username..."
                            className="pl-9 h-9 text-sm bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border focus-visible:ring-1 focus-visible:ring-ring/20 rounded-lg"
                            value={search}
                            onChange={handleSearch}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="h-[360px] overflow-y-auto overscroll-contain border-t border-border/50">
                    {loading ? (
                        <div className="space-y-0.5 p-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 bg-muted animate-pulse rounded w-32" />
                                        <div className="h-3 bg-muted/60 animate-pulse rounded w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <div className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center mb-3">
                                <Users className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-muted-foreground">No users found</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="p-1">
                            {users.map((user) => {
                                const displayName = user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.username;
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            onUserSelect(user);
                                            onOpenChange(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
                                    >
                                        <Avatar className="w-9 h-9 border border-border/50">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                                            <AvatarFallback className="text-xs bg-muted text-muted-foreground font-semibold">
                                                {(user.first_name?.[0] || user.username?.[0])?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-foreground truncate">
                                                {displayName}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                @{user.username}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
