package com.amol.pharmacy.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.amol.pharmacy.data.local.entity.ProductEntity
import com.amol.pharmacy.data.local.entity.SettingsEntity
import com.amol.pharmacy.ui.components.CameraBarcodeScannerDialog

data class PosCartItem(
    val product: ProductEntity,
    val unit: String, // "piece", "strip", "box"
    var quantity: Int,
    val pricePerUnit: Double,
    val multiplier: Int
) {
    val totalPieces: Int get() = quantity * multiplier
    val lineTotal: Double get() = quantity * pricePerUnit
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PosSalesScreen(
    settings: SettingsEntity,
    onBack: () => Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var showScanPopup by remember { mutableStateOf(false) }

    // Sample/Offline Products Catalog for lookup
    val allProducts = remember {
        mutableStateListOf(
            ProductEntity("1", "Napa Extra Tablet", "Paracetamol 500mg + Caffeine 65mg", "Tablet", "Beximco Pharmaceuticals", "890123456701", 2.20, 2.50, 480, 10, 100, 20),
            ProductEntity("2", "Seclo 20mg Capsule", "Omeprazole 20mg", "Capsule", "Square Pharmaceuticals", "890123456702", 4.50, 5.00, 320, 10, 100, 30),
            ProductEntity("3", "Ceevit 250mg Chewable", "Ascorbic Acid (Vitamin C)", "Chewable", "Square Pharmaceuticals", "890123456703", 1.80, 2.20, 250, 10, 100, 15),
            ProductEntity("4", "Azithrocin 500mg", "Azithromycin 500mg", "Tablet", "Incepta Pharmaceuticals", "890123456704", 30.00, 35.00, 120, 3, 30, 10),
            ProductEntity("5", "Sergel 20mg Tablet", "Esomeprazole Magnesium", "Tablet", "Healthcare Pharmaceuticals", "890123456705", 6.20, 7.00, 290, 14, 140, 25)
        )
    }

    // Cart State
    val cartItems = remember { mutableStateListOf<PosCartItem>() }

    // Product Info Popup State (Opened upon scanning barcode)
    var selectedProductForPopup by remember { mutableStateOf<ProductEntity?>(null) }
    var popupUnit by remember { mutableStateOf("piece") } // "piece", "strip", "box"
    var popupQuantity by remember { mutableIntStateOf(1) }

    // Not Found Barcode Alert
    var notFoundBarcode by remember { mutableStateOf<String?>(null) }

    // Discounts
    var discountValue by remember { mutableDoubleStateOf(0.0) }

    val subtotal = cartItems.sumOf { it.lineTotal }
    val discountAmount = discountValue
    val grandTotal = (subtotal - discountAmount).coerceAtLeast(0.0)

    // Lookup function matching barcode against database
    fun handleBarcodeScanned(barcode: String) {
        val trimmed = barcode.trim()
        if (trimmed.isEmpty()) return

        val found = allProducts.find { it.barcode.equals(trimmed, ignoreCase = true) }
        if (found != null) {
            notFoundBarcode = null
            showScanPopup = false
            selectedProductForPopup = found
            popupUnit = "piece"
            popupQuantity = 1
        } else {
            showScanPopup = false
            notFoundBarcode = trimmed
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("POS / Retail Billing", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                    navigationIconContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Search & Barcode Trigger Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Scan Barcode or Search...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Button(
                    onClick = {
                        if (searchQuery.isNotBlank()) {
                            handleBarcodeScanned(searchQuery)
                        } else {
                            showScanPopup = true
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary
                    )
                ) {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan")
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Scan")
                }
            }

            // Cart Area
            Text(
                text = "Current Memo / Cart (${cartItems.size} items)",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
            )

            if (cartItems.isEmpty()) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.QrCodeScanner,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Scan a medicine barcode to begin billing",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(cartItems) { item ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        item.product.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        "${item.quantity} ${item.unit} @ ${settings.currency}${item.pricePerUnit} = ${settings.currency}${item.lineTotal.format(2)}",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    IconButton(onClick = {
                                        if (item.quantity > 1) item.quantity--
                                    }) {
                                        Icon(
                                            Icons.Default.RemoveCircleOutline,
                                            contentDescription = "Decrease",
                                            tint = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                    Text("${item.quantity}", fontWeight = FontWeight.Bold)
                                    IconButton(onClick = { item.quantity++ }) {
                                        Icon(
                                            Icons.Default.AddCircleOutline,
                                            contentDescription = "Increase",
                                            tint = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                    IconButton(onClick = { cartItems.remove(item) }) {
                                        Icon(
                                            Icons.Default.DeleteOutline,
                                            contentDescription = "Remove",
                                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Summary & Checkout Bottom Bar
            Card(
                shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Subtotal", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        Text("${settings.currency}${subtotal.format(2)}", fontWeight = FontWeight.SemiBold)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Discount", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        Text("-${settings.currency}${discountAmount.format(2)}")
                    }
                    Divider(modifier = Modifier.padding(vertical = 8.dp), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Grand Total", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(
                            "${settings.currency}${grandTotal.format(2)}",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { /* Print Thermal */ },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Print, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Print Memo")
                        }

                        Button(
                            onClick = {
                                if (cartItems.isNotEmpty()) {
                                    cartItems.clear()
                                }
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            )
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Save Sale")
                        }
                    }
                }
            }
        }
    }

    // --- 1. CameraX + ML Kit Barcode Scanner Dialog ---
    if (showScanPopup) {
        CameraBarcodeScannerDialog(
            onDismissRequest = { showScanPopup = false },
            onBarcodeScanned = { rawBarcode ->
                handleBarcodeScanned(rawBarcode)
            }
        )
    }

    // --- 2. Product Information Popup (When Barcode is Scanned) ---
    // Rule: Scanning must NOT immediately add medicine to cart; user selects unit, quantity, then presses Add Cart
    selectedProductForPopup?.let { product ->
        val unitMultiplier = when (popupUnit) {
            "strip" -> product.piecesPerStrip.coerceAtLeast(1)
            "box" -> product.piecesPerBox.coerceAtLeast(1)
            else -> 1
        }
        val unitPrice = product.salePrice * unitMultiplier
        val lineTotal = unitPrice * popupQuantity

        Dialog(onDismissRequest = { selectedProductForPopup = null }) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Scanned Medicine",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                    Text(
                        text = product.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = product.genericName,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f),
                                RoundedCornerShape(10.dp)
                            )
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Stock Available", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            Text("${product.stockInPieces} Pcs", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Column {
                            Text("Piece Price", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            Text("${settings.currency}${product.salePrice.format(2)}", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Column {
                            Text("Barcode", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            Text(product.barcode, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Unit Selection (Piece, Strip, Box)
                    Text(
                        text = "Select Unit:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("piece" to "Piece (1x)", "strip" to "Strip (${product.piecesPerStrip}x)", "box" to "Box (${product.piecesPerBox}x)").forEach { (u, label) ->
                            OutlinedButton(
                                onClick = { popupUnit = u },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                colors = if (popupUnit == u) {
                                    ButtonDefaults.outlinedButtonColors(
                                        containerColor = MaterialTheme.colorScheme.onSurface,
                                        contentColor = MaterialTheme.colorScheme.surface
                                    )
                                } else {
                                    ButtonDefaults.outlinedButtonColors()
                                }
                            ) {
                                Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Quantity selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Quantity:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { if (popupQuantity > 1) popupQuantity-- }) {
                                Icon(Icons.Default.Remove, contentDescription = "Minus")
                            }
                            Text(
                                text = "$popupQuantity",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )
                            IconButton(onClick = { popupQuantity++ }) {
                                Icon(Icons.Default.Add, contentDescription = "Plus")
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Divider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                    Spacer(modifier = Modifier.height(10.dp))

                    // Calculated Total
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Line Total:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text(
                            "${settings.currency}${lineTotal.format(2)}",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Buttons: Cancel & Add Cart
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { selectedProductForPopup = null },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Cancel")
                        }

                        Button(
                            onClick = {
                                cartItems.add(
                                    PosCartItem(
                                        product = product,
                                        unit = popupUnit,
                                        quantity = popupQuantity,
                                        pricePerUnit = unitPrice,
                                        multiplier = unitMultiplier
                                    )
                                )
                                selectedProductForPopup = null
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Add Cart")
                        }
                    }
                }
            }
        }
    }

    // --- 3. Medicine Not Found Dialog ---
    notFoundBarcode?.let { unknownCode ->
        AlertDialog(
            onDismissRequest = { notFoundBarcode = null },
            title = { Text("Medicine Not Found") },
            text = {
                Column {
                    Text("No medicine matches the scanned barcode:")
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = unknownCode,
                        fontWeight = FontWeight.Bold,
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                        fontSize = 14.sp
                    )
                }
            },
            confirmButton = {
                Button(onClick = { notFoundBarcode = null }) {
                    Text("OK")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = {
                    notFoundBarcode = null
                    showScanPopup = true
                }) {
                    Text("Scan Again")
                }
            }
        )
    }
}
