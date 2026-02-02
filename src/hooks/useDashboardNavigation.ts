import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * Hook for URL-based navigation within dashboards.
 * Syncs state from URL only; never calls navigate() inside useEffect to avoid
 * "Maximum update depth exceeded" (router re-renders before location updates, effect re-runs, loop).
 */
export function useDashboardNavigation(defaultTab: string = 'overview') {
  const { screen } = useParams<{ screen?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState(screen || defaultTab);

  // Only sync URL -> state. Do NOT navigate here (causes infinite loop with react-router).
  useEffect(() => {
    const tabFromUrl = screen || defaultTab;
    setActiveTabState(tabFromUrl);
  }, [screen, defaultTab]);

  // Navigate function: updates URL when user clicks a tab
  const setActiveTab = (tab: string) => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);

    if (pathParts[0] === 'dashboard' && pathParts[1]) {
      const dashboardName = pathParts[1];
      navigate(`/dashboard/${dashboardName}/${tab}`, { replace: true });
      setActiveTabState(tab);
    } else {
      setActiveTabState(tab);
    }
  };

  return { activeTab, setActiveTab };
}
