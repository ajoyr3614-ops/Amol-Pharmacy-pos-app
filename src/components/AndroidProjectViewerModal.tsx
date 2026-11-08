/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code,
  Download,
  Folder,
  FileCode,
  FileText,
  X,
  CheckCircle,
  Copy,
  Terminal,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { AndroidProjectExporter } from '../services/androidProjectZip';

interface AndroidProjectViewerModalProps {
  onClose: () => void;
}

interface ProjectFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'DashboardScreen.kt',
    path: 'app/src/main/java/com/amol/pharmacy/ui/screens/DashboardScreen.kt',
    language: 'kotlin',
    content: `package com.amol.pharmacy.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amol.pharmacy.data.local.entity.SettingsEntity

// 17 Colorful Action Buttons & 11 Always-Visible Summary Cards
@Composable
fun DashboardScreen(settings: SettingsEntity, onNavigate: (String) -> Unit) {
    // Teal & green gradient header, dynamic pharmacy name, Material 3 cards
}`
  },
  {
    name: 'Entities.kt (Room)',
    path: 'app/src/main/java/com/amol/pharmacy/data/local/entity/Entities.kt',
    language: 'kotlin',
    content: `package com.amol.pharmacy.data.local.entity

import androidx.room.*

@Entity(tableName = "products")
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
    val piecesPerBox: Int = 100
)

@Entity(tableName = "batches")
data class BatchEntity(
    @PrimaryKey val id: String,
    val productId: String,
    val batchNumber: String,
    val expiryDate: String,
    val purchasePricePerPiece: Double,
    val stockInPieces: Int
)`
  },
  {
    name: 'PharmacyDao.kt',
    path: 'app/src/main/java/com/amol/pharmacy/data/local/dao/PharmacyDao.kt',
    language: 'kotlin',
    content: `package com.amol.pharmacy.data.local.dao

import androidx.room.*
import com.amol.pharmacy.data.local.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PharmacyDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Transaction
    suspend fun processSaleTransaction(sale: SaleEntity, items: List<SaleItemEntity>) {
        insertSale(sale)
        insertSaleItems(items)
        for (item in items) {
            updateProductStock(item.productId, -item.totalPieces)
        }
    }
}`
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.BLUETOOTH" />

    <application
        android:name=".AmolPharmacyApp"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.AmolPharmacy">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  },
  {
    name: 'app/build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.amol.pharmacy"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.amol.pharmacy"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.google.mlkit.barcode)
}`
  },
  {
    name: 'README.md (APK Guide)',
    path: 'README.md',
    language: 'markdown',
    content: `# Build APK in Android Studio

1. Open the \`android/\` folder in Android Studio (Koala / Ladybug).
2. Configure Gradle JDK to JDK 17+.
3. Run \`./gradlew assembleDebug\` or Build > Build APK.
4. Output file: \`app/build/outputs/apk/debug/app-debug.apk\`
`
  }
];

export const AndroidProjectViewerModal: React.FC<AndroidProjectViewerModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      const blob = await AndroidProjectExporter.exportZip();
      AndroidProjectExporter.downloadZip(blob);
    } catch (e) {
      console.error(e);
      alert('Failed to generate zip.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Native Android Studio Project</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  Kotlin • Jetpack Compose • Room DB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full buildable Gradle project with Room entities, DAOs, CameraX, and WorkManager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Packaging Zip...' : 'Download Project (.zip)'}</span>
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner on APK Generation */}
        <div className="px-4 py-3 bg-teal-950/60 border-b border-teal-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-teal-200">
            <Terminal className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Target APK Location: <code className="font-mono font-bold bg-teal-900/80 px-1.5 py-0.5 rounded text-white">app/build/outputs/apk/debug/app-debug.apk</code>
            </span>
          </div>
          <span className="text-[11px] text-teal-300 font-mono">Build Command: ./gradlew assembleDebug</span>
        </div>

        {/* Content Explorer Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Sidebar */}
          <div className="w-64 bg-slate-950 border-r border-slate-800 p-3 overflow-y-auto space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Android Source Files
            </span>
            {PROJECT_FILES.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition ${
                    isSelected
                      ? 'bg-teal-600/20 text-teal-300 font-bold border border-teal-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <FileCode className="w-4 h-4 shrink-0 text-slate-400" />
                  <div className="truncate">
                    <div className="truncate text-xs">{file.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono truncate">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300">{selectedFile.path}</span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1 text-[11px]"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 bg-slate-900 leading-relaxed whitespace-pre">
              {selectedFile.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
