import 'package:flutter/material.dart';

// --- 1. Constants & Theme (Extracted from Tailwind Config) ---
class AppColors {
  static const Color primary = Color(0xFF13b6ec);
  static const Color backgroundLight = Color(0xFFf6f8f8);
  static const Color backgroundDark = Color(0xFF101d22);
  static const Color cardDark = Color(
    0xFF1a2c32,
  ); // Updated to match HTML darker card
  static const Color textDark = Colors.white;
  static const Color textGray = Color(0xFF9db2b9);

  // New Status Colors
  static const Color success = Color(0xFF22c55e);
  static const Color warning = Color(0xFFf59e0b);
  static const Color error = Color(0xFFef4444);
}