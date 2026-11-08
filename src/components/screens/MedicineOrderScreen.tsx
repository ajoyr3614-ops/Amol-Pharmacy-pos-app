/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  Package,
  Building2
} from 'lucide-react';
import { MedicineOrder, MedicineOrderItem, AppSettings, UnitType, OrderStatus } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface MedicineOrderScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const MedicineOrderScreen: React.FC<MedicineOrderScreenProps> = ({ settings, onBack }) => {
  const isDark = settings.theme === 'dark';
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('Square Pharmaceuticals');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [totalBillAmount, setTotalBillAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Multi-medicine item list for order
  const [items, setItems] = useState<MedicineOrderItem[]>([
    { medicineName: 'Seclo 20mg Capsule', quantity: 10, unit: 'box' }
  ]);
  const [tempMedName, setTempMedName] = useState('');
  const [tempQty, setTempQty] = useState(5);
  const [tempUnit, setTempUnit] = useState<UnitType>('box');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setOrders(StorageService.getMedicineOrders());
  };

  const handleAddItemToOrder = () => {
    if (!tempMedName.trim()) return;
    setItems([...items, { medicineName: tempMedName.trim(), quantity: tempQty, unit: tempUnit }]);
    setTempMedName('');
    setTempQty(5);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveOrder = () => {
    if (!companyName.trim() || items.length === 0 || totalBillAmount <= 0) {
      alert('Company name, order medicines, and total bill amount are required.');
      return;
    }

    const newOrder: MedicineOrder = {
      id: 'mo-' + Date.now(),
      orderNumber: `ORD-${Date.now().toString().slice(-5)}`,
      companyName: companyName.trim(),
      orderDate,
      expectedDeliveryDate,
      items,
      totalBillAmount,
      notes: notes.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    StorageService.saveMedicineOrder(newOrder);
    setShowAddModal(false);
    setItems([]);
    setTotalBillAmount(0);
    setNotes('');
    loadOrders();
  };

  // Status updates
  const handleStatusChange = (order: MedicineOrder, newStatus: OrderStatus) => {
    if (newStatus === 'cancelled') {
      const confirmed = window.confirm(
        `Are you sure you want to cancel order "${order.orderNumber}"? This will immediately delete the order from the system.`
      );
      if (confirmed) {
        StorageService.deleteMedicineOrder(order.id);
        loadOrders();
      }
      return;
    }

    order.status = newStatus;
    StorageService.saveMedicineOrder(order);
    loadOrders();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'due_today':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isDark ? 'bg-neutral-900 border-neutral-600 text-white' : 'bg-neutral-100 border-neutral-400 text-black'
          }`}>
            DUE TODAY
          </span>
        );
      case 'overdue':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
          }`}>
            OVERDUE
          </span>
        );
      case 'received':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-700'
          }`}>
            RECEIVED
          </span>
        );
      default:
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
          }`}>
            PENDING
          </span>
        );
    }
  };

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header - Minimalist Monochrome */}
      <div className={`px-4 py-3.5 border-b flex items-center justify-between sticky top-0 z-20 ${
        isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-xl border transition ${
              isDark ? 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-white' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-black'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold">Medicine Orders</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Company Order Book &amp; Tracking
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition ${
            isDark
              ? 'bg-white text-black border-white hover:bg-neutral-200'
              : 'bg-black text-white border-black hover:bg-neutral-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Orders List */}
        {orders.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
          }`}>
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No medicine orders placed yet.</p>
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-extrabold">{order.companyName}</span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Order: {order.orderDate} • Expected: <strong>{order.expectedDeliveryDate}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black font-mono">
                    {settings.currency}{order.totalBillAmount.toFixed(2)}
                  </div>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
              </div>

              {/* Medicines in Order */}
              <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <span className={`font-bold text-[11px] block ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Ordered Medicines ({order.items.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {order.items.map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-200' : 'bg-white border-neutral-300 text-black'
                      }`}
                    >
                      {item.medicineName} — <strong>{item.quantity} {item.unit}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className={`text-[11px] italic ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Note: {order.notes}
                </div>
              )}

              {/* Status Selector & Actions */}
              <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                isDark ? 'border-neutral-800' : 'border-neutral-100'
              }`}>
                <span className={`font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Status:
                </span>
                <div className="flex gap-1.5">
                  {order.status !== 'received' && (
                    <button
                      onClick={() => handleStatusChange(order, 'received')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition ${
                        isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
                      }`}
                    >
                      Mark Received
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(order, 'cancelled')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:text-black'
                    }`}
                  >
                    Cancel &amp; Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Add Medicine Order Modal --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className={`rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-neutral-50'
            }`}>
              <div>
                <h3 className="font-bold text-base">Create Medicine Order</h3>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Total bill only • No individual item prices needed
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded-lg border ${
                  isDark ? 'border-neutral-800 bg-neutral-900 text-white' : 'border-neutral-200 bg-neutral-50 text-black'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Beximco / Incepta"
                    className={`w-full p-2 border rounded-xl font-bold ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-bold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Total Bill Amount ({settings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={totalBillAmount || ''}
                    onChange={e => setTotalBillAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`w-full p-2 border rounded-xl font-bold font-mono ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Order Date</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={e => setOrderDate(e.target.value)}
                    className={`w-full p-2 border rounded-xl ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-bold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={e => setExpectedDeliveryDate(e.target.value)}
                    className={`w-full p-2 border rounded-xl font-bold ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  />
                </div>
              </div>

              {/* Multi-Medicine Items Picker */}
              <div className={`p-3 rounded-2xl border space-y-2 ${
                isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <span className={`font-bold block text-xs ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                  Add Medicines to Order
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempMedName}
                    onChange={e => setTempMedName(e.target.value)}
                    placeholder="Medicine name..."
                    className={`flex-1 p-2 border rounded-xl ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                    }`}
                  />
                  <input
                    type="number"
                    min="1"
                    value={tempQty}
                    onChange={e => setTempQty(parseInt(e.target.value) || 1)}
                    className={`w-16 p-2 border rounded-xl text-center font-bold ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                    }`}
                  />
                  <select
                    value={tempUnit}
                    onChange={e => setTempUnit(e.target.value as any)}
                    className={`p-2 border rounded-xl uppercase font-bold ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
                    }`}
                  >
                    <option value="box">Box</option>
                    <option value="strip">Strip</option>
                    <option value="piece">Piece</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    className={`px-3 rounded-xl font-bold border transition ${
                      isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
                    }`}
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 mt-2">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
                      }`}
                    >
                      <span className="font-medium">{it.medicineName} ({it.quantity} {it.unit})</span>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className={`p-1 rounded transition ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={`font-bold block mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>Optional Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Special instructions..."
                  className={`w-full p-2 border rounded-xl ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                  }`}
                />
              </div>
            </div>

            <div className={`p-3 border-t flex gap-2 ${
              isDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-200 border-neutral-300 text-black'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
                }`}
              >
                Save Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
