import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/absensi_model.dart';
import '../models/perizinan_model.dart';
import '../models/siswa_model.dart';
import '../services/attendance_service.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import '../services/permission_service.dart';
import '../services/qr_service.dart';
import '../services/schedule_service.dart';

// ═══════════════════════════════════════════════════════════════
// SERVICE PROVIDERS
// ═══════════════════════════════════════════════════════════════

final authServiceProvider = Provider<AuthService>((ref) => AuthService());
final qrServiceProvider = Provider<QrService>((ref) => QrService());
final attendanceServiceProvider = Provider<AttendanceService>((ref) => AttendanceService());
final permissionServiceProvider = Provider<PermissionService>((ref) => PermissionService());
final scheduleServiceProvider = Provider<ScheduleService>((ref) => ScheduleService());
final notificationServiceProvider = Provider<NotificationService>((ref) => NotificationService());

// ═══════════════════════════════════════════════════════════════
// AUTH STATE
// ═══════════════════════════════════════════════════════════════

class AuthNotifier extends AsyncNotifier<SiswaModel?> {
  @override
  Future<SiswaModel?> build() async {
    // Auto-restore sesi saat app start
    return ref.read(authServiceProvider).getLocalSession();
  }

  Future<void> login({required String nisn, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(authServiceProvider).login(nisn: nisn, password: password),
    );
  }

  Future<void> logout() async {
    await ref.read(authServiceProvider).logout();
    state = const AsyncData(null);
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, SiswaModel?>(
  AuthNotifier.new,
);

// ═══════════════════════════════════════════════════════════════
// QR STATE
// ═══════════════════════════════════════════════════════════════

class QrNotifier extends AsyncNotifier<String?> {
  @override
  Future<String?> build() async => null; // Belum di-generate

  Future<void> generate({required String nisn}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(qrServiceProvider).generateQrPayload(nisn: nisn),
    );
  }

  void reset() => state = const AsyncData(null);
}

final qrProvider = AsyncNotifierProvider<QrNotifier, String?>(QrNotifier.new);

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE HISTORY STATE
// ═══════════════════════════════════════════════════════════════

final attendanceHistoryProvider =
    FutureProvider.family<List<AbsensiModel>, String>((ref, siswaId) async {
  return ref.read(attendanceServiceProvider).getHistory(siswaId: siswaId);
});

final attendanceSummaryProvider =
    FutureProvider.family<AttendanceSummary, String>((ref, siswaId) async {
  return ref.read(attendanceServiceProvider).getSummary(siswaId: siswaId);
});

// ═══════════════════════════════════════════════════════════════
// PERIZINAN STATE
// ═══════════════════════════════════════════════════════════════

class PerizinanNotifier extends AsyncNotifier<List<PerizinanModel>> {
  @override
  Future<List<PerizinanModel>> build() async {
    final siswa = ref.watch(authProvider).asData?.value;
    if (siswa == null) return[];
    return ref
        .read(permissionServiceProvider)
        .getMyPerizinan(siswaId: siswa.id);
  }

  Future<bool> submit({
    required String alasan,
    required DateTime tanggalMulai,
    required DateTime tanggalSelesai,
    String? catatan,
    File? file, // 2. Buka comment parameter ini
  }) async {
    final siswa = ref.read(authProvider).asData?.value;
    if (siswa == null) return false;

    final previous = state;
    state = const AsyncLoading();

    final result = await AsyncValue.guard(() =>
        ref.read(permissionServiceProvider).submitPerizinan(
              siswaId: siswa.id,
              alasan: alasan,
              tanggalMulai: tanggalMulai,
              tanggalSelesai: tanggalSelesai,
              catatan: catatan,
              file: file, // 3. Teruskan file ke service
            ));

    if (result.hasError) {
      state = previous; // Rollback ke state sebelumnya
      return false;
    }

    // Prepend item baru ke daftar
    final newItem = result.asData!.value;
    state = AsyncData([newItem, ...?previous.asData?.value]);
    return true;
  }
}

final perizinanProvider =
    AsyncNotifierProvider<PerizinanNotifier, List<PerizinanModel>>(
  PerizinanNotifier.new,
);

// ═══════════════════════════════════════════════════════════════
// SCHEDULE STATE
// ═══════════════════════════════════════════════════════════════

final scheduleProvider =
    FutureProvider.family<List<JadwalModel>, String>((ref, siswaId) async {
  return ref.read(scheduleServiceProvider).getScheduleForStudent(siswaId: siswaId);
});

final todayScheduleProvider =
    FutureProvider.family<List<JadwalModel>, String>((ref, siswaId) async {
  return ref.read(scheduleServiceProvider).getTodaySchedule(siswaId: siswaId);
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS STATE
// ═══════════════════════════════════════════════════════════════

final notificationsProvider =
    FutureProvider.family<List<NotificationModel>, String>((ref, userId) async {
  return ref.read(notificationServiceProvider).getNotifications(userId: userId);
});

final unreadCountProvider =
    FutureProvider.family<int, String>((ref, userId) async {
  return ref.read(notificationServiceProvider).getUnreadCount(userId: userId);
});