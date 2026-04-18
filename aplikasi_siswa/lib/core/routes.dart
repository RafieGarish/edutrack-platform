import 'package:flutter/material.dart';
import '../screens/analytics_screen.dart';
import '../screens/generate_qr_screen_integrated.dart';
import '../screens/login_screen_integrated.dart';
import '../screens/main_layout.dart';
import '../screens/notification_screen.dart';
import '../screens/schedule_screen.dart';
import '../screens/submit_permission_screen_integrated.dart';
import 'transitions.dart';

class AppRoutes {
  static const String login = '/';
  static const String main = '/main';
  static const String analytics = '/analytics';
  static const String notifications = '/notifications';
  static const String qr = '/qr';
  static const String permission = '/permission';
  static const String schedule = '/schedule';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case main:
        return MaterialPageRoute(builder: (_) => const MainLayout());
      case analytics:
        return SlidePageRoute(page: const AnalyticsScreen());
      case notifications:
        return SlidePageRoute(page: const NotificationScreen());
      case qr:
        return ScalePageRoute(page: const GenerateQRScreen());
      case schedule:
        return ScalePageRoute(page: const ScheduleScreen());
      case permission:
        return SlidePageRoute(page: const SubmitPermissionScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('Route ${settings.name} tidak ditemukan!')),
          ),
        );
    }
  }
}