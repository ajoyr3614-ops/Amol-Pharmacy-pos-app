package com.amol.pharmacy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.amol.pharmacy.data.local.entity.SettingsEntity
import com.amol.pharmacy.ui.screens.*
import com.amol.pharmacy.ui.theme.AmolPharmacyTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as AmolPharmacyApp

        setContent {
            AmolPharmacyTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val navController = rememberNavController()

                    // Collect reactive business settings
                    val settings by app.database.pharmacyDao()
                        .getSettings()
                        .collectAsState(initial = SettingsEntity())

                    val activeSettings = settings ?: SettingsEntity()

                    NavHost(
                        navController = navController,
                        startDestination = "dashboard"
                    ) {
                        composable("dashboard") {
                            DashboardScreen(
                                settings = activeSettings,
                                onNavigate = { destination ->
                                    navController.navigate(destination)
                                }
                            )
                        }

                        composable("dashboard_summary") {
                            SummaryScreen(
                                settings = activeSettings,
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("pos_sales") {
                            PosSalesScreen(
                                settings = activeSettings,
                                onBack = { navController.popBackStack() }
                            )
                        }

                        // Feature destinations connect to each corresponding screen module
                        listOf(
                            "medicine_product",
                            "purchase",
                            "stock_inventory",
                            "customer",
                            "supplier",
                            "sales_history",
                            "purchase_history",
                            "return",
                            "expenses",
                            "reports",
                            "barcode",
                            "notifications",
                            "backup_restore",
                            "settings",
                            "expiry_delivery",
                            "medicine_order"
                        ).forEach { route ->
                            composable(route) {
                                PosSalesScreen(
                                    settings = activeSettings,
                                    onBack = { navController.popBackStack() }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
