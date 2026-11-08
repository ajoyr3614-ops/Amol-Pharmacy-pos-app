/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Medicine,
  SaleTransaction,
  PurchaseTransaction,
  Customer,
  CustomerPayment,
  Supplier,
  SupplierPayment,
  ExpiryDeliveryRecord,
  MedicineOrder,
  ReturnRecord,
  ExpenseCategory,
  ExpenseRecord,
  AppSettings,
  PharmacySummary
} from '../types/pharmacy';

const STORAGE_KEYS = {
  MEDICINES: 'amol_pharmacy_medicines',
  SALES: 'amol_pharmacy_sales',
  PURCHASES: 'amol_pharmacy_purchases',
  CUSTOMERS: 'amol_pharmacy_customers',
  CUSTOMER_PAYMENTS: 'amol_pharmacy_customer_payments',
  SUPPLIERS: 'amol_pharmacy_suppliers',
  SUPPLIER_PAYMENTS: 'amol_pharmacy_supplier_payments',
  EXPIRY_DELIVERY: 'amol_pharmacy_expiry_delivery',
  MEDICINE_ORDERS: 'amol_pharmacy_medicine_orders',
  RETURNS: 'amol_pharmacy_returns',
  EXPENSE_CATEGORIES: 'amol_pharmacy_expense_categories',
  EXPENSES: 'amol_pharmacy_expenses',
  SETTINGS: 'amol_pharmacy_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  pharmacyName: 'Amol Pharmacy',
  pharmacyLogo: '',
  ownerName: 'Md. Amol Hossain',
  mobileNumber: '+880 1712-345678',
  address: 'Shop #14, Central Market, Station Road, Dhaka',
  currency: '৳',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  theme: 'light',
  negativeStockAllowed: true, // As requested: Negative stock must be ON by default
  returnsEnabled: true,
  returnNoticeBangla: 'বিশেষ দ্রষ্টব্য: বিক্রিত ওষুধ ফেরত নেওয়া হয় না।',
  defaultPrinterSize: '80mm',
  autoBackupEnabled: true,
  lowStockThreshold: 15,
  expiryWarningDays: 60,
};

