package com.amol.pharmacy.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Product/Medicine Entity with unit conversion support.
 * All base calculations are in Pieces.
 */
@Entity(
    tableName = "products",
    indices = [Index(value = ["barcode"], unique = false)]
)
data class ProductEntity(
    @PrimaryKey val id: String,
    val name: String,
    val genericName: String,
    val category: String,
    val company: String,
    val barcode: String,
    val purchasePricePerPiece: Double,
    val salePricePerPiece: Double,
    val stockInPieces: Int,
    val piecesPerStrip: Int = 10,
    val piecesPerBox: Int = 100,
    val minStockAlert: Int = 15,
    val imageUri: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

/**
 * Multi-batch entity.
 * Batch number is optional (can be blank or auto-generated).
 */
@Entity(
    tableName = "batches",
    foreignKeys = [
        ForeignKey(
            entity = ProductEntity::class,
            parentColumns = ["id"],
            childColumns = ["productId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["productId"])]
)
data class BatchEntity(
    @PrimaryKey val id: String,
    val productId: String,
    val batchNumber: String, // Optional
    val expiryDate: String,  // YYYY-MM-DD
    val purchasePricePerPiece: Double,
    val stockInPieces: Int,
    val createdAt: Long = System.currentTimeMillis()
)

/**
 * Retail Sales Memo Entity.
 */
@Entity(tableName = "sales")
data class SaleEntity(
    @PrimaryKey val invoiceNo: String,
    val date: Long = System.currentTimeMillis(),
    val customerId: String? = null,
    val customerName: String? = null,
    val customerMobile: String? = null,
    val subtotal: Double,
    val discountType: String, // "percentage", "fixed", "adjustment"
    val discountValue: Double,
    val discountAmount: Double,
    val grandTotal: Double,
    val paidAmount: Double,
    val remainingDue: Double,
    val paymentMethod: String, // "cash", "online", "due", "mixed"
    val cashPaid: Double,
    val onlinePaid: Double,
    val status: String, // "paid", "partial", "due"
    val notes: String? = null
)

@Entity(
    tableName = "sale_items",
    foreignKeys = [
        ForeignKey(
            entity = SaleEntity::class,
            parentColumns = ["invoiceNo"],
            childColumns = ["saleInvoiceNo"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["saleInvoiceNo"])]
)
data class SaleItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val saleInvoiceNo: String,
    val productId: String,
    val productName: String,
    val genericName: String,
    val batchId: String? = null,
    val batchNumber: String? = null,
    val unit: String, // "piece", "strip", "box"
    val quantity: Int,
    val totalPieces: Int,
    val pricePerUnit: Double,
    val lineTotal: Double
)

/**
 * Purchase Transaction from Supplier.
 */
@Entity(tableName = "purchases")
data class PurchaseEntity(
    @PrimaryKey val invoiceNo: String,
    val supplierId: String,
    val supplierName: String,
    val companyName: String,
    val date: Long = System.currentTimeMillis(),
    val totalBill: Double,
    val paidAmount: Double,
    val remainingDue: Double,
    val paymentMethod: String,
    val cashPaid: Double,
    val onlinePaid: Double,
    val status: String,
    val notes: String? = null
)

@Entity(
    tableName = "purchase_items",
    foreignKeys = [
        ForeignKey(
            entity = PurchaseEntity::class,
            parentColumns = ["invoiceNo"],
            childColumns = ["purchaseInvoiceNo"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["purchaseInvoiceNo"])]
)
data class PurchaseItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val purchaseInvoiceNo: String,
    val productId: String,
    val productName: String,
    val batchNumber: String,
    val expiryDate: String,
    val unit: String,
    val quantity: Int,
    val totalPieces: Int,
    val costPerPiece: Double,
    val lineTotal: Double
)

/**
 * Customer Ledger Entity.
 */
@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey val id: String,
    val customerCode: String,
    val name: String,
    val mobile: String,
    val address: String,
    val photoUri: String? = null,
    val dueBalance: Double = 0.0,
    val notes: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "customer_payments")
data class CustomerPaymentEntity(
    @PrimaryKey val id: String,
    val customerId: String,
    val date: Long = System.currentTimeMillis(),
    val amount: Double,
    val paymentMethod: String,
    val saleInvoiceNo: String? = null,
    val notes: String? = null
)

/**
 * Supplier Ledger Entity.
 */
@Entity(tableName = "suppliers")
data class SupplierEntity(
    @PrimaryKey val id: String,
    val name: String,
    val companyName: String,
    val mobile: String,
    val address: String,
    val totalBill: Double = 0.0,
    val totalPaid: Double = 0.0,
    val remainingDue: Double = 0.0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "supplier_payments")
data class SupplierPaymentEntity(
    @PrimaryKey val id: String,
    val supplierId: String,
    val date: Long = System.currentTimeMillis(),
    val amount: Double,
    val paymentMethod: String,
    val purchaseInvoiceNo: String? = null,
    val notes: String? = null
)

/**
 * Expiry Delivery Module (organized by Company folders).
 */
@Entity(tableName = "expiry_deliveries")
data class ExpiryDeliveryEntity(
    @PrimaryKey val id: String,
    val companyName: String,
    val medicineName: String,
    val batchNumber: String? = null,
    val quantity: Int,
    val unit: String,
    val totalPieces: Int,
    val deliveryDate: String, // YYYY-MM-DD
    val totalReturnAmount: Double,
    val supplierName: String,
    val amountReceived: Double = 0.0,
    val remainingDue: Double = 0.0,
    val status: String = "unpaid", // "paid", "partial", "unpaid"
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "expiry_delivery_payments")
data class ExpiryDeliveryPaymentEntity(
    @PrimaryKey val id: String,
    val deliveryId: String,
    val date: Long = System.currentTimeMillis(),
    val amount: Double,
    val notes: String? = null
)

/**
 * Medicine Order Module.
 * Statuses: Pending, Due Today, Overdue, Received, Cancelled.
 */
@Entity(tableName = "medicine_orders")
data class MedicineOrderEntity(
    @PrimaryKey val id: String,
    val orderNumber: String,
    val companyName: String,
    val orderDate: String,
    val expectedDeliveryDate: String,
    val totalBillAmount: Double,
    val status: String = "pending", // "pending", "due_today", "overdue", "received", "cancelled"
    val notes: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "medicine_order_items")
data class MedicineOrderItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val orderId: String,
    val medicineName: String,
    val quantity: Int,
    val unit: String
)

/**
 * Returns (Sales Return & Purchase Return).
 */
@Entity(tableName = "returns")
data class ReturnEntity(
    @PrimaryKey val id: String,
    val type: String, // "sale_return" or "purchase_return"
    val referenceInvoiceNo: String,
    val date: Long = System.currentTimeMillis(),
    val partyName: String,
    val partyId: String? = null,
    val productId: String,
    val productName: String,
    val batchNumber: String? = null,
    val quantity: Int,
    val unit: String,
    val totalPieces: Int,
    val unitPrice: Double,
    val refundAmount: Double,
    val reason: String
)

/**
 * Expenses Module.
 */
@Entity(tableName = "expense_categories")
data class ExpenseCategoryEntity(
    @PrimaryKey val id: String,
    val name: String,
    val isDefault: Boolean = false
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val categoryId: String,
    val categoryName: String,
    val date: Long = System.currentTimeMillis(),
    val amount: Double,
    val description: String,
    val paymentMethod: String = "cash"
)

/**
 * Business & App Settings.
 */
@Entity(tableName = "settings")
data class SettingsEntity(
    @PrimaryKey val id: Int = 1,
    val pharmacyName: String = "Amol Pharmacy",
    val pharmacyLogo: String? = null,
    val ownerName: String = "Md. Amol Hossain",
    val mobileNumber: String = "+880 1712-345678",
    val address: String = "Shop #14, Station Road, Dhaka",
    val currency: String = "BDT",
    val dateFormat: String = "DD/MM/YYYY",
    val language: String = "en", // "en" or "bn"
    val theme: String = "light", // "light" or "dark"
    val negativeStockAllowed: Boolean = true,
    val returnsEnabled: Boolean = true,
    val returnNoticeBangla: String = "বিশেষ দ্রষ্টব্য: বিক্রিত ওষুধ ফেরত নেওয়া হয় না।",
    val defaultPrinterSize: String = "80mm",
    val autoBackupEnabled: Boolean = true,
    val lowStockThreshold: Int = 15,
    val expiryWarningDays: Int = 60
)
