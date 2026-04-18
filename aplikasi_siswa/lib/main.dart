import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/routes.dart';
import 'core/theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── Inisialisasi Supabase ──────────────────────────────────────────────────
  // await Supabase.initialize(
  //   url: const String.fromEnvironment('SUPABASE_URL',
  //       defaultValue: 'https://gbysbabbwhyutfjctwdn.supabase.co'),
  //   anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY',
  //       defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieXNiYWJid2h5dXRmamN0d2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjI2NDYsImV4cCI6MjA4NzQ5ODY0Nn0.MFosMQaOcV-wr8KoI1Yjkxj9-ymWwf4MPvu7TtxsYh4'),
  // );
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL',
        defaultValue: 'https://ccnxsyctowegwhxzrbpm.supabase.co'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY',
        defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbnhzeWN0b3dlZ3doeHpyYnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTM4MjEsImV4cCI6MjA4ODM2OTgyMX0.3PjFat0xepkG2zmd7UOue83w6DbxTWNiFe-gabETNj4'),
  );

  runApp(
    // ── Bungkus dengan ProviderScope untuk Riverpod ──────────────────────────
    const ProviderScope(
      child: StudentApp(),
    ),
  );
}

class StudentApp extends ConsumerWidget {
  const StudentApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, currentMode, child) {
        return MaterialApp(
          title: 'EduTrack',
          debugShowCheckedModeBanner: false,
          themeMode: currentMode,
          theme: ThemeData(
            brightness: Brightness.light,
            scaffoldBackgroundColor: AppPalette.light.background,
            primaryColor: AppPalette.light.primary,
            fontFamily: GoogleFonts.lexend().fontFamily,
            extensions: const [AppPalette.light],
            colorScheme: ColorScheme.light(
              primary: AppPalette.light.primary,
              surface: AppPalette.light.card,
            ),
            useMaterial3: true,
          ),
          darkTheme: ThemeData(
            brightness: Brightness.dark,
            scaffoldBackgroundColor: AppPalette.dark.background,
            primaryColor: AppPalette.dark.primary,
            fontFamily: GoogleFonts.lexend().fontFamily,
            extensions: const [AppPalette.dark],
            colorScheme: ColorScheme.dark(
              primary: AppPalette.dark.primary,
              surface: AppPalette.dark.card,
            ),
            useMaterial3: true,
          ),
          initialRoute: AppRoutes.login,
          onGenerateRoute: AppRoutes.generateRoute,
        );
      },
    );
  }
}