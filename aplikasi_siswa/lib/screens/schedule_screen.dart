import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../core/routes.dart';

class ScheduleScreen extends StatelessWidget {
  const ScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);

    return Scaffold(
      backgroundColor: palette.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  IconButton(onPressed: () => Navigator.pop(context), icon: Icon(Icons.arrow_back)),
                  Expanded(
                    child: Text(
                      "Schedule",
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: palette.text),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      Navigator.pushNamed(context, AppRoutes.notifications); // Navigasi ke Notifikasi
                    },
                    icon: Badge(
                      child: Icon(Icons.notifications_outlined, color: palette.text),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const CircleAvatar(
                    backgroundImage: NetworkImage(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9YARIuoG2VkpMA6dAKVhV8n-_-DbKOWdE5PNKzp0RyoQmQaqcQ0DZFwOeziLmWQe4k2E4OnBpxuY0Kz2l8J4XQNMNUPXYtilmF5mqZF_6IpGpK0aNgKPol1XXonhdKxDjxPCKIfdFXqZiVEnEyjGa8kZdKmJdx7OQLap25Rdg2_RYpMQ66AXPKqsCBqmGtz2YTmcnrTcgEDDSm7C4Qa7AlLgxDfIkisiebIGg9dZFAY45AjIW-u8cSJByMCgQP9PxsKXrJ_hvcw',
                    ),
                  ),
                ],
              ),
            ),
            // Month Selector
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(icon: Icon(Icons.chevron_left, color: palette.text), onPressed: () {}),
                  Text("October 2023", style: TextStyle(fontWeight: FontWeight.bold, color: palette.text)),
                  IconButton(icon: Icon(Icons.chevron_right, color: palette.text), onPressed: () {}),
                ],
              ),
            ),
            // Date Strip
            SizedBox(
              height: 70,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _buildDateItem("Mon", "23", false, palette),
                  _buildDateItem("Tue", "24", false, palette),
                  _buildDateItem("Wed", "25", true, palette), // Active
                  _buildDateItem("Thu", "26", false, palette),
                  _buildDateItem("Fri", "27", false, palette),
                  _buildDateItem("Sat", "28", false, palette),
                ],
              ),
            ),
            Divider(height: 32, color: palette.textGray.withOpacity(0.1)),
            // Timeline Content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  Text("3 Classes Today", style: TextStyle(color: palette.textGray, fontSize: 14)),
                  const SizedBox(height: 16),
                  _buildClassCard(
                    "09:00", "AM", "Mathematics", "Room 101", "Prof. Smith",
                    palette.success, palette, isDone: true,
                  ),
                  // Time divider
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 50,
                          child: Text(
                            "10:45", textAlign: TextAlign.right,
                            style: TextStyle(color: palette.primary, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                        const SizedBox(width: 16),
                        CircleAvatar(radius: 5, backgroundColor: palette.primary),
                        Expanded(child: Container(height: 2, color: palette.primary)),
                      ],
                    ),
                  ),
                  _buildClassCard(
                    "11:00", "AM", "History", "Room 3B", "Dr. Jones",
                    palette.primary, palette, isLive: true,
                  ),
                  const SizedBox(height: 24),
                  _buildClassCard(
                    "02:00", "PM", "Physics", "Lab 4", "Mrs. Davis",
                    palette.warning, palette,
                  ),
                  const SizedBox(height: 40),
                  Center(
                    child: Column(
                      children: [
                        Icon(Icons.bedtime, size: 40, color: palette.textGray.withOpacity(0.3)),
                        const SizedBox(height: 8),
                        Text("No more classes for today.", style: TextStyle(color: palette.textGray.withOpacity(0.5))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateItem(String day, String date, bool isActive, AppPalette palette) {
    return Container(
      width: 60, margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: isActive ? palette.primary : palette.card,
        borderRadius: BorderRadius.circular(12),
        border: isActive ? null : Border.all(color: palette.textGray.withOpacity(0.1)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(day, style: TextStyle(fontSize: 12, color: isActive ? Colors.white : palette.textGray)),
          Text(date, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isActive ? Colors.white : palette.text)),
        ],
      ),
    );
  }

  Widget _buildClassCard(
    String time, String period, String title, String loc, String prof,
    Color accent, AppPalette palette, {bool isDone = false, bool isLive = false,}
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 50,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(time, style: TextStyle(fontWeight: FontWeight.bold, color: isLive ? palette.primary : palette.text)),
              Text(period, style: TextStyle(fontSize: 10, color: palette.textGray)),
            ],
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: palette.card, borderRadius: BorderRadius.circular(16),
              border: isLive ? Border.all(color: palette.primary, width: 2) : Border.all(color: palette.textGray.withOpacity(0.1)),
              boxShadow: isLive ? [BoxShadow(color: palette.primary.withOpacity(0.1), blurRadius: 10)] : null,
            ),
            child: Row(
              children: [
                Container(
                  width: 6, height: 110,
                  decoration: BoxDecoration(
                    color: accent,
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: palette.text)),
                            if (isDone)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: palette.success.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                                child: Text("Done", style: TextStyle(color: palette.success, fontSize: 10)),
                              ),
                            if (isLive)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: palette.primary.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                                child: Row(
                                  children: [
                                    CircleAvatar(radius: 3, backgroundColor: palette.primary),
                                    const SizedBox(width: 4),
                                    Text("Live", style: TextStyle(color: palette.primary, fontSize: 10)),
                                  ],
                                ),
                              ),
                          ],
                        ),
                        if (isLive)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text("In Progress • 45m remaining", style: TextStyle(color: palette.primary, fontSize: 12)),
                          ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _buildDetailIcon(Icons.location_on, loc, palette),
                            const SizedBox(width: 16),
                            _buildDetailIcon(Icons.person, prof, palette),
                          ],
                        ),
                        if (isLive)
                          Padding(
                            padding: const EdgeInsets.only(top: 16),
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(backgroundColor: palette.primary, foregroundColor: Colors.white),
                              onPressed: () {},
                              icon: const Icon(Icons.qr_code_scanner, size: 16),
                              label: const Text("Check-in via QR"),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDetailIcon(IconData icon, String label, AppPalette palette) {
    return Row(
      children: [
        Icon(icon, size: 16, color: palette.textGray),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(color: palette.textGray, fontSize: 12)),
      ],
    );
  }
}