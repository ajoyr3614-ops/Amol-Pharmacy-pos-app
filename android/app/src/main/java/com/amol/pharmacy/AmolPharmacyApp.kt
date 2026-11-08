package com.amol.pharmacy

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.amol.pharmacy.data.local.AppDatabase
import com.amol.pharmacy.worker.DailySummaryWorker
import com.amol.pharmacy.worker.ExpiryNotificationWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import java.util.concurrent.TimeUnit

class AmolPharmacyApp : Application() {

    val applicationScope = CoroutineScope(SupervisorJob())
    val database by lazy { AppDatabase.getDatabase(this, applicationScope) }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        scheduleBackgroundWorkers()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID_ALERTS,
                "Pharmacy Alerts & Summaries",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Daily summaries, low stock warnings, expiry alerts, and medicine order notifications"
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    private fun scheduleBackgroundWorkers() {
        val workManager = WorkManager.getInstance(this)

        // Expiry & Overdue check every 12 hours
        val expiryWorkRequest = PeriodicWorkRequestBuilder<ExpiryNotificationWorker>(12, TimeUnit.HOURS)
            .build()
        workManager.enqueueUniquePeriodicWork(
            "ExpiryNotificationWorker",
            ExistingPeriodicWorkPolicy.KEEP,
            expiryWorkRequest
        )

        // Daily evening summary worker
        val summaryWorkRequest = PeriodicWorkRequestBuilder<DailySummaryWorker>(24, TimeUnit.HOURS)
            .build()
        workManager.enqueueUniquePeriodicWork(
            "DailySummaryWorker",
            ExistingPeriodicWorkPolicy.KEEP,
            summaryWorkRequest
        )
    }

    companion object {
        const val CHANNEL_ID_ALERTS = "pharmacy_alerts"
    }
}
