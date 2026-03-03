import { Building2, ClipboardList, HardHat, Landmark, Loader2, MapPin, TrendingUp, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardSWR } from '../../hooks/useConstructionSWR';

export function ConstructionDashboardPage() {
    const navigate = useNavigate();
    const { data: dashboard, isLoading } = useDashboardSWR();

    const stats = [
        { label: 'Active Projects', value: dashboard?.active_projects ?? '—', color: 'text-blue-600', bg: 'bg-blue-500/10' },
        { label: 'Pending Reports', value: dashboard?.pending_reports ?? '—', color: 'text-amber-600', bg: 'bg-amber-500/10' },
        { label: 'Total Budget', value: dashboard?.total_budget ? `₹${(dashboard.total_budget / 100000).toFixed(2)}L` : '—', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
        { label: 'Total Spent', value: dashboard?.total_spent ? `₹${(dashboard.total_spent / 100000).toFixed(2)}L` : '—', color: 'text-rose-600', bg: 'bg-rose-500/10' },
        { label: 'Geofence Alerts', value: dashboard?.geofence_violations ?? '—', color: 'text-red-600', bg: 'bg-red-500/10' },
    ];

    const cards = [
        { title: 'Projects', desc: 'Manage all construction projects', icon: Building2, href: '/construction/projects', color: 'from-blue-500 to-indigo-600' },
        { title: 'Daily Reports', desc: 'Submit & review daily site reports', icon: ClipboardList, href: '/construction/daily-reports', color: 'from-emerald-500 to-teal-600' },
        { title: 'Photos', desc: 'Upload and manage site photos', icon: MapPin, href: '/construction/photos', color: 'from-amber-500 to-orange-600' },
        { title: 'Milestones', desc: 'Track project milestones', icon: TrendingUp, href: '/construction/milestones', color: 'from-purple-500 to-violet-600' },
        { title: 'Expenses', desc: 'Record site expenses & costs', icon: Landmark, href: '/construction/expenses', color: 'from-rose-500 to-pink-600' },
        { title: 'Material Requests', desc: 'Request materials for projects', icon: Wrench, href: '/construction/material-requests', color: 'from-cyan-500 to-sky-600' },
        { title: 'Geofence Violations', desc: 'View photos outside allowed zones', icon: MapPin, href: '/construction/geofence-violations', color: 'from-red-500 to-rose-600' },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <HardHat className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Construction Command Center
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Real-time overview of all construction activities
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="rounded-2xl bg-card border border-border shadow-sm p-5 space-y-2 relative overflow-hidden group">
                        <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full transition-transform group-hover:scale-150 ${stat.bg}`} />
                        <div className="text-xs font-medium text-muted-foreground relative z-10">{stat.label}</div>
                        <div className={`text-3xl font-bold relative z-10 ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" /> Recent Projects
                        </h2>
                        <button onClick={() => navigate('/construction/projects')} className="text-sm text-blue-500 hover:underline">
                            View All →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dashboard?.recent_projects?.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => navigate(`/construction/projects/${project.id}`)}
                                className="text-left bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-blue-500/50 group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold group-hover:text-blue-500 transition-colors line-clamp-1">{project.project_name}</h3>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mb-4 line-clamp-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {project.location_address || 'No location set'}
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{project.progress_percentage || 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: `${project.progress_percentage || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                        {(!dashboard?.recent_projects || dashboard.recent_projects.length === 0) && (
                            <div className="col-span-2 p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                                No recent projects found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Links Column */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-emerald-500" /> Quick Links
                    </h2>
                    <div className="space-y-3">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.title}
                                    onClick={() => navigate(card.href)}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold truncate group-hover:text-blue-500 transition-colors">{card.title}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{card.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
