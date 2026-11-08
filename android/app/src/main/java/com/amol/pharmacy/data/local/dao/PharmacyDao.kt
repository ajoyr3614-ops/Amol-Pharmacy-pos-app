package com.amol.pharmacy.data.local.dao

import androidx.room.*
import com.amol.pharmacy.data.local.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PharmacyDao {

    // --- Products ---
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE id = :id LIMIT 1")
    suspend fun getProductById(id: String): ProductEntity?

    @Query("SELECT * FROM products WHERE barcode = :barcode LIMIT 1")
    suspend fun getProductByBarcode(barcode: String): ProductEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity)

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Delete
    suspend fun deleteProduct(product: ProductEntity)

    @Query("UPDATE products SET stockInPieces = stockInPieces + :delta WHERE id = :productId")
    suspend fun updateProductStock(productId: String, delta: Int)

    // --- Batches ---
    @Query("SELECT * FROM batches WHERE productId = :productId ORDER BY expiryDate ASC")
    fun getBatchesForProduct(productId: String): Flow<List<BatchEntity>>

    @Query("SELECT * FROM batches WHERE productId = :productId ORDER BY expiryDate ASC")
    suspend fun getBatchesForProductSync(productId: String): List<BatchEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBatch(batch: BatchEntity)

    @Update
    suspend fun updateBatch(batch: BatchEntity)

    @Query("UPDATE batches SET stockInPieces = stockInPieces + :delta WHERE id = :batchId")
    suspend fun updateBatchStock(batchId: String, delta: Int)

    // --- Sales ---
    @Query("SELECT * FROM sales ORDER BY date DESC")
    fun getAllSales(): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE invoiceNo = :invoiceNo LIMIT 1")
    suspend fun getSaleByInvoice(invoiceNo: String): SaleEntity?

    @Query("SELECT * FROM sale_items WHERE saleInvoiceNo = :invoiceNo")
    suspend fun getSaleItems(invoiceNo: String): List<SaleItemEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSale(sale: SaleEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSaleItems(items: List<SaleItemEntity>)

    @Transaction
    suspend fun processSaleTransaction(
        sale: SaleEntity,
        items: List<SaleItemEntity>
    ) {
        insertSale(sale)
        insertSaleItems(items)
        for (item in items) {
            updateProductStock(item.productId, -item.totalPieces)
            if (item.batchId != null) {
                updateBatchStock(item.batchId, -item.totalPieces)
            }
        }
        if (sale.customerId != null && sale.remainingDue > 0) {
            updateCustomerDue(sale.customerId, sale.remainingDue)
        }
    }

    // --- Purchases ---
    @Query("SELECT * FROM purchases ORDER BY date DESC")
    fun getAllPurchases(): Flow<List<PurchaseEntity>>

    @Query("SELECT * FROM purchase_items WHERE purchaseInvoiceNo = :invoiceNo")
    suspend fun getPurchaseItems(invoiceNo: String): List<PurchaseItemEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchase(purchase: PurchaseEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPurchaseItems(items: List<PurchaseItemEntity>)

    @Transaction
    suspend fun processPurchaseTransaction(
        purchase: PurchaseEntity,
        items: List<PurchaseItemEntity>
    ) {
        insertPurchase(purchase)
        insertPurchaseItems(items)
        for (item in items) {
            updateProductStock(item.productId, item.totalPieces)
        }
        updateSupplierFinancials(purchase.supplierId, purchase.totalBill, purchase.paidAmount)
    }

    // --- Customers ---
    @Query("SELECT * FROM customers ORDER BY name ASC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Query("SELECT * FROM customers WHERE id = :id LIMIT 1")
    suspend fun getCustomerById(id: String): CustomerEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Query("UPDATE customers SET dueBalance = dueBalance + :dueDelta WHERE id = :customerId")
    suspend fun updateCustomerDue(customerId: String, dueDelta: Double)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomerPayment(payment: CustomerPaymentEntity)

    @Query("SELECT * FROM customer_payments WHERE customerId = :customerId ORDER BY date DESC")
    fun getCustomerPayments(customerId: String): Flow<List<CustomerPaymentEntity>>

    // --- Suppliers ---
    @Query("SELECT * FROM suppliers ORDER BY name ASC")
    fun getAllSuppliers(): Flow<List<SupplierEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSupplier(supplier: SupplierEntity)

    @Query("UPDATE suppliers SET totalBill = totalBill + :billDelta, totalPaid = totalPaid + :paidDelta, remainingDue = (totalBill + :billDelta) - (totalPaid + :paidDelta) WHERE id = :supplierId")
    suspend fun updateSupplierFinancials(supplierId: String, billDelta: Double, paidDelta: Double)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSupplierPayment(payment: SupplierPaymentEntity)

    @Query("SELECT * FROM supplier_payments WHERE supplierId = :supplierId ORDER BY date DESC")
    fun getSupplierPayments(supplierId: String): Flow<List<SupplierPaymentEntity>>

    // --- Expiry Delivery ---
    @Query("SELECT * FROM expiry_deliveries ORDER BY deliveryDate DESC")
    fun getAllExpiryDeliveries(): Flow<List<ExpiryDeliveryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpiryDelivery(record: ExpiryDeliveryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpiryDeliveryPayment(payment: ExpiryDeliveryPaymentEntity)

    @Query("UPDATE expiry_deliveries SET amountReceived = amountReceived + :amount, remainingDue = totalReturnAmount - (amountReceived + :amount), status = CASE WHEN (totalReturnAmount - (amountReceived + :amount)) <= 0 THEN 'paid' ELSE 'partial' END WHERE id = :id")
    suspend fun recordExpiryDeliveryPayment(id: String, amount: Double)

    // --- Medicine Orders ---
    @Query("SELECT * FROM medicine_orders ORDER BY expectedDeliveryDate ASC")
    fun getAllMedicineOrders(): Flow<List<MedicineOrderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMedicineOrder(order: MedicineOrderEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMedicineOrderItems(items: List<MedicineOrderItemEntity>)

    @Query("DELETE FROM medicine_orders WHERE id = :orderId")
    suspend fun deleteMedicineOrder(orderId: String)

    // --- Returns ---
    @Query("SELECT * FROM returns ORDER BY date DESC")
    fun getAllReturns(): Flow<List<ReturnEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReturn(record: ReturnEntity)

    // --- Expenses ---
    @Query("SELECT * FROM expenses ORDER BY date DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)

    @Query("SELECT * FROM expense_categories ORDER BY name ASC")
    fun getAllExpenseCategories(): Flow<List<ExpenseCategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpenseCategory(category: ExpenseCategoryEntity)

    // --- Settings ---
    @Query("SELECT * FROM settings WHERE id = 1 LIMIT 1")
    fun getSettings(): Flow<SettingsEntity?>

    @Query("SELECT * FROM settings WHERE id = 1 LIMIT 1")
    suspend fun getSettingsSync(): SettingsEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveSettings(settings: SettingsEntity)
}
