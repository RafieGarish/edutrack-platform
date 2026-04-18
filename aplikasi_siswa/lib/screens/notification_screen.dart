import 'package:flutter/material.dart';
import '../core/theme.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);

    return Scaffold(
      backgroundColor: palette.background,
      appBar: AppBar(
        backgroundColor: palette.background.withOpacity(0.95),
        surfaceTintColor: palette.background.withValues(alpha: 0.95),
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: palette.text),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text("Notifications", style: TextStyle(fontWeight: FontWeight.bold, color: palette.text)),
        actions: [
          TextButton(
            onPressed: () {},
            child: Text("Mark all read", style: TextStyle(color: palette.primary, fontSize: 12)),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: palette.textGray.withOpacity(0.1), height: 1),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader("Today", "2 New", palette),
          _buildNotificationItem(
            icon: Icons.check_circle, color: palette.success,
            title: "Attendance Confirmed", desc: "You successfully checked in for Biology 101.",
            time: "9:05 AM", isUnread: true, palette: palette,
          ),
          _buildNotificationItem(
            icon: Icons.notifications_active, color: palette.primary,
            title: "Upcoming Class", desc: "Math 202 starts in 15 minutes in Room 304.",
            time: "1:45 PM", isUnread: true, palette: palette,
          ),

          _buildSectionHeader("Yesterday", null, palette),
          _buildNotificationItem(
            icon: Icons.pending_actions, color: palette.warning,
            title: "Permission Pending", desc: "Your sick leave request for Oct 24 is under review.",
            time: "4:30 PM", isUnread: false, palette: palette,
          ),

          _buildSectionHeader("Earlier", null, palette),
          _buildNotificationItem(
            icon: Icons.cancel, color: palette.error,
            title: "Permission Rejected", desc: "Resubmit medical certificate. Image was blurry.",
            time: "Oct 24", isUnread: false, palette: palette,
          ),
          _buildNotificationItem(
            icon: Icons.campaign, color: Colors.grey,
            title: "Campus Announcement", desc: "The main library will be closed for maintenance.",
            time: "Oct 20", isUnread: false, palette: palette,
          ),

          const SizedBox(height: 40),
          Center(
            child: Column(
              children: [
                Icon(Icons.inbox, size: 40, color: palette.textGray.withOpacity(0.3)),
                const SizedBox(height: 8),
                Text("No older notifications", style: TextStyle(color: palette.textGray.withOpacity(0.5))),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String? badge, AppPalette palette) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, top: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: palette.text)),
          if (badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: palette.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
              child: Text(badge, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: palette.primary)),
            ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem({
    required IconData icon, required Color color, required String title,
    required String desc, required String time, required bool isUnread, required AppPalette palette,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: palette.card, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isUnread ? Colors.transparent : palette.textGray.withOpacity(0.1)),
        boxShadow: isUnread ? [BoxShadow(color: palette.primary.withOpacity(0.1), blurRadius: 10)] : null,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: palette.text)),
                    if (isUnread) Container(width: 8, height: 8, decoration: BoxDecoration(color: palette.primary, shape: BoxShape.circle)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(desc, style: TextStyle(fontSize: 14, color: palette.textGray, height: 1.4)),
                const SizedBox(height: 6),
                Text(time, style: TextStyle(fontSize: 12, color: palette.textGray, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}