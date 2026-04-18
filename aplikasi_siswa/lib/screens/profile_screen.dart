import 'package:flutter/material.dart';
import '../core/routes.dart';
import '../core/theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final palette = AppPalette.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: palette.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "Profil Saya",
          style: TextStyle(fontWeight: FontWeight.bold, color: palette.text),
        ),
        centerTitle: true,
        actions: [
          // --- TOMBOL SWITCH TEMA ---
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode, color: palette.text),
            onPressed: () {
              themeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark;
            },
          ),
          IconButton(onPressed: () {}, icon: Icon(Icons.more_vert, color: palette.text)),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Avatar
            Stack(
              children: [
                Container(
                  width: 112,
                  height: 112,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: palette.card, width: 4),
                    image: const DecorationImage(
                      image: NetworkImage(
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCS2wLIRuaA4o4TcoNFWX71Z1Pkt-6kf8qcrFIDPaUqrBqykOnIncYNZ8EHTe0TN5tZPRngQKW-8VNSTLZCdM0xm5JLjNK7nvNAMCHhuzjm1eP-d2E96ni_MeXOHquhePonpYFpRrBDCdx1AWvnWpL1b8uSk2jd-oJ8DOLjRqynVPz8p7sdZW7oOdY45H3AbMzLA3OvhA2tyMbLqW1SG87UKkfzWXSBqiwGALwCaXJ3Z5QCEkJXOH4tQg7iQWb5jGnbQKkrHgtW0w',
                      ),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: palette.primary,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: palette.background,
                        width: 4,
                      ),
                    ),
                    child: const Icon(
                      Icons.edit,
                      size: 14,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              "Alex Johnson",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: palette.text),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.badge, size: 16, color: palette.textGray),
                const SizedBox(width: 4),
                Text(
                  "NISN: 0012345678",
                  style: TextStyle(color: palette.textGray),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: palette.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                "Rekayasa Perangkat Lunak",
                style: TextStyle(
                  color: palette.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Digital ID Card
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "Digital Student ID",
                  style: TextStyle(fontWeight: FontWeight.bold, color: palette.text),
                ),
                TextButton(
                  onPressed: () {},
                  child: Text(
                    "View Full Card",
                    style: TextStyle(fontSize: 12, color: palette.primary),
                  ),
                ),
              ],
            ),
            Container(
              height: 200,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF101d22), Color(0xFF1c3038)], // Keep ID card dark always
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
                boxShadow: const [
                  BoxShadow(color: Colors.black45, blurRadius: 10),
                ],
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: RadialGradient(
                          center: Alignment.topRight,
                          radius: 1.5,
                          colors: [
                            palette.primary.withOpacity(0.2),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "SMKN 1 Pacitan",
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.grey,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const Text(
                                  "Kartu Pelajar",
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              width: 32,
                              height: 32,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.yellow,
                                    Colors.pink,
                                    Colors.cyan,
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "Card Holder",
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  "ALEX JOHNSON",
                                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                SizedBox(height: 8),
                                Text(
                                  "Berlaku Sampai",
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.grey,
                                  ),
                                ),
                                Text(
                                  "09/26",
                                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.all(4),
                              color: Colors.white,
                              child: Image.network(
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuBgPJtDxmFhiFAHn3YBz_EYZ8uDlw5OoQCXFoaYIKn7XcroXYukyE_X4jgVxdFC5dD37XdDh__BHCKtDhj-znrN1ucnljiByafG4p-wrJ-4OyGhHnvpYCH-2OpblU94jdE20TDHd5sPYbGo5JZf4yOgwcdXsPZocb7cO6lX5lCz8VDsOmYS8pYY7vUo0sxuO67P9B5ijaldWRBfpGAUh6KHEdtfmsgCSSTcoGQJTNZtcvahwcIMbNYp9wBqWKQ6y7-k1Yk853lp4w',
                                width: 60,
                                height: 60,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Link to Permissions
            ListTile(
              onTap: () => Navigator.pushNamed(context, AppRoutes.permission), // ROUTING PERMISSION
              tileColor: palette.card,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.verified_user, color: Colors.purple),
              ),
              title: Text("Surat Izin", style: TextStyle(color: palette.text)),
              subtitle: Text("Upload surat izin, jika tidak masuk", style: TextStyle(color: palette.textGray)),
              trailing: Icon(
                Icons.chevron_right,
                color: palette.textGray,
              ),
            ),
            const SizedBox(height: 12),
            _buildSettingGroup("Account Settings", [
              _buildSettingItem(
                Icons.person,
                Colors.blue,
                "Personal Information",
                "Email, Phone, Address",
                palette,
              ),
              _buildSettingItem(
                Icons.school,
                Colors.purple,
                "Academic Details",
                "Grades, Schedule",
                palette,
              ),
            ], palette),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red.shade300,
                side: BorderSide(color: Colors.red.shade900),
                minimumSize: const Size(double.infinity, 50),
                backgroundColor: Colors.red.withOpacity(0.05),
              ),
              onPressed: () => Navigator.pushReplacementNamed(context, AppRoutes.login), // LOGOUT ROUTING
              icon: const Icon(Icons.logout),
              label: const Text("Log Out"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingGroup(String title, List<Widget> items, AppPalette palette) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: TextStyle(
            fontSize: 12,
            color: palette.textGray,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: palette.card,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(children: items),
        ),
      ],
    );
  }

  Widget _buildSettingItem(
    IconData icon,
    Color color,
    String title,
    String sub,
    AppPalette palette,
  ) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color),
      ),
      title: Text(
        title,
        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: palette.text),
      ),
      subtitle: Text(
        sub,
        style: TextStyle(fontSize: 12, color: palette.textGray),
      ),
      trailing: Icon(Icons.chevron_right, color: palette.textGray),
    );
  }
}