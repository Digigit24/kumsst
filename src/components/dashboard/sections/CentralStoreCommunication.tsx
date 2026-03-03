import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronRight, Megaphone, MessageSquare } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotices, useChats } from '@/hooks/useCommunication';

export const CentralStoreCommunication: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('notices');

    const { data: noticesData, isLoading: noticesLoading } = useNotices({ page_size: 3, is_published: true });
    // Assuming 'chats' queries messages relevant to current user
    const { data: chatsData, isLoading: chatsLoading } = useChats({ page_size: 3 });

    const notices = noticesData?.results || [];
    const chats = chatsData?.results || [];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Card className="h-full border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        Communication Center
                    </CardTitle>
                    <CardDescription>Recent notices and messages</CardDescription>
                </div>
                <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/communication/notices')} className="rounded-full bg-slate-100 hover:bg-slate-200">
                        <Bell className="h-5 w-5 text-slate-600" />
                    </Button>
                </motion.div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 p-1 bg-slate-100 rounded-xl">
                        <TabsTrigger value="notices" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">Notices</TabsTrigger>
                        <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-300">Messages</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TabsContent value="notices" className="space-y-3 mt-0">
                                {noticesLoading && <p className="text-sm text-center text-muted-foreground p-4">Loading notices...</p>}
                                {!noticesLoading && notices.length === 0 && <p className="text-sm text-center text-muted-foreground p-4">No recent notices</p>}

                                {notices.map((note, index) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                                        className="flex items-start justify-between p-3 border rounded-xl hover:border-primary/20 transition-all cursor-pointer group bg-card"
                                        onClick={() => navigate('/communication/notices')}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                                                <Megaphone className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{note.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1.5">{formatDate(note.publish_date)}</p>
                                            </div>
                                        </div>
                                        <Badge variant={note.is_urgent ? 'destructive' : 'outline'} className="rounded-md">
                                            {note.is_urgent ? 'Urgent' : 'General'}
                                        </Badge>
                                    </motion.div>
                                ))}
                                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary mt-2" onClick={() => navigate('/communication/notices')}>
                                    View all notices <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </TabsContent>
                        </motion.div>

                        <motion.div
                            key={activeTab + "-content"}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TabsContent value="messages" className="space-y-3 mt-0">
                                {chatsLoading && <p className="text-sm text-center text-muted-foreground p-4">Loading messages...</p>}
                                {!chatsLoading && chats.length === 0 && <p className="text-sm text-center text-muted-foreground p-4">No recent messages</p>}

                                {chats.map((msg, index) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.02)" }}
                                        className="flex items-start justify-between p-3 border rounded-xl hover:border-blue-500/20 transition-all cursor-pointer group bg-card"
                                        onClick={() => navigate('/communication/chats')}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold leading-none group-hover:text-blue-600 transition-colors">{msg.sender_name || 'User ' + msg.sender}</h4>
                                                <p className="text-xs text-foreground mt-1.5 line-clamp-1">{msg.message}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">{formatDate(msg.created_at)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-blue-600 mt-2" onClick={() => navigate('/communication/chats')}>
                                    Go to inbox <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            </CardContent>
        </Card>
    );
};
