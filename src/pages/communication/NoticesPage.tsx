// Notices Page
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Megaphone,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../../components/ui/card';
import {
  MoreVertical,
  ExternalLink,
  Calendar,
  Eye,
  Building2,
} from 'lucide-react';
import { useNoticesSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import {
  useCreateNotice,
  useCreateNoticeVisibility,
  useDeleteNotice,
  useUpdateNotice
} from '../../hooks/useCommunication';
import type { Notice, NoticeFilters } from '../../types/communication.types';
import { NoticeForm } from './forms/NoticeForm';

const audienceLabel = (audience?: string) => {
  switch (audience) {
    case 'student': return 'Students';
    case 'teacher': return 'Teachers';
    case 'staff': return 'Staff';
    case 'specific': return 'Specific';
    default: return 'Everyone';
  }
};


export const NoticesPage = () => {
  const { user } = useAuth();
  const isStudent = user?.user_type === 'student' || user?.userType === 'student';
  const isJrEngineer = user?.user_type === 'jr_engineer' || user?.userType === 'jr_engineer';
  const canManage = !isStudent && !isJrEngineer;
  const [filters, setFilters] = useState<NoticeFilters>({
    page: 1,
    page_size: 20,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [viewNotice, setViewNotice] = useState<Notice | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Queries and mutations
  const { data, isLoading, refresh } = useNoticesSWR(filters);
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const deleteMutation = useDeleteNotice();
  const createVisibilityMutation = useCreateNoticeVisibility();

  const handleCreate = () => {
    setSelectedNotice(null);
    setIsFormOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      const { college, class_obj, section, ...rest } = formData;
      const transformedData = {
        ...rest,
        attachment: formData.attachment || null,
      };

      if (selectedNotice) {
        await updateMutation.mutateAsync({
          id: selectedNotice.id,
          data: transformedData,
        });
        toast.success('Notice updated successfully');
      } else {
        const createdNotice = await createMutation.mutateAsync(transformedData);

        if (formData.target_audience === 'specific' && class_obj && createdNotice?.id) {
          await createVisibilityMutation.mutateAsync({
            notice: createdNotice.id,
            target_type: section ? 'section' : 'class',
            class_obj: class_obj,
            section: section || null,
            is_active: true,
          });
        }
        toast.success('Notice created successfully');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to save notice');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Notice deleted successfully');
      setDeleteId(null);
      refresh();
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete notice');
    }
  };

  const filteredNotices = useMemo(() => {
    let notices = data?.results || [];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      notices = notices.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    // Tab filter
    if (activeTab === 'urgent') {
      notices = notices.filter((n) => n.is_urgent);
    } else if (activeTab === 'published') {
      notices = notices.filter((n) => n.is_published);
    } else if (activeTab === 'draft') {
      notices = notices.filter((n) => !n.is_published);
    }

    return notices;
  }, [data?.results, searchQuery, activeTab]);

  // Stats
  const stats = useMemo(() => {
    const all = data?.results || [];
    return {
      total: data?.count || 0,
      published: all.filter((n) => n.is_published).length,
      urgent: all.filter((n) => n.is_urgent).length,
      draft: all.filter((n) => !n.is_published).length,
    };
  }, [data]);

  const getNoticeStatus = (notice: Notice) => {
    const expiry = new Date(notice.expiry_date);
    if (isPast(expiry)) return 'expired';
    if (!notice.is_published) return 'draft';
    if (notice.is_urgent) return 'urgent';
    return 'active';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Nebula Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#1a0f14] p-8 sm:p-12 text-slate-900 dark:text-white shadow-xl shadow-rose-500/5 dark:shadow-2xl border border-rose-100 dark:border-rose-900/40">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-400/10 dark:bg-red-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-[80px]" />

          <div className="absolute inset-0 opacity-[0.03] dark:opacity-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-white/10 backdrop-blur-md border border-rose-200 dark:border-white/20 text-xs font-bold text-rose-700 dark:text-white tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              System Live • {stats.published} Active Notices
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-500 dark:from-rose-400 dark:to-red-400">Notice Board</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-300 text-lg font-medium">
              The central hub for all official communications, policy updates, and urgent alerts.
            </p>
          </div>

          {canManage && (
            <Button
              onClick={handleCreate}
              size="lg"
              className="rounded-2xl bg-rose-600 dark:bg-rose-600 text-white hover:bg-rose-700 dark:hover:bg-rose-500 shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 px-8 h-14 font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Publish Notice
            </Button>
          )}
        </div>

        {/* Floating Quick Stats */}
        <div className="relative z-10 mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Posts', value: stats.total, icon: FileText, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-400/10' },
            { label: 'Urgent Ops', value: stats.urgent, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-400/10' },
            { label: 'Live Board', value: stats.published, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10' },
            { label: 'Queued', value: stats.draft, icon: Clock, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-400/10' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-md border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md dark:hover:bg-white/10 transition-all">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-300 font-bold">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl h-12">
            {[
              { id: 'all', label: 'All Feeds', icon: Megaphone },
              { id: 'urgent', label: 'Priority', icon: AlertTriangle },
              { id: 'published', label: 'Public', icon: CheckCircle },
              { id: 'draft', label: 'Internal', icon: Clock, hide: !canManage },
            ].filter(t => !t.hide).map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm gap-2 font-bold text-xs uppercase tracking-wider">
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search Intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !filteredNotices || filteredNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? 'No notices match your search' : activeTab !== 'all' ? `No ${activeTab} notices` : 'No notices yet'}
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {searchQuery
              ? 'Try adjusting your search query or switching tabs'
              : 'Create your first notice to keep everyone informed'}
          </p>
          {!searchQuery && canManage && activeTab === 'all' && (
            <Button onClick={handleCreate} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Notice
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {filteredNotices
            .sort((a, b) => {
              if (a.is_urgent && !b.is_urgent) return -1;
              if (!a.is_urgent && b.is_urgent) return 1;
              return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
            })
            .map((notice) => {
              const status = getNoticeStatus(notice);
              const isExpired = status === 'expired';
              const publishDate = format(new Date(notice.publish_date), 'MMM d, yyyy');

              return (
                <TooltipProvider key={notice.id}>
                  <Card
                    className={cn(
                      "group relative flex flex-col h-[370px] rounded-[2.5rem] border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-[#1a0f14] shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden",
                      notice.is_urgent && "border-rose-300 dark:border-rose-700/60 hover:shadow-rose-500/20",
                      isExpired && "opacity-60 grayscale"
                    )}
                    onClick={() => setViewNotice(notice)}
                  >
                    {/* Glowing Orbs */}
                    <div className={cn(
                      "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-[0.05] dark:opacity-[0.1] transition-all duration-700 group-hover:opacity-[0.12] translate-x-1/2 -translate-y-1/2",
                      notice.is_urgent ? "bg-red-500" : "bg-rose-500"
                    )} />

                    {/* Card Accent Line */}
                    <div className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[3px] rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      notice.is_urgent ? "bg-red-500" : "bg-rose-400"
                    )} />
                    <div className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      notice.is_urgent ? "bg-red-600" : "bg-rose-500"
                    )} />

                    <div className="relative z-10 flex justify-between items-start pt-6 px-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500",
                        notice.is_urgent
                          ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/30"
                          : "bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-500/30"
                      )}>
                        <Megaphone className="h-7 w-7" />
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {notice.is_urgent ? (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ring-1 ring-red-200 dark:ring-red-500/50 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-white animate-pulse" />
                            Urgent
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-rose-50 dark:bg-white/10 border-rose-200 dark:border-white/20 text-rose-600 dark:text-white uppercase text-[9px] font-black tracking-widest px-3 py-1">
                            {notice.is_published ? 'Public' : 'Draft'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardHeader className="pt-6 px-6 pb-2 relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-400 dark:text-white tracking-wide uppercase">
                        <Calendar className="w-3.5 h-3.5 text-rose-500 dark:text-white" />
                        {publishDate}
                      </div>
                      <h3 className="text-[1.35rem] font-bold text-slate-900 dark:text-white leading-[1.3] line-clamp-2 min-h-[3.5rem] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rose-600 group-hover:to-red-600 dark:group-hover:text-white transition-all">
                        {notice.title}
                      </h3>
                    </CardHeader>

                    <CardContent className="px-6 flex-1 relative z-10">
                      <p className="text-sm text-slate-600 dark:text-white line-clamp-3 leading-relaxed font-medium">
                        {notice.content}
                      </p>
                    </CardContent>

                    <CardFooter className="relative z-10 p-4 mx-4 mb-4 rounded-3xl bg-rose-50/50 dark:bg-white/10 flex items-center justify-between border border-rose-100 dark:border-white/20 mt-auto">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-rose-100 to-rose-200 dark:from-slate-700 dark:to-slate-800 text-rose-700 dark:text-white text-xs font-bold">
                            {notice.created_by_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{notice.created_by_name || 'System Admin'}</span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-white font-bold tracking-tight uppercase">
                            <Building2 className="w-3 h-3 text-rose-400 dark:text-white" />
                            <span className="truncate">{notice.college_name || 'Main Campus'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {notice.attachment && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl bg-white dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-white/20 hover:text-rose-600 dark:hover:text-white transition-all shadow-sm border border-rose-100 dark:border-white/20 text-slate-500 dark:text-white" asChild>
                                <a href={notice.attachment} target="_blank" rel="noopener noreferrer">
                                  <Paperclip className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">View Attachment</TooltipContent>
                          </Tooltip>
                        )}
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-2xl bg-white dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-white/20 hover:text-rose-600 dark:hover:text-white transition-all shadow-sm border border-rose-100 dark:border-white/20 text-slate-500 dark:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-rose-100 dark:border-slate-800 shadow-xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-white">
                              <DropdownMenuItem onClick={() => handleEdit(notice)} className="rounded-xl h-10 gap-3 font-bold text-xs cursor-pointer hover:bg-rose-50 dark:hover:bg-slate-800 hover:text-rose-700 dark:hover:text-white transition-colors">
                                <Pencil className="w-4 h-4 text-rose-400 dark:text-white" /> Edit Notice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setDeleteId(notice.id); setViewNotice(null); }} className="rounded-xl h-10 gap-3 font-bold text-xs cursor-pointer text-red-600 dark:text-white focus:text-red-700 dark:focus:text-white focus:bg-red-50 dark:focus:bg-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors">
                                <Trash2 className="w-4 h-4" /> Delete Notice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </TooltipProvider>
              );
            })}
        </div>
      )}

      {/* Pagination */}
      {data && data.results.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {((filters.page || 1) - 1) * (filters.page_size || 20) + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">
              {Math.min((filters.page || 1) * (filters.page_size || 20), data.count)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">{data.count}</span> notices
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.previous}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.next}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto [&>button]:z-50">
          <DialogHeader>
            <DialogTitle>
              {selectedNotice ? 'Edit Notice' : 'New Notice'}
            </DialogTitle>
          </DialogHeader>
          <NoticeForm
            notice={selectedNotice || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notice"
        description="Are you sure you want to delete this notice? This action cannot be undone."
        variant="destructive"
      />
      <Dialog open={!!viewNotice} onOpenChange={(open) => !open && setViewNotice(null)}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] p-0 border-0 bg-white dark:bg-[#0B1120] rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden [&>button]:right-6 [&>button]:top-6 [&>button]:bg-white/80 dark:[&>button]:bg-slate-800/80 backdrop-blur-sm [&>button]:p-2.5 [&>button]:rounded-2xl [&>button]:opacity-100 hover:[&>button]:bg-slate-100 dark:hover:[&>button]:bg-slate-700 transition-all [&>button]:border [&>button]:border-slate-200/50 dark:[&>button]:border-slate-700/50 [&>button]:shadow-sm [&>button]:z-[100]">
          {viewNotice && (
            <div className="relative">
              {/* Animated Background Gradients */}
              <div className={cn(
                "absolute top-0 left-0 w-full h-64 blur-[80px] opacity-20 dark:opacity-10 pointer-events-none transition-colors duration-1000",
                viewNotice.is_urgent ? "bg-rose-500" : "bg-blue-600"
              )} />

              <div className="p-8 md:p-12 relative z-10">
                <DialogHeader className="mb-8">
                  <div className="flex items-center gap-3 mb-5">
                    <Badge
                      className={cn(
                        "uppercase text-[10px] font-black tracking-widest px-3.5 py-1.5 rounded-full border-0 shadow-sm",
                        viewNotice.is_urgent ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-2 inline-block", viewNotice.is_urgent ? "bg-rose-500 animate-pulse" : "bg-blue-500")} />
                      {viewNotice.is_urgent ? 'Urgent Priority' : 'Official Notice'}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(viewNotice.publish_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <DialogTitle className="text-3xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 leading-[1.2] tracking-tight pr-10">
                    {viewNotice.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-10">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-[1.05rem] leading-[1.8] text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium">
                      {viewNotice.content}
                    </p>
                  </div>

                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-700/30">
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-black text-sm">
                          {viewNotice.created_by_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Published By</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewNotice.created_by_name || 'Administrator'}</span>
                        <span className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1"><Building2 className="w-3 h-3 text-slate-400" />{viewNotice.college_name || 'Main Campus'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50/80 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-700/30">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Audience</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" />{audienceLabel(viewNotice.target_audience)}</span>
                      </div>
                      <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires On</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{format(new Date(viewNotice.expiry_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {viewNotice.attachment && (
                    <div className="pt-2">
                      <Button asChild className="w-full sm:w-auto rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-none font-bold tracking-wide h-14 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <a href={viewNotice.attachment} target="_blank" rel="noopener noreferrer">
                          <Paperclip className="w-5 h-5 mr-3" />
                          View Attached Document
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
