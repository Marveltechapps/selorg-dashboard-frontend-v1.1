import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, TrendingUp, Download, X, Search } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';

interface RawMaterial {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  safetyStock: number;
  reorderPoint: number;
  supplier: string;
  lastOrderDate?: string;
  category: string;
}

interface InboundReceipt {
  id: string;
  poNumber: string;
  supplier: string;
  expectedDate: string;
  status: 'pending' | 'docking' | 'received';
  items: string;
}

interface Requisition {
  id: string;
  reqNumber: string;
  material: string;
  quantity: number;
  requestedBy: string;
  line: string;
  status: 'pending' | 'approved' | 'issued' | 'rejected';
  date: string;
}

export function RawMaterials() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<InboundReceipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'receipts' | 'requisitions'>('inventory');

  const [materials, setMaterials] = useState<RawMaterial[]>([
    { id: '1', name: 'Organic Oats', currentStock: 2500, unit: 'kg', safetyStock: 500, reorderPoint: 800, supplier: 'Grain Co.', category: 'Grains', lastOrderDate: '2024-12-20' },
    { id: '2', name: 'Sugar (Refined)', currentStock: 120, unit: 'kg', safetyStock: 300, reorderPoint: 500, supplier: 'Sweet Suppliers', category: 'Sweeteners', lastOrderDate: '2024-12-18' },
    { id: '3', name: 'Packaging Film 2mm', currentStock: 2, unit: 'Rolls', safetyStock: 10, reorderPoint: 15, supplier: 'PackMaster Inc', category: 'Packaging', lastOrderDate: '2024-12-15' },
    { id: '4', name: 'Almond Extract', currentStock: 850, unit: 'L', safetyStock: 200, reorderPoint: 300, supplier: 'Flavor House', category: 'Ingredients' },
    { id: '5', name: 'Protein Powder', currentStock: 1800, unit: 'kg', safetyStock: 500, reorderPoint: 700, supplier: 'Nutrition Plus', category: 'Ingredients', lastOrderDate: '2024-12-21' },
  ]);

  const [receipts, setReceipts] = useState<InboundReceipt[]>([
    { id: '1', poNumber: 'PO-9921', supplier: 'Supplier A', expectedDate: '2024-12-22', status: 'pending', items: 'Organic Oats (500kg)' },
    { id: '2', poNumber: 'PO-9924', supplier: 'Supplier B', expectedDate: '2024-12-22', status: 'docking', items: 'Sugar (400kg)' },
    { id: '3', poNumber: 'PO-9920', supplier: 'Grain Co.', expectedDate: '2024-12-23', status: 'pending', items: 'Wheat Flour (800kg)' },
  ]);

  const [requisitions, setRequisitions] = useState<Requisition[]>([
    { id: '1', reqNumber: 'REQ-1001', material: 'Organic Oats', quantity: 250, requestedBy: 'John Smith', line: 'Line A', status: 'approved', date: '2024-12-22' },
    { id: '2', reqNumber: 'REQ-1002', material: 'Sugar', quantity: 100, requestedBy: 'Sarah Johnson', line: 'Line B', status: 'pending', date: '2024-12-22' },
    { id: '3', reqNumber: 'REQ-1003', material: 'Protein Powder', quantity: 300, requestedBy: 'Mike Davis', line: 'Line D', status: 'issued', date: '2024-12-21' },
  ]);

  const [newRequisition, setNewRequisition] = useState({
    material: '',
    quantity: '',
    line: '',
    requestedBy: '',
  });

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    currentStock: '',
    unit: '',
    safetyStock: '',
    reorderPoint: '',
    supplier: '',
    category: '',
  });

  const createRequisition = () => {
    if (newRequisition.material && newRequisition.quantity && newRequisition.line && newRequisition.requestedBy) {
      const req: Requisition = {
        id: Date.now().toString(),
        reqNumber: `REQ-${Math.floor(Math.random() * 10000)}`,
        material: newRequisition.material,
        quantity: parseInt(newRequisition.quantity),
        requestedBy: newRequisition.requestedBy,
        line: newRequisition.line,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      };
      setRequisitions([req, ...requisitions]);
      setNewRequisition({ material: '', quantity: '', line: '', requestedBy: '' });
      setShowAddModal(false);
    }
  };

  const addMaterial = () => {
    if (newMaterial.name && newMaterial.currentStock && newMaterial.unit) {
      const material: RawMaterial = {
        id: Date.now().toString(),
        name: newMaterial.name,
        currentStock: parseInt(newMaterial.currentStock),
        unit: newMaterial.unit,
        safetyStock: parseInt(newMaterial.safetyStock) || 0,
        reorderPoint: parseInt(newMaterial.reorderPoint) || 0,
        supplier: newMaterial.supplier,
        category: newMaterial.category,
      };
      setMaterials([...materials, material]);
      setNewMaterial({ name: '', currentStock: '', unit: '', safetyStock: '', reorderPoint: '', supplier: '', category: '' });
      setShowAddModal(false);
    }
  };

  const updateRequisitionStatus = (id: string, newStatus: Requisition['status']) => {
    setRequisitions(requisitions.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (newStatus === 'issued') {
      const req = requisitions.find(r => r.id === id);
      if (req) {
        const material = materials.find(m => m.name.toLowerCase().includes(req.material.toLowerCase()));
        if (material) {
          setMaterials(materials.map(m => 
            m.id === material.id ? { ...m, currentStock: m.currentStock - req.quantity } : m
          ));
        }
      }
    }
  };

  const receiveShipment = (id: string) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, status: 'received' as const } : r));
    setShowReceiptModal(null);
  };

  const orderMaterial = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      const orderQty = prompt(`Enter order quantity for ${material.name} (${material.unit}):`, material.reorderPoint.toString());
      if (orderQty) {
        alert(`Purchase Order created for ${orderQty} ${material.unit} of ${material.name}`);
      }
    }
  };

  const exportData = () => {
    const today = new Date().toISOString().split('T')[0];
    let csvData: any[] = [];

    if (activeTab === 'inventory') {
      csvData = [
        ['Raw Materials Inventory Report', `Date: ${today}`],
        [''],
        ['Material', 'Current Stock', 'Unit', 'Safety Stock', 'Reorder Point', 'Supplier', 'Category', 'Status'],
        ...materials.map(m => [
          m.name,
          m.currentStock.toString(),
          m.unit,
          m.safetyStock.toString(),
          m.reorderPoint.toString(),
          m.supplier,
          m.category,
          m.currentStock < m.safetyStock ? 'LOW STOCK' : 'OK'
        ]),
      ];
    } else if (activeTab === 'receipts') {
      csvData = [
        ['Inbound Receipts Report', `Date: ${today}`],
        [''],
        ['PO Number', 'Supplier', 'Expected Date', 'Status', 'Items'],
        ...receipts.map(r => [r.poNumber, r.supplier, r.expectedDate, r.status, r.items]),
      ];
    } else {
      csvData = [
        ['Material Requisitions Report', `Date: ${today}`],
        [''],
        ['Req Number', 'Material', 'Quantity', 'Requested By', 'Line', 'Status', 'Date'],
        ...requisitions.map(r => [r.reqNumber, r.material, r.quantity.toString(), r.requestedBy, r.line, r.status, r.date]),
      ];
    }
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw-materials-${activeTab}-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockMaterials = materials.filter(m => m.currentStock < m.safetyStock);
  const criticalStockMaterials = materials.filter(m => m.currentStock < m.safetyStock * 0.5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Materials"
        subtitle="Inventory and supplier management"
        actions={
          <>
            <button 
              onClick={exportData}
              className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center gap-2"
            >
              <Plus size={16} />
              Add Material
            </button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-[#3B82F6]" />
            <span className="text-xs text-[#757575] uppercase font-bold">Total Materials</span>
          </div>
          <p className="text-2xl font-bold text-[#212121]">{materials.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-[#EF4444]" />
            <span className="text-xs text-[#757575] uppercase font-bold">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-[#EF4444]">{lowStockMaterials.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-[#F59E0B]" />
            <span className="text-xs text-[#757575] uppercase font-bold">Pending Receipts</span>
          </div>
          <p className="text-2xl font-bold text-[#F59E0B]">{receipts.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-[#16A34A]" />
            <span className="text-xs text-[#757575] uppercase font-bold">Requisitions</span>
          </div>
          <p className="text-2xl font-bold text-[#16A34A]">{requisitions.filter(r => r.status === 'pending').length}</p>
          <p className="text-xs text-[#757575]">Pending Approval</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#E0E0E0]">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'inventory'
                ? 'bg-[#16A34A] text-white'
                : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#F5F5F5]'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'receipts'
                ? 'bg-[#16A34A] text-white'
                : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#F5F5F5]'
            }`}
          >
            Inbound Receipts
          </button>
          <button
            onClick={() => setActiveTab('requisitions')}
            className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'requisitions'
                ? 'bg-[#16A34A] text-white'
                : 'bg-[#FAFAFA] text-[#757575] hover:bg-[#F5F5F5]'
            }`}
          >
            Requisitions
          </button>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={16} />
                <input 
                  type="text" 
                  placeholder="Search materials..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#F5F5F5] border-transparent text-sm focus:bg-white focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
                  <tr>
                    <th className="px-6 py-3">Material</th>
                    <th className="px-6 py-3">Current Stock</th>
                    <th className="px-6 py-3">Safety Stock</th>
                    <th className="px-6 py-3">Reorder Point</th>
                    <th className="px-6 py-3">Supplier</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {filteredMaterials.map(material => {
                    const isLowStock = material.currentStock < material.safetyStock;
                    const isCritical = material.currentStock < material.safetyStock * 0.5;
                    
                    return (
                      <tr key={material.id} className="hover:bg-[#FAFAFA]">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[#212121]">{material.name}</p>
                            <p className="text-xs text-[#757575]">{material.category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isCritical ? 'text-[#EF4444]' : isLowStock ? 'text-[#F59E0B]' : 'text-[#212121]'}`}>
                            {material.currentStock} {material.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#616161]">{material.safetyStock} {material.unit}</td>
                        <td className="px-6 py-4 text-[#616161]">{material.reorderPoint} {material.unit}</td>
                        <td className="px-6 py-4 text-[#616161]">{material.supplier}</td>
                        <td className="px-6 py-4">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#991B1B]">
                              Critical
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF9C3] text-[#854D0E]">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#166534]">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(isLowStock || isCritical) && (
                            <button 
                              onClick={() => orderMaterial(material.id)}
                              className="text-[#16A34A] hover:text-[#15803D] font-medium text-xs"
                            >
                              Order Now
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <div className="p-6 space-y-4">
            {receipts.map(receipt => (
              <div 
                key={receipt.id}
                className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#212121]">{receipt.poNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        receipt.status === 'received' ? 'bg-green-100 text-green-800' :
                        receipt.status === 'docking' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {receipt.status === 'docking' ? 'Docking' : receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-[#616161]">{receipt.supplier}</p>
                    <p className="text-xs text-[#757575] mt-1">{receipt.items}</p>
                    <p className="text-xs text-[#757575]">Expected: {receipt.expectedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowReceiptModal(receipt)}
                      className="text-xs font-medium text-[#3B82F6] hover:text-[#2563EB]"
                    >
                      View Details
                    </button>
                    {receipt.status !== 'received' && (
                      <button 
                        onClick={() => receiveShipment(receipt.id)}
                        className="text-xs font-medium text-[#16A34A] hover:text-[#15803D]"
                      >
                        Mark Received
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Requisitions Tab */}
        {activeTab === 'requisitions' && (
          <div className="p-6">
            <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
                  <tr>
                    <th className="px-6 py-3">Req #</th>
                    <th className="px-6 py-3">Material</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Requested By</th>
                    <th className="px-6 py-3">Line</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {requisitions.map(req => (
                    <tr key={req.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-6 py-4 font-mono font-medium text-[#212121]">{req.reqNumber}</td>
                      <td className="px-6 py-4 text-[#616161]">{req.material}</td>
                      <td className="px-6 py-4 text-[#212121]">{req.quantity}</td>
                      <td className="px-6 py-4 text-[#616161]">{req.requestedBy}</td>
                      <td className="px-6 py-4 text-[#616161]">{req.line}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.status === 'issued' ? 'bg-[#DCFCE7] text-[#166534]' :
                          req.status === 'approved' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                          req.status === 'rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          'bg-[#FEF9C3] text-[#854D0E]'
                        }`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {req.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateRequisitionStatus(req.id, 'approved')}
                                className="text-[#16A34A] hover:text-[#15803D] font-medium text-xs"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => updateRequisitionStatus(req.id, 'rejected')}
                                className="text-[#EF4444] hover:text-[#DC2626] font-medium text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {req.status === 'approved' && (
                            <button 
                              onClick={() => updateRequisitionStatus(req.id, 'issued')}
                              className="text-[#16A34A] hover:text-[#15803D] font-medium text-xs"
                            >
                              Issue Material
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">Add New Material</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Material Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Organic Oats"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Current Stock</label>
                  <input 
                    type="number"
                    placeholder="1000"
                    value={newMaterial.currentStock}
                    onChange={(e) => setNewMaterial({...newMaterial, currentStock: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Unit</label>
                  <input 
                    type="text"
                    placeholder="kg, L, Rolls"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Safety Stock</label>
                  <input 
                    type="number"
                    placeholder="200"
                    value={newMaterial.safetyStock}
                    onChange={(e) => setNewMaterial({...newMaterial, safetyStock: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Reorder Point</label>
                  <input 
                    type="number"
                    placeholder="300"
                    value={newMaterial.reorderPoint}
                    onChange={(e) => setNewMaterial({...newMaterial, reorderPoint: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Supplier</label>
                <input 
                  type="text"
                  placeholder="Supplier name"
                  value={newMaterial.supplier}
                  onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Category</label>
                <input 
                  type="text"
                  placeholder="e.g., Grains, Ingredients"
                  value={newMaterial.category}
                  onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#E0E0E0] flex gap-3 justify-end">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <button 
                onClick={addMaterial}
                className="px-4 py-2 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB]"
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Details Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">{showReceiptModal.poNumber}</h3>
              <button onClick={() => setShowReceiptModal(null)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <span className="text-xs text-[#757575]">Supplier</span>
                <p className="font-bold text-[#212121]">{showReceiptModal.supplier}</p>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Expected Date</span>
                <p className="font-bold text-[#212121]">{showReceiptModal.expectedDate}</p>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Items</span>
                <p className="font-bold text-[#212121]">{showReceiptModal.items}</p>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Status</span>
                <p className="font-bold text-[#212121] capitalize">{showReceiptModal.status}</p>
              </div>
            </div>
            {showReceiptModal.status !== 'received' && (
              <div className="p-6 border-t border-[#E0E0E0]">
                <button 
                  onClick={() => receiveShipment(showReceiptModal.id)}
                  className="w-full px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Mark as Received
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}