import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/app_exception.dart';
import '../models/perizinan_model.dart';

const String _bucketName = 'surat-izin';
const int _maxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

class PermissionService {
  PermissionService({SupabaseClient? client})
      : _supabase = client ?? Supabase.instance.client;

  final SupabaseClient _supabase;

  // ─────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────

  /// Submit perizinan lengkap: upload file → insert ke DB.
  /// [file] bisa null jika siswa tidak melampirkan bukti.
  Future<PerizinanModel> submitPerizinan({
    required String siswaId,
    required String alasan,          // 'Sakit' | 'Izin'
    required DateTime tanggalMulai,
    required DateTime tanggalSelesai,
    File? file,
    String? catatan,
  }) async {
    _validateDates(tanggalMulai, tanggalSelesai);

    String? buktiUrl;

    // 1. Upload file jika ada
    if (file != null) {
      buktiUrl = await _uploadFile(siswaId: siswaId, file: file);
    }

    // 2. Fetch student's school_id for multi-tenant insert
    String? schoolId;
    try {
      final siswaData = await _supabase
          .from('siswa')
          .select('school_id')
          .eq('id', siswaId)
          .single();
      schoolId = siswaData['school_id'] as String?;
    } catch (_) {
      // Fallback: proceed without school_id if column doesn't exist yet
    }

    // 3. Insert ke tabel perizinan
    try {
      final payload = {
        'siswa_id': siswaId,
        'alasan': alasan,
        'bukti_url': buktiUrl,
        'status': 'Pending',
        'tanggal_mulai': _toDateStr(tanggalMulai),
        'tanggal_selesai': _toDateStr(tanggalSelesai),
        'catatan': catatan,
        'created_at': DateTime.now().toUtc().toIso8601String(),
        if (schoolId != null) 'school_id': schoolId,
      };

      final data = await _supabase
          .from('perizinan')
          .insert(payload)
          .select()
          .single();

      return PerizinanModel.fromJson(data);
    } catch (e) {
      throw AppException('Gagal menyimpan surat izin. Silakan coba lagi.\n($e)');
    }
  }

  /// Ambil semua perizinan milik siswa tertentu.
  Future<List<PerizinanModel>> getMyPerizinan({
    required String siswaId,
  }) async {
    try {
      final data = await _supabase
          .from('perizinan')
          .select()
          .eq('siswa_id', siswaId)
          .order('created_at', ascending: false);

      return (data as List)
          .map((row) => PerizinanModel.fromJson(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw AppException('Gagal memuat data perizinan.\n($e)');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  /// Upload file ke Supabase Storage.
  /// Return: Public URL file yang sudah di-upload.
  Future<String> _uploadFile({
    required String siswaId,
    required File file,
  }) async {
    // Validasi ukuran file
    final fileSize = await file.length();
    if (fileSize > _maxFileSizeBytes) {
      throw const AppException(
        'Ukuran file terlalu besar. Maksimal 5 MB.',
        code: 'FILE_TOO_LARGE',
      );
    }

    // Validasi ekstensi
    final ext = file.path.split('.').last.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'pdf'].contains(ext)) {
      throw const AppException(
        'Format file tidak didukung.\nGunakan JPG, PNG, atau PDF.',
        code: 'INVALID_FILE_TYPE',
      );
    }

    // Buat nama file unik: siswaId/timestamp.ext
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final storagePath = '$siswaId/$timestamp.$ext';

    try {
      await _supabase.storage.from(_bucketName).upload(
            storagePath,
            file,
            fileOptions: FileOptions(
              contentType: _contentType(ext),
              upsert: false,
            ),
          );

      // Return public URL
      final publicUrl =
          _supabase.storage.from(_bucketName).getPublicUrl(storagePath);
      return publicUrl;
    } on StorageException catch (e) {
      throw AppException('Gagal mengupload file: ${e.message}');
    }
  }

  void _validateDates(DateTime start, DateTime end) {
    if (end.isBefore(start)) {
      throw const AppException(
        'Tanggal selesai tidak boleh sebelum tanggal mulai.',
        code: 'INVALID_DATE_RANGE',
      );
    }
    final maxEndDate = DateTime.now().add(const Duration(days: 30));
    if (start.isAfter(maxEndDate)) {
      throw const AppException(
        'Tanggal izin terlalu jauh ke depan (maks. 30 hari).',
        code: 'DATE_TOO_FAR',
      );
    }
  }

  String _contentType(String ext) {
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      default:
        return 'image/jpeg';
    }
  }

  String _toDateStr(DateTime dt) =>
      '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
}