# EduTrack Platform Architecture & Flowcharts

Berikut adalah visualisasi arsitektur dan alur kerja (workflow) dari EduTrack Platform yang terdiri dari 4 aplikasi utama dan Backend Supabase.

## 1. Arsitektur Komponen Keseluruhan (System Architecture)

Diagram ini menunjukkan hubungan antara setiap aplikasi dalam ekosistem EduTrack dengan Supabase sebagai Backend-as-a-Service (BaaS).

```mermaid
flowchart TB
    subgraph Users
        Pub[Public / School Admin]
        Admin[Admin / Guru]
        Siswa[Siswa]
        ScannerUser[Petugas Piket / Device Scanner]
    end

    subgraph EduTrack Platform
        direction TB
        LP[landing-page-edutrack\nNext.js / React]
        EA[edutrack-admin\nNext.js Dashboard]
        AS[aplikasi_siswa\nFlutter Mobile App]
        QS[qr-scanner\nNext.js Web App]
    end

    subgraph Backend - Supabase
        Auth[Supabase Auth]
        DB[(PostgreSQL Database)]
        Storage[Supabase Storage]
    end

    %% Relasi Pengguna ke Aplikasi
    Pub -->|Visit & Register| LP
    Admin -->|Manage System| EA
    Siswa -->|View & Gen QR| AS
    ScannerUser -->|Scan QR| QS

    %% Relasi Aplikasi ke Backend
    LP -.->|Sign Up School| Auth
    LP -.->|Redirect to| EA
    
    EA <-->|CRUD Data Sekolah,\nApprove Izin, View Absensi| DB
    EA <-->|Manage Users| Auth
    
    AS <-->|Fetch Jadwal & Riwayat,\nSubmit Izin| DB
    AS -.->|Upload Surat Izin| Storage
    AS <-->|Login Siswa| Auth
    
    QS <-->|Validasi QR & Insert Absen| DB
    QS <-->|Login Scanner| Auth
```

---

## 2. Alur Mekanisme Absensi & Perizinan (Attendance Workflow)

Flowchart ini memvisualisasikan mekanisme spesifik absensi harian, pembuatan surat izin, persetujuan izin, dan cara scanner memproses kehadiran (Sesuai dengan logika terbaru yang dibatasi **1 kali sehari** dan **berdasarkan jadwal pertama**).

```mermaid
sequenceDiagram
    autonumber
    actor S as Siswa (aplikasi_siswa)
    actor SC as Petugas (qr-scanner)
    participant B as Supabase Database
    actor A as Admin/Guru (edutrack-admin)

    %% Skenario 1: Pengajuan Izin
    rect rgb(240, 248, 255)
        note right of S: SKENARIO 1: SISWA TIDAK MASUK (IZIN/SAKIT)
        S->>B: Upload Surat Izin (Status: Pending)
        A->>B: Buka Dashboard & Cek Request Izin
        A->>B: Setujui Izin (Status: Approved)
        B-->>B: Trigger/Action: Buat record Absensi 'Excused'<br/>Untuk hari-hari tersebut (Catatan: Sakit/Izin)
        S->>B: Cek Riwayat Absensi
        B-->>S: Tampil Status "Izin" & Catatan "Sakit"
    end

    %% Skenario 2: Scan QR Terhalang Izin
    rect rgb(255, 240, 245)
        note right of S: SKENARIO 2: SISWA YANG SUDAH IZIN MENCOBA SCAN
        S->>S: Generate QR Code Absensi
        S->>SC: Tunjukkan QR Code
        SC->>B: Decode QR & Validasi Absensi Hari ini
        B-->>SC: Error: Punya Perizinan Disetujui/Pending
        SC-->>S: Tampilkan Error "Siswa memiliki izin..."
    end

    %% Skenario 3: Absensi Normal (Masuk/Terlambat)
    rect rgb(240, 255, 240)
        note right of S: SKENARIO 3: ABSENSI NORMAL HARIAN
        S->>S: Generate QR Code Absensi
        S->>SC: Tunjukkan QR Code
        SC->>B: Decode QR & Validasi
        B->>B: Cek apakah sudah absen hari ini? (Max 1x)
        B->>B: Ambil Jadwal Pertama Hari Ini (Mulai Pukul X)
        B->>B: Hitung Keterlambatan: Jika Waktu > X, Status = 'Late', else 'Present'
        B->>B: Insert Absensi ke Database
        B-->>SC: Return Success + Status (Masuk/Terlambat)
        SC-->>S: Mainkan Suara 'Beep' Sukses + Tampil Toast
    end
```

