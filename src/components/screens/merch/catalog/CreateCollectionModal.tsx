import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { CollectionType, Region } from './types';
import { Check, ChevronRight, Upload, Calendar as CalendarIcon, X } from 'lucide-react';
import { toast } from "sonner";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const STEPS = [
  'Basics',
  'Add SKUs',
  'Media',
  'Visibility',
  'Review'
];

export function CreateCollectionModal({ isOpen, onClose, onSubmit, initialData }: CreateCollectionModalProps) {
  const [step, setStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'Seasonal' as CollectionType,
    region: initialData?.region || 'North America' as Region,
    skus: initialData?.skus || [] as string[],
    media: initialData?.imageUrl || null,
    status: initialData?.status || 'Draft'
  });

  // Reset data when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setData({
          name: initialData.name,
          description: initialData.description,
          type: initialData.type,
          region: initialData.region,
          skus: initialData.skus || [],
          media: initialData.imageUrl || null,
          status: initialData.status
        });
      } else {
        setData({
          name: '',
          description: '',
          type: 'Seasonal',
          region: 'North America',
          skus: [],
          media: null,
          status: 'Draft'
        });
      }
      setStep(0);
    }
  }, [isOpen, initialData]);

  const validateStep = () => {
    if (step === 0) {
      return data.name.trim() !== '' && data.description.trim() !== '';
    }
    if (step === 1) {
      // User requested: "when i didn't upload any data or images starting from create collection it won't allow to next page"
      // Let's require at least one SKU for step 1?
      return data.skus.length > 0;
    }
    if (step === 2) {
      // Require media?
      return data.media !== null;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error("Please complete all required fields");
      return;
    }
    
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onSubmit(data);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setData({ ...data, media: imageUrl as any });
      toast.success("Cover image selected");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] min-h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new collection by following the steps.
          </DialogDescription>
          {/* Progress Bar */}
          <div className="flex items-center gap-1 mt-4">
             {STEPS.map((s, i) => (
                <div key={i} className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${i <= step ? 'bg-[#7C3AED]' : 'bg-transparent'} transition-all`} />
                </div>
             ))}
          </div>
          <div className="text-xs text-[#757575] font-medium mt-1">Step {step + 1}: {STEPS[step]}</div>
        </DialogHeader>

        <div className="flex-1 py-4">
            {step === 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <Label>Collection Name</Label>
                        <Input 
                            placeholder="e.g. Summer Essentials" 
                            value={data.name} 
                            onChange={(e) => setData({...data, name: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            placeholder="Describe this collection..." 
                            value={data.description} 
                            onChange={(e) => setData({...data, description: e.target.value})}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select 
                                value={data.type} 
                                onValueChange={(val: CollectionType) => setData({...data, type: val})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                                    <SelectItem value="Thematic">Thematic</SelectItem>
                                    <SelectItem value="Bundle/Combo">Bundle/Combo</SelectItem>
                                    <SelectItem value="Brand">Brand</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Region Scope</Label>
                            <Select 
                                value={data.region} 
                                onValueChange={(val: Region) => setData({...data, region: val})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="North America">North America</SelectItem>
                                    <SelectItem value="Europe (West)">Europe (West)</SelectItem>
                                    <SelectItem value="APAC">APAC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div 
                        className="p-8 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-center"
                        onClick={() => {
                            // Mock adding SKUs
                            const mockSkus = ['sku-1', 'sku-2', 'sku-3'];
                            setData({...data, skus: mockSkus});
                            toast.success("Added 3 SKUs to collection");
                        }}
                    >
                        <p className="text-sm font-medium text-gray-900">Click to Select SKUs</p>
                        <p className="text-xs text-gray-500">Opens the SKU picker (Mocked for now)</p>
                    </div>
                    {data.skus.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase">Selected SKUs</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {data.skus.map(id => (
                                    <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs">
                                        <span>{id}</span>
                                        <X size={14} className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setData({...data, skus: data.skus.filter(s => s !== id)})} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 text-center">{data.skus.length} SKUs selected</p>
                </div>
            )}
            
            {step === 2 && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                     />
                     <div 
                        className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 relative overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {data.media ? (
                            <img src={data.media} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Upload size={24} className="mb-2" />
                                <span className="text-sm">Upload Cover Image</span>
                            </>
                        )}
                     </div>
                     {data.media && (
                         <Button variant="ghost" size="sm" className="w-full text-red-600" onClick={() => setData({...data, media: null})}>
                             Remove Image
                         </Button>
                     )}
                 </div>
            )}

            {step === 3 && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-2">
                            <Label>Status</Label>
                            <Select 
                                value={data.status} 
                                onValueChange={(val: string) => setData({...data, status: val as any})}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Live">Live</SelectItem>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Schedule Start (Optional)</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input className="pl-9" placeholder="Select date..." />
                            </div>
                        </div>
                 </div>
            )}

             {step === 4 && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-bold text-gray-900">{data.name || 'Untitled Collection'}</h4>
                        <p className="text-sm text-gray-600">{data.description || 'No description provided'}</p>
                        <div className="flex gap-2 text-xs">
                             <span className="px-2 py-1 bg-white border rounded">{data.type}</span>
                             <span className="px-2 py-1 bg-white border rounded">{data.region}</span>
                             <span className="px-2 py-1 bg-white border rounded">{data.status}</span>
                        </div>
                     </div>
                     <p className="text-sm text-gray-500 text-center">Ready to create?</p>
                 </div>
            )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between w-full">
            <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                Back
            </Button>
            <Button onClick={handleNext} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                {step === STEPS.length - 1 ? 'Create Collection' : (
                    <>Next <ChevronRight size={16} className="ml-1" /></>
                )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
