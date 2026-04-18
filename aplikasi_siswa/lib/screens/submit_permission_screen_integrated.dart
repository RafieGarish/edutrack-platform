import 'dart:io';
import 'package:edutrack_full/core/routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart'; // tambahkan: image_picker di pubspec.yaml
import '../core/theme.dart';
import '../providers/providers.dart';

class SubmitPermissionScreen extends ConsumerStatefulWidget {
  const SubmitPermissionScreen({super.key});

  @override
  ConsumerState<SubmitPermissionScreen> createState() => _SubmitPermissionScreenState();
}

class _SubmitPermissionScreenState extends ConsumerState<SubmitPermissionScreen> {
  final _catatanController = TextEditingController();
  String? _selectedAlasan;
  
  // 1. Inisialisasi tanggal tanpa jam/menit/detik agar kalkulasi durasi akurat
  DateTime _tanggalMulai = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
  DateTime _tanggalSelesai = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
  
  File? _selectedFile;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _catatanController.dispose();
    super.dispose();
  }

  // ─── Pick File ───────────────────────────────────────────────────────────────
  Future<void> _pickFile() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
      maxWidth: 1920,
    );
    if (picked != null) {
      setState(() => _selectedFile = File(picked.path));
    }
  }

  // ─── Submit Handler ──────────────────────────────────────────────────────────
  Future<void> _handleSubmit() async {
    if (_selectedAlasan == null) {
      _showSnack('Pilih alasan terlebih dahulu.', isError: true);
      return;
    }
    if (_tanggalSelesai.isBefore(_tanggalMulai)) {
      _showSnack('Tanggal selesai tidak boleh sebelum tanggal mulai.', isError: true);
      return;
    }

    setState(() => _isSubmitting = true);

    final siswa = ref.read(authProvider).asData?.value;
    if (siswa == null) {
      _showSnack('Sesi habis. Silakan login ulang.', isError: true);
      setState(() => _isSubmitting = false);
      return;
    }

    // 2. Panggil submit dan sertakan file
    final success = await ref.read(perizinanProvider.notifier).submit(
          alasan: _selectedAlasan!,
          tanggalMulai: _tanggalMulai,
          tanggalSelesai: _tanggalSelesai,
          catatan: _catatanController.text.trim().isEmpty
              ? null
              : _catatanController.text.trim(),
          file: _selectedFile, // <-- Tambahkan baris ini
        );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      _showSnack('Surat izin berhasil dikirim!', isError: false);
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) Navigator.pushNamed(context, AppRoutes.main);
    } else {
      final error = ref.read(perizinanProvider).error;
      _showSnack(error?.toString() ?? 'Terjadi kesalahan.', isError: true);
    }
  }

  void _showSnack(String message, {required bool isError}) {
    final palette = AppPalette.of(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? palette.error : palette.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<void> _pickDate({required bool isMulai}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isMulai ? _tanggalMulai : _tanggalSelesai,
      firstDate: DateTime.now().subtract(const Duration(days: 7)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      builder: (context, child) {
        final palette = AppPalette.of(context);
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(primary: palette.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (isMulai) {
          _tanggalMulai = picked;
          if (_tanggalSelesai.isBefore(picked)) _tanggalSelesai = picked;
        } else {
          _tanggalSelesai = picked;
        }
      });
    }
  }

  // ─── Build ───────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);
    final durasiHari = _tanggalSelesai.difference(_tanggalMulai).inDays + 1;

    return Scaffold(
      backgroundColor: palette.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text("Upload Surat Izin", style: TextStyle(color: palette.text)),
        centerTitle: true,
        iconTheme: IconThemeData(color: palette.text),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── Alasan Dropdown ──────────────────────────────────────
                Text("Alasan", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: palette.text)),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  dropdownColor: palette.card,
                  value: _selectedAlasan,
                  decoration: InputDecoration(
                    filled: true, fillColor: palette.card,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  hint: Text("Pilih alasan...", style: TextStyle(color: palette.textGray)),
                  items: [
                    DropdownMenuItem(value: "Sakit", child: Text("Sakit", style: TextStyle(color: palette.text))),
                    DropdownMenuItem(value: "Izin", child: Text("Izin", style: TextStyle(color: palette.text))),
                  ],
                  onChanged: (v) => setState(() => _selectedAlasan = v),
                ),

                const SizedBox(height: 24),

                // ─── Durasi ───────────────────────────────────────────────
                Text("Durasi", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: palette.text)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _pickDate(isMulai: true),
                        child: _buildDateInput("Dari", _formatDate(_tanggalMulai), palette),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _pickDate(isMulai: false),
                        child: _buildDateInput("Sampai", _formatDate(_tanggalSelesai), palette),
                      ),
                    ),
                  ],
                ),
                // Duration indicator
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: (durasiHari / 30).clamp(0.0, 1.0),
                            minHeight: 4,
                            backgroundColor: palette.textGray.withOpacity(0.2),
                            color: palette.primary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        '$durasiHari Hari',
                        style: TextStyle(color: palette.primary, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // ─── Upload Bukti ─────────────────────────────────────────
                Text("Surat Izin", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: palette.text)),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: _pickFile,
                  child: _selectedFile != null
                      ? _buildFilePreview(palette)
                      : _buildUploadPlaceholder(palette),
                ),

                const SizedBox(height: 24),

                // ─── Catatan Tambahan ─────────────────────────────────────
                Text("Catatan Tambahan (Opsional)", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: palette.text)),
                const SizedBox(height: 12),
                TextField(
                  controller: _catatanController,
                  maxLines: 4,
                  style: TextStyle(color: palette.text),
                  decoration: InputDecoration(
                    filled: true, fillColor: palette.card,
                    hintText: "Tambahkan detail spesifik...",
                    hintStyle: TextStyle(color: palette.textGray),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 100),
              ],
            ),
          ),

          // ─── Submit Button (sticky bottom) ──────────────────────────────
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter, end: Alignment.topCenter,
                  colors: [palette.background, palette.background.withOpacity(0)],
                ),
              ),
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: palette.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 8,
                  shadowColor: palette.primary.withOpacity(0.4),
                  disabledBackgroundColor: palette.primary.withOpacity(0.5),
                ),
                child: _isSubmitting
                    ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text("Kirim Surat", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          SizedBox(width: 8),
                          Icon(Icons.send),
                        ],
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Widget Helpers ──────────────────────────────────────────────────────────

  Widget _buildUploadPlaceholder(AppPalette palette) {
    return Container(
      height: 160, width: double.infinity,
      decoration: BoxDecoration(
        color: palette.card.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.textGray.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: palette.primary.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(Icons.cloud_upload, color: palette.primary, size: 32),
          ),
          const SizedBox(height: 8),
          Text.rich(
            TextSpan(children: [
              TextSpan(text: "Tap untuk upload", style: TextStyle(color: palette.primary, fontWeight: FontWeight.bold)),
              TextSpan(text: " gambar / PDF", style: TextStyle(color: palette.textGray)),
            ]),
          ),
          Text("Maks. 5 MB", style: TextStyle(color: palette.textGray, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildFilePreview(AppPalette palette) {
    return Container(
      height: 160, width: double.infinity,
      decoration: BoxDecoration(
        color: palette.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.primary.withOpacity(0.3)),
      ),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(_selectedFile!, width: double.infinity, height: 160, fit: BoxFit.cover),
          ),
          Positioned(
            top: 8, right: 8,
            child: GestureDetector(
              onTap: () => setState(() => _selectedFile = null),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                child: const Icon(Icons.close, color: Colors.white, size: 18),
              ),
            ),
          ),
          Positioned(
            bottom: 8, left: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: palette.success.withOpacity(0.9), borderRadius: BorderRadius.circular(8)),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check, color: Colors.white, size: 14),
                  SizedBox(width: 4),
                  Text("File dipilih", style: TextStyle(color: Colors.white, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateInput(String label, String value, AppPalette palette) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: palette.textGray)),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: palette.card, borderRadius: BorderRadius.circular(12)),
          child: Row(
            children: [
              Icon(Icons.calendar_today, color: palette.primary, size: 18),
              const SizedBox(width: 8),
              Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: palette.text)),
            ],
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime dt) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
  }
}