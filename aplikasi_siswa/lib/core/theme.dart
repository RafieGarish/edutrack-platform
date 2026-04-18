import 'package:flutter/material.dart';

@immutable
class AppPalette extends ThemeExtension<AppPalette> {
  final Color primary;
  final Color background;
  final Color card;
  final Color text;
  final Color textGray;
  final Color success;
  final Color warning;
  final Color error;

  const AppPalette({
    required this.primary,
    required this.background,
    required this.card,
    required this.text,
    required this.textGray,
    required this.success,
    required this.warning,
    required this.error,
  });

  static AppPalette of(BuildContext context) {
    return Theme.of(context).extension<AppPalette>()!;
  }

  static const dark = AppPalette(
    primary: Color(0xFF13b6ec),
    background: Color(0xFF101d22),
    card: Color(0xFF1a2c32),
    text: Colors.white,
    textGray: Color(0xFF9db2b9),
    success: Color(0xFF22c55e),
    warning: Color(0xFFf59e0b),
    error: Color(0xFFef4444),
  );

  static const light = AppPalette(
    primary: Color(0xFF0E8AB3),
    background: Color(0xFFF3F4F6),
    card: Color(0xFFFFFFFF),
    text: Color(0xFF111827),
    textGray: Color(0xFF6B7280),
    success: Color(0xFF16A34A),
    warning: Color(0xFFD97706),
    error: Color(0xFFDC2626),
  );

  @override
  ThemeExtension<AppPalette> copyWith({
    Color? primary, Color? background, Color? card, Color? text,
    Color? textGray, Color? success, Color? warning, Color? error,
  }) {
    return AppPalette(
      primary: primary ?? this.primary,
      background: background ?? this.background,
      card: card ?? this.card,
      text: text ?? this.text,
      textGray: textGray ?? this.textGray,
      success: success ?? this.success,
      warning: warning ?? this.warning,
      error: error ?? this.error,
    );
  }

  @override
  ThemeExtension<AppPalette> lerp(ThemeExtension<AppPalette>? other, double t) {
    if (other is! AppPalette) return this;
    return AppPalette(
      primary: Color.lerp(primary, other.primary, t)!,
      background: Color.lerp(background, other.background, t)!,
      card: Color.lerp(card, other.card, t)!,
      text: Color.lerp(text, other.text, t)!,
      textGray: Color.lerp(textGray, other.textGray, t)!,
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      error: Color.lerp(error, other.error, t)!,
    );
  }
}

// Global Notifier untuk Tema
final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.dark);