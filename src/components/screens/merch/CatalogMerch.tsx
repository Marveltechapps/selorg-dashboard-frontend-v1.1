import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Database } from 'lucide-react';
import { toast } from "sonner";
import { catalogApi } from '../../../api/merch/catalogApi';

import { SearchFilterBar, FilterState } from './catalog/SearchFilterBar';
import { ActiveCollections } from './catalog/ActiveCollections';
import { SKUVisibility } from './catalog/SKUVisibility';
import { CollectionDrawer } from './catalog/CollectionDrawer';
import { CreateCollectionModal } from './catalog/CreateCollectionModal';
import { SKUEditDrawer } from './catalog/SKUEditDrawer';
import { AddSKUModal } from './catalog/AddSKUModal';
import { CollectionsListModal } from './catalog/CollectionsListModal';
import { Collection, SKU, Region, SKUVisibilityStatus } from './catalog/types';

export function CatalogMerch({ searchQuery = "" }: { searchQuery?: string }) {
  // Data State - Using Real API
  const [collections, setCollections] = useState<Collection[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from API and localStorage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [collectionsResp, skusResp] = await Promise.all([
          catalogApi.getCollections(),
          catalogApi.getSKUs()
        ]);
        if (!mounted) return;
        
        // Collections: API already merges with localStorage
        if (collectionsResp.success && collectionsResp.data) {
          setCollections(collectionsResp.data);
        } else {
          // Fallback: try loading from localStorage directly
          try {
            const stored = localStorage.getItem('catalog_collections');
            if (stored) {
              setCollections(JSON.parse(stored));
            }
          } catch (e) {
            console.error('Error loading collections from localStorage:', e);
          }
        }
        
        // SKUs: API already merges with localStorage, but need to convert format
        if (skusResp.success && skusResp.data) {
          // Convert API SKU format to local SKU format
          const convertedSKUs: SKU[] = skusResp.data.map((apiSku: any) => ({
            id: apiSku.id,
            code: apiSku.sku || apiSku.code || apiSku.id,
            name: apiSku.name,
            category: apiSku.category || 'Uncategorized',
            brand: apiSku.brand || 'Generic',
            price: apiSku.price || 0,
            stock: apiSku.stock || 0,
            visibility: apiSku.visibility || { 'North America': 'Visible', 'Europe (West)': 'Hidden', 'APAC': 'Hidden' },
            tags: apiSku.tags || [],
            imageUrl: apiSku.imageUrl
          }));
          setSkus(convertedSKUs);
        } else {
          // Fallback: try loading from localStorage directly
          try {
            const stored = localStorage.getItem('catalog_skus');
            if (stored) {
              const storedSKUs = JSON.parse(stored);
              const convertedSKUs: SKU[] = storedSKUs.map((apiSku: any) => ({
                id: apiSku.id,
                code: apiSku.sku || apiSku.code || apiSku.id,
                name: apiSku.name,
                category: apiSku.category || 'Uncategorized',
                brand: apiSku.brand || 'Generic',
                price: apiSku.price || 0,
                stock: apiSku.stock || 0,
                visibility: apiSku.visibility || { 'North America': 'Visible', 'Europe (West)': 'Hidden', 'APAC': 'Hidden' },
                tags: apiSku.tags || [],
                imageUrl: apiSku.imageUrl
              }));
              setSkus(convertedSKUs);
            }
          } catch (e) {
            console.error('Error loading SKUs from localStorage:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load catalog data', err);
        // Don't show error toast - localStorage fallback will handle it
        // Try loading from localStorage as last resort
        try {
          const storedCollections = localStorage.getItem('catalog_collections');
          const storedSKUs = localStorage.getItem('catalog_skus');
          if (storedCollections) {
            setCollections(JSON.parse(storedCollections));
          }
          if (storedSKUs) {
            const stored = JSON.parse(storedSKUs);
            const convertedSKUs: SKU[] = stored.map((apiSku: any) => ({
              id: apiSku.id,
              code: apiSku.sku || apiSku.code || apiSku.id,
              name: apiSku.name,
              category: apiSku.category || 'Uncategorized',
              brand: apiSku.brand || 'Generic',
              price: apiSku.price || 0,
              stock: apiSku.stock || 0,
              visibility: apiSku.visibility || { 'North America': 'Visible', 'Europe (West)': 'Hidden', 'APAC': 'Hidden' },
              tags: apiSku.tags || [],
              imageUrl: apiSku.imageUrl
            }));
            setSkus(convertedSKUs);
          }
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  // UI State
  const [filters, setFilters] = useState<FilterState>({
    collectionStatus: 'All',
    collectionType: 'All',
    skuVisibility: 'All'
  });
  const [currentRegion, setCurrentRegion] = useState<Region>('North America'); 

  // Drawer/Modal State
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [isAddSKUOpen, setIsAddSKUOpen] = useState(false);
  const [isCollectionsListOpen, setIsCollectionsListOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Derived State (Filtering)
  const filteredCollections = collections.filter(col => {
    if (searchQuery && !col.name.toLowerCase().includes(searchQuery.toLowerCase()) && !col.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (filters.collectionStatus !== 'All' && col.status !== filters.collectionStatus) return false;
    if (filters.collectionType !== 'All' && col.type !== filters.collectionType) return false;
    return true;
  });

  const filteredSkus = skus.filter(sku => {
    if (searchQuery && !sku.name.toLowerCase().includes(searchQuery.toLowerCase()) && !sku.code.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
    }
    const isVisibleInRegion = sku.visibility[currentRegion] === 'Visible';
    if (filters.skuVisibility === 'Visible' && !isVisibleInRegion) return false;
    if (filters.skuVisibility === 'Hidden' && isVisibleInRegion) return false;
    return true;
  });

  // Handlers - Updated to use API with localStorage persistence
  const handleCreateCollection = async (data: any) => {
    setIsLoading(true);
    try {
      if (editingCollection) {
        // Update existing collection
        const updatedCollection: Collection = {
          ...editingCollection,
          ...data,
          updatedAt: new Date().toLocaleDateString(),
          imageUrl: data.media || editingCollection.imageUrl
        };
        
        // Save to localStorage directly
        try {
          const storedCollections = JSON.parse(localStorage.getItem('catalog_collections') || '[]');
          const index = storedCollections.findIndex((c: Collection) => c.id === editingCollection.id);
          if (index !== -1) {
            storedCollections[index] = updatedCollection;
            localStorage.setItem('catalog_collections', JSON.stringify(storedCollections));
          }
        } catch (e) {
          console.error('Error saving collection to localStorage:', e);
        }
        
        // Call API
        try {
          await catalogApi.updateCollection(editingCollection.id, updatedCollection);
        } catch (apiError) {
          console.error('API call failed, but collection saved to localStorage:', apiError);
        }
        
        setCollections(collections.map(c => c.id === editingCollection.id ? updatedCollection : c));
        setEditingCollection(null);
        toast.success("Collection updated successfully");
      } else {
        // Create new collection
        const newCollection: Collection = {
          id: `col-${Date.now()}`,
          name: data.name,
          description: data.description,
          type: data.type,
          status: data.status,
          tags: data.tags || [],
          skus: data.skus || [],
          region: data.region || 'Global',
          updatedAt: new Date().toLocaleDateString(),
          imageUrl: data.media,
          owner: 'You'
        };
        
        // Save to localStorage directly
        try {
          const storedCollections = JSON.parse(localStorage.getItem('catalog_collections') || '[]');
          storedCollections.unshift(newCollection);
          localStorage.setItem('catalog_collections', JSON.stringify(storedCollections));
        } catch (e) {
          console.error('Error saving collection to localStorage:', e);
        }
        
        // Call API
        try {
          await catalogApi.createCollection(newCollection);
        } catch (apiError) {
          console.error('API call failed, but collection saved to localStorage:', apiError);
        }
        
        setCollections([newCollection, ...collections]);
        toast.success("Collection created successfully");
      }
    } catch (error) {
      console.error('Error creating/updating collection:', error);
      toast.error("Failed to save collection");
    } finally {
      setIsLoading(false);
      setIsCreateCollectionOpen(false);
    }
  };

  const handleDuplicateCollection = async (col: Collection) => {
    try {
      const duplicateData = {
        name: `${col.name} (Copy)`,
        description: col.description,
        type: col.type,
        status: col.status,
        tags: col.tags,
        skus: col.skus,
        region: col.region,
        imageUrl: col.imageUrl,
        owner: 'You'
      };
      const response = await catalogApi.createCollection(duplicateData);
      if (response.success && response.data) {
        setCollections([response.data, ...collections]);
        toast.success(`${col.name} duplicated successfully`);
      } else {
        toast.error("Failed to duplicate collection");
      }
    } catch (error) {
      console.error('Error duplicating collection:', error);
      toast.error("Failed to duplicate collection");
    }
  };

  const handleArchiveCollection = async (col: Collection) => {
    try {
      const response = await catalogApi.updateCollection(col.id, { status: 'Archived' as any });
      if (response.success) {
        setCollections(collections.map(c => c.id === col.id ? { ...c, status: 'Archived' } : c));
        toast.success(`${col.name} archived successfully`);
      } else {
        toast.error("Failed to archive collection");
      }
    } catch (error) {
      console.error('Error archiving collection:', error);
      toast.error("Failed to archive collection");
    }
    setSelectedCollection(null);
  };

  const handleAddSKU = async (data: any) => {
      setIsLoading(true);
      try {
          // Create full SKU object
          const fullSKUData: SKU = {
              id: `sku-${Date.now()}`,
              code: data.code || 'NEW-SKU-001',
              name: data.name || 'New Product',
              category: data.category || 'Uncategorized',
              brand: data.brand || 'Generic',
              price: data.price || 0,
              stock: data.stock || 0,
              visibility: { 'North America': 'Visible', 'Europe (West)': 'Hidden', 'APAC': 'Hidden' },
              tags: [],
              imageUrl: data.images?.[0]
          };
          
          // Save to localStorage directly (the API function will also save, but we want the full object)
          try {
              const storedSKUs = JSON.parse(localStorage.getItem('catalog_skus') || '[]');
              storedSKUs.unshift(fullSKUData);
              localStorage.setItem('catalog_skus', JSON.stringify(storedSKUs));
          } catch (e) {
              console.error('Error saving SKU to localStorage:', e);
          }
          
          // Create API format for the call
          const skuData = {
              sku: fullSKUData.code,
              name: fullSKUData.name,
              category: fullSKUData.category,
              price: fullSKUData.price,
              status: 'active' as const
          };
          
          // Call API (it will also save to localStorage, but we've already saved the full object)
          try {
              await catalogApi.createSKU(skuData as any);
          } catch (apiError) {
              // API failed but localStorage is already updated
              console.error('API call failed, but SKU saved to localStorage:', apiError);
          }
          
          // Update state with the full SKU object
          setSkus([fullSKUData, ...skus]);
          toast.success("SKU created successfully");
      } catch (error) {
          console.error('Error creating SKU:', error);
          toast.error("Failed to create SKU");
      } finally {
          setIsLoading(false);
          setIsAddSKUOpen(false);
      }
  };

  const handleToggleVisibility = async (sku: SKU, region: Region | 'Global') => {
      const newStatus: SKUVisibilityStatus = sku.visibility[region as Region] === 'Visible' ? 'Hidden' : 'Visible';
      // Optimistic update
      setSkus(skus.map(s => {
          if (s.id === sku.id) {
              return { ...s, visibility: { ...s.visibility, [region as Region]: newStatus } };
          }
          return s;
      }));
      
      // Save to localStorage
      try {
          await catalogApi.updateSKU(sku.id, {
              ...sku,
              visibility: { ...sku.visibility, [region as Region]: newStatus }
          } as any);
          toast.success(`SKU visibility updated successfully`);
      } catch (error) {
          console.error('Error updating SKU visibility:', error);
          toast.success(`SKU visibility updated`);
      }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Catalog Merchandising</h1>
          <p className="text-[#757575] text-sm">Product visibility, collections, and media assets for <span className="font-semibold text-purple-600">{currentRegion}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCreateCollectionOpen(true)}
            className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Create Collection
          </button>
          <button 
            onClick={() => setIsAddSKUOpen(true)}
            className="px-4 py-2 bg-[#7C3AED] text-white font-medium rounded-lg hover:bg-[#6D28D9] flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add SKU
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar 
        onSearch={() => {}} // Internal search disabled as global search is used
        onFilterChange={setFilters}
        recentSearches={['Summer', 'Beverages', 'New Arrivals']}
        allCollections={collections}
        allSkus={skus}
        onSelectCollection={(col) => setSelectedCollection(col)}
        onSelectSKU={(sku) => setSelectedSKU(sku)}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          {/* Active Collections Panel (Left - 5 cols) */}
          <div className="lg:col-span-5 h-full">
            <ActiveCollections 
                collections={filteredCollections}
                onSelectCollection={setSelectedCollection}
                onViewAll={() => setIsCollectionsListOpen(true)}
                isLoading={isLoading}
            />
          </div>

          {/* SKU Visibility Panel (Right - 7 cols) */}
          <div className="lg:col-span-7 h-full">
            <SKUVisibility 
                skus={filteredSkus}
                currentRegion={currentRegion}
                onToggleVisibility={handleToggleVisibility}
                onEditSKU={setSelectedSKU}
                isLoading={isLoading}
            />
          </div>
      </div>

      {/* Drawers & Modals */}
      <CollectionDrawer 
        collection={selectedCollection}
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
        onEdit={(col) => {
            setEditingCollection(col);
            setIsCreateCollectionOpen(true);
            setSelectedCollection(null);
        }}
        onDuplicate={handleDuplicateCollection}
        onArchive={handleArchiveCollection}
      />

      <SKUEditDrawer 
        sku={selectedSKU}
        isOpen={!!selectedSKU}
        onClose={() => setSelectedSKU(null)}
        onSave={async (updatedSku) => {
            try {
              const response = await catalogApi.updateSKU(updatedSku.id, {
                sku: updatedSku.code,
                name: updatedSku.name,
                category: updatedSku.category,
                price: updatedSku.price,
                status: 'active'
              });
              if (response.success) {
                setSkus(skus.map(s => s.id === updatedSku.id ? updatedSku : s));
                setSelectedSKU(null);
                toast.success("SKU updated successfully");
              } else {
                toast.error("Failed to update SKU");
              }
            } catch (error) {
              console.error('Error updating SKU:', error);
              toast.error("Failed to update SKU");
            }
        }}
      />

      <CreateCollectionModal 
        isOpen={isCreateCollectionOpen}
        onClose={() => {
            setIsCreateCollectionOpen(false);
            setEditingCollection(null);
        }}
        onSubmit={handleCreateCollection}
        initialData={editingCollection}
      />

      <AddSKUModal 
        isOpen={isAddSKUOpen}
        onClose={() => setIsAddSKUOpen(false)}
        onSubmit={handleAddSKU}
      />

      <CollectionsListModal 
        isOpen={isCollectionsListOpen}
        onClose={() => setIsCollectionsListOpen(false)}
        collections={collections}
        onSelectCollection={(col) => {
            setSelectedCollection(col);
            setIsCollectionsListOpen(false);
        }}
        onEdit={(col) => {
            setEditingCollection(col);
            setIsCreateCollectionOpen(true);
            setIsCollectionsListOpen(false);
        }}
        onDuplicate={handleDuplicateCollection}
        onArchive={handleArchiveCollection}
      />
    </div>
  );
}