const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-rent', name: 'Rent', isDefault: true },
  { id: 'cat-electricity', name: 'Electricity', isDefault: true },
  { id: 'cat-salary', name: 'Salary', isDefault: true },
  { id: 'cat-travel', name: 'Travel', isDefault: true },
  { id: 'cat-other', name: 'Other', isDefault: true },
];

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Napa Extra 500mg+65mg',
    genericName: 'Paracetamol + Caffeine',
    category: 'Tablet',
    company: 'Beximco Pharmaceuticals',
    barcode: '890123456701',
    purchasePricePerPiece: 2.10,
    salePricePerPiece: 2.50,
    stockInPieces: 250,
    conversion: { piecesPerStrip: 10, piecesPerBox: 200 },
    minStockAlert: 30,
    batches: [
      {
        id: 'batch-101',
        batchNumber: 'BEX-2401',
        expiryDate: '2027-08-30',
        purchasePricePerPiece: 2.10,
        stockInPieces: 150,
        createdAt: new Date().toISOString()
      },
      {
        id: 'batch-102',
        batchNumber: 'BEX-2402',
        expiryDate: '2026-12-15',
        purchasePricePerPiece: 2.10,
        stockInPieces: 100,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-2',
    name: 'Seclo 20mg Capsule',
    genericName: 'Omeprazole',
    category: 'Capsule',
    company: 'Square Pharmaceuticals',
    barcode: '890123456702',
    purchasePricePerPiece: 5.20,
    salePricePerPiece: 6.00,
    stockInPieces: 120,
    conversion: { piecesPerStrip: 10, piecesPerBox: 100 },
    minStockAlert: 20,
    batches: [
      {
        id: 'batch-201',
        batchNumber: 'SQR-8891',
        expiryDate: '2027-03-20',
        purchasePricePerPiece: 5.20,
        stockInPieces: 120,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-3',
    name: 'Ceevit 250mg Chewable',
    genericName: 'Vitamin C (Ascorbic Acid)',
    category: 'Tablet',
    company: 'Square Pharmaceuticals',
    barcode: '890123456703',
    purchasePricePerPiece: 1.60,
    salePricePerPiece: 2.00,
    stockInPieces: 180,
    conversion: { piecesPerStrip: 10, piecesPerBox: 100 },
    minStockAlert: 25,
    batches: [
      {
        id: 'batch-301',
        batchNumber: 'CV-1092',
        expiryDate: '2027-01-10',
        purchasePricePerPiece: 1.60,
        stockInPieces: 180,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-4',
    name: 'Azithrocin 500mg',
    genericName: 'Azithromycin',
    category: 'Tablet',
    company: 'Incepta Pharmaceuticals',
    barcode: '890123456704',
    purchasePricePerPiece: 30.00,
    salePricePerPiece: 35.00,
    stockInPieces: 8, // Low stock example
    conversion: { piecesPerStrip: 3, piecesPerBox: 30 },
    minStockAlert: 15,
    batches: [
      {
        id: 'batch-401',
        batchNumber: 'INC-7721',
        expiryDate: '2026-11-20', // Near expiry
        purchasePricePerPiece: 30.00,
        stockInPieces: 8,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'med-5',
    name: 'Monas 10mg',
    genericName: 'Montelukast Sodium',
    category: 'Tablet',
    company: 'Acme Laboratories',
    barcode: '890123456705',
    purchasePricePerPiece: 13.50,
    salePricePerPiece: 16.00,
    stockInPieces: 60,
    conversion: { piecesPerStrip: 10, piecesPerBox: 50 },
    minStockAlert: 20,
    batches: [
      {
        id: 'batch-501',
        batchNumber: 'ACM-4410',
        expiryDate: '2027-06-15',
        purchasePricePerPiece: 13.50,
        stockInPieces: 60,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customerId: 'CUST-1001',
    name: 'Kalam Mia',
    mobile: '01711223344',
    address: 'Station Road, Mirpur',
    dueBalance: 240,
    notes: 'Regular customer',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'cust-2',
    customerId: 'CUST-1002',
    name: 'Dr. Shahinur Alam',
    mobile: '01819556677',
    address: 'City Clinic Quarter',
    dueBalance: 0,
    notes: 'Doctor referral account',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Beximco Pharma Depot',
    companyName: 'Beximco Pharmaceuticals',
    mobile: '01911887766',
    address: 'Tejgaon I/A, Dhaka',
    totalBill: 15400,
    totalPaid: 12000,
    remainingDue: 3400,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'sup-2',
    name: 'Square Distribution Center',
    companyName: 'Square Pharmaceuticals',
    mobile: '01713998877',
    address: 'Uttara Sector 7, Dhaka',
    totalBill: 22800,
    totalPaid: 20000,
    remainingDue: 2800,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString()
  }
];

export class StorageService {
  private static load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private static save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // --- Initializer ---
  static initializeIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      this.save(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.save(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES)) {
      this.save(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.save(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.save(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      // Seed a few initial sales
      const sampleSales: SaleTransaction[] = [
        {
          id: 'sale-1',
          invoiceNo: 'INV-20261101-001',
          date: new Date().toISOString(),
          customerId: 'cust-1',
          customerName: 'Kalam Mia',
          customerMobile: '01711223344',
          items: [
            {
              id: 'item-1',
              medicineId: 'med-1',
              medicineName: 'Napa Extra 500mg+65mg',
              genericName: 'Paracetamol + Caffeine',
              selectedUnit: 'strip',
              unitMultiplier: 10,
              quantity: 2,
              totalPieces: 20,
              pricePerUnit: 25,
              lineTotal: 50
            },
            {
              id: 'item-2',
              medicineId: 'med-2',
              medicineName: 'Seclo 20mg Capsule',
              genericName: 'Omeprazole',
              selectedUnit: 'piece',
              unitMultiplier: 1,
              quantity: 10,
              totalPieces: 10,
              pricePerUnit: 6,
              lineTotal: 60
            }
          ],
          subtotal: 110,
          discountType: 'fixed',
          discountValue: 10,
          discountAmount: 10,
          grandTotal: 100,
          paymentMethod: 'cash',
          payments: { cash: 100, online: 0, due: 0 },
          paidAmount: 100,
          remainingDue: 0,
          status: 'paid'
        }
      ];
      this.save(STORAGE_KEYS.SALES, sampleSales);
    }
  }

  // --- Settings ---
  static getSettings(): AppSettings {
    return this.load<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    this.save(STORAGE_KEYS.SETTINGS, settings);
  }

  // --- Medicines ---
  static getMedicines(): Medicine[] {
    return this.load<Medicine[]>(STORAGE_KEYS.MEDICINES, []);
  }

  static saveMedicine(medicine: Medicine): void {
    const list = this.getMedicines();
    const index = list.findIndex(m => m.id === medicine.id);
    if (index >= 0) {
      list[index] = { ...medicine, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...medicine, updatedAt: new Date().toISOString() });
    }
    this.save(STORAGE_KEYS.MEDICINES, list);
  }

  static deleteMedicine(id: string): void {
    const list = this.getMedicines().filter(m => m.id !== id);
    this.save(STORAGE_KEYS.MEDICINES, list);
  }

  // --- Sales ---
  static getSales(): SaleTransaction[] {
    return this.load<SaleTransaction[]>(STORAGE_KEYS.SALES, []);
  }

  static processSale(sale: SaleTransaction): void {
    const sales = this.getSales();
    sales.unshift(sale);
    this.save(STORAGE_KEYS.SALES, sales);

    // Update Medicine Stock
    const medicines = this.getMedicines();
    sale.items.forEach(item => {
      const med = medicines.find(m => m.id === item.medicineId);
      if (med) {
        // Reduce stock in pieces
        med.stockInPieces -= item.totalPieces;

        // Reduce from specific batch if selected, or from earliest expiring batch (FIFO)
        if (med.batches && med.batches.length > 0) {
          let needed = item.totalPieces;
          const targetBatch = item.batchId ? med.batches.find(b => b.id === item.batchId) : null;
          if (targetBatch) {
            targetBatch.stockInPieces -= needed;
          } else {
            // Sort by expiry
            med.batches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
            for (const batch of med.batches) {
              if (batch.stockInPieces >= needed) {
                batch.stockInPieces -= needed;
                needed = 0;
                break;
              } else {
                needed -= batch.stockInPieces;
                batch.stockInPieces = 0;
              }
            }
            if (needed > 0 && med.batches.length > 0) {
              // Deduct remaining from first batch (handles negative batch stock)
              med.batches[0].stockInPieces -= needed;
            }
          }
        }
      }
    });
    this.save(STORAGE_KEYS.MEDICINES, medicines);

    // Update Customer Due Balance
    if (sale.customerId && sale.remainingDue > 0) {
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === sale.customerId);
      if (customer) {
        customer.dueBalance += sale.remainingDue;
        this.save(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }
  }

  // --- Purchases ---
  static getPurchases(): PurchaseTransaction[] {
    return this.load<PurchaseTransaction[]>(STORAGE_KEYS.PURCHASES, []);
  }

  static processPurchase(purchase: PurchaseTransaction): void {
    const purchases = this.getPurchases();
    purchases.unshift(purchase);
    this.save(STORAGE_KEYS.PURCHASES, purchases);

    // Increase stock in medicines and add/update batch
    const medicines = this.getMedicines();
    purchase.items.forEach(item => {
      const med = medicines.find(m => m.id === item.medicineId);
      if (med) {
        med.stockInPieces += item.totalPieces;
        // Check if batch exists
        const existingBatch = med.batches.find(b => b.batchNumber === item.batchNumber && item.batchNumber);
        if (existingBatch) {
          existingBatch.stockInPieces += item.totalPieces;
          existingBatch.purchasePricePerPiece = item.costPerPiece;
          if (item.expiryDate) existingBatch.expiryDate = item.expiryDate;
        } else {
          med.batches.push({
            id: 'batch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            batchNumber: item.batchNumber || `B-${Date.now().toString().slice(-4)}`,
            expiryDate: item.expiryDate || new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
            purchasePricePerPiece: item.costPerPiece,
            stockInPieces: item.totalPieces,
            createdAt: new Date().toISOString()
          });
        }
      }
    });
    this.save(STORAGE_KEYS.MEDICINES, medicines);

    // Update Supplier Balance based strictly on transactions
    const suppliers = this.getSuppliers();
    const supplier = suppliers.find(s => s.id === purchase.supplierId);
    if (supplier) {
      supplier.totalBill += purchase.totalBill;
      supplier.totalPaid += purchase.paidAmount;
      supplier.remainingDue = supplier.totalBill - supplier.totalPaid;
      this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
    }
  }

  // --- Customers ---
  static getCustomers(): Customer[] {
    return this.load<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  }

  static saveCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.unshift(customer);
    }
    this.save(STORAGE_KEYS.CUSTOMERS, customers);
  }

  static recordCustomerPayment(payment: CustomerPayment): void {
    const payments = this.getCustomerPayments();
    payments.unshift(payment);
    this.save(STORAGE_KEYS.CUSTOMER_PAYMENTS, payments);

    // Deduct due
    const customers = this.getCustomers();
    const customer = customers.find(c => c.id === payment.customerId);
    if (customer) {
      customer.dueBalance = Math.max(0, customer.dueBalance - payment.amount);
      this.save(STORAGE_KEYS.CUSTOMERS, customers);
    }
  }

  static getCustomerPayments(customerId?: string): CustomerPayment[] {
    const all = this.load<CustomerPayment[]>(STORAGE_KEYS.CUSTOMER_PAYMENTS, []);
    if (!customerId) return all;
    return all.filter(p => p.customerId === customerId);
  }

  // --- Suppliers ---
  static getSuppliers(): Supplier[] {
    return this.load<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
  }

  static saveSupplier(supplier: Supplier): void {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex(s => s.id === supplier.id);
    if (index >= 0) {
      suppliers[index] = supplier;
    } else {
      suppliers.unshift(supplier);
    }
    this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  static recordSupplierPayment(payment: SupplierPayment): void {
    const payments = this.getSupplierPayments();
    payments.unshift(payment);
    this.save(STORAGE_KEYS.SUPPLIER_PAYMENTS, payments);

    // Update supplier ledger
    const suppliers = this.getSuppliers();
    const supplier = suppliers.find(s => s.id === payment.supplierId);
    if (supplier) {
      supplier.totalPaid += payment.amount;
      supplier.remainingDue = Math.max(0, supplier.totalBill - supplier.totalPaid);
      this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
    }
  }

  static getSupplierPayments(supplierId?: string): SupplierPayment[] {
    const all = this.load<SupplierPayment[]>(STORAGE_KEYS.SUPPLIER_PAYMENTS, []);
    if (!supplierId) return all;
    return all.filter(p => p.supplierId === supplierId);
  }

  // --- Expiry Delivery ---
  static getExpiryDeliveries(): ExpiryDeliveryRecord[] {
    return this.load<ExpiryDeliveryRecord[]>(STORAGE_KEYS.EXPIRY_DELIVERY, []);
  }

  static saveExpiryDelivery(record: ExpiryDeliveryRecord): void {
    const records = this.getExpiryDeliveries();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }
    this.save(STORAGE_KEYS.EXPIRY_DELIVERY, records);
  }

  static recordExpiryDeliveryPayment(recordId: string, amount: number, notes?: string): void {
    const records = this.getExpiryDeliveries();
    const record = records.find(r => r.id === recordId);
    if (record) {
      record.amountReceived += amount;
      record.remainingDue = Math.max(0, record.totalReturnAmount - record.amountReceived);
      record.status = record.remainingDue === 0 ? 'paid' : (record.amountReceived > 0 ? 'partial' : 'unpaid');
      record.payments.unshift({
        id: 'edp-' + Date.now(),
        date: new Date().toISOString(),
        amount,
        notes
      });
      this.save(STORAGE_KEYS.EXPIRY_DELIVERY, records);
    }
  }

  // --- Medicine Orders ---
  static getMedicineOrders(): MedicineOrder[] {
    const orders = this.load<MedicineOrder[]>(STORAGE_KEYS.MEDICINE_ORDERS, []);
    // Update statuses dynamically based on current date
    const todayStr = new Date().toISOString().split('T')[0];
    orders.forEach(order => {
      if (order.status !== 'received' && order.status !== 'cancelled') {
        if (order.expectedDeliveryDate < todayStr) {
          order.status = 'overdue';
        } else if (order.expectedDeliveryDate === todayStr) {
          order.status = 'due_today';
        } else {
          order.status = 'pending';
        }
      }
    });
    return orders;
  }

  static saveMedicineOrder(order: MedicineOrder): void {
    const orders = this.getMedicineOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    this.save(STORAGE_KEYS.MEDICINE_ORDERS, orders);
  }

  static deleteMedicineOrder(id: string): void {
    const orders = this.getMedicineOrders().filter(o => o.id !== id);
    this.save(STORAGE_KEYS.MEDICINE_ORDERS, orders);
  }

  // --- Returns ---
  static getReturns(): ReturnRecord[] {
    return this.load<ReturnRecord[]>(STORAGE_KEYS.RETURNS, []);
  }

  static processReturn(ret: ReturnRecord): void {
    const returns = this.getReturns();
    returns.unshift(ret);
    this.save(STORAGE_KEYS.RETURNS, returns);

    // Update stock:
    // Sales return -> customer returns medicine to pharmacy -> stock increases
    // Purchase return -> pharmacy returns medicine to supplier -> stock decreases
    const medicines = this.getMedicines();
    const med = medicines.find(m => m.id === ret.medicineId);
    if (med) {
      if (ret.type === 'sale_return') {
        med.stockInPieces += ret.totalPieces;
      } else {
        med.stockInPieces -= ret.totalPieces;
      }
      this.save(STORAGE_KEYS.MEDICINES, medicines);
    }

    // Update financial ledger if party is linked
    if (ret.type === 'sale_return' && ret.partyId) {
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === ret.partyId);
      if (customer) {
        customer.dueBalance = Math.max(0, customer.dueBalance - ret.refundAmount);
        this.save(STORAGE_KEYS.CUSTOMERS, customers);
      }
    } else if (ret.type === 'purchase_return' && ret.partyId) {
      const suppliers = this.getSuppliers();
      const supplier = suppliers.find(s => s.id === ret.partyId);
      if (supplier) {
        supplier.totalBill -= ret.refundAmount;
        supplier.remainingDue = Math.max(0, supplier.totalBill - supplier.totalPaid);
        this.save(STORAGE_KEYS.SUPPLIERS, suppliers);
      }
    }
  }

  // --- Expenses ---
  static getExpenseCategories(): ExpenseCategory[] {
    return this.load<ExpenseCategory[]>(STORAGE_KEYS.EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES);
  }

  static saveExpenseCategory(cat: ExpenseCategory): void {
    const categories = this.getExpenseCategories();
    const index = categories.findIndex(c => c.id === cat.id);
    if (index >= 0) {
      categories[index] = cat;
    } else {
      categories.push(cat);
    }
    this.save(STORAGE_KEYS.EXPENSE_CATEGORIES, categories);
  }

  static deleteExpenseCategory(id: string): void {
    const categories = this.getExpenseCategories().filter(c => c.id !== id);
    this.save(STORAGE_KEYS.EXPENSE_CATEGORIES, categories);
  }

  static getExpenses(): ExpenseRecord[] {
    return this.load<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, []);
  }

  static saveExpense(expense: ExpenseRecord): void {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index >= 0) {
      expenses[index] = expense;
    } else {
      expenses.unshift(expense);
    }
    this.save(STORAGE_KEYS.EXPENSES, expenses);
  }

  static deleteExpense(id: string): void {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.save(STORAGE_KEYS.EXPENSES, expenses);
  }

  // --- Dashboard Summary Calculations ---
  static getSummary(): PharmacySummary {
    const todayStr = new Date().toISOString().split('T')[0];
    const sales = this.getSales();
    const purchases = this.getPurchases();
    const expenses = this.getExpenses();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();
    const medicines = this.getMedicines();
    const settings = this.getSettings();

    // Today's Sales
    const todaySales = sales
      .filter(s => s.date.startsWith(todayStr))
      .reduce((sum, s) => sum + s.grandTotal, 0);

    // Today's Purchases
    const todayPurchase = purchases
      .filter(p => p.date.startsWith(todayStr))
      .reduce((sum, p) => sum + p.totalBill, 0);

    // Today's Expenses
    const todayExpenses = expenses
      .filter(e => e.date.startsWith(todayStr))
      .reduce((sum, e) => sum + e.amount, 0);

    // Total Profit (Total Sales Grand Total minus Cost of Sold Goods minus Total Expenses)
    let totalSalesRevenue = 0;
    let totalSalesCost = 0;
    sales.forEach(sale => {
      totalSalesRevenue += sale.grandTotal;
      sale.items.forEach(item => {
        const med = medicines.find(m => m.id === item.medicineId);
        const costPrice = med ? med.purchasePricePerPiece : 0;
        totalSalesCost += costPrice * item.totalPieces;
      });
    });
    const totalAllExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalProfit = Math.max(0, totalSalesRevenue - totalSalesCost - totalAllExpenses);

    // Dues
    const totalCustomerDue = customers.reduce((sum, c) => sum + (c.dueBalance || 0), 0);
    const totalSupplierDue = suppliers.reduce((sum, s) => sum + (s.remainingDue || 0), 0);

    // Stock checks
    const lowStockCount = medicines.filter(m => m.stockInPieces <= (m.minStockAlert || settings.lowStockThreshold)).length;

    const nowTime = Date.now();
    const expiryThresholdTime = nowTime + settings.expiryWarningDays * 86400000;
    let expiringMedicinesCount = 0;

    medicines.forEach(m => {
      let isExpiring = false;
      if (m.batches && m.batches.length > 0) {
        for (const b of m.batches) {
          const expTime = new Date(b.expiryDate).getTime();
          if (expTime <= expiryThresholdTime) {
            isExpiring = true;
            break;
          }
        }
      }
      if (isExpiring) expiringMedicinesCount++;
    });

    return {
      todaySales,
      todayPurchase,
      todayExpenses,
      totalProfit,
      totalCustomerDue,
      totalSupplierDue,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalProducts: medicines.length,
      lowStockCount,
      expiringMedicinesCount
    };
  }

  // --- Backup & Restore ---
  static exportFullBackup(): string {
    const backupData = {
      app: 'Amol Pharmacy Management',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      medicines: this.getMedicines(),
      sales: this.getSales(),
      purchases: this.getPurchases(),
      customers: this.getCustomers(),
      customerPayments: this.load(STORAGE_KEYS.CUSTOMER_PAYMENTS, []),
      suppliers: this.getSuppliers(),
      supplierPayments: this.load(STORAGE_KEYS.SUPPLIER_PAYMENTS, []),
      expiryDeliveries: this.getExpiryDeliveries(),
      medicineOrders: this.getMedicineOrders(),
      returns: this.getReturns(),
      expenseCategories: this.getExpenseCategories(),
      expenses: this.getExpenses(),
      settings: this.getSettings()
    };
    return JSON.stringify(backupData, null, 2);
  }

  static importFullBackup(jsonContent: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonContent);
      if (!data || !data.medicines || !data.settings) {
        return { success: false, message: 'Invalid backup file structure.' };
      }
      if (data.medicines) this.save(STORAGE_KEYS.MEDICINES, data.medicines);
      if (data.sales) this.save(STORAGE_KEYS.SALES, data.sales);
      if (data.purchases) this.save(STORAGE_KEYS.PURCHASES, data.purchases);
      if (data.customers) this.save(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.customerPayments) this.save(STORAGE_KEYS.CUSTOMER_PAYMENTS, data.customerPayments);
      if (data.suppliers) this.save(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.supplierPayments) this.save(STORAGE_KEYS.SUPPLIER_PAYMENTS, data.supplierPayments);
      if (data.expiryDeliveries) this.save(STORAGE_KEYS.EXPIRY_DELIVERY, data.expiryDeliveries);
      if (data.medicineOrders) this.save(STORAGE_KEYS.MEDICINE_ORDERS, data.medicineOrders);
      if (data.returns) this.save(STORAGE_KEYS.RETURNS, data.returns);
      if (data.expenseCategories) this.save(STORAGE_KEYS.EXPENSE_CATEGORIES, data.expenseCategories);
      if (data.expenses) this.save(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.settings) this.save(STORAGE_KEYS.SETTINGS, data.settings);
      return { success: true, message: 'Database restored successfully!' };
    } catch (e: any) {
      return { success: false, message: 'Failed to restore: ' + (e?.message || 'Parse error') };
    }
  }

  static resetToDefault(): void {
    localStorage.clear();
    this.initializeIfEmpty();
  }
}
