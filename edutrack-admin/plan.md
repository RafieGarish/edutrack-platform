[done]~~ketika memasukkan data siswa pada onboarding screen, maka data siswa akan masuk ke supabase auth (tanpa verifikasi) dan ke tabel users dengan role student. agar nantinya bisa digunakan untuk login pada aplikasi_siswa~~  
[done]password student diinput manual di onboarding screen step-students.tsx
[done]saya ingin setelah user mengklik Create Account pada halaman signup, maka akan di redirect ke halaman check-email/page.tsx
[done]buat halaman management surat izin siswa
tambahkan dropdown yang berisi checkbox (multiple choices) kelas di onboarding screen step-teachers
tambahkan smart-combo-box.tsx yang berisi kelas di onboarding screen step-teachers. fungsinya adalah untuk mendefinisikan kelas yang akan diajar guru-guru
tambahkan step baru untuk ruang kelas di onboarding screen. ini 
[done]buatlah field kelas menjadi 2 saja (kelas & jurusan)
[done, need review]buat penginputan jadwal agar lebih efisien. gunakan component yang sudah dibuat sebelumnya seperti yang ada di "F:\Programming\next-js-projects\lesson-schedule". untuk kotak yang kosong, diberi icon "+", kemudian ketika diklik, maka akan muncul modal "Tambah Jadwal". [masih kurang fitur custom penambahan row untuk jam mapelnya. jamnya bisa di custom value, termasuk jam istirahatnya.]
validasi untuk mencegah duplikasi jadwal pada step-schedule
[done]tambahkan map dengan pinpoint coordinate picker pada step-school-info.tsx, saya ingin alamat sekolahnya otomatis terdeteksi berdasarkan pinpointnya
untuk user yang mendaftarkan pertama kali (sebelumnya memiliki role admin), ubah rolenya menjadi superadmin
ketika memasukkan data guru pada onboarding screen, maka data guru akan masuk ke supabase auth (tanpa verifikasi) dan ke tabel users dengan role guru. agar nantinya bisa digunakan untuk login pada dashboard admin. namun untuk role guru ini memiliki keterbatasan, yaitu tidak bisa mengakses halaman manage guru
format email guru nip@edutrack.internal. jadi ganti field email yang ada di onboarding school step-teachers.tsx
tambahkan field no. hp pada onboarding screen step-teachers.tsx

I want users who register for the first time (previously had the admin role) to have their role changed to superadmin. Also, when entering teacher data on the onboarding screen, the teacher data will be entered into the supabase auth (without verification) and into the users table with the teacher role, so that it can later be used to log in to the admin dashboard. However, this teacher role has limitations, namely that it cannot access the manage teacher page. Therefore, there are only three roles on this platform: superadmin, teacher, and student.
setelah user berhasil setup, maka user akan diarahkan ke halaman app/welcome/page.tsx
setelah 5 detik di phase Welcome to EduTrack, maka user akan diarahkan ke dashboard admin

@edutrack.internal diganti dengan domain yang sudah dibeli

Mari kita buat halaman arahan modern dan responsif dengan palet warna biru untuk platform SaaS berbasis QR Code untuk kehadiran siswa. Tambahkan animasi untuk menjaga keterlibatan pengguna.

!!!The schedules page is broken. files affected: schedule/page.tsx, app/globals.css

dialog-logout masih berantakan

crypto-js date-fns flipclock framer-motion lucide-react motion next-themes nextjs-toploader papaparse react-day-picker recharts server-only tailwind-merge tw-animate-css

react digunakan sebagai UI (User Interface/Antarmuka) sebuah website. kami menggunakan react karena react ini adalah framework component
dalam aplikasi ini, next js digunakan sebagai engine backend untuk menangani SSR dan CSR