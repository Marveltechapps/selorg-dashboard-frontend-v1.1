import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ShieldCheck, X, Package, User, Truck, Store, FileText, Loader2 } from 'lucide-react';
import { globalSearch, getRecentSearches, type GlobalSearchResult, type SearchItem } from '../../api/shared/globalSearchApi';
import { API_CONFIG } from '../../config/api';

/** In-app notification / alert from shared alerts API */
export interface AdminNotification {
  _id?: string;
  id?: string;
  alert_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  type?: string;
  createdAt?: string;
  lastUpdatedAt?: string;
  source?: { orderId?: string; riderName?: string };
}

async function fetchAdminNotifications(limit: number = 10): Promise<AdminNotification[]> {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_CONFIG.baseURL}/shared/alerts?limit=${limit}&status=all`, {
      headers: { Authorization: `Bearer ${token || ''}` },
    });
    if (!res.ok) return getMockNotifications();
    const data = await res.json();
    const list = data.alerts ?? data.data ?? data ?? [];
    const arr = Array.isArray(list) ? list : [];
    if (arr.length === 0) return getMockNotifications();
    return arr.map((a: any) => ({
      id: a.id ?? a._id ?? a.alert_id,
      _id: a._id,
      alert_id: a.alert_id,
      title: a.title ?? 'Notification',
      description: a.description ?? a.message,
      status: a.status,
      priority: a.priority,
      type: a.type,
      createdAt: a.createdAt ?? a.lastUpdatedAt ?? a.updatedAt,
      lastUpdatedAt: a.lastUpdatedAt ?? a.updatedAt,
      source: a.source,
    }));
  } catch {
    return getMockNotifications();
  }
}

function getMockNotifications(): AdminNotification[] {
  return [
    { id: '1', title: 'Order ORD-1001 delayed', description: 'Delivery ETA exceeded by 15 mins', status: 'open', priority: 'high', createdAt: new Date().toISOString() },
    { id: '2', title: 'Low stock alert', description: 'SKU-101 below minimum in Warehouse A', status: 'open', priority: 'medium', createdAt: new Date().toISOString() },
    { id: '3', title: 'New user signup', description: '50 new users in the last hour', status: 'open', priority: 'low', createdAt: new Date().toISOString() },
  ];
}

const DEBOUNCE_MS = 300;

/** Map search result type to admin tab and optional URL param */
function getTabForSearchType(type: string): string {
  const map: Record<string, string> = {
    order: 'citywide',
    orders: 'citywide',
    product: 'catalog',
    products: 'catalog',
    user: 'users',
    users: 'users',
    vendor: 'store-config',
    vendors: 'store-config',
    rider: 'citywide',
    riders: 'citywide',
    inventory: 'store-config',
  };
  return map[type] ?? 'citywide';
}

export interface AdminTopBarProps {
  onSearchResultSelect?: (type: string, item: SearchItem) => void;
  setActiveTab?: (tab: string) => void;
}

export function AdminTopBar({ onSearchResultSelect, setActiveTab }: AdminTopBarProps = {}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const notifWrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const result = await globalSearch(q.trim(), 'all', 15);
      setSearchResults(result);
    } catch {
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setRecentSearches([]);
      getRecentSearches(8).then(setRecentSearches).catch(() => setRecentSearches(['ORD-1001', 'SKU-101', 'PO-2024-001']));
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(searchQuery), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, runSearch]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;
    setNotificationsLoading(true);
    fetchAdminNotifications(15)
      .then((list) => setNotifications(list.length > 0 ? list : getMockNotifications()))
      .catch(() => setNotifications(getMockNotifications()))
      .finally(() => setNotificationsLoading(false));
  }, [notificationsOpen]);

  useEffect(() => {
    fetchAdminNotifications(10)
      .then((list) => setNotifications(list.length > 0 ? list : getMockNotifications()))
      .catch(() => setNotifications(getMockNotifications()));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = useCallback(
    (item: SearchItem) => {
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults(null);
      const tab = getTabForSearchType(item.type);
      onSearchResultSelect?.(item.type, item);
      setActiveTab?.(tab);
      const search = item.id ? `?highlight=${encodeURIComponent(item.id)}` : '';
      navigate(`/dashboard/admin/${tab}${search}`, { replace: true });
    },
    [navigate, onSearchResultSelect, setActiveTab]
  );

  const renderSearchDropdown = () => {
    if (!searchOpen) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e4e4e7] rounded-lg shadow-lg z-50 max-h-[420px] overflow-y-auto">
        {searchLoading && (
          <div className="flex items-center justify-center py-8 text-[#71717a]">
            <Loader2 size={20} className="animate-spin mr-2" />
            Searching...
          </div>
        )}
        {!searchLoading && searchQuery.trim().length >= 2 && searchResults && (
          <>
            <div className="p-2 border-b border-[#e4e4e7] text-xs text-[#71717a]">
              {searchResults.total} result(s) in {searchResults.took}ms
            </div>
            {[
              { key: 'orders', label: 'Orders', items: searchResults.results.orders, icon: FileText },
              { key: 'products', label: 'Products', items: searchResults.results.products, icon: Package },
              { key: 'users', label: 'Users', items: searchResults.results.users, icon: User },
              { key: 'vendors', label: 'Vendors', items: searchResults.results.vendors, icon: Store },
              { key: 'riders', label: 'Riders', items: searchResults.results.riders, icon: Truck },
              { key: 'inventory', label: 'Inventory', items: searchResults.results.inventory, icon: Package },
            ].map(
              (section) =>
                section.items.length > 0 && (
                  <div key={section.key} className="py-1">
                    <div className="px-3 py-1.5 text-xs font-semibold text-[#71717a] flex items-center gap-2">
                      <section.icon size={12} />
                      {section.label}
                    </div>
                    {section.items.map((item: SearchItem) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f4f4f5] text-left cursor-pointer rounded"
                      >
                        <span className="font-medium text-[#18181b] truncate">{item.title}</span>
                        <span className="text-xs text-[#71717a] truncate flex-1">{item.subtitle}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f5] text-[#71717a] shrink-0">{item.status}</span>
                      </button>
                    ))}
                  </div>
                )
            )}
            {searchResults.total === 0 && (
              <div className="py-8 text-center text-[#71717a] text-sm">No results for &quot;{searchQuery}&quot;</div>
            )}
          </>
        )}
        {!searchLoading && searchQuery.trim().length < 2 && (
          <div className="p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-[#71717a]">Recent searches</div>
            {recentSearches.length === 0 && <div className="px-2 py-4 text-xs text-[#a1a1aa]">No recent searches</div>}
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchQuery(term);
                  setSearchOpen(true);
                  runSearch(term);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-[#f4f4f5] text-left text-sm text-[#18181b]"
              >
                <Search size={14} className="text-[#a1a1aa]" />
                {term}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderNotificationsDropdown = () => {
    if (!notificationsOpen) return null;
    return (
      <div className="absolute top-full right-0 mt-1 w-[360px] bg-white border border-[#e4e4e7] rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
        <div className="p-3 border-b border-[#e4e4e7] flex items-center justify-between">
          <span className="font-semibold text-[#18181b]">Notifications</span>
          <button
            type="button"
            onClick={() => setNotificationsOpen(false)}
            className="p-1 rounded hover:bg-[#f4f4f5] text-[#71717a]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {notificationsLoading && (
          <div className="flex items-center justify-center py-8 text-[#71717a]">
            <Loader2 size={20} className="animate-spin mr-2" />
            Loading...
          </div>
        )}
        {!notificationsLoading && notifications.length === 0 && (
          <div className="py-8 text-center text-[#71717a] text-sm">No new notifications</div>
        )}
        {!notificationsLoading &&
          notifications.map((n) => (
            <div
              key={n.id ?? n._id ?? n.alert_id ?? n.title}
              className="p-3 border-b border-[#f4f4f5] last:border-0 hover:bg-[#fafafa]"
            >
              <p className="font-medium text-[#18181b] text-sm">{n.title}</p>
              {n.description && <p className="text-xs text-[#71717a] mt-0.5">{n.description}</p>}
              <p className="text-[10px] text-[#a1a1aa] mt-1">
                {n.priority && <span className="capitalize">{n.priority}</span>}
                {n.createdAt && ` · ${new Date(n.createdAt).toLocaleString()}`}
              </p>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="h-[64px] bg-white border-b border-[#e4e4e7] fixed top-0 left-[260px] right-0 z-40 flex items-center px-8 justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4 flex-1 max-w-xl" ref={searchWrapRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={16} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for orders, users, stores, or config keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="h-10 pl-10 pr-12 w-full rounded-lg bg-[#f4f4f5] border-transparent text-sm focus:bg-white focus:ring-2 focus:ring-[#e11d48] focus:border-transparent transition-all placeholder-[#a1a1aa] text-[#18181b]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <div className="px-1.5 py-0.5 rounded border border-[#d4d4d8] bg-white text-[10px] text-[#71717a] font-mono">
              ⌘K
            </div>
          </div>
          {renderSearchDropdown()}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100">
          <ShieldCheck size={14} className="text-[#e11d48]" />
          <span className="text-xs font-medium text-rose-900">Prod Environment</span>
        </div>

        <div className="h-6 w-px bg-[#e4e4e7] mx-2" />

        <div className="relative" ref={notifWrapRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((o) => !o)}
            className="relative p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-full transition-colors group"
            aria-label="Notifications"
          >
            <Bell size={20} className="group-hover:text-[#18181b]" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[#e11d48] rounded-full border-2 border-white">
                {notifications.length > 99 ? '99+' : notifications.length}
              </span>
            )}
          </button>
          {renderNotificationsDropdown()}
        </div>
      </div>
    </div>
  );
}
