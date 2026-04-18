import 'package:edutrack_full/screens/submit_permission_screen_integrated.dart';
import 'package:flutter/material.dart';
import '../core/routes.dart';
import '../widgets/custom_bottom_nav.dart';
import 'history_screen_integrated.dart';
import 'home_screen.dart';
import 'profile_screen.dart';
import 'schedule_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  final List<Widget> _pages = [
    const HomeScreen(),
    const HistoryScreen(),
    // const ScheduleScreen(),
    const SubmitPermissionScreen(),
    const ProfileScreen(),
  ];

  void _onTabTapped(int index) {
    setState(() => _currentIndex = index);
    _pageController.animateToPage(
      index, duration: const Duration(milliseconds: 300), curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        physics: const BouncingScrollPhysics(),
        onPageChanged: (index) => setState(() => _currentIndex = index),
        children: _pages,
      ),
      bottomNavigationBar: CustomBottomNavBar(
        selectedIndex: _currentIndex,
        onItemSelected: _onTabTapped,
        onScanPressed: () {
          Navigator.pushNamed(context, AppRoutes.qr); // ROUTING KE QR
        },
      ),
    );
  }
}