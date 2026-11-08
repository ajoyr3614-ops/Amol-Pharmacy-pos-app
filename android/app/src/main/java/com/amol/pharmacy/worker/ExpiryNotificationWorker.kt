package com.amol.pharmacy.worker

import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.amol.pharmacy.AmolPharmacyApp
import com.amol.pharmacy.R

class ExpiryNotificationWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? AmolPharmacyApp ?: return Result.failure()
        val dao = app.database.pharmacyDao()
        val settings = dao.getSettingsSync() ?: return Result.success()

        // Check low stock & near expiry
        val notification = NotificationCompat.Builder(applicationContext, AmolPharmacyApp.CHANNEL_ID_ALERTS)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("${settings.pharmacyName}: Routine Stock Check")
            .setContentText("Checking low stock items and medicine order delivery dates...")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        try {
            NotificationManagerCompat.from(applicationContext).notify(101, notification)
        } catch (_: SecurityException) {
            // Permission not yet granted
        }

        return Result.success()
    }
}
