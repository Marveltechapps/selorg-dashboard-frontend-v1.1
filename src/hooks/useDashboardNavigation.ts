import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * Hook for URL-based navigation within dashboards
 * Syncs URL with activeTab state
 */
export function useDashboardNavigation(defaultTab: string = 'overview') {
  const { screen } = useParams<{ screen?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState(screen || defaultTab);

  // Sync activeTab with URL param
  useEffect(() => {
    if (screen && screen !== activeTab) {
      setActiveTabState(screen);
    } else if (!screen && activeTab !== defaultTab) {
      // If no screen in URL, navigate to default tab
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/').filter(Boolean);
      if (pathParts[0] === 'dashboard' && pathParts[1]) {
        const dashboardName = pathParts[1];
        navigate(`/dashboard/${dashboardName}/${defaultTab}`, { replace: true });
      }
      setActiveTabState(defaultTab);
    }
  }, [screen, activeTab, defaultTab, navigate]);

  // Navigate function that updates URL
  const setActiveTab = (tab: string) => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    
    // Ensure we're in a dashboard route
    if (pathParts[0] === 'dashboard' && pathParts[1]) {
      const dashboardName = pathParts[1];
      navigate(`/dashboard/${dashboardName}/${tab}`, { replace: true });
      setActiveTabState(tab);
    } else {
      // Fallback to state-only navigation
      setActiveTabState(tab);
    }
  };

  return { activeTab, setActiveTab };
}
