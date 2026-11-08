/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UnitType = 'piece' | 'strip' | 'box';

export interface UnitConversion {
  piecesPerStrip: number; // e.g. 10
  piecesPerBox: number;   // e.g. 100
}

export interface MedicineBatch {
  id: string;
  batchNumber: string; // Optional in UI, auto-generated if blank
  expiryDate: string;  // YYYY-MM-DD
  purchasePricePerPiece: number;
  stockInPieces: number;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  company: string;
  barcode: string;
  purchasePricePerPiece: number;
  salePricePerPiece: number;
  stockInPieces: number;
  conversion: UnitConversion;
  image?: string;
  batches: MedicineBatch[];
  minStockAlert: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  selectedUnit: UnitType;
  unitMultiplier: number; // 1 for piece, conversion.piecesPerStrip for strip, etc.
  quantity: number;        // in selectedUnit
  totalPieces: number;
  pricePerUnit: number;
  lineTotal: number;
}

export type PaymentMethod = 'cash' | 'online' | 'due' | 'mixed';

export interface PaymentBreakdown {
  cash: number;
  online: number;
  due: number;
}

export type MemoStatus = 'paid' | 'partial' | 'due';

export interface SaleTransaction {
  id: string;
  invoiceNo: string;
  date: string; // ISO string
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  items: CartItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed' | 'adjustment';
  discountValue: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  payments: PaymentBreakdown;
  paidAmount: number;
  remainingDue: number;
  status: MemoStatus;
  notes?: string;
}

export interface PurchaseItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  unit: UnitType;
  quantity: number;
  totalPieces: number;
  costPerPiece: number;
  lineTotal: number;
}

export interface PurchaseTransaction {
  id: string;
  invoiceNo: string;
  supplierId: string;
  supplierName: string;
  companyName: string;
  date: string;
  items: PurchaseItem[];
  totalBill: number;
  paidAmount: number;
  remainingDue: number;
  paymentMethod: 'cash' | 'online' | 'credit' | 'partial';
  payments: PaymentBreakdown;
  status: 'paid' | 'partial' | 'due';
  notes?: string;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. CUST-1001
  name: string;
  mobile: string;
  address: string;
  photo?: string;
  dueBalance: number;
  notes?: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'online';
  saleInvoiceNo?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  mobile: string;
  address: string;
  totalBill: number;
  totalPaid: number;
  remainingDue: number;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'online';
  purchaseInvoiceNo?: string;
  notes?: string;
}

export interface ExpiryDeliveryRecord {
  id: string;
  companyName: string;
  medicineName: string;
  batchNumber?: string;
  quantity: number;
  unit: UnitType;
  totalPieces: number;
  deliveryDate: string;
  totalReturnAmount: number;
  supplierName: string;
  amountReceived: number;
  remainingDue: number;
  status: 'paid' | 'partial' | 'unpaid';
  payments: {
    id: string;
    date: string;
    amount: number;
    notes?: string;
  }[];
  createdAt: string;
}

export type OrderStatus = 'pending' | 'due_today' | 'overdue' | 'received' | 'cancelled';

export interface MedicineOrderItem {
  medicineName: string;
  quantity: number;
  unit: UnitType;
}

export interface MedicineOrder {
  id: string;
  orderNumber: string;
  companyName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: MedicineOrderItem[];
  totalBillAmount: number;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface ReturnRecord {
  id: string;
  type: 'sale_return' | 'purchase_return';
  referenceInvoiceNo: string;
  date: string;
  partyName: string; // Customer or Supplier
  partyId?: string;
  medicineId: string;
  medicineName: string;
  batchNumber?: string;
  quantity: number;
  unit: UnitType;
  totalPieces: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface ExpenseRecord {
  id: string;
  categoryId: string;
  categoryName: string;
  date: string;
  amount: number;
  description: string;
  paymentMethod: 'cash' | 'online';
}

export interface AppSettings {
  pharmacyName: string;
  pharmacyLogo?: string;
  ownerName: string;
  mobileNumber: string;
  address: string;
  currency: string; // e.g. "BDT" or "৳"
  dateFormat: string; // e.g. "DD/MM/YYYY"
  language: 'en' | 'bn';
  theme: 'light' | 'dark';
  negativeStockAllowed: boolean;
  returnsEnabled: boolean;
  returnNoticeBangla: string; // "বিশেষ দ্রষ্টব্য: বিক্রিত ওষুধ ফেরত নেওয়া হয় না।"
  defaultPrinterSize: '58mm' | '80mm' | 'a4';
  autoBackupEnabled: boolean;
  lowStockThreshold: number;
  expiryWarningDays: number;
}

export interface PharmacySummary {
  todaySales: number;
  todayPurchase: number;
  todayExpenses: number;
  totalProfit: number;
  totalCustomerDue: number;
  totalSupplierDue: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  lowStockCount: number;
  expiringMedicinesCount: number;
}
