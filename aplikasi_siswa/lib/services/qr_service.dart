import 'dart:convert';
import 'package:encrypt/encrypt.dart' as enc;
import 'package:geolocator/geolocator.dart';
import '../core/app_exception.dart';

// ─── Konfigurasi Sekolah (Hardcode — ganti dengan koordinat nyata) ───────────
const double _schoolLat = -8.194219;   
const double _schoolLng = 111.104055;
// const double _schoolLat = -8.206267325519933;
// const double _schoolLng = 111.09232429773203;
//-8.206267325519933, 111.09232429773203
const double _maxDistanceMeters = 100.0;

// ─── Konfigurasi Enkripsi AES ─────────────────────────────────────────────────
// PENTING: Simpan key ini di .env / dart-define, JANGAN hardcode di production!
const String _aesKeyHex = '0123456789abcdef0123456789abcdef'; // 32 chars = 256-bit
const String _aesIvHex  = 'abcdef9876543210';               // 16 chars = 128-bit

class QrService {
  // ─── Enkriptor (lazy init) ──────────────────────────────────────────────────
  late final enc.Encrypter _encrypter = enc.Encrypter(
    enc.AES(enc.Key.fromUtf8(_aesKeyHex), mode: enc.AESMode.cbc),
  );
  late final enc.IV _iv = enc.IV.fromUtf8(_aesIvHex);

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────────

  /// Generate encrypted QR payload setelah validasi geo-lokasi.
  /// Return: Base64-encoded string yang ditampilkan di QR widget.
  /// Melempar [AppException] jika:
  ///   - Izin lokasi ditolak
  ///   - Jarak > 100m dari sekolah
  Future<String> generateQrPayload({required String nisn}) async {
    // 1. Validasi & minta izin lokasi
    await _ensureLocationPermission();

    // 2. Ambil posisi saat ini
    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
      timeLimit: const Duration(seconds: 10),
    );

    // 3. Hitung jarak ke sekolah
    final distanceMeters = Geolocator.distanceBetween(
      position.latitude,
      position.longitude,
      _schoolLat,
      _schoolLng,
    );

    if (distanceMeters > _maxDistanceMeters) {
      throw AppException(
        'Anda berada di luar jangkauan sekolah.\n'
        'Jarak saat ini: ${distanceMeters.toStringAsFixed(0)}m '
        '(maks ${_maxDistanceMeters.toStringAsFixed(0)}m).',
        code: 'OUT_OF_RANGE',
      );
    }

    // 4. Buat payload → enkripsi → return
    return _buildEncryptedPayload(nisn: nisn, position: position);
  }

  /// Dekripsi QR payload (dipakai oleh scanner/admin — opsional untuk sisi klien).
  /// Return: Map {'nisn': String, 'timestamp': String, 'lat': String, 'lng': String}
  Map<String, String>? decryptPayload(String encryptedBase64) {
    try {
      final decrypted = _encrypter.decrypt64(encryptedBase64, iv: _iv);
      final parts = decrypted.split(';');
      if (parts.length < 3) return null;
      return {
        'nisn': parts[0],
        'timestamp': parts[1],
        'lat': parts[2],
        'lng': parts.length > 3 ? parts[3] : '',
      };
    } catch (_) {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  String _buildEncryptedPayload({
    required String nisn,
    required Position position,
  }) {
    // Format: NISN;ISO8601Timestamp;lat;lng
    final timestamp = DateTime.now().toUtc().toIso8601String();
    final plaintext =
        '$nisn;$timestamp;${position.latitude};${position.longitude}';

    final encrypted = _encrypter.encrypt(plaintext, iv: _iv);
    return encrypted.base64; // Safe untuk ditampilkan di QR
  }

  Future<void> _ensureLocationPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw const AppException(
        'Layanan GPS tidak aktif. Aktifkan GPS dan coba lagi.',
        code: 'GPS_DISABLED',
      );
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw const AppException(
        'Izin lokasi diperlukan untuk Check-In.\n'
        'Aktifkan izin lokasi di Pengaturan aplikasi.',
        code: 'LOCATION_PERMISSION_DENIED',
      );
    }
  }
}