---

## 3. Alur Kerja Logika Scanner secara Internal (QR Scanner Logic)

Berikut ini adalah logika rinci di dalam `qr-scanner/actions/attendance.ts` saat fungsi scan dipanggil.

```mermaid
flowchart TD
    Start([Mulai Scan QR]) --> Decode[Dekripsi & Parse Payload QR]
    
    Decode --> ValidFormat{Format/Kadaluarsa?}
    ValidFormat -- Yes --> Exists{QR Invalid/Expired}
    Exists --> ToastErr1[Toast Error: QR Invalid]
    
    ValidFormat -- No --> CheckSiswa[Cari Siswa di Database]
    CheckSiswa --> Found{Siswa Ditemukan?}
    Found -- No --> ToastErr2[Toast Error: Siswa Tidak Ditemukan]
    
    Found -- Yes --> CheckIzin[Cek Status Izin Hari Ini]
    CheckIzin --> IsIzin{Ada Izin Pending/Approved?}
    IsIzin -- Yes --> ToastErr3[Toast Error: Siswa punya izin/pending]
    
    IsIzin -- No --> CheckCheckedIn[Cek Absensi Hari Ini]
    CheckCheckedIn --> IsCheckedIn{Sudah Absen?}
    IsCheckedIn -- Yes --> ToastErr4[Toast Warning: Sudah Absen]
    
    IsCheckedIn -- No --> GetSchedule[Cari Semua Jadwal Hari Ini]
    GetSchedule --> HasSchedule{Ada Jadwal?}
    HasSchedule -- No --> ToastErr5[Toast Error: Tidak ada jadwal]
    
    HasSchedule -- Yes --> CalcTime[Ambil Jadwal Pertama & Terakhir]
    CalcTime --> CheckEnd{Waktu > Jadwal Terakhir?}
    CheckEnd -- Yes --> ToastErr6[Toast Error: Waktu Absen Berakhir]
    
    CheckEnd -- No --> CheckLate{Waktu <= Jadwal Pertama?}
    CheckLate -- Yes --> SetPresent[Set Status = 'Present']
    CheckLate -- No --> SetLate[Set Status = 'Late']
    
    SetPresent --> Insert[Insert ke Tabel Absensi]
    SetLate --> Insert
    
    Insert --> Success[Tampilkan Toast Berhasil]
```

---

## 4. Alur Pembuatan QR Code (Generate QR Logic di Aplikasi Siswa)

Flowchart ini memvisualisasikan bagaimana aplikasi siswa memproses, memvalidasi lokasi, dan mengenkripsi data sebelum QR Code ditampilkan di layar. Payload QR akan terus diperbarui otomatis setiap 30 detik untuk keamanan.

```mermaid
flowchart TD
    Start([Mulai Generate QR]) --> ReqPerm[Cek Izin Lokasi & GPS]
    
    ReqPerm --> GPSEnabled{GPS Aktif?}
    GPSEnabled -- Tidak --> ErrGPS[Tampilkan Error: GPS Disabled]
    GPSEnabled -- Ya --> PermGranted{Izin Diberikan?}
    
    PermGranted -- Tidak --> ErrPerm[Tampilkan Error: Permission Denied]
    PermGranted -- Ya --> GetLoc[Ambil Koordinat Lokasi Saat Ini]
    
    GetLoc --> CalcDist[Hitung Jarak ke Titik Sekolah]
    CalcDist --> InRange{Jarak <= 100 meter?}
    
    InRange -- Tidak --> ErrRange[Tampilkan Error: Out of Range]
    InRange -- Ya --> BuildPayload[Buat String: NISN;Timestamp;Lat;Lng]
    
    BuildPayload --> Encrypt[Enkripsi String dengan AES-256-CBC]
    Encrypt --> Base64[Encode Hasil ke Base64]
    
    Base64 --> Display[Tampilkan QR Code di Layar]
    Display --> Wait([Tunggu 30 Detik])
    Wait -.-> Start
```

