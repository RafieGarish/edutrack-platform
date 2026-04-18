/// Centralized, user-friendly exception wrapper untuk EduTrack.
class AppException implements Exception {
  final String message;
  final String? code;

  const AppException(this.message, {this.code});

  @override
  String toString() => message;
}