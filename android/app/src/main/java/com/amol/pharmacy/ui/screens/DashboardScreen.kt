package com.amol.pharmacy.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amol.pharmacy.data.local.entity.SettingsEntity

data class DashboardAction(
    val id: String,
    val title: String,
    val icon: ImageVector,
    val badge: String? = null
)

@Composable
fun DashboardScreen(
    settings: SettingsEntity,
    onNavigate: (String) -> Unit
) {
    // 18 Action Buttons formatted as compact squircle Android launcher icons
    val actionButtons = listOf(
        DashboardAction("dashboard_summary", "Dashboard Summary", Icons.Default.Dashboard, "11"),
        DashboardAction("pos_sales", "POS / Sales", Icons.Default.PointOfSale, "POS"),
        DashboardAction("medicine_product", "Medicine / Product", Icons.Default.Medication),
        DashboardAction("purchase", "Purchase", Icons.Default.ShoppingCart),
        DashboardAction("stock_inventory", "Stock / Inventory", Icons.Default.Inventory2),
        DashboardAction("customer", "Customer", Icons.Default.People),
        DashboardAction("supplier", "Supplier", Icons.Default.LocalShipping),
        DashboardAction("sales_history", "Sales History", Icons.Default.ReceiptLong),
        DashboardAction("purchase_history", "Purchase History", Icons.Default.History),
        DashboardAction("return", "Return", Icons.Default.AssignmentReturn),
        DashboardAction("expenses", "Expenses", Icons.Default.AccountBalanceWallet),
        DashboardAction("reports", "Reports", Icons.Default.Assessment),
        DashboardAction("barcode", "Barcode", Icons.Default.QrCodeScanner),
        DashboardAction("notifications", "Notifications", Icons.Default.Notifications, "3"),
        DashboardAction("backup_restore", "Backup & Restore", Icons.Default.SettingsBackupRestore),
        DashboardAction("settings", "Settings", Icons.Default.Settings),
        DashboardAction("expiry_delivery", "Expiry Delivery", Icons.Default.FolderSpecial),
        DashboardAction("medicine_order", "Medicine Order", Icons.Default.ShoppingBag)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
    ) {
        // --- Clean Minimalist Header (Dynamic Pharmacy Name & Actions) ---
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
                .padding(horizontal = 20.dp, vertical = 20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .background(MaterialTheme.colorScheme.onSurface, CircleShape)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "OFFLINE ROOM DB • NATIVE ANDROID",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = settings.pharmacyName, // Dynamic pharmacy name
                        color = MaterialTheme.colorScheme.onSurface,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = (-0.5).sp
                    )
                    Text(
                        text = settings.address,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        fontSize = 11.sp
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconButton(
                        onClick = { onNavigate("notifications") },
                        modifier = Modifier
                            .size(40.dp)
                            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Notifications,
                            contentDescription = "Alerts",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    IconButton(
                        onClick = { onNavigate("settings") },
                        modifier = Modifier
                            .size(40.dp)
                            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // --- Squircle Launcher Icon Grid (3 Columns) ---
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            actionButtons.chunked(3).forEach { rowButtons ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    rowButtons.forEach { btn ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .width(96.dp)
                                .clickable { onNavigate(btn.id) }
                                .padding(vertical = 4.dp)
                        ) {
                            // Squircle Icon Tile (like reference image)
                            Box(
                                modifier = Modifier
                                    .size(62.dp)
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(MaterialTheme.colorScheme.surface)
                                    .border(
                                        1.dp,
                                        MaterialTheme.colorScheme.outline.copy(alpha = 0.25f),
                                        RoundedCornerShape(20.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = btn.icon,
                                    contentDescription = btn.title,
                                    tint = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.size(28.dp)
                                )

                                if (btn.badge != null) {
                                    Box(
                                        modifier = Modifier
                                            .align(Alignment.TopEnd)
                                            .padding(top = 4.dp, end = 4.dp)
                                            .background(
                                                MaterialTheme.colorScheme.onSurface,
                                                CircleShape
                                            )
                                            .padding(horizontal = 5.dp, vertical = 1.dp)
                                    ) {
                                        Text(
                                            text = btn.badge,
                                            color = MaterialTheme.colorScheme.surface,
                                            fontSize = 8.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Action Title
                            Text(
                                text = btn.title,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                textAlign = TextAlign.Center,
                                maxLines = 2,
                                lineHeight = 14.sp
                            )
                        }
                    }

                    // Balance empty spots if less than 3
                    for (i in 0 until (3 - rowButtons.size)) {
                        Spacer(modifier = Modifier.width(96.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(30.dp))
    }
}
