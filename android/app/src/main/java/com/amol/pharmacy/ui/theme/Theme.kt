package com.amol.pharmacy.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

// Clean White Mode (Light Color Scheme)
private val LightColorScheme = lightColorScheme(
    primary = BlackPure,
    onPrimary = WhitePure,
    secondary = DarkSurfaceVariant,
    onSecondary = WhitePure,
    background = WhitePure,
    surface = LightSurface,
    surfaceVariant = LightSurfaceVariant,
    outline = LightBorder,
    onBackground = TextLightPrimary,
    onSurface = TextLightPrimary
)

// Clean Dark Mode (Dark Color Scheme)
private val DarkColorScheme = darkColorScheme(
    primary = WhitePure,
    onPrimary = BlackPure,
    secondary = DarkSurfaceVariant,
    onSecondary = TextDarkPrimary,
    background = BlackPure,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    outline = DarkBorder,
    onBackground = TextDarkPrimary,
    onSurface = TextDarkPrimary
)

@Composable
fun AmolPharmacyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
