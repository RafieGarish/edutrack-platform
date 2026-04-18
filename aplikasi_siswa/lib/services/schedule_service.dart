import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/app_exception.dart';

class JadwalModel {
  final int id;
  final int kelasId;
  final String hari;
  final String jamMulai;
  final String jamSelesai;
  final String? ruangan;
  final String? mataPelajaranNama;
  final String? mataPelajaranKode;
  final String? teacherName;

  const JadwalModel({
    required this.id,
    required this.kelasId,
    required this.hari,
    required this.jamMulai,
    required this.jamSelesai,
    this.ruangan,
    this.mataPelajaranNama,
    this.mataPelajaranKode,
    this.teacherName,
  });

  factory JadwalModel.fromJson(Map<String, dynamic> json) {
    final mapel = json['mata_pelajaran'] as Map<String, dynamic>?;
    final teacher = json['teachers'] as Map<String, dynamic>?;

    return JadwalModel(
      id: json['id'] as int,
      kelasId: json['kelas_id'] as int,
      hari: json['hari'] as String,
      jamMulai: json['jam_mulai'] as String,
      jamSelesai: json['jam_selesai'] as String,
      ruangan: json['ruangan'] as String?,
      mataPelajaranNama: mapel?['nama'] as String?,
      mataPelajaranKode: mapel?['kode'] as String?,
      teacherName: teacher?['name'] as String?,
    );
  }
}

class ScheduleService {
  ScheduleService({SupabaseClient? client})
      : _supabase = client ?? Supabase.instance.client;

  final SupabaseClient _supabase;

  /// Fetch schedule for a specific class (by kelas_id).
  Future<List<JadwalModel>> getScheduleByKelas({
    required int kelasId,
    String? hariFilter,
  }) async {
    try {
      var query = _supabase
          .from('jadwal')
          .select('*, mata_pelajaran(id, kode, nama), teachers(id, name)')
          .eq('kelas_id', kelasId);

      if (hariFilter != null && hariFilter.isNotEmpty) {
        query = query.eq('hari', hariFilter);
      }

      final data = await query.order('jam_mulai', ascending: true);

      return (data as List)
          .map((row) => JadwalModel.fromJson(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw AppException('Gagal memuat jadwal.\n($e)');
    }
  }

  /// Fetch schedule for a student (looks up kelas_id from siswa record).
  Future<List<JadwalModel>> getScheduleForStudent({
    required String siswaId,
    String? hariFilter,
  }) async {
    try {
      // Get student's kelas_id
      final siswaData = await _supabase
          .from('siswa')
          .select('kelas_id')
          .eq('id', siswaId)
          .single();

      final kelasId = siswaData['kelas_id'] as int?;
      if (kelasId == null) {
        throw const AppException('Kelas belum ditetapkan untuk siswa ini.');
      }

      return getScheduleByKelas(kelasId: kelasId, hariFilter: hariFilter);
    } catch (e) {
      if (e is AppException) rethrow;
      throw AppException('Gagal memuat jadwal.\n($e)');
    }
  }

  /// Get today's schedule for a student.
  Future<List<JadwalModel>> getTodaySchedule({
    required String siswaId,
  }) async {
    final days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    final today = days[DateTime.now().weekday % 7];
    return getScheduleForStudent(siswaId: siswaId, hariFilter: today);
  }
}
