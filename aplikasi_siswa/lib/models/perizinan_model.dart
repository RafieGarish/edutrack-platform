class PerizinanModel {
  final int id;
  final String siswaId;
  final String alasan;
  final String? buktiUrl;
  final String status; // 'Pending', 'Approved', 'Rejected'
  final DateTime createdAt;
  final DateTime tanggalMulai;
  final DateTime tanggalSelesai;
  final String? catatan;

  const PerizinanModel({
    required this.id,
    required this.siswaId,
    required this.alasan,
    this.buktiUrl,
    required this.status,
    required this.createdAt,
    required this.tanggalMulai,
    required this.tanggalSelesai,
    this.catatan,
  });

  factory PerizinanModel.fromJson(Map<String, dynamic> json) {
    return PerizinanModel(
      id: json['id'] as int,
      siswaId: json['siswa_id'] as String,
      alasan: json['alasan'] as String,
      buktiUrl: json['bukti_url'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      tanggalMulai: DateTime.parse(json['tanggal_mulai'] as String),
      tanggalSelesai: DateTime.parse(json['tanggal_selesai'] as String),
      catatan: json['catatan'] as String?,
    );
  }
}