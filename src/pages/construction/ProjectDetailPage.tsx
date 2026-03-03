import { ArrowLeft, Calendar, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectSWR } from '../../hooks/useConstructionSWR';
import { ProjectDailyReportsTab } from './tabs/ProjectDailyReportsTab';
import { ProjectExpensesTab } from './tabs/ProjectExpensesTab';
import { ProjectMaterialsTab } from './tabs/ProjectMaterialsTab';
import { ProjectMilestonesTab } from './tabs/ProjectMilestonesTab';
import { ProjectOverviewTab } from './tabs/ProjectOverviewTab';
import { ProjectPhotosTab } from './tabs/ProjectPhotosTab';
export function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const projectId = Number(id);
    const { data: project, isLoading } = useProjectSWR(projectId);

    // Manage which tab is active
    type TabKey = 'overview' | 'daily-reports' | 'milestones' | 'photos' | 'expenses' | 'materials';
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
                <p className="text-muted-foreground">Project not found</p>
                <button
                    onClick={() => navigate('/construction/projects')}
                    className="text-blue-500 hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button
                    onClick={() => navigate('/construction/projects')}
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                    <ArrowLeft className="h-4 w-4" /> Projects
                </button>
                <span>/</span>
                <span className="text-foreground font-medium truncate">{project.project_name}</span>
            </div>

            {/* Hub Header */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold">{project.project_name}</h1>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                            project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' :
                                'bg-amber-500/10 text-amber-600'
                            }`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {project.location_address || 'No location set'}</div>
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Started: {new Date(project.start_date).toLocaleDateString()}</div>
                        {project.project_head_name && <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Head: {project.project_head_name}</div>}
                    </div>
                </div>

                {/* Global Progress */}
                <div className="w-full md:w-64 space-y-2 bg-muted/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span>Overall Progress</span>
                        <span className="text-blue-600">{project.progress_percentage || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${project.progress_percentage || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Unified Hub Navigation (Tabs) */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                <div className="flex flex-col">
                    <div className="border-b border-border overflow-x-auto no-scrollbar">
                        <div className="flex items-center px-4 py-3 gap-2 min-w-max">
                            {[
                                { key: 'overview', label: 'Overview' },
                                { key: 'daily-reports', label: 'Daily Reports' },
                                { key: 'milestones', label: 'Milestones' },
                                { key: 'photos', label: 'Photos' },
                                { key: 'expenses', label: 'Expenses' },
                                { key: 'materials', label: 'Materials' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as TabKey)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.key
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-muted-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        {activeTab === 'overview' && <ProjectOverviewTab project={project} />}
                        {activeTab === 'daily-reports' && <ProjectDailyReportsTab project={project} />}
                        {activeTab === 'milestones' && <ProjectMilestonesTab project={project} />}
                        {activeTab === 'photos' && <ProjectPhotosTab project={project} />}
                        {activeTab === 'expenses' && <ProjectExpensesTab project={project} />}
                        {activeTab === 'materials' && <ProjectMaterialsTab project={project} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
