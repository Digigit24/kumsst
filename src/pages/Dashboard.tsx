import { LazySection } from '@/components/dashboard/LazySection';
import { SECTION_COMPONENTS } from '@/components/dashboard/sections';
import { Button } from '@/components/ui/button';
import { getSectionsForRole } from '@/config/dashboard.config';
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/lib/react-query';
import { useSettings } from '@/settings/context/useSettings';
import {
  getUserType,
  isAdmin
} from '@/utils/permissions';
import { Bell, RefreshCw } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { mutate } from 'swr';

/** Number of sections to render eagerly (above the fold). The rest are lazy-loaded. */
const EAGER_SECTION_COUNT = 2;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const userRole = getUserType();
  const showAdminContent = isAdmin();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect construction personnel to their specific dashboard
  if (userRole === 'construction_head' || userRole === 'jr_engineer') {
    return <Navigate to="/construction/dashboard" replace />;
  }

  // Refresh dashboard-relevant data only (not the entire app cache)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Revalidate SWR caches matching dashboard-related keys
      await mutate(
        (key: unknown) => {
          if (typeof key === 'string') {
            return ['dashboard', 'stats', 'recent', 'attendance', 'student', 'notice'].some(k => key.includes(k));
          }
          if (Array.isArray(key)) {
            const first = key[0];
            if (typeof first === 'string') {
              return ['dashboard', 'stats', 'recent', 'attendance', 'student', 'notice'].some(k => first.includes(k));
            }
          }
          return false;
        },
        undefined,
        { revalidate: true }
      );
      // Invalidate only dashboard-related React Query caches
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && ['dashboard', 'stats', 'recent', 'attendance', 'student', 'notice'].some(k => (key as string).includes(k));
        },
      });
      // Force re-render of all sections (also resets LazySection visibility)
      setRefreshKey(prev => prev + 1);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'student':
        return 'Student Dashboard';
      case 'teacher':
        return 'Faculty Dashboard';
      case 'super_admin':
      case 'college_admin':
        return 'Dashboard';
      default:
        return 'Dashboard';
    }
  };

  // Get sections for current user's role from config
  const sections = getSectionsForRole(userRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* Title removed as per request */}
          <p className="text-muted-foreground text-xl">
            Welcome <span className="font-bold text-xl uppercase" style={{ color: settings.primaryColor }}>{user?.full_name || user?.username || 'Back'}</span>! Here's what's happening today
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh dashboard"
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          {showAdminContent && (
            <Button onClick={() => navigate('/communication/notices')}>
              <Bell className="h-4 w-4 mr-2" />
              Announcements
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Sections - Rendered based on config */}
      {/* First sections render eagerly; the rest are lazy-loaded when near the viewport */}
      {sections.map((section, index) => {
        const SectionComponent = SECTION_COMPONENTS[section.component];

        if (!SectionComponent) {
          console.warn(`Dashboard section component "${section.component}" not found`);
          return null;
        }

        if (index < EAGER_SECTION_COUNT) {
          return (
            <div key={`${section.id}-${refreshKey}`}>
              <SectionComponent />
            </div>
          );
        }

        return (
          <LazySection key={`${section.id}-${refreshKey}`}>
            <SectionComponent />
          </LazySection>
        );
      })}

      {/* Empty state if no sections */}
      {sections.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No Dashboard Sections</h3>
          <p className="text-muted-foreground">
            No dashboard sections are configured for your role: {userRole}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Contact your administrator to configure dashboard permissions.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
