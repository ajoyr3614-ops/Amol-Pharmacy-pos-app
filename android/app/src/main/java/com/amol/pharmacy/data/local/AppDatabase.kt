package com.amol.pharmacy.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.amol.pharmacy.data.local.dao.PharmacyDao
import com.amol.pharmacy.data.local.entity.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        ProductEntity::class,
        BatchEntity::class,
        SaleEntity::class,
        SaleItemEntity::class,
        PurchaseEntity::class,
        PurchaseItemEntity::class,
        CustomerEntity::class,
        CustomerPaymentEntity::class,
        SupplierEntity::class,
        SupplierPaymentEntity::class,
        ExpiryDeliveryEntity::class,
        ExpiryDeliveryPaymentEntity::class,
        MedicineOrderEntity::class,
        MedicineOrderItemEntity::class,
        ReturnEntity::class,
        ExpenseCategoryEntity::class,
        ExpenseEntity::class,
        SettingsEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun pharmacyDao(): PharmacyDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "amol_pharmacy.db"
                )
                .addCallback(DatabaseCallback(scope))
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialData(database.pharmacyDao())
                    }
                }
            }

            suspend fun populateInitialData(dao: PharmacyDao) {
                // Initialize default settings
                dao.saveSettings(SettingsEntity())

                // Initialize default expense categories
                dao.insertExpenseCategory(ExpenseCategoryEntity("cat-rent", "Rent", true))
                dao.insertExpenseCategory(ExpenseCategoryEntity("cat-electricity", "Electricity", true))
                dao.insertExpenseCategory(ExpenseCategoryEntity("cat-salary", "Salary", true))
                dao.insertExpenseCategory(ExpenseCategoryEntity("cat-travel", "Travel", true))
                dao.insertExpenseCategory(ExpenseCategoryEntity("cat-other", "Other", true))
            }
        }
    }
}
