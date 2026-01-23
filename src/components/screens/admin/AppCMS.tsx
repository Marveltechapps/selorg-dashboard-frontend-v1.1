import { useState, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Search,
  MapPin,
  User,
  ShoppingCart,
  Home,
  Menu,
  Zap,
  Plus,
  Trash2,
  GripVertical,
  Smartphone,
  Image as ImageIcon,
  List,
  Grid,
  Play,
  ChevronLeft,
  Save,
  ChevronDown,
  Check,
  X,
  Heart,
  UserCircle,
  ArrowLeft,
  Share2,
  Star,
  Filter,
  LayoutTemplate,
  Columns,
  Rows,
  Monitor,
  CheckCircle2,
  Circle,
  ImageIcon as ImageIconSmall,
  ChevronRight,
  MoreVertical,
  Timer,
  CircleDashed,
  PlayCircle
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Separator } from "../../ui/separator";
import { ImageWithFallback } from "../../figma/ImageWithFallback";

// --- Utilities ---

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Types ---

type SectionType = "banner" | "category-grid" | "product-list" | "wellbeing-grid" | "lifestyle-banner" | "header-search" | "flash-sale" | "stories";

interface Section {
  id: string;
  type: SectionType;
  title?: string;
  data: any;
}

interface Product {
  id: string;
  name: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount: string | null;
  image: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
}

// --- Mock Data ---