---

## 5. Alur Login & Pengikatan Perangkat (Device Binding) di Aplikasi Siswa

Untuk mencegah kecurangan absensi (seperti titip absen), aplikasi siswa menerapkan sistem *Device Binding*. Satu akun NISN hanya dapat login di satu perangkat (HP) yang sama. Flowchart ini menunjukkan proses validasinya.

```mermaid
flowchart TD
    Start(["Input NISN & Password"]) --> Auth["Login via Supabase Auth\nNISN@edutrack.internal"]
    
    Auth --> AuthCheck{"Auth Sukses?"}
    AuthCheck -- "Tidak" --> ErrAuth["Tampilkan Error: Kredensial Salah"]
    AuthCheck -- "Ya" --> FetchData["Ambil Data Siswa dari Tabel siswa"]
    
    FetchData --> Found{"Data Ditemukan?"}
    Found -- "Tidak" --> ErrFound["Tampilkan Error: Data Tidak Ditemukan"]
    Found -- "Ya" --> GetDevice["Ambil Device ID Hardware (Android/iOS)"]
    
    GetDevice --> BindCheck{"Cek Kolom device_id di Database"}
    
    BindCheck -- "Kosong (Login Pertama)" --> BindDevice["Simpan Device ID ke Database"]
    BindDevice --> Persist["Simpan Sesi ke Secure Storage"]
    
    BindCheck -- "Sudah Terisi" --> MatchCheck{"Cocok dengan Device ID Saat Ini?"}
    
    MatchCheck -- "Tidak" --> ErrDevice["Tampilkan Error: Akun Terkunci di Perangkat Lain"]
    ErrDevice --> SignOut["Sign Out Paksa"]
    
    MatchCheck -- "Ya" --> Persist
    
    Persist --> Success(["Login Berhasil, Masuk ke Beranda"])
```

---

## 6. Alur Registrasi & Login Admin Sekolah (edutrack-admin)

Dashboard admin (`edutrack-admin`) diperuntukkan bagi pihak sekolah untuk mengelola sistem. Registrasi baru akan secara otomatis membuat entitas *tenant* sekolah baru. Flowchart ini memisahkan proses Registrasi dan Login.

```mermaid
flowchart TD
    %% Register Flow
    subgraph Register ["Alur Pendaftaran (Sign Up)"]
        direction TB
        StartReg(["Input: School Name, Name, Email, Password"]) --> CheckPass{"Validasi Password?"}
        
        CheckPass -- "Tidak Match / < 6 Karakter" --> ErrReg["Tampilkan Error Form"]
        CheckPass -- "Valid" --> AuthSignUp["supabase.auth.signUp()"]
        
        AuthSignUp --> SignUpCheck{"User Terbuat?"}
        SignUpCheck -- "Gagal" --> ErrReg
        SignUpCheck -- "Sukses" --> InsertSchool["Insert Data ke tabel schools\n(Bypass RLS via Service Role)"]
        
        InsertSchool --> InsertProfile["Insert Data ke tabel users\n(Set Role = admin & bind ke school_id)"]
        InsertProfile --> RedirectEmail["Redirect ke Halaman /auth/check-email"]
    end
    
    %% Login Flow
    subgraph Login ["Alur Masuk (Sign In)"]
        direction TB
        StartLog(["Input: Email & Password"]) --> AuthSignIn["supabase.auth.signInWithPassword()"]
        
        AuthSignIn --> SignInCheck{"Login Sukses?"}
        SignInCheck -- "Gagal" --> ErrLog["Tampilkan Error Kredensial"]
        SignInCheck -- "Sukses" --> RedirectDash["Redirect ke Halaman /dashboard"]
    end
```

