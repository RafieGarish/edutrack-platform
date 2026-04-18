import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/app_exception.dart';
import '../models/siswa_model.dart';

/// Key yang dipakai untuk menyimpan data sesi di secure storage.
const _kSiswaIdKey = 'siswa_id';
const _kNisnKey = 'nisn';
const _kNamaKey = 'nama_lengkap';
const _kKelasKey = 'kelas';

class AuthService {
  AuthService({
    SupabaseClient? client,
    FlutterSecureStorage? storage,
  })  : _supabase = client ?? Supabase.instance.client,
        _secureStorage = storage ?? const FlutterSecureStorage();

  final SupabaseClient _supabase;
  final FlutterSecureStorage _secureStorage;
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  // ─────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────

  /// Login dengan NISN + password, validasi device, lalu simpan sesi.
  /// Melempar [AppException] jika ada error (termasuk device mismatch).
  Future<SiswaModel> login({
    required String nisn,
    required String password,
  }) async {
    try {
      // 1. Login ke Supabase Auth
      final authResponse = await _supabase.auth.signInWithPassword(
        email: _nisnToEmail(nisn),
        password: password,
      );
      if (authResponse.user == null) {
        throw const AppException('Login gagal. Periksa NISN dan password Anda.');
      }

      // 2. Ambil data siswa dari tabel `siswa`
      final data = await _supabase
          .from('siswa')
          .select()
          .eq('nisn', nisn)
          .maybeSingle();

      if (data == null) {
        throw const AppException('Data siswa tidak ditemukan.');
      }
      final siswa = SiswaModel.fromJson(data);

      // 3. Validasi Device ID
      final currentDeviceId = await _getDeviceId();
      await _validateAndBindDevice(siswa: siswa, currentDeviceId: currentDeviceId);

      // 4. Simpan sesi di secure storage
      await _persistSession(siswa);

      return siswa;
    } on AuthException catch (e) {
      throw AppException(_mapAuthError(e.message));
    } on AppException {
      rethrow;
    } catch (e) {
      throw AppException('Terjadi kesalahan tak terduga. Silakan coba lagi.\n($e)');
    }
  }

  /// Logout dari Supabase dan hapus sesi lokal.
  Future<void> logout() async {
    await _supabase.auth.signOut();
    await _secureStorage.deleteAll();
  }

  /// Kembalikan data siswa dari secure storage (untuk auto-login / persist session).
  /// Return null jika tidak ada sesi aktif.
  Future<SiswaModel?> getLocalSession() async {
    final siswaId = await _secureStorage.read(key: _kSiswaIdKey);
    if (siswaId == null) return null;

    // Verifikasi token Supabase masih valid
    if (_supabase.auth.currentSession == null) {
      await _secureStorage.deleteAll();
      return null;
    }

    final nisn = await _secureStorage.read(key: _kNisnKey) ?? '';
    final nama = await _secureStorage.read(key: _kNamaKey) ?? '';
    final kelas = await _secureStorage.read(key: _kKelasKey) ?? '';

    return SiswaModel(
      id: siswaId,
      nisn: nisn,
      namaLengkap: nama,
      kelas: kelas,
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  /// Konversi NISN → format email palsu untuk Supabase Auth.
  /// Supabase Auth membutuhkan email; gunakan konvensi internal ini.
  String _nisnToEmail(String nisn) => '$nisn@edutrack.internal';

  /// Ambil Device ID unik dari platform (Android SSAID / iOS identifierForVendor).
  Future<String> _getDeviceId() async {
    try {
      if (Platform.isAndroid) {
        final info = await _deviceInfo.androidInfo;
        return info.id; // SSAID — stabil per-device per-app
      } else if (Platform.isIOS) {
        final info = await _deviceInfo.iosInfo;
        return info.identifierForVendor ?? 'ios-unknown';
      }
      return 'unsupported-platform';
    } catch (_) {
      return 'device-id-error';
    }
  }

  /// Validasi device ID dan bind ke akun jika belum ada.
  Future<void> _validateAndBindDevice({
    required SiswaModel siswa,
    required String currentDeviceId,
  }) async {
    if (siswa.deviceId == null || siswa.deviceId!.isEmpty) {
      // Pertama kali login → bind device ke akun
      await _supabase
          .from('siswa')
          .update({'device_id': currentDeviceId}).eq('id', siswa.id);
    } else if (siswa.deviceId != currentDeviceId) {
      // Device berbeda → tolak login
      await _supabase.auth.signOut();
      throw const AppException(
        'Akun ini terkunci di perangkat lain.\nHubungi Admin untuk mereset perangkat.',
        code: 'DEVICE_MISMATCH',
      );
    }
    // Jika cocok → lanjut tanpa aksi
  }

  Future<void> _persistSession(SiswaModel siswa) async {
    await _secureStorage.write(key: _kSiswaIdKey, value: siswa.id);
    await _secureStorage.write(key: _kNisnKey, value: siswa.nisn);
    await _secureStorage.write(key: _kNamaKey, value: siswa.namaLengkap);
    await _secureStorage.write(key: _kKelasKey, value: siswa.kelas);
  }

  String _mapAuthError(String supabaseMessage) {
    final msg = supabaseMessage.toLowerCase();
    if (msg.contains('invalid login credentials')) {
      return 'NISN atau password salah.';
    }
    if (msg.contains('email not confirmed')) {
      return 'Akun belum diaktifkan. Hubungi Admin.';
    }
    if (msg.contains('too many requests')) {
      return 'Terlalu banyak percobaan. Tunggu beberapa menit.';
    }
    return 'Login gagal: $supabaseMessage';
  }
}