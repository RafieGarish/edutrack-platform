import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/routes.dart';
import '../core/theme.dart';
import '../providers/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _nisnController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isObscure = true;
  bool _rememberMe = false;

  @override
  void dispose() {
    _nisnController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // ─── Handler Login ──────────────────────────────────────────────────────────
  Future<void> _handleLogin() async {
    final nisn = _nisnController.text.trim();
    final password = _passwordController.text;

    if (nisn.isEmpty || password.isEmpty) {
      _showError('NISN dan password tidak boleh kosong.');
      return;
    }

    // Panggil AuthNotifier.login() — state berubah menjadi AsyncLoading
    await ref.read(authProvider.notifier).login(nisn: nisn, password: password);

    // Cek hasil setelah login
    final authState = ref.read(authProvider);
    authState.when(
      data: (siswa) {
        if (siswa != null) {
          // Login sukses → navigasi ke MainLayout
          if (mounted) {
            Navigator.pushReplacementNamed(context, AppRoutes.main);
          }
        }
      },
      error: (e, _) => _showError(e.toString()),
      loading: () {},
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppPalette.of(context).error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);

    // Watch loading state untuk disable tombol saat proses login
    final isLoading = ref.watch(authProvider).isLoading;

    return Scaffold(
      backgroundColor: palette.background,
      body: Stack(
        children: [
          // Background glow effects (sama seperti aslinya)
          Positioned(
            top: -100, left: -100,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: palette.primary.withOpacity(0.1),
                boxShadow: [BoxShadow(color: palette.primary.withOpacity(0.1), blurRadius: 100, spreadRadius: 50)],
              ),
            ),
          ),
          Positioned(
            bottom: -100, right: -100,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: palette.primary.withOpacity(0.1),
                boxShadow: [BoxShadow(color: palette.primary.withOpacity(0.1), blurRadius: 100, spreadRadius: 50)],
              ),
            ),
          ),
          Center(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100),
              child: Container(width: MediaQuery.of(context).size.width, height: MediaQuery.of(context).size.height),
            ),
          ),
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 96, height: 96, padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: palette.card, borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
                    ),
                    child: Icon(Icons.school, size: 48, color: palette.text),
                  ),
                  const SizedBox(height: 16),
                  Text("EduTrack", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: palette.text)),
                  Text("Sign in to manage your attendance", style: TextStyle(fontSize: 16, color: palette.textGray)),
                  const SizedBox(height: 32),

                  // NISN Field
                  _buildTextField(
                    controller: _nisnController,
                    icon: Icons.person_outline,
                    hint: "NISN",
                    palette: palette,
                    enabled: !isLoading,
                  ),
                  const SizedBox(height: 16),

                  // Password Field
                  _buildTextField(
                    controller: _passwordController,
                    icon: Icons.lock_outline,
                    hint: "Password",
                    isPassword: true,
                    isObscure: _isObscure,
                    onToggle: () => setState(() => _isObscure = !_isObscure),
                    palette: palette,
                    enabled: !isLoading,
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          SizedBox(
                            width: 24, height: 24,
                            child: Checkbox(
                              value: _rememberMe,
                              activeColor: palette.primary,
                              side: BorderSide(color: palette.textGray),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                              onChanged: isLoading ? null : (v) => setState(() => _rememberMe = v!),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text("Ingat Saya", style: TextStyle(color: palette.textGray, fontWeight: FontWeight.w500)),
                        ],
                      ),
                      TextButton(
                        onPressed: isLoading ? null : () {},
                        child: Text("Lupa Password?", style: TextStyle(color: palette.primary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // ─── Tombol Login ─────────────────────────────────────────────
                  ElevatedButton(
                    onPressed: isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: palette.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      disabledBackgroundColor: palette.primary.withOpacity(0.5),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text("Login", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              SizedBox(width: 8),
                              Icon(Icons.login),
                            ],
                          ),
                  ),
                  const SizedBox(height: 24),

                  OutlinedButton.icon(
                    onPressed: isLoading ? null : () {},
                    style: OutlinedButton.styleFrom(
                      foregroundColor: palette.text,
                      side: BorderSide(color: palette.textGray.withOpacity(0.2)),
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      backgroundColor: palette.card,
                    ),
                    icon: Icon(Icons.school, color: palette.primary),
                    label: const Text("Login dengan ID Sekolah (SSO)"),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    required AppPalette palette,
    bool isPassword = false,
    bool isObscure = false,
    VoidCallback? onToggle,
    bool enabled = true,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: palette.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.textGray.withOpacity(0.1)),
      ),
      child: TextField(
        controller: controller,
        obscureText: isObscure,
        enabled: enabled,
        style: TextStyle(color: palette.text),
        keyboardType: isPassword ? TextInputType.visiblePassword : TextInputType.number,
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: palette.textGray),
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(isObscure ? Icons.visibility_off : Icons.visibility, color: palette.textGray),
                  onPressed: onToggle,
                )
              : null,
          hintText: hint,
          hintStyle: TextStyle(color: palette.textGray),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        ),
      ),
    );
  }
}