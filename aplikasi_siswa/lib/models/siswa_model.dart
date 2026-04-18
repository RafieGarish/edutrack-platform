class SiswaModel {
  final String id;
  final String nisn;
  final String namaLengkap;
  final String? deviceId;
  final String kelas;

  const SiswaModel({
    required this.id,
    required this.nisn,
    required this.namaLengkap,
    this.deviceId,
    required this.kelas,
  });

  factory SiswaModel.fromJson(Map<String, dynamic> json) {
    return SiswaModel(
      id: json['id'] as String,
      nisn: json['nisn'] as String,
      namaLengkap: json['nama_lengkap'] as String,
      deviceId: json['device_id'] as String?,
      kelas: json['kelas'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nisn': nisn,
    'nama_lengkap': namaLengkap,
    'device_id': deviceId,
    'kelas': kelas,
  };
}