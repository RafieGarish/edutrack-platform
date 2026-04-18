import 'package:flutter/material.dart';
import '../core/routes.dart';
import '../core/theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);

    return Scaffold(
      backgroundColor: palette.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: palette.primary.withOpacity(0.2),
                            width: 2,
                          ),
                          image: const DecorationImage(
                            image: NetworkImage(
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuCpVsceZE2tdgStdx-jm-hOKgDsF2C2ZENKMVWv9ZFBQM-3hP46RhhcZZf6xtI8GxfsIgfHwDtMpA4XTBHM1OlW1-V6xrt61pP_7SWz9-HHjFCjSpFWHD8Baky0VzhyjqblZU6pllEc4bMP_S01ryW7dDhGPk1HXq37YM7SywJpEFGFWBXH0CjVp-AB_v09ozhdVs2w8xB8yR-swH43yWfHRzZMPzVt--LpWZ6KBKPt1psBgiwfZczZccRLLRIap9W6jy1N-TAasg',
                            ),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Selamat Pagi,",
                            style: TextStyle(
                              fontSize: 12,
                              color: palette.textGray,
                            ),
                          ),
                          Text(
                            "Alex Johnson",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: palette.text,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Stack(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.pushNamed(context, AppRoutes.notifications), // ROUTING
                        icon: Badge(
                          label: const Text('5'),
                          child: Icon(
                            Icons.notifications_outlined,
                            color: palette.text,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Hero Card
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, AppRoutes.qr), // ROUTING QR
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: palette.card,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: palette.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: palette.primary.withOpacity(0.3),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: palette.primary.withOpacity(0.2),
                              blurRadius: 15,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.qr_code_scanner,
                          size: 32,
                          color: palette.primary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "Scan untuk Absen",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: palette.text,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Siap memulai pembelajaran? Scan QR code pada monitor untuk absensi",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: palette.textGray,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 12,
                          horizontal: 24,
                        ),
                        decoration: BoxDecoration(
                          color: palette.primary,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: palette.primary.withOpacity(0.25),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.center_focus_weak,
                              color: Colors.white,
                            ),
                            SizedBox(width: 8),
                            Text(
                              "Buka Scanner",
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Stats Row
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => Navigator.pushNamed(context, AppRoutes.analytics), // ROUTING ANALYTICS
                      child: _buildStatCard("Kehadiran", "85", "%", 0.85, true, palette),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard("Mapel", "12", "/ 14", 0, false, palette),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Schedule Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Jadwal Hari Ini",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: palette.text),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.schedule),
                    child: Text(
                      "Lihat Kalender",
                      style: TextStyle(color: palette.primary, fontSize: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Timeline
              Stack(
                children: [
                  Positioned(
                    left: 20,
                    top: 0,
                    bottom: 0,
                    child: Container(width: 2, color: palette.textGray.withOpacity(0.2)),
                  ),
                  Column(
                    children: [
                      _buildTimelineItem(
                        isPast: true,
                        title: "Mathematics",
                        time: "09:00 AM - 10:30 AM",
                        location: "Room 302",
                        status: "Attended",
                        palette: palette,
                      ),
                      _buildTimelineItem(
                        isPast: false,
                        isCurrent: true,
                        title: "Physics 101",
                        time: "11:00 AM - 12:30 PM",
                        location: "Science Lab 1",
                        status: "Up Next",
                        palette: palette,
                      ),
                      _buildTimelineItem(
                        isPast: false,
                        title: "World History",
                        time: "02:00 PM - 03:30 PM",
                        location: "Lecture Hall B",
                        status: "",
                        palette: palette,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 60),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String title,
    String bigVal,
    String smallVal,
    double progress,
    bool showChart,
    AppPalette palette,
  ) {
    return Container(
      height: 140,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: palette.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.textGray.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: TextStyle(
                  fontSize: 10,
                  color: palette.textGray,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (showChart)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.trending_up, color: Colors.green, size: 14),
                      Text(
                        " 2%",
                        style: TextStyle(
                          color: Colors.green,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    bigVal,
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: palette.text,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6, left: 2),
                    child: Text(
                      smallVal,
                      style: TextStyle(
                        fontSize: 14,
                        color: palette.textGray,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (showChart)
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: palette.textGray.withOpacity(0.2),
                    color: palette.primary,
                    minHeight: 6,
                  ),
                )
              else
                Text(
                  "Completed this week",
                  style: TextStyle(fontSize: 10, color: palette.textGray),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem({
    required bool isPast,
    bool isCurrent = false,
    required String title,
    required String time,
    required String location,
    required String status,
    required AppPalette palette,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16, left: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Dot
          Column(
            children: [
              const SizedBox(height: 8),
              Container(
                width: 16,
                height: 16,
                margin: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: isCurrent
                      ? palette.primary
                      : (isPast ? palette.textGray : palette.textGray),
                  shape: BoxShape.circle,
                  border: Border.all(color: palette.background, width: 3),
                  boxShadow: isCurrent
                      ? [
                          BoxShadow(
                            color: palette.primary.withOpacity(0.5),
                            blurRadius: 10,
                          ),
                        ]
                      : null,
                ),
              ),
            ],
          ),
          // Card
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isCurrent
                    ? palette.card
                    : (isPast
                          ? palette.card.withOpacity(0.6)
                          : palette.card),
                borderRadius: BorderRadius.circular(12),
                border: isCurrent
                    ? Border(
                        left: BorderSide(color: palette.primary, width: 4),
                      )
                    : Border.all(
                        color: palette.textGray.withOpacity(0.1),
                        width: 1,
                      ),
                boxShadow: isCurrent ? [
                   BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 5)
                ] : null,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isCurrent)
                    Text(
                      "UP NEXT",
                      style: TextStyle(
                        color: palette.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: palette.text,
                        ),
                      ),
                      if (isPast)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: palette.textGray.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            status,
                            style: TextStyle(
                              fontSize: 10,
                              color: palette.textGray,
                            ),
                          ),
                        ),
                      if (isCurrent)
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: palette.textGray.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.science, size: 14, color: palette.text),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.schedule,
                        size: 16,
                        color: palette.textGray,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        time,
                        style: TextStyle(
                          fontSize: 12,
                          color: palette.textGray,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 16,
                        color: palette.textGray,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        location,
                        style: TextStyle(
                          fontSize: 12,
                          color: palette.textGray,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}