import { apiRequest } from '../apiClient';

export interface GlobalSearchResult {
  query: string;
  results: {
    orders: SearchItem[];
    products: SearchItem[];
    users: SearchItem[];
    vendors: SearchItem[];
    riders: SearchItem[];
    inventory: SearchItem[];
  };
  total: number;
  took: number;
}

export interface SearchItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  status: string;
  metadata: Record<string, any>;
}

export interface SearchSuggestion {
  text: string;
  type: string;
  category: string;
}

/**
 * Global Search API
 */

/**
 * Perform global search across all modules
 */
export async function globalSearch(
  query: string,
  type: string = 'all',
  limit: number = 10
): Promise<GlobalSearchResult> {
  return apiRequest<GlobalSearchResult>(
    `/api/v1/shared/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
  );
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<SearchSuggestion[]> {
  const response = await apiRequest<{ success: boolean; data: SearchSuggestion[] }>(
    `/api/v1/shared/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.data || [];
}

/**
 * Get recent searches
 */
export async function getRecentSearches(limit: number = 10): Promise<string[]> {
  const response = await apiRequest<{ success: boolean; data: string[] }>(
    `/api/v1/shared/search/recent?limit=${limit}`
  );
  return response.data || [];
}
