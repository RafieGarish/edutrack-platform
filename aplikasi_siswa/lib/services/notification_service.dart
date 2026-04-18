import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/app_exception.dart';

class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String type;
  final bool isRead;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    this.metadata,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String? ?? 'info',
      isRead: json['is_read'] as bool? ?? false,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

class NotificationService {
  NotificationService({SupabaseClient? client})
      : _supabase = client ?? Supabase.instance.client;

  final SupabaseClient _supabase;

  /// Fetch all notifications for the current user.
  Future<List<NotificationModel>> getNotifications({
    required String userId,
    int limit = 50,
  }) async {
    try {
      final data = await _supabase
          .from('notifications')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(limit);

      return (data as List)
          .map((row) => NotificationModel.fromJson(row as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw AppException('Gagal memuat notifikasi.\n($e)');
    }
  }

  /// Get unread notification count.
  Future<int> getUnreadCount({required String userId}) async {
    try {
      final data = await _supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('is_read', false);

      return (data as List).length;
    } catch (e) {
      return 0;
    }
  }

  /// Mark a notification as read.
  Future<void> markAsRead({required String notificationId}) async {
    try {
      await _supabase
          .from('notifications')
          .update({'is_read': true})
          .eq('id', notificationId);
    } catch (e) {
      throw AppException('Gagal memperbarui notifikasi.\n($e)');
    }
  }

  /// Mark all notifications as read.
  Future<void> markAllAsRead({required String userId}) async {
    try {
      await _supabase
          .from('notifications')
          .update({'is_read': true})
          .eq('user_id', userId)
          .eq('is_read', false);
    } catch (e) {
      throw AppException('Gagal memperbarui notifikasi.\n($e)');
    }
  }

  /// Subscribe to realtime notification inserts.
  RealtimeChannel subscribeToNotifications({
    required String userId,
    required void Function(NotificationModel) onNewNotification,
  }) {
    return _supabase
        .channel('notifications:$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            if (payload.newRecord.isNotEmpty) {
              onNewNotification(
                NotificationModel.fromJson(payload.newRecord),
              );
            }
          },
        )
        .subscribe();
  }
}
