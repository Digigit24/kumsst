import SettingsDrawer from "@/components/SettingsDrawer";
import { ActionSearchBar } from "@/components/ui/action-search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useSuperAdminContext } from "@/contexts/SuperAdminContext";
import {
  useApprovalNotifications,
  useApprovalNotificationUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  approvalNotificationKeys,
} from "@/hooks/useApprovals";
import { useAuth } from "@/hooks/useAuth";
import { useColleges } from "@/hooks/useCore";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSSE, SSEEvent } from "@/hooks/useSSE";
import { cn } from "@/lib/utils";
import { useSettings } from "@/settings/context/useSettings";
import { ApprovalNotification, NotificationType } from "@/types/approvals.types";
import { canSwitchCollege, isSuperAdmin } from "@/utils/auth.utils";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Search,
  Settings,
  User,
  XCircle,
  CheckCheck,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface HeaderProps {
  toggleSidebar: () => void;
}

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

// Get icon for notification type
const getNotificationIcon = (type: NotificationType | string) => {
  switch (type) {
    case 'notice_published':
      return <Megaphone className="h-4 w-4 text-blue-500" />;
    case 'chat_message':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'event_created':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case 'approval_request':
      return <ClipboardList className="h-4 w-4 text-orange-500" />;
    case 'approval_approved':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'approval_rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'system':
      return <Settings className="h-4 w-4 text-gray-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

// Get action label for notification type
const getActionLabel = (type: NotificationType | string) => {
  switch (type) {
    case 'notice_published':
      return 'View Notice';
    case 'chat_message':
      return 'Open Chat';
    case 'event_created':
      return 'View Event';
    case 'approval_request':
      return 'Review';
    case 'approval_approved':
    case 'approval_rejected':
      return 'View';
    default:
      return 'View';
  }
};

export const Header: React.FC<HeaderProps> = React.memo(({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { data: profileData } = useUserProfile();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Super admin context for college selection
  const { selectedCollege, setSelectedCollege } = useSuperAdminContext();
  const { data: collegesData, isLoading: isLoadingColleges } = useColleges({
    page_size: DROPDOWN_PAGE_SIZE,
    is_active: true
  });

  // Fetch notifications
  const { data: approvalNotificationsData } = useApprovalNotifications({ page_size: 50 });
  const { data: approvalUnreadCountData } = useApprovalNotificationUnreadCount();
  const markNotificationAsReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  const notifications = approvalNotificationsData?.results || [];
  const unreadCount = approvalUnreadCountData?.unread_count || 0;

  // SSE real-time connection
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.event === 'notification') {
      // Refresh notification list and unread count
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.unreadCount() });

      // Show toast for new notification
      const data = event.data;
      if (data?.title) {
        toast(data.title, {
          description: data.message,
          action: data.action_url ? {
            label: 'View',
            onClick: () => navigate(data.action_url),
          } : undefined,
        });
      }
    }

    if (event.event === 'message') {
      // Refresh notification count (chat_message notifications are created by backend)
      queryClient.invalidateQueries({ queryKey: approvalNotificationKeys.unreadCount() });
    }
  }, [queryClient, navigate]);

  useSSE(handleSSEEvent, !!user);

  const colleges = collegesData?.results || [];
  const isSuperAdminRole = isSuperAdmin(user as any);
  const showCollegeSelector = canSwitchCollege(user as any);

  // Compute panel title from user role
  const panelTitle = useMemo(() => {
    const userRoles = (user as any)?.user_roles;
    if (userRoles && Array.isArray(userRoles) && userRoles.length > 0) {
      const roleName = userRoles[0]?.role_name;
      if (roleName) {
        const lowerRole = roleName.toLowerCase();
        if (lowerRole === 'teacher') return "Faculty";
        if (lowerRole === 'admin' || lowerRole === 'super admin') return "CEO";
        if (lowerRole === 'student') return "Student";
        if (lowerRole === 'store') return "Store";
        if (lowerRole === 'college_admin' || lowerRole === 'college admin') return "Principal";
        return roleName;
      }
    }
    const type = (user as any)?.user_type;
    if (isSuperAdminRole) return "CEO";
    if (type === 'college_admin') return "Principal";
    if (type === 'student') return "Student";
    if (type === 'teacher') return "Faculty";
    return "Dashboard";
  }, [user, isSuperAdminRole]);

  // Handle college selection change
  const handleCollegeChange = (value: string) => {
    if (value === 'all') {
      setSelectedCollege(null);
    } else {
      setSelectedCollege(Number(value));
    }
    window.location.reload();
  };

  const handleNotificationClick = async (notification: ApprovalNotification) => {
    // Mark notification as read via API
    if (!notification.is_read) {
      try {
        await markNotificationAsReadMutation.mutateAsync(notification.id);
      } catch {
        // notification read marking failed — non-critical
      }
    }

    // Navigate using action_url from backend (preferred) or fallback
    if (notification.action_url) {
      navigate(notification.action_url);
    } else if (notification.approval_request) {
      // Fallback for old-style approval notifications
      navigate(`/approvals/${notification.approval_request}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync(undefined);
    } catch {
      // non-critical
    }
  };

  const handleLogout = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent dropdown from closing immediately
    e?.preventDefault();

    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      // Add minimum delay for UX feedback
      await Promise.all([
        logout(),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      navigate("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>

            <h1
              className="text-2xl font-bold hidden sm:block"
              style={{ color: settings.primaryColor }}
            >
              {panelTitle}
            </h1>
          </div>

          {/* Middle - College Selector for Super Admins and Chief Accountants */}
          {showCollegeSelector && (
            <div className="flex-1 mx-1 sm:mx-2 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-xs">
              <Select
                value={selectedCollege === null ? 'all' : String(selectedCollege)}
                onValueChange={handleCollegeChange}
                disabled={isLoadingColleges}
              >
                <SelectTrigger className="h-9 w-full bg-muted/50 border-primary/20 px-2 lg:px-3 overflow-hidden [&>span]:min-w-0 [&>span]:truncate">
                  <SelectValue>
                    {isLoadingColleges ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0 text-muted-foreground" />
                        <span className="font-medium truncate text-muted-foreground">Loading...</span>
                      </div>
                    ) : selectedCollege === null ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium truncate">All Colleges</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 min-w-0">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium truncate">
                          {colleges.find(c => c.id === selectedCollege)?.short_name ||
                            colleges.find(c => c.id === selectedCollege)?.name ||
                            'College'}
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <div className="font-medium">All Colleges</div>
                        <div className="text-xs text-muted-foreground">View all data</div>
                      </div>
                    </div>
                  </SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={String(college.id)}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{college.name}</div>
                          {college.short_name && (
                            <div className="text-xs text-muted-foreground truncate">
                              {college.short_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              title="Search (Ctrl+K)"
              className="relative"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(380px,calc(100vw-1rem))]">
                <div className="flex items-center justify-between px-3 py-2">
                  <DropdownMenuLabel className="p-0">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({unreadCount} unread)
                      </span>
                    )}
                  </DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                      onClick={handleMarkAllRead}
                      disabled={markAllReadMutation.isPending}
                    >
                      {markAllReadMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCheck className="h-3 w-3" />
                      )}
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[min(400px,60vh)]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-1">
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={cn(
                            "flex flex-col items-start gap-2 p-3 cursor-pointer",
                            !notification.is_read && "bg-accent/50"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <span className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.notification_type || notification.request_type || '')}
                            </span>
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium leading-tight">
                                  {notification.title}
                                </p>
                                <Badge
                                  variant={getPriorityColor(notification.priority) as any}
                                  className="text-xs flex-shrink-0"
                                >
                                  {notification.priority_display || notification.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.sent_at || notification.created_at || ''), { addSuffix: true })}
                                </span>
                                <span className="text-xs text-primary font-medium flex items-center gap-1">
                                  {getActionLabel(notification.notification_type || notification.request_type || '')}
                                  <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu - combines Settings + Profile + Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" title="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* User info */}
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-sm font-medium truncate">
                    {profileData?.user_name || user?.username || user?.email || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {panelTitle}
                  </p>
                </div>

                {/* Settings */}
                <DropdownMenuItem
                  className="gap-2 cursor-pointer mt-1"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  onSelect={(e) => handleLogout(e as any)}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* SETTINGS DRAWER (IMPORTANT: OUTSIDE HEADER DOM) */}
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* SEARCH DIALOG */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          <div className="pt-10 px-4 pb-4">
            <ActionSearchBar
              onClose={() => setSearchOpen(false)}
              userType={(user as any)?.user_type || ''}
              userPermissions={(user as any)?.permissions || []}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
