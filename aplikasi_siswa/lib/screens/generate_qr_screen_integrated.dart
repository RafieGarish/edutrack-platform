import 'package:flutter/material.dart';
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart'; // tambahkan: qr_flutter di pubspec.yaml
import '../core/theme.dart';
import '../providers/providers.dart';

class GenerateQRScreen extends ConsumerStatefulWidget {
  const GenerateQRScreen({super.key});

  @override
  ConsumerState<GenerateQRScreen> createState() => _GenerateQRScreenState();
}

class _GenerateQRScreenState extends ConsumerState<GenerateQRScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _scanLineController;
  Timer? _refreshTimer;
  int _secondsRemaining = 30;
  double _progress = 1.0;

  @override
  void initState() {
    super.initState();

    // Animasi scan line — boleh langsung di initState karena tidak sentuh provider
    _scanLineController =
        AnimationController(vsync: this, duration: const Duration(seconds: 2))
          ..repeat();

    // Generate QR & start timer harus ditunda sampai SETELAH widget tree selesai
    // dibangun. Memodifikasi provider langsung di initState akan throw error:
    // "Tried to modify a provider while the widget tree was building."
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _generateQr();
      _startRefreshTimer();
    });
  }

  @override
  void dispose() {
    _scanLineController.dispose();
    _refreshTimer?.cancel();
    super.dispose();
  }

  // ─── Core Logic ─────────────────────────────────────────────────────────────

  Future<void> _generateQr() async {
    final siswa = ref.read(authProvider).asData?.value;
    if (siswa == null) return;

    await ref.read(qrProvider.notifier).generate(nisn: siswa.nisn);

    // Cek error setelah generate
    final qrState = ref.read(qrProvider);
    if (qrState.hasError && mounted) {
      _showErrorSheet(qrState.error.toString());
    }
  }

  void _startRefreshTimer() {
    _secondsRemaining = 30;
    _progress = 1.0;
    _refreshTimer?.cancel();

    _refreshTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() {
        _secondsRemaining--;
        _progress = _secondsRemaining / 30;

        if (_secondsRemaining <= 0) {
          t.cancel();
          _generateQr();
          _startRefreshTimer(); // restart
        }
      });
    });
  }

  void _showErrorSheet(String message) {
    final palette = AppPalette.of(context);
    showModalBottomSheet(
      context: context,
      backgroundColor: palette.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.location_off, size: 48, color: palette.error),
            const SizedBox(height: 16),
            Text(
              "Tidak dapat membuat QR",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: palette.text),
            ),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center, style: TextStyle(color: palette.textGray)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _generateQr();
                _startRefreshTimer();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: palette.primary,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text("Coba Lagi", style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);
    final qrState = ref.watch(qrProvider);
    final siswa = ref.watch(authProvider).asData?.value;

    return Scaffold(
      backgroundColor: palette.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: CircleAvatar(
            backgroundColor: palette.card,
            child: IconButton(
              icon: Icon(Icons.arrow_back, color: palette.text),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ),
        title: Text("Check-In", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: palette.text)),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Row(
              children: [
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Text("Live", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: palette.textGray)),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Informasi siswa dari state
            Text(
              siswa?.kelas ?? 'XII RPL',
              style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, color: palette.text),
            ),
            const SizedBox(height: 4),
            Text("Gedung Timur", style: TextStyle(fontSize: 16, color: palette.textGray)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: palette.card,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: palette.textGray.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.calendar_today, size: 14, color: palette.textGray),
                  const SizedBox(width: 6),
                  Text(
                    _formattedNow(),
                    style: TextStyle(fontSize: 12, color: palette.textGray),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // ─── QR Display ─────────────────────────────────────────────
            Stack(
              alignment: Alignment.center,
              children: [
                // Glow background
                Container(
                  width: 300, height: 300,
                  decoration: BoxDecoration(
                    color: palette.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(200),
                    boxShadow: [BoxShadow(color: palette.primary.withOpacity(0.2), blurRadius: 40)],
                  ),
                ),
                // QR Card
                Container(
                  width: 280, height: 280, padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
                  child: qrState.when(
                    // ── Loading ──
                    loading: () => Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(color: palette.primary),
                          const SizedBox(height: 12),
                          const Text("Memverifikasi lokasi...", style: TextStyle(color: Colors.black54, fontSize: 12)),
                        ],
                      ),
                    ),
                    // ── Error ──
                    error: (e, _) => Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.qr_code, color: Colors.black26, size: 64),
                          const SizedBox(height: 8),
                          const Text("QR tidak tersedia", style: TextStyle(color: Colors.black45, fontSize: 12)),
                        ],
                      ),
                    ),
                    // ── Data ──
                    data: (payload) {
                      if (payload == null) {
                        return const Center(child: Icon(Icons.qr_code, color: Colors.black26, size: 80));
                      }
                      return Stack(
                        children: [
                          // QR Code yang sesungguhnya (pakai qr_flutter)
                          Center(
                            child: QrImageView(
                              data: payload,
                              version: QrVersions.auto,
                              size: 220,
                              foregroundColor: Colors.black,
                            ),
                          ),
                          // Scan line animasi
                          // AnimatedBuilder(
                          //   animation: _scanLineController,
                          //   builder: (_, __) => Positioned(
                          //     top: 220 * _scanLineController.value,
                          //     left: 0, right: 0,
                          //     child: Container(
                          //       height: 2,
                          //       decoration: BoxDecoration(
                          //         color: palette.primary,
                          //         boxShadow: [BoxShadow(color: palette.primary.withOpacity(0.8), blurRadius: 10)],
                          //       ),
                          //     ),
                          //   ),
                          // ),
                        ],
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // ─── Timer & Progress ────────────────────────────────────────
            SizedBox(
              width: 320,
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("EXPIRES IN", style: TextStyle(fontSize: 10, color: palette.textGray, fontWeight: FontWeight.bold)),
                          Text(
                            '00:${_secondsRemaining.toString().padLeft(2, '0')}',
                            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: palette.text),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Icon(Icons.sync, size: 16, color: palette.primary),
                          const SizedBox(width: 4),
                          Text("Auto-refreshing", style: TextStyle(color: palette.primary, fontSize: 14, fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: _progress,
                      minHeight: 8,
                      backgroundColor: palette.textGray.withOpacity(0.2),
                      color: _progress < 0.3 ? palette.error : palette.primary,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Manual refresh button
                  ElevatedButton(
                    onPressed: qrState.isLoading
                        ? null
                        : () {
                            _generateQr();
                            _startRefreshTimer();
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: palette.primary,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.refresh, color: Colors.white),
                        SizedBox(width: 8),
                        Text("Generate Kode Baru", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            // Footer info
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: palette.textGray.withOpacity(0.1))),
              ),
              child: Text(
                "Scan code ini pada monitor scanner.",
                style: TextStyle(fontSize: 12, color: palette.textGray),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formattedNow() {
    final now = DateTime.now();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final hour = now.hour > 12 ? now.hour - 12 : now.hour;
    final period = now.hour >= 12 ? 'PM' : 'AM';
    return '${months[now.month - 1]} ${now.day}, ${now.year} • ${hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')} $period';
  }
}