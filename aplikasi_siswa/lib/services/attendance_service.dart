import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/app_exception.dart';
import '../models/absensi_model.dart';

class AttendanceService {
  AttendanceService({SupabaseClient? client})
      : _supabase = client ?? Supabase.instance.client;

  final SupabaseClient _supabase;

  // ─────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────

  /// Ambil semua riwayat absensi untuk siswa tertentu.
  /// [siswaId] adalah UUID dari tabel `siswa`.
  /// Diurutkan terbaru → terlama.
  Future<List<AbsensiModel>> getHistory({
    required String siswaId,
    DateTime? startDate,
    DateTime? endDate,
    String? statusFilter, // 'Present' | 'Late' | 'Excused' | 'Absent'
  }) async {
    try {
      // ── PENTING: semua filter (.eq, .gte, .lte) harus dichain SEBELUM
      // .order() karena .order() mengubah tipe menjadi PostgrestTransformBuilder
      // yang tidak memiliki metode filter.
      var filterBuilder = _supabase
          .from('absensi')
          .select()
          .eq('siswa_id', siswaId);

      if (startDate != null) {
        filterBuilder = filterBuilder.gte('tanggal', _toDateStr(startDate));
      }
      if (endDate != null) {
        filterBuilder = filterBuilder.lte('tanggal', _toDateStr(endDate));
      }
      if (statusFilter != null && statusFilter.isNotEmpty) {
        filterBuilder = filterBuilder.eq('status', statusFilter);
      }

      // .order() dipanggil terakhir setelah semua filter selesai
      final data = await filterBuilder.order('tanggal', ascending: false);

      return (data as List)
          .map((row) => AbsensiModel.fromJson(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw AppException(
        'Gagal memuat riwayat absensi. Periksa koneksi internet Anda.\n($e)',
      );
    }
  }

  /// Hitung ringkasan statistik absensi untuk ditampilkan di header HistoryScreen.
  Future<AttendanceSummary> getSummary({required String siswaId}) async {
    try {
      final data = await _supabase
          .from('absensi')
          .select('status')
          .eq('siswa_id', siswaId);

      final rows = data as List;
      int present = 0, late = 0, excused = 0, absent = 0;

      for (final row in rows) {
        switch ((row['status'] as String).toLowerCase()) {
          case 'present':
            present++;
            break;
          case 'late':
            late++;
            break;
          case 'excused':
            excused++;
            break;
          case 'absent':
            absent++;
            break;
        }
      }

      final total = rows.length;
      final percentage =
          total == 0 ? 0.0 : ((present + late) / total * 100);

      return AttendanceSummary(
        totalPresent: present,
        totalLate: late,
        totalExcused: excused,
        totalAbsent: absent,
        percentage: percentage,
      );
    } catch (e) {
      throw AppException('Gagal memuat statistik absensi.\n($e)');
    }
  }

  /// Subscribe ke realtime updates absensi (opsional — untuk live dashboard).
  RealtimeChannel subscribeToAbsensi({
    required String siswaId,
    required void Function(AbsensiModel) onInsert,
    required void Function(AbsensiModel) onUpdate,
  }) {
    return _supabase
        .channel('absensi:$siswaId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'absensi',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'siswa_id',
            value: siswaId,
          ),
          callback: (payload) {
            if (payload.newRecord.isNotEmpty) {
              onInsert(AbsensiModel.fromJson(payload.newRecord));
            }
          },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'absensi',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'siswa_id',
            value: siswaId,
          ),
          callback: (payload) {
            if (payload.newRecord.isNotEmpty) {
              onUpdate(AbsensiModel.fromJson(payload.newRecord));
            }
          },
        )
        .subscribe();
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────
  String _toDateStr(DateTime dt) =>
      '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
}