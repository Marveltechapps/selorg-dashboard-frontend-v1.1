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

  // Load data from API
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
        
        if (collectionsResp.success && collectionsResp.data) {
          setCollections(collectionsResp.data);
        }
        if (skusResp.success && skusResp.data) {
          setSkus(skusResp.data);
        }
      } catch (err) {
        console.error('Failed to load catalog data', err);
        toast.error('Failed to load catalog');
        setCollections([]);
        setSkus([]);
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

  // Handlers - Updated to use local state only
  const handleCreateCollection = (data: any) => {
    setIsLoading(true);
    setTimeout(() => {
        if (editingCollection) {
            setCollections(collections.map(c => c.id === editingCollection.id ? { 
                ...c, 
                ...data, 
                updatedAt: new Date().toLocaleDateString() 
            } : c));
            setEditingCollection(null);
            toast.success("Collection updated locally");
        } else {
            const newCol: Collection = {
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
            setCollections([newCol, ...collections]);
            toast.success("Collection created locally");
        }
        setIsLoading(false);
        setIsCreateCollectionOpen(false);
    }, 500);
  };

  const handleDuplicateCollection = (col: Collection) => {
    const newCol: Collection = {
      ...col,
      id: `col-${Date.now()}`,
      name: `${col.name} (Copy)`,
      updatedAt: new Date().toLocaleDateString(),
    };
    setCollections([newCol, ...collections]);
    toast.success(`${col.name} duplicated locally`);
  };

  const handleArchiveCollection = (col: Collection) => {
    setCollections(collections.map(c => c.id === col.id ? { ...c, status: 'Archived' } : c));
    toast.error(`${col.name} archived locally`);
    setSelectedCollection(null);
  };

  const handleAddSKU = (data: any) => {
      setIsLoading(true);
      setTimeout(() => {
          const newSKU: SKU = {
              id: `sku-${Date.now()}`,
              code: data.code || 'NEW-SKU-001',
              name: data.name || 'New Product',
              category: data.category || 'Uncategorized',
              brand: 'Generic',
              price: data.price || 0,
              stock: data.stock || 0,
              visibility: { 'North America': 'Visible', 'Europe (West)': 'Hidden', 'APAC': 'Hidden' },
              tags: []
          };
          setSkus([newSKU, ...skus]);
          setIsLoading(false);
          toast.success("SKU created locally");
          setIsAddSKUOpen(false);
      }, 500);
  };

  const handleToggleVisibility = (sku: SKU, region: Region | 'Global') => {
      const newStatus: SKUVisibilityStatus = sku.visibility[region as Region] === 'Visible' ? 'Hidden' : 'Visible';
      setSkus(skus.map(s => {
          if (s.id === sku.id) {
              return { ...s, visibility: { ...s.visibility, [region as Region]: newStatus } };
          }
          return s;
      }));
      toast.success(`SKU visibility updated locally`);
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
        onSave={(updatedSku) => {
            setSkus(skus.map(s => s.id === updatedSku.id ? updatedSku : s));
            setSelectedSKU(null);
            toast.success("SKU updated locally");
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
