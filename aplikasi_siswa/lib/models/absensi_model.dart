class AbsensiModel {
  final int id;
  final String siswaId;
  final DateTime tanggal;
  final String? checkInTime;
  final String status; // 'Present', 'Late', 'Excused', 'Absent'

  const AbsensiModel({
    required this.id,
    required this.siswaId,
    required this.tanggal,
    this.checkInTime,
    required this.status,
  });

  factory AbsensiModel.fromJson(Map<String, dynamic> json) {
    return AbsensiModel(
      id: json['id'] as int,
      siswaId: json['siswa_id'] as String,
      tanggal: DateTime.parse(json['tanggal'] as String),
      checkInTime: json['check_in_time'] as String?,
      status: json['status'] as String,
    );
  }
}

class AttendanceSummary {
  final int totalPresent;
  final int totalLate;
  final int totalExcused;
  final int totalAbsent;
  final double percentage;

  const AttendanceSummary({
    required this.totalPresent,
    required this.totalLate,
    required this.totalExcused,
    required this.totalAbsent,
    required this.percentage,
  });
}