---

## 7. Alur Setup Wizard (Onboarding) di Admin Dashboard

Setelah registrasi awal selesai, Admin sekolah akan dihadapkan dengan 7 langkah pengisian data master. Data ini disimpan sekaligus pada akhir *step* untuk mencegah anomali relasi data.

```mermaid
flowchart TD
    Start(["Submit Data Onboarding (7 Langkah)"]) --> Form["Parsing FormData & JSON"]
    
    Form --> Step1["1. Update Info Sekolah & Lokasi Geofence"]
    Step1 -.->|"Upload Logo (Jika Ada)"| Storage[("Supabase Storage\nschool-logos")]
    Step1 --> Step2["2. Insert Data Kelas"]
    
    Step2 --> Step3["3. Insert Data Guru & Mata Pelajaran"]
    Step3 --> Step4["4. Insert Data Ruangan"]
    
    Step4 --> Step5["5. Mapping & Insert Jadwal\n(Merelasikan Kelas, Guru, Mapel, Ruangan)"]
    
    Step5 --> CheckLimit{"Cek Kuota Siswa Sekolah?"}
    CheckLimit -- "Melebihi Limit" --> ErrLimit["Return Error: Quota Exceeded"]
    CheckLimit -- "Aman" --> LoopSiswa{"Looping Data Siswa"}
    
    LoopSiswa -- "Next Siswa" --> CreateSiswaAuth["Buat Supabase Auth User\n(NISN@edutrack.internal)"]
    CreateSiswaAuth --> InsertSiswaUser["Insert ke tabel `users` (Role: student)"]
    InsertSiswaUser --> InsertSiswaTabel["Insert Profil Lengkap ke tabel `siswa`"]
    InsertSiswaTabel --> LoopSiswa
    
    LoopSiswa -- "Selesai" --> LoopScanner{"Looping Data Scanner"}
    
    LoopScanner -- "Next Scanner" --> CreateScanAuth["Buat Supabase Auth User Scanner"]
    CreateScanAuth --> InsertScanUser["Insert ke tabel `users` (Role: scanner)"]
    InsertScanUser --> LoopScanner
    
    LoopScanner -- "Selesai" --> MarkComplete["Update tabel `schools`:\nonboarding_completed = true"]
    MarkComplete --> Finish(["Setup Berhasil, Redirect ke /dashboard"])
```

---

## 8. Alur Login Aplikasi QR Scanner (`qr-scanner`)

Aplikasi pemindai QR memiliki mekanisme proteksi _Role-Based Access Control_ (RBAC) pada saat proses login. Aplikasi akan memastikan bahwa hanya user dengan akses sebagai petugas pemindai atau admin yang bisa mengakses halaman _Scanner_.

```mermaid
flowchart TD
    Start(["Input: Email & Password"]) --> AuthSignIn["supabase.auth.signInWithPassword()"]
    
    AuthSignIn --> SignInCheck{"Login Sukses?"}
    SignInCheck -- "Gagal" --> ErrKredensial["Tampilkan Error: Kredensial Tidak Valid"]
    
    SignInCheck -- "Sukses" --> GetRole["Ambil Data Role dari Tabel users\n(via Supabase Admin)"]
    
    GetRole --> RoleCheck{"Berhasil Fetch Role?"}
    RoleCheck -- "Gagal" --> SignOut1["supabase.auth.signOut()"]
    SignOut1 --> ErrFetch["Tampilkan Error: Gagal Fetch Role"]
    
    RoleCheck -- "Sukses" --> ValidRoleCheck{"Role == 'scanner' / 'admin' / 'superadmin' ?"}
    
    ValidRoleCheck -- "Bukan" --> SignOut2["supabase.auth.signOut()"]
    SignOut2 --> ErrUnauthorized["Tampilkan Error: Unauthorized"]
    
    ValidRoleCheck -- "Ya" --> RedirectHome["Redirect ke Halaman Utama Scanner ( / )"]
```
