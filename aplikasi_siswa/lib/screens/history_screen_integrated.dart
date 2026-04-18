import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme.dart';
import '../models/absensi_model.dart';
import '../providers/providers.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  final _searchController = TextEditingController();
  String? _activeStatusFilter;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);
    final siswa = ref.watch(authProvider).asData?.value;

    if (siswa == null) {
      return Scaffold(
        backgroundColor: palette.background,
        body: Center(child: Text('Sesi tidak valid.', style: TextStyle(color: palette.text))),
      );
    }

    // Watch providers dengan siswaId sebagai key
    final historyAsync = ref.watch(attendanceHistoryProvider(siswa.id));
    final summaryAsync = ref.watch(attendanceSummaryProvider(siswa.id));

    return Scaffold(
      backgroundColor: palette.background,
      appBar: AppBar(
        backgroundColor: palette.background,
        surfaceTintColor: palette.background,
        elevation: 0,
        title: Text("Attendance History", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: palette.text)),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(shape: BoxShape.circle, color: palette.textGray.withOpacity(0.1)),
            child: IconButton(
              icon: Icon(Icons.calendar_month, color: palette.primary),
              onPressed: () {},
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: palette.textGray.withOpacity(0.1), height: 1),
        ),
      ),
      body: Column(
        children: [
          // ─── Stats Summary (dari Supabase) ──────────────────────────────
          summaryAsync.when(
            loading: () => Container(
              height: 80,
              alignment: Alignment.center,
              child: CircularProgressIndicator(color: palette.primary, strokeWidth: 2),
            ),
            error: (e, _) => _buildSummaryError(palette, e.toString()),
            data: (summary) => Container(
              padding: const EdgeInsets.all(16),
              color: palette.background,
              child: Row(
                children: [
                  _buildSummaryCard('${summary.percentage.toStringAsFixed(0)}%', "Overall", palette.primary, palette),
                  const SizedBox(width: 12),
                  _buildSummaryCard('${summary.totalPresent}', "Present", palette.success, palette),
                  const SizedBox(width: 12),
                  _buildSummaryCard('${summary.totalLate}', "Late", palette.warning, palette),
                  const SizedBox(width: 12),
                  _buildSummaryCard('${summary.totalExcused}', "Excused", Colors.purpleAccent, palette),
                ],
              ),
            ),
          ),

          // ─── Search & Filter ─────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            color: palette.background,
            child: Column(
              children: [
                Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: palette.card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: palette.textGray.withOpacity(0.1)),
                  ),
                  child: TextField(
                    controller: _searchController,
                    style: TextStyle(color: palette.text),
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      prefixIcon: Icon(Icons.search, color: palette.textGray),
                      hintText: "Search subjects...",
                      hintStyle: TextStyle(color: palette.textGray),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip("All", isActive: _activeStatusFilter == null, palette: palette, onTap: () => setState(() => _activeStatusFilter = null)),
                      const SizedBox(width: 8),
                      _buildFilterChip("Present", isActive: _activeStatusFilter == 'Present', palette: palette, onTap: () => setState(() => _activeStatusFilter = 'Present')),
                      const SizedBox(width: 8),
                      _buildFilterChip("Late", isActive: _activeStatusFilter == 'Late', palette: palette, onTap: () => setState(() => _activeStatusFilter = 'Late')),
                      const SizedBox(width: 8),
                      _buildFilterChip("Excused", isActive: _activeStatusFilter == 'Excused', palette: palette, onTap: () => setState(() => _activeStatusFilter = 'Excused')),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ─── List Content ─────────────────────────────────────────────────
          Expanded(
            child: historyAsync.when(
              loading: () => Center(child: CircularProgressIndicator(color: palette.primary)),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.cloud_off, size: 48, color: palette.textGray),
                    const SizedBox(height: 12),
                    Text(e.toString(), textAlign: TextAlign.center, style: TextStyle(color: palette.textGray)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.refresh(attendanceHistoryProvider(siswa.id)),
                      style: ElevatedButton.styleFrom(backgroundColor: palette.primary),
                      child: const Text("Coba Lagi", style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              ),
              data: (allHistory) {
                // Filter di sisi client berdasarkan search & status
                final filtered = allHistory.where((item) {
                  final matchStatus = _activeStatusFilter == null ||
                      item.status.toLowerCase() == _activeStatusFilter!.toLowerCase();
                  final matchSearch = _searchController.text.isEmpty; 
                  // TODO: tambah field 'mata_pelajaran' ke AbsensiModel untuk search
                  return matchStatus && matchSearch;
                }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.history_toggle_off, size: 48, color: palette.textGray.withOpacity(0.4)),
                        const SizedBox(height: 12),
                        Text("Tidak ada data absensi.", style: TextStyle(color: palette.textGray)),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(attendanceHistoryProvider(siswa.id)),
                  color: palette.primary,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) => _buildHistoryItem(filtered[i], palette),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ─── Widget Helpers ──────────────────────────────────────────────────────────

  Widget _buildSummaryError(AppPalette palette, String msg) {
    return Container(
      height: 80,
      alignment: Alignment.center,
      child: Text(msg, style: TextStyle(color: palette.error, fontSize: 12)),
    );
  }

  Widget _buildSummaryCard(String value, String label, Color color, AppPalette palette) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: palette.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: palette.textGray.withOpacity(0.1)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(color: palette.textGray, fontSize: 10, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, {
    required bool isActive,
    required AppPalette palette,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? palette.primary : palette.card,
          borderRadius: BorderRadius.circular(20),
          border: isActive ? null : Border.all(color: palette.textGray.withOpacity(0.1)),
          boxShadow: isActive ? [BoxShadow(color: palette.primary.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2))] : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : palette.text,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryItem(AbsensiModel item, AppPalette palette) {
    final statusColor = _statusColor(item.status, palette);
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: palette.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.textGray.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 50, height: 50,
            decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(months[item.tanggal.month - 1].toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor)),
                Text('${item.tanggal.day}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: statusColor)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Absensi', // Ganti dengan nama mata pelajaran jika ada JOIN
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: palette.text),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: statusColor.withOpacity(0.2)),
                      ),
                      child: Text(item.status, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.schedule, size: 14, color: palette.textGray),
                    const SizedBox(width: 4),
                    Text(item.checkInTime ?? '--:--', style: TextStyle(fontSize: 12, color: palette.textGray)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _statusColor(String status, AppPalette palette) {
    switch (status.toLowerCase()) {
      case 'present': return palette.success;
      case 'late':    return palette.warning;
      case 'excused': return Colors.purpleAccent;
      default:        return palette.error;
    }
  }
}