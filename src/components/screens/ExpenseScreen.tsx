/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  CreditCard,
  Tag
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategory, AppSettings } from '../../types/pharmacy';
import { StorageService } from '../../services/storage';

interface ExpenseScreenProps {
  settings: AppSettings;
  onBack: () => void;
}

export const ExpenseScreen: React.FC<ExpenseScreenProps> = ({ settings, onBack }) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  // Add Expense Modal
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');

  // Categories Modal
  const [showManageCatsModal, setShowManageCatsModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExpenses(StorageService.getExpenses());
    const cats = StorageService.getExpenseCategories();
    setCategories(cats);
    if (cats.length > 0 && !selectedCatId) {
      setSelectedCatId(cats[0].id);
    }
  };

  const handleSaveExpense = () => {
    if (!selectedCatId || amount <= 0) {
      alert('Please select category and enter valid amount.');
      return;
    }
    const cat = categories.find(c => c.id === selectedCatId);

    const newExp: ExpenseRecord = {
      id: 'exp-' + Date.now(),
      categoryId: selectedCatId,
      categoryName: cat?.name || 'Other',
      date: new Date(expenseDate).toISOString(),
      amount,
      description: description.trim() || `${cat?.name || 'General'} expense`,
      paymentMethod
    };

    StorageService.saveExpense(newExp);
    setShowAddExpenseModal(false);
    setAmount(0);
    setDescription('');
    loadData();
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: ExpenseCategory = {
      id: 'cat-' + Date.now(),
      name: newCatName.trim()
    };
    StorageService.saveExpenseCategory(newCat);
    setNewCatName('');
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    StorageService.deleteExpenseCategory(id);
    loadData();
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Delete this expense entry?')) {
      StorageService.deleteExpense(id);
      loadData();
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-full flex flex-col pb-20 ${isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
      {/* Header */}
      <div className={`px-4 py-3.5 border-b shadow-xs flex items-center justify-between sticky top-0 z-20 ${
        isDark ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-xl border transition ${
              isDark ? 'border-neutral-800 hover:bg-neutral-900 text-white' : 'border-neutral-200 hover:bg-neutral-100 text-black'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold tracking-tight">Expense Management</h1>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Shop Overheads &amp; Daily Expenses
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowManageCatsModal(true)}
            className={`p-1.5 rounded-xl border transition ${
              isDark ? 'border-neutral-800 hover:bg-neutral-900 text-white' : 'border-neutral-200 hover:bg-neutral-100 text-black'
            }`}
            title="Manage Categories"
          >
            <Tag className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition active:scale-95 ${
              isDark ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Expense Banner */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Recorded Expenses:</span>
            <div className="text-xl font-black text-rose-700 mt-0.5">
              {settings.currency}{totalExpenses.toFixed(2)}
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {expenses.length} Entries
          </span>
        </div>

        {/* Expenses List */}
        <div className="space-y-2.5">
          {expenses.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <DollarSign className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No expense records logged yet.</p>
            </div>
          ) : (
            expenses.map(exp => (
              <div
                key={exp.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded">
                      {exp.categoryName}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{exp.description}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(exp.date).toLocaleDateString()} • Method: {exp.paymentMethod.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm font-black text-rose-700">
                    -{settings.currency}{exp.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Add Expense Modal --- */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add Expense Entry</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Expense Category *</label>
                <select
                  value={selectedCatId}
                  onChange={e => setSelectedCatId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Amount ({settings.currency}) *</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={amount || ''}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-base"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Expense Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online / Card</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. October shop rent or electricity bill"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExpense}
                className="flex-1 py-2 bg-red-700 text-white font-bold rounded-xl text-xs hover:bg-red-800"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Manage Expense Categories Modal --- */}
      {showManageCatsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Expense Categories</h3>
              <button onClick={() => setShowManageCatsModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="New category..."
                className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
              <button
                onClick={handleAddCategory}
                className="px-3 py-2 bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Add
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat.id} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