const CATEGORIES: Category[] = [
  { id: "1", name: "Fresh Vegetables", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&q=80" },
  { id: "2", name: "Fresh Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80" },
  { id: "3", name: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&q=80" },
  { id: "4", name: "Atta, Rice & Dal", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80" },
  { id: "5", name: "Oil & Ghee", image: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=200&q=80" },
  { id: "6", name: "Masala & Spices", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&q=80" },
  { id: "7", name: "Salt, Sugar & Jaggery", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80" },
  { id: "8", name: "Dry Fruits & Seeds", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&q=80" },
  { id: "9", name: "Tea & Coffee", image: "https://images.unsplash.com/photo-1571934811356-5cc55449d0a4?w=200&q=80" },
];

const PRODUCTS: Product[] = [
  // Fruits
  { id: "f1", name: "Fresh Banana Robusta", weight: "500g", price: 40, originalPrice: 50, discount: "20% OFF", image: "https://images.unsplash.com/photo-1603833665858-e61c17a86271?w=400&q=80", categoryId: "fruits" },
  { id: "f2", name: "Shimla Apple", weight: "4 pcs", price: 150, originalPrice: 180, discount: "15% OFF", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80", categoryId: "fruits" },
  { id: "f3", name: "Pomegranate (Anar)", weight: "3 pcs", price: 120, originalPrice: 140, discount: "14% OFF", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80", categoryId: "fruits" },
  { id: "f4", name: "Nagpur Orange", weight: "1kg", price: 80, originalPrice: 100, discount: "20% OFF", image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80", categoryId: "fruits" },
  { id: "f5", name: "Alphonso Mango", weight: "6 pcs", price: 450, originalPrice: 600, discount: "25% OFF", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80", categoryId: "fruits" },
  { id: "f6", name: "Watermelon Kiran", weight: "1 pc (2-3kg)", price: 45, originalPrice: 60, discount: "25% OFF", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80", categoryId: "fruits" },
  { id: "f7", name: "Green Grapes (Seedless)", weight: "500g", price: 60, originalPrice: 80, discount: "25% OFF", image: "https://images.unsplash.com/photo-1596363505729-41905a943e30?w=400&q=80", categoryId: "fruits" },
  { id: "f8", name: "Organic Kiwi", weight: "3 pcs", price: 120, originalPrice: 150, discount: "20% OFF", image: "https://images.unsplash.com/photo-1585059895524-72359e06138a?w=400&q=80", categoryId: "fruits" },

  // Veggies
  { id: "v1", name: "Farm Fresh Carrot", weight: "500g", price: 40, originalPrice: 50, discount: "20% OFF", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80", categoryId: "veggies" },
  { id: "v2", name: "Potato (Aloo)", weight: "1kg", price: 30, originalPrice: 40, discount: "25% OFF", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80", categoryId: "veggies" },
  { id: "v3", name: "Onion (Pyaaz)", weight: "1kg", price: 35, originalPrice: 45, discount: "22% OFF", image: "https://images.unsplash.com/photo-1508747703703-06f557e717d7?w=400&q=80", categoryId: "veggies" },
  { id: "v4", name: "Tomato (Hybrid)", weight: "500g", price: 20, originalPrice: 30, discount: "33% OFF", image: "https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400&q=80", categoryId: "veggies" },
  { id: "v5", name: "Spinach (Palak)", weight: "250g", price: 15, originalPrice: 20, discount: "25% OFF", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80", categoryId: "veggies" },
  { id: "v6", name: "Coriander (Dhania)", weight: "100g", price: 10, originalPrice: 15, discount: "33% OFF", image: "https://images.unsplash.com/photo-1588856818070-635c94891a91?w=400&q=80", categoryId: "veggies" },
  { id: "v7", name: "Fresh Mint (Pudina)", weight: "100g", price: 12, originalPrice: 18, discount: "33% OFF", image: "https://images.unsplash.com/photo-1626420924960-9e032e012386?w=400&q=80", categoryId: "veggies" },

  // Dairy & Eggs
  { id: "d1", name: "Amul Taaza Milk", weight: "500ml", price: 27, originalPrice: 28, discount: "1% OFF", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80", categoryId: "dairy" },
  { id: "d2", name: "Amul Gold Full Cream", weight: "500ml", price: 33, originalPrice: 34, discount: null, image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80", categoryId: "dairy" },
  { id: "d3", name: "Cow Milk", weight: "1L", price: 75, originalPrice: 80, discount: "5% OFF", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", categoryId: "dairy" },
  { id: "d4", name: "Farm Fresh Eggs", weight: "6 pcs", price: 48, originalPrice: 55, discount: "12% OFF", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&q=80", categoryId: "dairy" },
  { id: "d5", name: "Brown Eggs", weight: "6 pcs", price: 65, originalPrice: 75, discount: "13% OFF", image: "https://images.unsplash.com/photo-1511205344301-ed72a426c4bc?w=400&q=80", categoryId: "dairy" },
  { id: "d6", name: "Amul Butter", weight: "100g", price: 56, originalPrice: 58, discount: "3% OFF", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80", categoryId: "dairy" },
  { id: "d7", name: "Cow Ghee", weight: "500ml", price: 450, originalPrice: 520, discount: "15% OFF", image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=400&q=80", categoryId: "dairy" },
  { id: "d8", name: "Cheese Slices", weight: "200g", price: 130, originalPrice: 145, discount: "10% OFF", image: "https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=400&q=80", categoryId: "dairy" },
];

const INITIAL_SECTIONS: Section[] = [
  {
    id: "s1",
    type: "banner",
    data: {
      layout: "carousel",
      banners: [
        {
          id: "b1",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
          title: "Fresh Fruits & Veggies",
          variant: "standard",
          linkedProductIds: ["f1", "v1", "f2"]
        },
         {
          id: "b2",
          image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80",
          title: "Daily Essentials",
          variant: "standard",
          linkedProductIds: ["d1", "d4", "d6"]
        },
      ],
    },
  },
  {
    id: "s2",
    type: "category-grid",
    title: "Grocery & Kitchen",
    data: {
      mainCategories: [
        {
          id: "mc1",
          name: "Fruits",
          image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80",
          subCategories: [
            { id: "sc1", name: "Fresh Fruits", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80", linkedProductIds: ["f1", "f2", "f3", "f4"] },
            { id: "sc2", name: "Seasonal Fruits", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&q=80", linkedProductIds: ["f5", "f6", "f7"] },
            { id: "sc3", name: "Exotic Fruits", image: "https://images.unsplash.com/photo-1585059895524-72359e06138a?w=200&q=80", linkedProductIds: ["f8", "f3"] }
          ]
        },
        {
          id: "mc2",
          name: "Vegetables",
          image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&q=80",
          subCategories: [
            { id: "sc4", name: "Seasonal Veggies", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&q=80", linkedProductIds: ["v1", "v2", "v3", "v4"] },
            { id: "sc5", name: "Leafy Veggies", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80", linkedProductIds: ["v5"] },
            { id: "sc6", name: "Fresh Herbs", image: "https://images.unsplash.com/photo-1626420924960-9e032e012386?w=200&q=80", linkedProductIds: ["v6", "v7"] }
          ]
        },
        {
          id: "mc3",
          name: "Dairy & Eggs",
          image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&q=80",
          subCategories: [
            { id: "sc7", name: "Fresh Milk", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80", linkedProductIds: ["d1", "d2", "d3"] },
            { id: "sc8", name: "Eggs", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200&q=80", linkedProductIds: ["d4", "d5"] },
            { id: "sc9", name: "Butter & Ghee", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80", linkedProductIds: ["d6", "d7", "d8"] }
          ]
        }
      ]
    },
  },
  {
    id: "s3",
    type: "banner",
    data: {
      layout: "stack",
      banners: [
        {
          id: "b_moringa",
          image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=800&q=80",
          title: "MORINGA",
          subtitle: "Packed with 90+ nutrients",
          variant: "large",
          linkedProductIds: ["v5", "v7"]
        },
      ],
    },
  },
  {
    id: "s4",
    type: "product-list",
    title: "Deal at Lowest Price",
    data: {
      productIds: ["f1", "v3", "d1"],
    },
  },
  {
    id: "s5",
    type: "wellbeing-grid",
    title: "Designed for Well-being",
    data: {
        items: [
            { title: "Tiny Tummies", desc: "Wholesome food for growing children", image: "https://images.unsplash.com/photo-1519238263496-6359d7c6ce44?w=200&q=80" },
            { title: "Adult Well-being", desc: "Vitality for your busiest years", image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80" },
            { title: "Her Glow", desc: "Nurturing, blossoming women", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80" },
            { title: "Golden Years", desc: "Safe, mild & healthy foods", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80" },
        ]
    }
  },
  {
    id: "s6",
    type: "lifestyle-banner",
    title: "Level Up Your Lifestyle",
    data: {
       items: [
           { title: "Corporate Menu", image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400&q=80" },
           { title: "Gym Diet", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80" },
       ]
    }
  }
];

// --- Drag & Drop Item Component ---

const DraggableSectionItem = ({ section, index, moveSection, onEdit, onDelete, isActive }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "SECTION",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: () => {
      return { id: section.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const getIcon = () => {
    switch (section.type) {
      case "banner": return ImageIcon;
      case "product-list": return ShoppingCart;
      case "category-grid": return Grid;
      case "wellbeing-grid": return Heart;
      case "lifestyle-banner": return Zap;
      case "flash-sale": return Timer;
      case "stories": return PlayCircle;
      default: return List;
    }
  };

  const Icon = getIcon();

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`flex items-center justify-between p-3 bg-white dark:bg-slate-900 border rounded-lg mb-2 cursor-move transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isActive ? "ring-2 ring-[#4A7D5B] border-transparent" : "hover:border-slate-300"}`}
      onClick={onEdit}
    >
      <div className="flex items-center gap-3">
        <GripVertical className="text-slate-400 w-5 h-5" />
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
          <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </div>
        <div>
          <div className="font-medium text-sm capitalize">
            {section.title || section.type.replace("-", " ")}
          </div>
          <div className="text-xs text-muted-foreground">
             {section.type === 'banner' ? 'Banner Section' : 'Content Section'}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-red-500"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

// --- Preview Components (The "UI" Implementation) ---

// Navigation State Types
type Screen = 
  | { type: "home" }
  | { type: "category-detail", title: string, mainCategories: any[], activeId: string }
  | { type: "product-list", title: string, products: Product[], internalBanner?: any }
  | { type: "product-detail", product: Product };

const MobilePreview = ({ sections }: { sections: Section[] }) => {
  // Navigation Stack for Infinite Depth
  const [navStack, setNavStack] = useState<Screen[]>([{ type: "home" }]);
  
  const currentScreen = navStack[navStack.length - 1];

  const pushScreen = (screen: Screen) => {
      setNavStack(prev => [...prev, screen]);
  }

  const popScreen = () => {
      setNavStack(prev => {
          if (prev.length <= 1) return prev;
          return prev.slice(0, -1);
      });
  }

  const handleBannerClick = (banner: any) => {
    if (banner.linkedProductIds && banner.linkedProductIds.length > 0) {
      const products = PRODUCTS.filter(p => banner.linkedProductIds.includes(p.id));
      pushScreen({ 
        type: "product-list", 
        title: banner.title || "Products", 
        products,
        internalBanner: banner.landingBanner // Pass the nested banner config
      });
    }
  };
  
  const handleCategoryClick = (category: any, allCategories: any[]) => {
      pushScreen({
          type: "category-detail",
          title: "Categories",
          mainCategories: allCategories,
          activeId: category.id
      });
  }

  const handleProductClick = (product: Product) => {
      pushScreen({ type: "product-detail", product });
  }

  return (
    <div className="w-[375px] h-[780px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden relative flex flex-col font-sans transition-all">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-50"></div>

      {/* Status Bar */}
      <div className="h-10 bg-white w-full flex items-center justify-between px-6 pt-2 z-40 text-slate-900 flex-shrink-0">
        <span className="text-[12px] font-bold">9:41</span>
        <div className="flex items-center gap-1.5">
           <div className="h-2.5 w-4 rounded-sm border border-slate-900 flex items-center px-0.5">
             <div className="h-1.5 w-full bg-slate-900 rounded-[1px]" />
           </div>
        </div>
      </div>

      {currentScreen.type === "home" && (
        <>
          {/* Header (Fixed) - Matching Design */}
          <div className="px-4 py-3 bg-white sticky top-0 z-30 border-b border-transparent transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                 <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                    Deliver to: Other <ChevronDown className="w-3 h-3" />
                 </div>
                 <div className="text-slate-900 font-medium text-sm truncate w-48">
                    Green Park, Delhi, India
                 </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600">
                 <UserCircle className="w-6 h-6" />
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search for 'Oil'" 
                className="pl-9 bg-white border border-slate-200 shadow-sm h-10 rounded-lg text-sm placeholder:text-slate-400" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-auto bg-white [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-sm hover:[&::-webkit-scrollbar-thumb]:bg-white/70" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.4) transparent' }}>
            <div className="pb-24">
              {sections.map((section) => (
                <div key={section.id} className="mb-1">
                  {section.type === "banner" && <BannerSection data={section.data} onBannerClick={handleBannerClick} />}
                  {section.type === "category-grid" && <CategoryGridSection title={section.title} data={section.data} onCategoryClick={handleCategoryClick} />}
                  {section.type === "product-list" && <ProductListSection title={section.title} data={section.data} />}
                  {section.type === "wellbeing-grid" && <WellbeingSection title={section.title} data={section.data} />}
                  {section.type === "lifestyle-banner" && <LifestyleSection title={section.title} data={section.data} />}
                  {section.type === "flash-sale" && <FlashSaleSection title={section.title} data={section.data} />}
                  {section.type === "stories" && <StoriesSection data={section.data} />}
                </div>
              ))}
               
               <div className="p-8 text-center">
                  <h3 className="text-xl font-serif text-slate-400 mb-1 font-bold">Organic in Minutes,</h3>
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-lg font-serif">
                     Freshness Always <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom Nav - Matching Design */}
          <div className="bg-white border-t border-slate-100 h-16 flex items-center justify-around px-6 absolute bottom-0 w-full z-30">
            <div className="flex flex-col items-center gap-1 text-[#4A7D5B]">
               <Home className="w-6 h-6 fill-current" />
               <span className="text-[10px] font-medium">Home</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400">
               <Grid className="w-6 h-6" />
               <span className="text-[10px] font-medium">Category</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400">
               <ShoppingCart className="w-6 h-6" />
               <span className="text-[10px] font-medium">Cart</span>
            </div>
          </div>
        </>
      )}
      
      {currentScreen.type === "category-detail" && (
         <CategoryDetailView
            title={currentScreen.title}
            mainCategories={currentScreen.mainCategories}
            initialActiveId={currentScreen.activeId}
            onBack={popScreen}
            onSubCategoryClick={handleBannerClick}
         />
      )}

      {currentScreen.type === "product-list" && (
        <ProductListingView 
            title={currentScreen.title} 
            products={currentScreen.products}
            internalBanner={currentScreen.internalBanner} 
            onBack={popScreen}
            onProductClick={handleProductClick}
            onBannerClick={handleBannerClick}
        />
      )}
      
      {currentScreen.type === "product-detail" && (
        <ProductDetailView 
            product={currentScreen.product} 
            onBack={popScreen} 
        />
      )}
    </div>
  );
};

const ProductListingView = ({ 
  title, 
  products, 
  internalBanner,
  onBack, 
  onProductClick,
  onBannerClick
}: { 
  title: string, 
  products: Product[], 
  internalBanner?: any,
  onBack: () => void, 
  onProductClick: (p: Product) => void,
  onBannerClick?: (b: any) => void
}) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
            <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-30">
                <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                </Button>
                <h2 className="font-bold text-slate-800 text-lg truncate flex-1">{title}</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="w-5 h-5 text-slate-800" />
                </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-auto pb-24 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-sm hover:[&::-webkit-scrollbar-thumb]:bg-white/70" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.4) transparent' }}>
                {/* Internal Banner Display */}
                {internalBanner && internalBanner.image && (
                   <div 
                     className="mb-4 w-full cursor-pointer"
                     onClick={() => internalBanner.linkedProductIds?.length > 0 && onBannerClick && onBannerClick(internalBanner)}
                   >
                      <div className="relative aspect-[2.5/1] bg-slate-200">
                         <ImageWithFallback src={internalBanner.image} alt="Promo" className="w-full h-full object-cover" />
                      </div>
                   </div>
                )}

                <div className="px-4">
                  {products.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {products.map(product => (
                            <div 
                              key={product.id} 
                              className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer"
                              onClick={() => onProductClick(product)}
                            >
                              <div className="relative aspect-square bg-slate-50 p-2">
                                  <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                  <div className="absolute top-2 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-100">
                                    {product.weight}
                                  </div>
                                  <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                      <Plus className="w-4 h-4 text-[#4A7D5B]" />
                                  </div>
                              </div>
                              <div className="p-2.5">
                                  <div className="text-[10px] font-bold text-orange-500 mb-0.5">{product.discount}</div>
                                  <h4 className="text-xs font-medium text-slate-700 line-clamp-2 h-8 leading-snug mb-1">{product.name}</h4>
                                  <div className="flex items-baseline gap-1">
                                      <span className="text-sm font-bold text-slate-900">₹{product.price}</span>
                                      <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                                  </div>
                              </div>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                          <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                          <p className="text-sm">No products linked to this selection.</p>
                      </div>
                  )}
                </div>
            </div>
        </div>
    )
}

const ProductDetailView = ({ product, onBack }: { product: Product | null, onBack: () => void }) => {
  if (!product) return null;

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
       <div className="px-4 py-2 flex items-center justify-between">
         <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100 rounded-full">
           <ArrowLeft className="w-6 h-6 text-slate-800" />
         </Button>
         <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full">
           <Share2 className="w-5 h-5 text-slate-800" />
         </Button>
       </div>
       
       <div className="flex-1 overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-sm hover:[&::-webkit-scrollbar-thumb]:bg-white/70" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.4) transparent' }}>
          <div className="relative h-[300px] w-full bg-slate-50 mb-4">
             <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-8" />
          </div>
          
          <div className="px-5">
             <div className="flex items-center justify-between mb-1">
               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{product.weight}</span>
               <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-md">
                  <Star className="w-3 h-3 text-green-700 fill-green-700" />
                  <span className="text-xs font-bold text-green-700">4.8</span>
               </div>
             </div>
             
             <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{product.name}</h1>
             
             <div className="flex items-end gap-2 mb-6">
               <span className="text-3xl font-bold text-slate-900">₹{product.price}</span>
               <span className="text-lg text-slate-400 line-through mb-1">₹{product.originalPrice}</span>
               <span className="text-sm font-bold text-orange-500 mb-2">{product.discount}</span>
             </div>

             <div className="space-y-4 mb-8">
               <div>
                 <h3 className="font-bold text-slate-900 mb-2">Product Details</h3>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   Enjoy the fresh taste of premium organic produce. Directly sourced from certified farmers to ensure maximum nutrition and safety for your family.
                 </p>
               </div>
             </div>
          </div>
       </div>

       <div className="p-4 border-t border-slate-100 bg-white pb-8">
         <Button className="w-full h-12 bg-[#4A7D5B] hover:bg-[#3d684b] text-white text-lg font-bold rounded-xl shadow-lg shadow-green-900/20">
           Add to Cart
         </Button>
       </div>
    </div>
  );
};

// --- Section Components ---

const BannerSection = ({ data, onBannerClick }: any) => {
  const banners = data.banners || [];
  const layout = data.layout || "stack"; // stack, carousel, grid
  
  const getContainerClass = () => {
     if (layout === 'carousel') return "flex gap-3 overflow-x-auto px-4 pb-2 -mx-0 scrollbar-hide snap-x snap-mandatory";
     if (layout === 'grid') return "grid grid-cols-2 gap-3 px-4";
     return "flex flex-col gap-3 px-4"; // stack
  };

  return (
    <div className="py-2">
       <div className={getContainerClass()}>
         {banners.map((banner: any, idx: number) => (
            <BannerItem 
                key={banner.id} 
                banner={banner} 
                layout={layout}
                onClick={() => banner.linkedProductIds && banner.linkedProductIds.length > 0 && onBannerClick && onBannerClick(banner)}
            />
         ))}
       </div>
    </div>
  );
};

const BannerItem = ({ banner, layout, onClick }: any) => {
    const variant = banner.variant || "standard"; // standard, large, small, square

    const getHeightClass = () => {
        if (layout === 'grid') return "aspect-[4/3]"; // Grid items always mostly square/landscape
        if (variant === 'large') return "aspect-[16/9] min-h-[180px]";
        if (variant === 'small') return "aspect-[3/1] min-h-[100px]";
        if (variant === 'square') return "aspect-square";
        return "aspect-[2/1] min-h-[140px]"; // Standard
    };
    
    const getWidthClass = () => {
        if (layout === 'carousel') {
            if (variant === 'large') return "min-w-[90%]";
            if (variant === 'small' || variant === 'square') return "min-w-[40%]";
            return "min-w-[85%]";
        }
        return "w-full";
    };

    return (
        <div 
            className={cn(
                "rounded-xl overflow-hidden relative shadow-sm group snap-center bg-slate-100",
                getHeightClass(),
                getWidthClass(),
                (banner.linkedProductIds && banner.linkedProductIds.length > 0) ? 'cursor-pointer active:scale-95 transition-transform' : ''
            )}
            onClick={onClick}
        >
            <ImageWithFallback 
                src={banner.image} 
                alt={banner.title || "Banner"}
                className="w-full h-full object-cover"
            />
            {banner.title && (
                <div className="absolute inset-0 p-4 flex flex-col justify-center bg-gradient-to-r from-black/40 to-transparent">
                   <h3 className={cn("font-serif font-bold text-white w-3/4 leading-tight", variant === 'small' ? "text-sm" : "text-lg")}>
                      {banner.title}
                   </h3>
                   {banner.subtitle && variant !== 'small' && (
                      <p className="text-xs text-white/90 mt-1">{banner.subtitle}</p>
                   )}
                </div>
            )}
            
            {/* Indicator that this is clickable in the builder */}
            {banner.linkedProductIds && banner.linkedProductIds.length > 0 && (
                <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <List className="w-3 h-3 text-orange-500" />
                </div>
            )}
        </div>
    )
}

const CategoryGridSection = ({ title, data, onCategoryClick }: any) => {
  const mainCategories = data.mainCategories || [];

  return (
    <div className="px-4 py-4">
       {title && (
         <div className="flex items-center gap-4 mb-4">
             <h3 className="font-bold text-slate-800 whitespace-nowrap">{title}</h3>
             <div className="h-[1px] bg-slate-200 w-full"></div>
         </div>
       )}
       <div className="grid grid-cols-3 gap-x-3 gap-y-6">
          {mainCategories.map((cat: any) => (
             <div 
                key={cat.id} 
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => onCategoryClick && onCategoryClick(cat, mainCategories)}
             >
                 <div className="w-20 h-16 bg-slate-50 rounded-lg overflow-hidden shadow-sm border border-slate-100 p-1">
                    <ImageWithFallback src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded" />
                 </div>
                 <span className="text-[10px] text-center leading-tight font-medium text-slate-700 px-1">
                    {cat.name}
                 </span>
             </div>
          ))}
       </div>
    </div>
  );
};

const CategoryDetailView = ({ title, mainCategories, initialActiveId, onBack, onSubCategoryClick }: any) => {
  const [selectedMainCatId, setSelectedMainCatId] = useState<string | null>(initialActiveId || mainCategories[0]?.id || null);
  
  // Effect to sync if selected category disappears (e.g. deleted)
  if (selectedMainCatId && !mainCategories.find((c: any) => c.id === selectedMainCatId)) {
     if (mainCategories.length > 0) setSelectedMainCatId(mainCategories[0].id);
     else setSelectedMainCatId(null);
  }
  if (!selectedMainCatId && mainCategories.length > 0) {
     setSelectedMainCatId(mainCategories[0].id);
  }

  const activeMainCategory = mainCategories.find((c: any) => c.id === selectedMainCatId);
  const subCategories = activeMainCategory?.subCategories || [];

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
       <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-30 bg-white">
          <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 text-slate-800" />
          </Button>
          <h2 className="font-bold text-slate-800 text-lg truncate flex-1">{title || "Categories"}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="w-5 h-5 text-slate-800" />
          </Button>
       </div>

       <div className="flex flex-1 overflow-hidden">
           {/* Sidebar */}
           <div className="w-24 bg-slate-50 h-full overflow-y-auto shrink-0 border-r border-slate-100">
              {mainCategories.map((cat: any) => (
                 <div 
                    key={cat.id}
                    className={cn(
                        "p-3 text-[10px] font-bold text-center cursor-pointer border-b border-slate-100 transition-colors break-words flex flex-col items-center gap-2 relative",
                        selectedMainCatId === cat.id ? "bg-white text-[#4A7D5B]" : "text-slate-500 hover:bg-slate-100"
                    )}
                    onClick={() => setSelectedMainCatId(cat.id)}
                 >
                    {/* Rounded image for sidebar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                       <ImageWithFallback src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    {selectedMainCatId === cat.id && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A7D5B]"></div>
                    )}
                    {cat.name}
                 </div>
              ))}
           </div>
           
           {/* Content Grid */}
           <div className="flex-1 overflow-y-auto overflow-x-auto p-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-sm hover:[&::-webkit-scrollbar-thumb]:bg-white/70" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.4) transparent' }}>
               <div className="mb-4">
                  <h3 className="font-bold text-lg text-slate-800">{activeMainCategory?.name}</h3>
                  <p className="text-xs text-slate-500">Explore {subCategories.length} sub-categories</p>
               </div>

               {subCategories.length > 0 ? (
                   <div className="grid grid-cols-2 gap-3">
                      {subCategories.map((sub: any) => (
                         <div 
                            key={sub.id} 
                            className="flex flex-col items-center text-center gap-2 p-2 rounded-lg border border-slate-100 hover:border-[#4A7D5B]/30 transition-colors cursor-pointer"
                            onClick={() => sub.linkedProductIds && sub.linkedProductIds.length > 0 && onSubCategoryClick && onSubCategoryClick({ title: sub.name, linkedProductIds: sub.linkedProductIds })}
                         >
                             <div className="w-full aspect-[4/3] bg-slate-50 rounded overflow-hidden relative">
                                <ImageWithFallback src={sub.image} alt={sub.name} className="w-full h-full object-cover mix-blend-multiply" />
                                {sub.linkedProductIds && sub.linkedProductIds.length > 0 && (
                                   <div className="absolute bottom-1 right-1">
                                      <Circle className="w-2 h-2 fill-[#4A7D5B] text-[#4A7D5B]" />
                                   </div>
                                )}
                             </div>
                             <span className="text-[10px] font-medium text-slate-700 leading-tight">
                                {sub.name}
                             </span>
                         </div>
                      ))}
                   </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                     <Grid className="w-12 h-12 mb-2 opacity-20" />
                     <span className="text-xs">No sub-categories found</span>
                  </div>
               )}
           </div>
       </div>
    </div>
  );
};

const ProductListSection = ({ title, data }: any) => {
   const productIds = data.productIds || [];
   const activeProducts = PRODUCTS.filter(p => productIds.includes(p.id));

   return (
     <div className="px-4 py-4 bg-white">
         {title && (
            <div className="flex items-center gap-4 mb-4">
                <h3 className="font-bold text-slate-800 whitespace-nowrap">{title}</h3>
                <div className="h-[1px] bg-slate-200 w-full"></div>
            </div>
        )}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
           {activeProducts.map(product => (
              <div key={product.id} className="flex flex-col bg-white min-w-[130px] w-[130px] snap-start flex-shrink-0">
                 <div className="relative aspect-square mb-2 bg-slate-50 rounded-lg overflow-hidden p-2 border border-slate-100">
                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-0.5 px-2 border-t border-slate-100">
                       <span className="text-[10px] font-medium text-slate-500">{product.weight}</span>
                    </div>
                 </div>
                 <h4 className="text-xs font-medium text-slate-700 line-clamp-2 h-8 leading-snug">{product.name}</h4>
                 <div className="text-[10px] font-bold text-orange-500 mt-1">{product.discount}</div>
                 <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-sm font-bold text-slate-900">₹{product.price}</span>
                    <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                 </div>
                 <Button className="w-full h-8 text-xs font-bold bg-[#4A7D5B] hover:bg-[#3d684b] text-white rounded-md shadow-sm">
                    Add
                 </Button>
              </div>
           ))}
        </div>
     </div>
   )
}

const WellbeingSection = ({ title, data }: any) => {
   return (
     <div className="py-6 bg-[#FDF2F8]">
         {title && (
            <div className="flex items-center justify-center mb-6">
                <div className="bg-purple-600 h-0.5 w-4 rounded-full"></div>
                <div className="h-8 w-[1px] bg-purple-600 mx-2 -rotate-12"></div>
                <h3 className="font-serif font-bold text-lg text-slate-800">{title}</h3>
                <div className="h-8 w-[1px] bg-purple-600 mx-2 -rotate-12"></div>
                <div className="bg-purple-600 h-0.5 w-4 rounded-full"></div>
            </div>
         )}
         
         {/* Just for flair from image */}
         <div className="flex justify-center mb-4">
            <span className="bg-purple-600 text-white text-[10px] px-3 py-1 rounded-full font-bold">Just for you</span>
         </div>

         <div className="grid grid-cols-2 gap-4 px-4">
            {data.items?.map((item: any, idx: number) => (
               <div key={idx} className="flex flex-col items-center text-center mb-4">
                  <div className={`w-24 h-24 rounded-t-full rounded-b-[3rem] overflow-hidden mb-2 border-4 ${idx % 2 === 0 ? 'border-yellow-300' : 'border-blue-300'}`}>
                     <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-sm text-purple-900">{item.title}</h4>
                  <p className="text-[10px] text-slate-600 leading-tight w-32">{item.desc}</p>
               </div>
            ))}
         </div>
     </div>
   )
}

const LifestyleSection = ({ title, data }: any) => {
    return (
      <div className="bg-cyan-50 py-6 px-4">
         <h3 className="font-serif font-bold text-xl text-slate-800 mb-4 italic">
            {title?.split(" ").map((word: string, i: number) => (
                <span key={i} className={i === 0 ? "text-slate-800" : "text-slate-600"}>{word} </span>
            ))}
         </h3>
         
         <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
             {data.items?.map((item: any, idx: number) => (
                <div key={idx} className="min-w-[140px] h-[100px] rounded-xl overflow-hidden relative shadow-md">
                   <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                   <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 py-1.5 px-2 text-center">
                      <span className="text-white text-xs font-bold">{item.title}</span>
                   </div>
                </div>
             ))}
         </div>
      </div>
    )
}

const FlashSaleSection = ({ title, data }: any) => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2); // Mock end time

    return (
        <div className="py-4 px-4 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-red-500 p-1 rounded-md">
                        <Zap className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-none">{title}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Ends in <span className="text-red-600 font-bold">01:45:12</span></p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-red-600 font-bold hover:bg-red-100 h-7 px-2">
                    See All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
                {(data.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="min-w-[130px] bg-white rounded-xl p-2 border border-red-100 shadow-sm relative">
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10">
                            {item.discount} OFF
                        </div>
                        <div className="aspect-square mb-2 bg-slate-50 rounded-lg overflow-hidden">
                            <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <h4 className="text-xs font-medium text-slate-800 line-clamp-2 h-8 leading-snug">{item.name}</h4>
                        <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-slate-900">₹{item.price}</span>
                            <span className="text-[10px] text-slate-400 line-through">₹{item.originalPrice}</span>
                        </div>
                        <div className="mt-2 w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${item.sold}%` }}></div>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-medium">{item.sold}% Sold</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StoriesSection = ({ data }: any) => {
    return (
        <div className="py-4 pl-4 overflow-hidden">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide pr-4">
                {(data.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center gap-1 cursor-pointer group">
                        <div className={cn(
                            "w-16 h-16 rounded-full p-[2px] relative",
                            item.viewed ? "bg-slate-200" : "bg-gradient-to-tr from-yellow-400 to-purple-600"
                        )}>
                            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                                <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            {!item.viewed && (
                                <div className="absolute bottom-0 right-0 bg-[#4A7D5B] text-white text-[8px] font-bold px-1 rounded-full border border-white">
                                    NEW
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 text-center w-16 truncate">
                            {item.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Editors ---

const ProductPicker = ({ selectedIds, onToggle }: { selectedIds: string[], onToggle: (id: string) => void }) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="border rounded-lg bg-slate-50 overflow-hidden">
      <div className="p-3 border-b border-slate-200 bg-white space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search products..." 
            className="h-8 text-xs border-slate-200 bg-slate-50" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
             className={cn(
               "px-3 py-1 text-xs rounded-full border whitespace-nowrap transition-colors",
               selectedCategory === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 hover:border-slate-300"
             )}
             onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={cn(
                "px-3 py-1 text-xs rounded-full border whitespace-nowrap transition-colors",
                selectedCategory === cat.id ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 hover:border-slate-300"
              )}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[200px]">
         <div className="p-2 grid grid-cols-2 gap-2">
           {filteredProducts.map(product => {
             const isSelected = selectedIds.includes(product.id);
             return (
               <div 
                 key={product.id}
                 className={cn(
                   "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all relative overflow-hidden",
                   isSelected ? "bg-green-50 border-green-500 ring-1 ring-green-500" : "bg-white border-slate-200 hover:border-slate-300"
                 )}
                 onClick={() => onToggle(product.id)}
               >
                 <div className="w-10 h-10 bg-slate-100 rounded flex-shrink-0 overflow-hidden">
                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-slate-700">{product.name}</p>
                    <p className="text-[10px] text-slate-500">{product.weight}</p>
                 </div>
                 {isSelected && (
                   <div className="absolute top-1 right-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600 fill-green-100" />
                   </div>
                 )}
               </div>
             );
           })}
           {filteredProducts.length === 0 && (
             <div className="col-span-2 py-8 text-center text-xs text-slate-400">
               No products found.
             </div>
           )}
         </div>
      </ScrollArea>
      
      <div className="p-2 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
        <span>{selectedIds.length} products selected</span>
        {selectedIds.length > 0 && (
          <button className="text-slate-700 hover:text-red-600 font-medium" onClick={() => selectedIds.forEach(id => onToggle(id))}>
             Clear All
          </button>
        )}
      </div>
    </div>
  );
};

const CategoryGridEditor = ({ data, onChange }: any) => {
  const mainCategories = data.mainCategories || [];
  const [activeMainId, setActiveMainId] = useState<string | null>(mainCategories[0]?.id || null);

  const addMainCategory = () => {
    const newCat = { id: `mc${Date.now()}`, name: "New Category", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&q=80", subCategories: [] };
    onChange({ mainCategories: [...mainCategories, newCat] });
    setActiveMainId(newCat.id);
  };

  const updateMainCategory = (id: string, field: string, value: any) => {
    onChange({
      mainCategories: mainCategories.map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const removeMainCategory = (id: string) => {
    const newCats = mainCategories.filter((c: any) => c.id !== id);
    onChange({ mainCategories: newCats });
    if (activeMainId === id) setActiveMainId(newCats[0]?.id || null);
  };

  const activeMainCat = mainCategories.find((c: any) => c.id === activeMainId);

  const addSubCategory = (mainCatId: string) => {
      const newSub = { 
        id: `sc${Date.now()}`, 
        name: "Sub Category", 
        image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&q=80",
        linkedProductIds: []
      };
      const updatedCats = mainCategories.map((c: any) => {
         if (c.id === mainCatId) {
            return { ...c, subCategories: [...(c.subCategories || []), newSub] };
         }
         return c;
      });
      onChange({ mainCategories: updatedCats });
  };

  const updateSubCategory = (mainCatId: string, subId: string, field: string, value: any) => {
      const updatedCats = mainCategories.map((c: any) => {
         if (c.id === mainCatId) {
            return {
                ...c,
                subCategories: c.subCategories.map((s: any) => s.id === subId ? { ...s, [field]: value } : s)
            };
         }
         return c;
      });
      onChange({ mainCategories: updatedCats });
  };
  
  const removeSubCategory = (mainCatId: string, subId: string) => {
      const updatedCats = mainCategories.map((c: any) => {
         if (c.id === mainCatId) {
            return {
                ...c,
                subCategories: c.subCategories.filter((s: any) => s.id !== subId)
            };
         }
         return c;
      });
      onChange({ mainCategories: updatedCats });
  };

  const toggleSubLinkedProduct = (mainCatId: string, subId: string, productId: string) => {
      const cat = mainCategories.find((c: any) => c.id === mainCatId);
      const sub = cat.subCategories.find((s: any) => s.id === subId);
      const currentIds = sub.linkedProductIds || [];
      const newIds = currentIds.includes(productId) ? currentIds.filter((id: string) => id !== productId) : [...currentIds, productId];
      
      updateSubCategory(mainCatId, subId, "linkedProductIds", newIds);
  };

  return (
    <div className="space-y-6">
        {/* Main Category Tabs */}
        <div className="space-y-3">
           <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-500 uppercase">Main Categories</Label>
              <Button size="sm" variant="outline" className="h-6 text-xs" onClick={addMainCategory}>
                 <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
           </div>
           <div className="flex flex-wrap gap-2">
              {mainCategories.map((cat: any) => (
                  <div 
                    key={cat.id}
                    className={cn(
                        "flex items-center pl-3 pr-1 py-1 rounded-full border text-xs cursor-pointer transition-all",
                        activeMainId === cat.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                    onClick={() => setActiveMainId(cat.id)}
                  >
                     <span className="mr-2">{cat.name}</span>
                     <div 
                       className={cn("p-1 rounded-full hover:bg-white/20", activeMainId === cat.id ? "text-white" : "text-slate-400")}
                       onClick={(e) => { e.stopPropagation(); removeMainCategory(cat.id); }}
                     >
                        <X className="w-3 h-3" />
                     </div>
                  </div>
              ))}
           </div>
        </div>
        
        <Separator />
        
        {activeMainCat ? (
           <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                 <Label className="w-20 shrink-0">Category Name</Label>
                 <Input 
                    value={activeMainCat.name} 
                    onChange={(e) => updateMainCategory(activeMainCat.id, "name", e.target.value)} 
                    className="h-8"
                 />
              </div>
              <div className="flex items-center gap-3">
                 <Label className="w-20 shrink-0">Image URL</Label>
                 <Input 
                    value={activeMainCat.image || ""} 
                    onChange={(e) => updateMainCategory(activeMainCat.id, "image", e.target.value)} 
                    className="h-8"
                    placeholder="Main category image"
                 />
              </div>
              
              <div className="pt-4">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm">Sub-Categories ({activeMainCat.subCategories?.length || 0})</h4>
                    <Button size="sm" onClick={() => addSubCategory(activeMainCat.id)}>
                       <Plus className="w-4 h-4 mr-2" /> Add Sub-Cat
                    </Button>
                 </div>
                 
                 <div className="space-y-4">
                    {activeMainCat.subCategories?.map((sub: any) => (
                       <Card key={sub.id} className="relative overflow-hidden border-slate-200 shadow-sm">
                          <div className="absolute top-2 right-2 z-10">
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => removeSubCategory(activeMainCat.id, sub.id)}>
                                <X className="w-3 h-3" />
                             </Button>
                          </div>
                          <div className="p-3 flex gap-3">
                             <div className="w-16 h-16 bg-slate-100 rounded flex-shrink-0 overflow-hidden border border-slate-100">
                                <ImageWithFallback src={sub.image} alt="Sub" className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 space-y-2">
                                <Input 
                                   value={sub.name} 
                                   onChange={(e) => updateSubCategory(activeMainCat.id, sub.id, "name", e.target.value)} 
                                   className="h-7 text-xs font-medium"
                                   placeholder="Sub Category Name"
                                />
                                <Input 
                                   value={sub.image} 
                                   onChange={(e) => updateSubCategory(activeMainCat.id, sub.id, "image", e.target.value)} 
                                   className="h-7 text-[10px] text-slate-500"
                                   placeholder="Image URL"
                                />
                             </div>
                          </div>
                          
                          <div className="bg-slate-50 p-3 border-t border-slate-100">
                             <Label className="text-[10px] font-bold text-slate-500 mb-2 block uppercase">Linked Products ({sub.linkedProductIds?.length || 0})</Label>
                             <ProductPicker 
                                selectedIds={sub.linkedProductIds || []}
                                onToggle={(pid) => toggleSubLinkedProduct(activeMainCat.id, sub.id, pid)}
                             />
                          </div>
                       </Card>
                    ))}
                    {(!activeMainCat.subCategories || activeMainCat.subCategories.length === 0) && (
                       <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                          <Grid className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No sub-categories added yet.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        ) : (
           <div className="text-center py-10 text-slate-400">
              <p>Select a Main Category to edit.</p>
           </div>
        )}
    </div>
  );
};

const BannerEditor = ({ data, onChange }: any) => {
  const banners = data.banners || [];
  const layout = data.layout || "stack";

  const addBanner = () => {
    const newBanner = {
      id: `b${Date.now()}`,
      title: "New Banner",
      subtitle: "",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      variant: "standard",
      linkedProductIds: [],
      landingBanner: { image: "", linkedProductIds: [] } // Initialize internal banner
    };
    onChange({ banners: [...banners, newBanner] });
  };

  const removeBanner = (id: string) => {
    onChange({ banners: banners.filter((b: any) => b.id !== id) });
  };

  const updateBanner = (id: string, field: string, value: any) => {
    onChange({
      banners: banners.map((b: any) => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const updateLandingBanner = (id: string, field: string, value: any) => {
    const banner = banners.find((b: any) => b.id === id);
    if (!banner) return;
    
    const currentLanding = banner.landingBanner || { image: "", linkedProductIds: [] };
    
    updateBanner(id, "landingBanner", { ...currentLanding, [field]: value });
  };

  const toggleLinkedProduct = (bannerId: string, productId: string, currentIds: string[]) => {
      const newIds = currentIds.includes(productId)
        ? currentIds.filter(id => id !== productId)
        : [...currentIds, productId];
      updateBanner(bannerId, "linkedProductIds", newIds);
  }

  const toggleLandingLinkedProduct = (bannerId: string, productId: string) => {
      const banner = banners.find((b: any) => b.id === bannerId);
      const currentIds = banner?.landingBanner?.linkedProductIds || [];
      const newIds = currentIds.includes(productId)
        ? currentIds.filter((id: string) => id !== productId)
        : [...currentIds, productId];
      updateLandingBanner(bannerId, "linkedProductIds", newIds);
  }
  
  const changeLayout = (newLayout: string) => {
      onChange({ ...data, layout: newLayout });
  }

  return (
    <div className="space-y-6">
       <div className="space-y-3">
         <Label className="text-sm font-bold">Section Layout</Label>
         <div className="grid grid-cols-3 gap-2">
            <Button 
                variant={layout === 'stack' ? "default" : "outline"} 
                className={cn("flex flex-col items-center h-20 gap-1", layout === 'stack' ? "bg-[#4A7D5B]" : "")}
                onClick={() => changeLayout('stack')}
            >
                <Rows className="w-5 h-5" />
                <span className="text-xs">Stack</span>
            </Button>
            <Button 
                variant={layout === 'carousel' ? "default" : "outline"} 
                className={cn("flex flex-col items-center h-20 gap-1", layout === 'carousel' ? "bg-[#4A7D5B]" : "")}
                onClick={() => changeLayout('carousel')}
            >
                <LayoutTemplate className="w-5 h-5 rotate-90" />
                <span className="text-xs">Carousel</span>
            </Button>
            <Button 
                variant={layout === 'grid' ? "default" : "outline"} 
                className={cn("flex flex-col items-center h-20 gap-1", layout === 'grid' ? "bg-[#4A7D5B]" : "")}
                onClick={() => changeLayout('grid')}
            >
                <Grid className="w-5 h-5" />
                <span className="text-xs">Grid</span>
            </Button>
         </div>
       </div>

       <Separator />

       <div className="flex items-center justify-between">
         <h3 className="font-medium">Banners ({banners.length})</h3>
         <Button size="sm" onClick={addBanner}><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
       </div>
       
       <div className="space-y-4">
         {banners.map((banner: any, idx: number) => (
           <Card key={banner.id} className="relative overflow-hidden">
             <div className="absolute top-2 right-2 z-10">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 bg-white/80 backdrop-blur" onClick={() => removeBanner(banner.id)}>
                 <X className="w-4 h-4" />
               </Button>
             </div>
             <div className="flex gap-4 p-4">
               <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={banner.image} alt="Preview" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input value={banner.title} onChange={(e) => updateBanner(banner.id, "title", e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                       <Label className="text-xs">Size / Variant</Label>
                       <Select value={banner.variant || "standard"} onValueChange={(val) => updateBanner(banner.id, "variant", val)}>
                          <SelectTrigger className="h-8 text-xs">
                             <SelectValue placeholder="Size" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="large">Large (Hero)</SelectItem>
                             <SelectItem value="standard">Standard (2:1)</SelectItem>
                             <SelectItem value="small">Small (Banner)</SelectItem>
                             <SelectItem value="square">Square (Tile)</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Image URL</Label>
                    <Input value={banner.image} onChange={(e) => updateBanner(banner.id, "image", e.target.value)} className="h-8 text-xs" />
                  </div>
                  
                  <div>
                    <Label className="text-xs mb-2 block">Linked Products</Label>
                    <ProductPicker 
                      selectedIds={banner.linkedProductIds || []} 
                      onToggle={(id) => toggleLinkedProduct(banner.id, id, banner.linkedProductIds || [])} 
                    />
                  </div>

                  {/* Internal Page Configuration */}
                  <div className="pt-4 border-t border-slate-100 mt-4">
                     <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <ImageIconSmall className="w-3 h-3" />
                        Internal Page Banner
                     </h4>
                     <div className="space-y-3 bg-slate-50 p-3 rounded-md border border-slate-100">
                        <div>
                           <Label className="text-[10px]">Internal Banner Image URL</Label>
                           <Input 
                              value={banner.landingBanner?.image || ""} 
                              onChange={(e) => updateLandingBanner(banner.id, "image", e.target.value)} 
                              className="h-7 text-xs bg-white"
                              placeholder="Image URL for the product listing page header" 
                           />
                        </div>
                        <div>
                           <Label className="text-[10px] mb-1 block">Internal Banner Products (Nested)</Label>
                           <ProductPicker 
                              selectedIds={banner.landingBanner?.linkedProductIds || []} 
                              onToggle={(id) => toggleLandingLinkedProduct(banner.id, id)} 
                           />
                           <p className="text-[10px] text-slate-400 mt-1">
                             Products to show if the user clicks this internal banner.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
           </Card>
         ))}
       </div>
    </div>
  );
};

// --- Main Component ---

export function AppCMS() {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);

  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      const [removed] = updatedSections.splice(dragIndex, 1);
      updatedSections.splice(hoverIndex, 0, removed);
      return updatedSections;
    });
  }, []);

  const handleAddSection = (type: SectionType) => {
    let initialData: any = {};
    
    if (type === "banner") initialData = { layout: "stack", banners: [{ id: `b${Date.now()}`, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80", variant: "standard", linkedProductIds: [] }] };
    else if (type === "category-grid") initialData = { mainCategories: [{ id: "mc1", name: "Category 1", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&q=80", subCategories: [] }] };
    else if (type === "product-list") initialData = { productIds: ["1", "2"] };
    else if (type === "wellbeing-grid") initialData = { items: [{ title: "New Persona", desc: "Description", image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80" }] };
    else if (type === "lifestyle-banner") initialData = { items: [{ title: "New Lifestyle", image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400&q=80" }] };
    else if (type === "flash-sale") initialData = { 
        items: [
            { name: "Fresh Strawberries", price: 99, originalPrice: 150, discount: "34%", sold: 85, image: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400&q=80" },
            { name: "Blueberries 125g", price: 249, originalPrice: 350, discount: "28%", sold: 42, image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80" },
            { name: "Imported Kiwi", price: 120, originalPrice: 180, discount: "33%", sold: 65, image: "https://images.unsplash.com/photo-1585059895524-72359e06138a?w=400&q=80" }
        ] 
    };
    else if (type === "stories") initialData = {
        items: [
             { title: "New Arrival", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80", viewed: false },
             { title: "Recipes", image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=200&q=80", viewed: false },
             { title: "Farmers", image: "https://images.unsplash.com/photo-1595855709915-f65b48827878?w=200&q=80", viewed: true }
        ]
    };

    const newSection: Section = {
      id: `s${Date.now()}`,
      type,
      title: "New Section",
      data: initialData
    };
    setSections([...sections, newSection]);
    setActiveSectionId(newSection.id);
    setIsAddingSection(false);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  
  const updateSectionData = (id: string, dataUpdates: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, data: { ...s.data, ...dataUpdates } } : s));
  };

  const activeSection = sections.find(s => s.id === activeSectionId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        {/* Left Panel: Live Preview */}
        <div className="w-[450px] flex-shrink-0 border-r border-slate-200 bg-[#F0F2F5] flex flex-col items-center justify-center p-6 overflow-hidden">
           <MobilePreview sections={sections} />
        </div>

        {/* Right Panel: Editor */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {/* Toolbar */}
          <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-2">
              <div className="bg-[#4A7D5B]/10 p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-[#4A7D5B]" />
              </div>
              <h1 className="font-bold text-lg text-slate-800">App Customizer</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => console.log("Draft saved")}>Save Draft</Button>
              <Button className="bg-[#4A7D5B] hover:bg-[#3d684b] text-white gap-2">
                <Save className="w-4 h-4" /> Publish
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden flex [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
            {/* Sidebar: Layer List */}
            <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50 flex-shrink-0">
              <div className="p-4 border-b border-slate-200">
                <Button 
                  className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#4A7D5B] hover:border-[#4A7D5B] shadow-sm"
                  onClick={() => {
                    setActiveSectionId(null);
                    setIsAddingSection(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Section
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3">
                  {sections.map((section, index) => (
                    <DraggableSectionItem
                      key={section.id}
                      index={index}
                      section={section}
                      moveSection={moveSection}
                      isActive={activeSectionId === section.id}
                      onEdit={() => {
                        setActiveSectionId(section.id);
                        setIsAddingSection(false);
                      }}
                      onDelete={() => handleDeleteSection(section.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Main Config Area */}
            <div className="flex-1 bg-white overflow-hidden flex flex-col min-w-[600px]">
              {isAddingSection ? (
                 <div className="p-8 max-w-4xl mx-auto w-full overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                   <div className="flex items-center gap-2 mb-6">
                      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setIsAddingSection(false)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <h2 className="text-xl font-bold">Select Section Type</h2>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4 min-w-[640px]">
                      <SectionTypeCard icon={ImageIcon} title="Banner" desc="Promotional hero images" onClick={() => handleAddSection("banner")} />
                      <SectionTypeCard icon={Grid} title="Category Grid" desc="Grid of categories with images" onClick={() => handleAddSection("category-grid")} />
                      <SectionTypeCard icon={ShoppingCart} title="Product List" desc="Horizontal list of products" onClick={() => handleAddSection("product-list")} />
                      <SectionTypeCard icon={Heart} title="Well-being" desc="Special 4-grid persona section" onClick={() => handleAddSection("wellbeing-grid")} />
                      <SectionTypeCard icon={Zap} title="Lifestyle" desc="Horizontal slider for lifestyle" onClick={() => handleAddSection("lifestyle-banner")} />
                      <SectionTypeCard icon={Timer} title="Flash Sale" desc="Countdown timer with deals" onClick={() => handleAddSection("flash-sale")} />
                      <SectionTypeCard icon={PlayCircle} title="Stories" desc="Instagram-style stories" onClick={() => handleAddSection("stories")} />
                   </div>
                 </div>
              ) : activeSection ? (
                <div className="flex-1 overflow-y-auto overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                   <div className="p-8 min-w-[640px] max-w-2xl mx-auto w-full pb-20">
                      <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-bold flex items-center gap-3">
                           Edit {activeSection.type.replace("-", " ")}
                         </h2>
                      </div>

                      <div className="space-y-4">
                         <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input 
                               value={activeSection.title || ""} 
                               onChange={(e) => updateSection(activeSection.id, { title: e.target.value })}
                               placeholder="Display Title"
                            />
                         </div>
                         
                         <Separator />
                         
                         {activeSection.type === "banner" ? (
                           <BannerEditor 
                             data={activeSection.data} 
                             onChange={(newData: any) => updateSectionData(activeSection.id, newData)} 
                           />
                         ) : activeSection.type === "category-grid" ? (
                           <CategoryGridEditor 
                             data={activeSection.data} 
                             onChange={(newData: any) => updateSectionData(activeSection.id, newData)}
                           />
                         ) : activeSection.type === "product-list" ? (
                           <div className="space-y-4">
                              <div>
                                 <Label className="text-sm font-medium mb-2 block">Selected Products</Label>
                                 <ProductPicker 
                                    selectedIds={activeSection.data.productIds || []} 
                                    onToggle={(id) => {
                                       const currentIds = activeSection.data.productIds || [];
                                       const newIds = currentIds.includes(id) 
                                          ? currentIds.filter((pid: string) => pid !== id)
                                          : [...currentIds, id];
                                       updateSectionData(activeSection.id, { productIds: newIds });
                                    }} 
                                 />
                              </div>
                           </div>
                         ) : (
                           <div className="text-sm text-slate-500 italic">
                              Detailed configuration for this section type (Products/Categories) works similarly to the banner editor.
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <Smartphone className="w-8 h-8" />
                   </div>
                   <p>Select a section from the left to edit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

const SectionTypeCard = ({ icon: Icon, title, desc, onClick }: any) => (
  <button 
    className="flex flex-col items-center text-center p-6 border rounded-xl hover:border-[#4A7D5B] hover:bg-[#4A7D5B]/5 transition-all group"
    onClick={onClick}
  >
    <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
      <Icon className="w-6 h-6 text-slate-600 group-hover:text-[#4A7D5B]" />
    </div>
    <h3 className="font-bold text-sm mb-1">{title}</h3>
    <p className="text-xs text-slate-500">{desc}</p>
  </button>
);
