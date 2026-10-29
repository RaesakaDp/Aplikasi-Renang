// ==================== DATABASE LOCALSTORAGE ====================
let db = JSON.parse(localStorage.getItem('aquaTrackDB')) || {
    members: [
        { id: '1', name: 'Abdul Kadir Malik Salampessy', squad: 'Prestasi', gender: 'PA', wa: '628123456789', birthDate: '2010-03-25' },
        { id: '2', name: 'Fitrah Fadillah Subagyo', squad: 'Reguler', gender: 'PA', wa: '628987654321', birthDate: '2011-09-06' },
        { id: '3', name: 'Chloe Dafina Putri', squad: 'Pemula', gender: 'PI', wa: '628112233445', birthDate: '2013-03-27' }
    ],
    spp: {}, 
    announcements: [
        { date: new Date().toISOString().split('T')[0], text: 'Selamat datang di Aplikasi Web AquaTrack!' }
    ],
    attendance: {}, 
    performance: {},
    workouts: [],
    treasury: [
        { id: 't1', date: new Date().toISOString().split('T')[0], type: 'masuk', amount: 500000, desc: 'Kas Awal Klub' }
    ],
    inventory: [
        { id: 'i1', name: 'Kickboard / Pelampung', qty: 15, condition: 'Baik' },
        { id: 'i2', name: 'Stopwatch Digital', qty: 4, condition: 'Baik' }
    ],
    tournaments: {
        info: {
            club: "MARABUNTA SWIMMING CLUB",
            city: "KOTA MALANG",
            official: "YUNI SRI WULANDARI",
            hp: "087864303370"
        },
        registrations: {}
    }
};

// Guarantee DB Structure Integrity
if (!db.attendance) db.attendance = {};
if (!db.performance) db.performance = {};
if (!db.workouts) db.workouts = [];
if (!db.treasury) db.treasury = [];
if (!db.inventory) db.inventory = [];
if (!db.tournaments) db.tournaments = { info: {}, registrations: {} };

let currentRole = localStorage.getItem('aquaTrackRole') || 'parent';
let currentPage = 'dashboard';
let pbChartInstance = null;

function saveData() {
    localStorage.setItem('aquaTrackDB', JSON.stringify(db));
}

// ==================== INITIALIZATION ====================
window.onload = () => {
    updateAuthUI();
    navigate('dashboard');
};

// ==================== ROLE & AUTH MANAGEMENT ====================
function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const roleDisplay = document.getElementById('current-role-display');

    if (currentRole === 'coach') {
        roleDisplay.innerHTML = '<i class="fa-solid fa-unlock text-green-600 mr-1"></i> Pelatih (Admin)';
        roleDisplay.parentElement.className = 'bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2';
        authSection.innerHTML = `
            <button onclick="backupData()" class="w-full flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                <i class="fa-solid fa-download"></i> Backup Data
            </button>
            <button onclick="triggerRestore()" class="w-full flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                <i class="fa-solid fa-upload"></i> Restore Data
            </button>
            <button onclick="handleLogout()" class="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600 text-sm font-semibold">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>`;
    } else {
        roleDisplay.innerHTML = '<i class="fa-solid fa-lock text-slate-500 mr-1"></i> Wali Atlet';
        roleDisplay.parentElement.className = 'bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2';
        authSection.innerHTML = `
            <button onclick="showLoginModal()" class="w-full flex justify-center items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md text-sm font-semibold">
                <i class="fa-solid fa-lock"></i> Login Pelatih
            </button>`;
    }
}

function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('login-password').focus();
}

function hideLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-password').value = '';
}

function handleLogin(e) {
    e.preventDefault();
    const pw = document.getElementById('login-password').value;
    if (pw === 'admin123') {
        currentRole = 'coach';
        localStorage.setItem('aquaTrackRole', 'coach');
        hideLoginModal();
        updateAuthUI();
        navigate(currentPage);
    } else {
        alert('Password salah! Password default: admin123');
    }
}

function handleLogout() {
    currentRole = 'parent';
    localStorage.setItem('aquaTrackRole', 'parent');
    updateAuthUI();
    navigate(currentPage);
}

// ==================== BACKUP & RESTORE DATA ====================
function backupData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `AquaTrack_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function triggerRestore() {
    document.getElementById('restore-file-input').click();
}

function processRestore(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const restoredDB = JSON.parse(e.target.result);
            if (restoredDB.members) {
                db = restoredDB;
                saveData();
                alert('Data berhasil dipulihkan!');
                location.reload();
            } else {
                alert('Format file JSON tidak sesuai.');
            }
        } catch (err) {
            alert('Gagal membaca file JSON.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ==================== ROUTER NAVIGASI ====================
function navigate(page) {
    currentPage = page;
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[onclick="navigate('${page}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const contentArea = document.getElementById('content-area');
    contentArea.className = 'p-8 fade-in';

    switch(page) {
        case 'dashboard': renderDashboard(); break;
        case 'members': renderMembers(); break;
        case 'attendance': renderAttendance(); break;
        case 'performance': renderPerformance(); break;
        case 'workout': renderWorkout(); break;
        case 'billing': renderBilling(); break;
        case 'inventory': renderInventory(); break;
        case 'tournament': renderTournament(); break;
    }
}

// ==================== 1. DASHBOARD ====================
function renderDashboard() {
    document.getElementById('page-title').innerText = "Dashboard Utama";
    const totalMembers = db.members.length;
    const isCoach = currentRole === 'coach';

    // Cek Ulang Tahun Atlet Bulan/Hari Ini
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const birthdayAthletes = db.members.filter(m => {
        if (!m.birthDate) return false;
        const parts = m.birthDate.split('-');
        return parts[1] === currentMonth;
    });

    let html = `
        <!-- Ringkasan Statistik -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-primary">
                <div>
                    <h3 class="text-slate-500 text-sm font-semibold">Total Atlet</h3>
                    <p class="text-3xl font-bold text-slate-800 mt-1">${totalMembers}</p>
                </div>
                <div class="bg-blue-100 p-3 rounded-lg text-blue-600"><i class="fa-solid fa-users text-xl"></i></div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-secondary">
                <div>
                    <h3 class="text-slate-500 text-sm font-semibold">Jadwal Lomba Terdekat</h3>
                    <p class="text-lg font-bold text-slate-800 mt-1">Kejurprov (15 Nov)</p>
                </div>
                <div class="bg-teal-100 p-3 rounded-lg text-teal-600"><i class="fa-solid fa-trophy text-xl"></i></div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-yellow-400">
                <div>
                    <h3 class="text-slate-500 text-sm font-semibold">Status Latihan</h3>
                    <p class="text-lg font-bold text-green-600 mt-1">Sesuai Jadwal</p>
                </div>
                <div class="bg-yellow-100 p-3 rounded-lg text-yellow-600"><i class="fa-solid fa-calendar-check text-xl"></i></div>
            </div>
        </div>

        <!-- Ulang Tahun Alert -->
        ${birthdayAthletes.length > 0 ? `
        <div class="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-xl shadow-sm mb-8 flex items-center gap-4">
            <i class="fa-solid fa-cake-candles text-3xl"></i>
            <div>
                <h4 class="font-bold text-sm">Ulang Tahun Bulan Ini! 🎂</h4>
                <p class="text-xs opacity-90">Selamat kepada: ${birthdayAthletes.map(a => `<b>${a.name}</b> (${a.squad})`).join(', ')}</p>
            </div>
        </div>` : ''}

        <!-- Papan Pengumuman -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-slate-800"><i class="fa-solid fa-bullhorn text-yellow-500 mr-2"></i> Papan Pengumuman</h3>
                ${isCoach ? `<button onclick="addAnnouncement()" class="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition">+ Tambah</button>` : ''}
            </div>
            <ul class="space-y-3">
                ${db.announcements.map(a => `
                    <li class="bg-slate-50 p-3 rounded-lg border border-slate-200 flex gap-3 items-center">
                        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">${a.date}</span>
                        <span class="text-slate-700 text-sm">${a.text}</span>
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Segitiga Emas Renang -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 border-t-4 border-t-primary">
            <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <div class="bg-blue-100 text-primary p-2.5 rounded-lg"><i class="fa-solid fa-people-group text-xl"></i></div>
                <div>
                    <h3 class="text-lg font-bold text-slate-800">Segitiga Emas Olahraga: Sinergi Atlet, Pelatih & Wali Atlet</h3>
                    <p class="text-xs text-slate-500">Kunci sukses perkembangan prestasi anak tidak lepas dari hubungan harmonis tiga pilar ini.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div class="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                    <h4 class="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-person-swimming text-primary"></i> 1. Atlet (Pusat)
                    </h4>
                    <p class="text-slate-600 text-xs leading-relaxed">Fokus pada kedisiplinan, semangat belajar, dan membangun mental pantang menyerah saat latihan maupun bertanding.</p>
                </div>
                <div class="bg-teal-50/60 p-4 rounded-xl border border-teal-100">
                    <h4 class="font-bold text-teal-800 mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-user-tie text-secondary"></i> 2. Pelatih (Teknis)
                    </h4>
                    <p class="text-slate-600 text-xs leading-relaxed">Menyusun program terstruktur, mengevaluasi rekor PB, serta memberikan bimbingan fisik dan mental secara profesional.</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <i class="fa-solid fa-heart-pulse text-red-500"></i> 3. Wali Atlet (Support)
                    </h4>
                    <p class="text-slate-600 text-xs leading-relaxed">Memberikan dukungan moral tanpa tekanan, memastikan nutrisi & istirahat, serta mempercayakan proses teknis kepada pelatih.</p>
                </div>
            </div>
        </div>

        <!-- Konsep LTAD -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-t-4 border-t-secondary">
            <div class="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <div class="bg-teal-100 text-secondary p-2.5 rounded-lg"><i class="fa-solid fa-chart-line text-xl"></i></div>
                <div>
                    <h3 class="text-lg font-bold text-slate-800">Panduan Pembinaan LTAD (Long-Term Athlete Development)</h3>
                    <p class="text-xs text-slate-500">Pendekatan pembinaan atlet berjenjang berbasis usia biologis dan tumbuh kembang anak.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div class="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span class="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">Tahap 1</span>
                    <h5 class="font-bold text-slate-800 mt-2 mb-1">FUNdamentals</h5>
                    <p class="text-slate-500 text-[11px]">Mengembangkan koordinasi gerak dasar di air melalui permainan yang menyenangkan.</p>
                </div>
                <div class="p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                    <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold text-[10px]">Tahap 2 (Pemula)</span>
                    <h5 class="font-bold text-blue-900 mt-2 mb-1">Learning to Train</h5>
                    <p class="text-slate-500 text-[11px]">Penguasaan 4 gaya renang dengan teknik yang benar dan efisien.</p>
                </div>
                <div class="p-3 rounded-lg border border-teal-100 bg-teal-50/50">
                    <span class="bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-bold text-[10px]">Tahap 3 (Reguler)</span>
                    <h5 class="font-bold text-teal-900 mt-2 mb-1">Training to Train</h5>
                    <p class="text-slate-500 text-[11px]">Peningkatan kapasitas fisik, daya tahan, dan pengenalan strategi perlombaan.</p>
                </div>
                <div class="p-3 rounded-lg border border-indigo-100 bg-indigo-50/50">
                    <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]">Tahap 4 (Prestasi)</span>
                    <h5 class="font-bold text-indigo-900 mt-2 mb-1">Training to Compete</h5>
                    <p class="text-slate-500 text-[11px]">Spesialisasi jarak & gaya renang utama, serta pemantapan mental bertanding.</p>
                </div>
                <div class="p-3 rounded-lg border border-yellow-200 bg-yellow-50/50">
                    <span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold text-[10px]">Tahap 5</span>
                    <h5 class="font-bold text-yellow-900 mt-2 mb-1">Training to Win</h5>
                    <p class="text-slate-500 text-[11px]">Mencapai performa puncak (peak performance) pada kejuaraan resmi.</p>
                </div>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function addAnnouncement() {
    const text = prompt("Masukkan pengumuman baru:");
    if(text) {
        const date = new Date().toISOString().split('T')[0];
        db.announcements.unshift({ date, text });
        saveData();
        renderDashboard();
    }
}

// ==================== 2. ANGGOTA & SQUAD ====================
function renderMembers() {
    document.getElementById('page-title').innerText = "Manajemen Anggota & Squad";
    const isCoach = currentRole === 'coach';

    let html = '';
    
    if (isCoach) {
        html += `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <h3 class="text-md font-bold mb-4 text-slate-800">Tambah Anggota Baru</h3>
            <form onsubmit="addMember(event)" class="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input type="text" id="m-name" placeholder="Nama Atlet" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                <select id="m-squad" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                    <option value="">Pilih Squad...</option>
                    <option value="Pemula">Pemula</option>
                    <option value="Reguler">Reguler</option>
                    <option value="Prestasi">Prestasi</option>
                </select>
                <select id="m-gender" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                    <option value="PA">PA (Putra)</option>
                    <option value="PI">PI (Putri)</option>
                </select>
                <input type="date" id="m-birth" title="Tanggal Lahir" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                <input type="text" id="m-wa" placeholder="No WA Wali (0812...)" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                <button type="submit" class="bg-primary text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition text-sm">Simpan</button>
            </form>
        </div>`;
    }

    html += `
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
                <input type="text" id="search-member" onkeyup="filterMembersTable()" placeholder="Cari nama atlet..." class="bg-transparent border-none outline-none text-sm w-full text-slate-700">
            </div>

            <div id="members-table-container">
                ${generateMembersTable('')}
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function filterMembersTable() {
    const keyword = document.getElementById('search-member').value.toLowerCase();
    document.getElementById('members-table-container').innerHTML = generateMembersTable(keyword);
}

function generateMembersTable(keyword = '') {
    const isCoach = currentRole === 'coach';
    const filteredMembers = db.members.filter(m => m.name.toLowerCase().includes(keyword));

    if (filteredMembers.length === 0) {
        return `<p class="p-6 text-slate-400 text-center text-sm">Tidak ada atlet yang ditemukan.</p>`;
    }

    return `
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th class="p-4">Nama Atlet</th>
                    <th class="p-4">PA/PI</th>
                    <th class="p-4">Squad</th>
                    <th class="p-4">Tgl Lahir</th>
                    <th class="p-4">No. WA Wali</th>
                    <th class="p-4">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
                ${filteredMembers.map((m) => {
                    const originalIndex = db.members.findIndex(item => item.id === m.id);
                    return `
                    <tr class="hover:bg-slate-50">
                        <td class="p-4 font-medium text-slate-800">${m.name}</td>
                        <td class="p-4"><span class="px-2 py-0.5 rounded text-xs font-bold ${m.gender === 'PI' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}">${m.gender || 'PA'}</span></td>
                        <td class="p-4"><span class="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">${m.squad}</span></td>
                        <td class="p-4 text-slate-600 text-xs">${m.birthDate || '-'}</td>
                        <td class="p-4 text-slate-600"><i class="fa-brands fa-whatsapp text-green-500 mr-1"></i> ${m.wa}</td>
                        <td class="p-4 flex gap-2">
                            <button onclick="printAthleteReport('${m.id}')" class="bg-teal-600 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-teal-700 flex items-center gap-1">
                                <i class="fa-solid fa-print"></i> Raport
                            </button>
                            ${isCoach ? `
                            <button onclick="deleteMember(${originalIndex})" class="text-red-500 hover:text-red-700 text-sm"><i class="fa-solid fa-trash"></i></button>
                            ` : ''}
                        </td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function addMember(e) {
    e.preventDefault();
    const name = document.getElementById('m-name').value;
    const squad = document.getElementById('m-squad').value;
    const gender = document.getElementById('m-gender').value;
    const birthDate = document.getElementById('m-birth').value;
    let wa = document.getElementById('m-wa').value;
    if(wa.startsWith('0')) wa = '62' + wa.substring(1);

    db.members.push({ id: Date.now().toString(), name, squad, gender, birthDate, wa });
    saveData();
    renderMembers();
}

function deleteMember(index) {
    if(confirm("Hapus atlet ini?")) {
        db.members.splice(index, 1);
        saveData();
        renderMembers();
    }
}

// ==================== RAPORT ATLET PRINT ====================
function printAthleteReport(memberId) {
    const member = db.members.find(m => m.id === memberId);
    if (!member) return;

    const records = db.performance[memberId] || [];
    const today = new Date().toISOString().split('T')[0];

    // Hitung kehadiran
    let totalSesi = 0;
    let hadir = 0;
    Object.keys(db.attendance).forEach(dateStr => {
        if (db.attendance[dateStr][memberId]) {
            totalSesi++;
            if (db.attendance[dateStr][memberId] === 'Hadir') hadir++;
        }
    });
    const attendancePct = totalSesi > 0 ? Math.round((hadir / totalSesi) * 100) : 100;

    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Raport Atlet - ${member.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-8 bg-white text-slate-800 font-sans">
            <div class="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold text-slate-900">MARABUNTA SWIMMING CLUB</h1>
                    <p class="text-sm text-slate-600">Laporan Perkembangan & Evaluasi Atlet Renang</p>
                </div>
                <div class="text-right text-xs text-slate-500">Tanggal Cetak: ${today}</div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div><b>Nama Atlet:</b> ${member.name}</div>
                <div><b>Kelas / Squad:</b> ${member.squad}</div>
                <div><b>Gender:</b> ${member.gender === 'PI' ? 'Putri' : 'Putra'}</div>
                <div><b>Kehadiran Latihan:</b> ${attendancePct}% (${hadir}/${totalSesi} Sesi)</div>
            </div>

            <h3 class="font-bold text-md mb-2 border-b pb-1">Catatan Rekor Personal Best (PB):</h3>
            <table class="w-full text-left border-collapse text-sm mb-6">
                <thead>
                    <tr class="bg-slate-100 text-xs uppercase border-b">
                        <th class="p-2 border">Gaya Renang</th>
                        <th class="p-2 border">Jarak</th>
                        <th class="p-2 border">Waktu Tercepat</th>
                        <th class="p-2 border">Tanggal Catat</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.length === 0 ? '<tr><td colspan="4" class="p-2 text-center text-slate-400">Belum ada rekor waktu.</td></tr>' : 
                    records.map(r => `
                        <tr>
                            <td class="p-2 border">${r.gaya}</td>
                            <td class="p-2 border">${r.jarak}</td>
                            <td class="p-2 border font-bold text-blue-600">${r.waktu}</td>
                            <td class="p-2 border text-xs text-slate-500">${r.tanggal}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="border border-slate-200 p-4 rounded-lg mb-8">
                <h4 class="font-bold text-xs uppercase text-slate-500 mb-2">Evaluasi & Catatan Pelatih:</h4>
                <p class="text-sm italic text-slate-600">"Tetap tingkatkan konsistensi kehadiran dan perhatikan ketahanan stamina di 15 meter terakhir."</p>
            </div>

            <div class="flex justify-between items-end text-center text-sm mt-12">
                <div><p>Orang Tua / Wali Atlet</p><br><br><br><p class="font-bold">( .................................... )</p></div>
                <div><p>Head Coach / Pelatih</p><br><br><br><p class="font-bold">( Yuni Sri Wulandari )</p></div>
            </div>

            <script>window.print();</script>
        </body>
        </html>
    `);
    reportWindow.document.close();
}

// ==================== 3. ABSENSI LATIHAN ====================
function renderAttendance() {
    document.getElementById('page-title').innerText = "Absensi Latihan";
    const today = new Date().toISOString().split('T')[0];

    let html = `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 class="text-md font-bold text-slate-800">Filter Absensi Latihan</h3>
                <p class="text-xs text-slate-500">Pilih tanggal dan kelas untuk mencatat atau melihat kehadiran</p>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <select id="att-squad-filter" onchange="changeAttDate()" class="border border-slate-200 p-2 rounded-lg font-medium text-slate-700 text-sm outline-none bg-slate-50 focus:bg-white focus:border-primary w-full sm:w-auto">
                    <option value="All">Semua Kelas</option>
                    <option value="Pemula">Kelas Pemula</option>
                    <option value="Reguler">Kelas Reguler</option>
                    <option value="Prestasi">Kelas Prestasi</option>
                </select>

                <input type="date" id="att-date" value="${today}" onchange="changeAttDate()" class="border-2 border-primary p-2 rounded-lg font-bold text-slate-700 text-sm outline-none w-full sm:w-auto">
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
                <input type="text" id="search-att" onkeyup="changeAttDate()" placeholder="Cari nama atlet di absensi..." class="bg-transparent border-none outline-none text-sm w-full text-slate-700">
            </div>

            <div id="att-table-container">
                ${generateAttTable(today, 'All', '')}
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function changeAttDate() {
    const dateStr = document.getElementById('att-date').value;
    const squadFilter = document.getElementById('att-squad-filter').value;
    const searchInput = document.getElementById('search-att');
    const keyword = searchInput ? searchInput.value.toLowerCase() : '';

    document.getElementById('att-table-container').innerHTML = generateAttTable(dateStr, squadFilter, keyword);
}

function generateAttTable(dateStr, squadFilter = 'All', keyword = '') {
    let filteredMembers = db.members;

    if (squadFilter !== 'All') {
        filteredMembers = filteredMembers.filter(m => m.squad === squadFilter);
    }

    if (keyword !== '') {
        filteredMembers = filteredMembers.filter(m => m.name.toLowerCase().includes(keyword));
    }

    if(filteredMembers.length === 0) {
        return `<p class="p-6 text-slate-500 text-center text-sm">Belum ada atlet yang sesuai filter.</p>`;
    }
    
    if(!db.attendance[dateStr]) {
        db.attendance[dateStr] = {};
        db.members.forEach(m => db.attendance[dateStr][m.id] = "-");
        saveData();
    }

    const isCoach = currentRole === 'coach';

    return `
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th class="p-4">Nama Atlet</th>
                    <th class="p-4">Kelas / Squad</th>
                    <th class="p-4">Status Kehadiran</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
                ${filteredMembers.map(m => {
                    const status = db.attendance[dateStr]?.[m.id] || "-";
                    let badge = "bg-slate-100 text-slate-600";
                    if(status === "Hadir") badge = "bg-green-100 text-green-700";
                    if(status === "Sakit") badge = "bg-yellow-100 text-yellow-700";
                    if(status === "Izin") badge = "bg-blue-100 text-blue-700";
                    if(status === "Alpa") badge = "bg-red-100 text-red-700";

                    return `
                    <tr class="hover:bg-slate-50">
                        <td class="p-4 font-medium text-slate-800">${m.name}</td>
                        <td class="p-4"><span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold">${m.squad}</span></td>
                        <td class="p-4">
                            ${isCoach ? `
                                <select onchange="updateAttendance('${dateStr}', '${m.id}', this.value)" class="border border-slate-200 p-1.5 rounded-md text-xs outline-none bg-white font-medium focus:border-primary">
                                    <option value="-" ${status==='-'?'selected':''}>- Belum Diisi -</option>
                                    <option value="Hadir" ${status==='Hadir'?'selected':''}>Hadir</option>
                                    <option value="Sakit" ${status==='Sakit'?'selected':''}>Sakit</option>
                                    <option value="Izin" ${status==='Izin'?'selected':''}>Izin</option>
                                    <option value="Alpa" ${status==='Alpa'?'selected':''}>Alpa</option>
                                </select>
                            ` : `
                                <span class="px-3 py-1 rounded-full text-xs font-bold ${badge}">${status}</span>
                            `}
                        </td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

function updateAttendance(dateStr, memberId, status) {
    if (!db.attendance[dateStr]) db.attendance[dateStr] = {};
    db.attendance[dateStr][memberId] = status;
    saveData();
}

// ==================== 4. REKOR WAKTU & GRAFIK (PB) ====================
function renderPerformance() {
    document.getElementById('page-title').innerText = "Rekor Waktu (Personal Best)";
    
    let html = `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="w-full md:w-1/3">
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Pilih Kelas / Squad</label>
                <select id="pb-squad-filter" onchange="filterPerformancePage()" class="w-full border border-slate-200 p-2 rounded-lg outline-none text-sm font-medium bg-slate-50 focus:bg-white focus:border-primary">
                    <option value="All">Semua Kelas</option>
                    <option value="Pemula">Kelas Pemula</option>
                    <option value="Reguler">Kelas Reguler</option>
                    <option value="Prestasi">Kelas Prestasi</option>
                </select>
            </div>

            <div class="w-full md:w-2/3">
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Cari Atlet</label>
                <div class="relative">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-sm"></i>
                    <input type="text" id="pb-search-athlete" onkeyup="filterPerformancePage()" placeholder="Ketik nama atlet untuk mencari..." class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:border-primary">
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6" id="pb-athletes-table-container">
            ${generatePBAthletesTable('All', '')}
        </div>

        <div id="pb-detail-area"></div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function filterPerformancePage() {
    const squadFilter = document.getElementById('pb-squad-filter').value;
    const searchKeyword = document.getElementById('pb-search-athlete').value.toLowerCase();
    
    document.getElementById('pb-athletes-table-container').innerHTML = generatePBAthletesTable(squadFilter, searchKeyword);
    document.getElementById('pb-detail-area').innerHTML = '';
}

function generatePBAthletesTable(squadFilter = 'All', keyword = '') {
    let filteredMembers = db.members;

    if (squadFilter !== 'All') {
        filteredMembers = filteredMembers.filter(m => m.squad === squadFilter);
    }

    if (keyword !== '') {
        filteredMembers = filteredMembers.filter(m => m.name.toLowerCase().includes(keyword));
    }

    if (filteredMembers.length === 0) {
        return `<p class="p-6 text-slate-400 text-center text-sm">Tidak ada atlet yang ditemukan.</p>`;
    }

    return `
        <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 class="text-sm font-bold text-slate-800">
                Daftar Atlet ${squadFilter !== 'All' ? `- ${squadFilter}` : ''}
            </h3>
            <span class="text-xs font-semibold text-slate-500">Total: ${filteredMembers.length} Atlet</span>
        </div>
        <table class="w-full text-left border-collapse text-sm">
            <thead>
                <tr class="bg-white text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th class="p-4">Nama Atlet</th>
                    <th class="p-4">PA/PI</th>
                    <th class="p-4">Kelas</th>
                    <th class="p-4">Jumlah PB Recorded</th>
                    <th class="p-4">Best 50m Bebas</th>
                    <th class="p-4">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                ${filteredMembers.map(m => {
                    const records = db.performance[m.id] || [];
                    const bebas50 = records.find(r => r.gaya === 'Gaya Bebas' && r.jarak === '50m');
                    const best50Text = bebas50 ? bebas50.waktu : '-';

                    return `
                    <tr class="hover:bg-slate-50 transition">
                        <td class="p-4 font-medium text-slate-800">${m.name}</td>
                        <td class="p-4"><span class="px-2 py-0.5 rounded text-xs font-bold ${m.gender === 'PI' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}">${m.gender || 'PA'}</span></td>
                        <td class="p-4"><span class="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">${m.squad}</span></td>
                        <td class="p-4"><span class="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-xs">${records.length} Nomor</span></td>
                        <td class="p-4 font-mono font-bold ${bebas50 ? 'text-primary' : 'text-slate-400'}">${best50Text}</td>
                        <td class="p-4">
                            <button onclick="selectPBAthlete('${m.id}')" class="bg-primary hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1">
                                <i class="fa-solid fa-stopwatch"></i> lihat / Catat PB
                            </button>
                        </td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function selectPBAthlete(memberId) {
    const member = db.members.find(m => m.id === memberId);
    if (!member) return;

    const detailArea = document.getElementById('pb-detail-area');
    const isCoach = currentRole === 'coach';
    const records = db.performance[memberId] || [];

    let formHtml = isCoach ? `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 border-t-4 border-t-primary fade-in">
            <h3 class="text-md font-bold mb-4 text-slate-800">
                <i class="fa-solid fa-medal text-yellow-500 mr-2"></i>Input Record Baru (${member.name} - <span class="text-primary">${member.squad}</span>)
            </h3>
            <form onsubmit="addPB(event, '${member.id}')" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select id="pb-gaya" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                    <option value="">Gaya Renang...</option>
                    <option value="Gaya Bebas">Gaya Bebas</option>
                    <option value="Gaya Dada">Gaya Dada</option>
                    <option value="Gaya Punggung">Gaya Punggung</option>
                    <option value="Gaya Kupu-kupu">Gaya Kupu-kupu</option>
                    <option value="Gaya Ganti">Gaya Ganti</option>
                </select>
                <select id="pb-jarak" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                    <option value="">Jarak...</option>
                    <option value="50m">50m</option>
                    <option value="100m">100m</option>
                    <option value="200m">200m</option>
                    <option value="400m">400m</option>
                    <option value="800m">800m</option>
                    <option value="1500m">1500m</option>
                </select>
                <input type="text" id="pb-waktu" placeholder="Waktu (Cth: 00:28.45 / 28.45)" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                <button type="submit" class="bg-primary text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition text-sm shadow-md">Simpan Record</button>
            </form>
        </div>` : '';

    detailArea.innerHTML = formHtml + `
        <!-- Chart Canvas -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 fade-in">
            <h3 class="text-sm font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-line text-primary mr-2"></i>Grafik Perkembangan Rekor Waktu</h3>
            <div class="h-64">
                <canvas id="pbChart"></canvas>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden fade-in">
            <div class="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 class="text-sm font-bold text-slate-800">Detail Personal Best: ${member.name}</h3>
                <span class="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">${member.squad}</span>
            </div>
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-white text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                        <th class="p-4">Gaya Renang</th>
                        <th class="p-4">Jarak</th>
                        <th class="p-4">Waktu Tercepat (PB)</th>
                        <th class="p-4">Tanggal Catat</th>
                        ${isCoach ? `<th class="p-4">Aksi</th>` : ''}
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                    ${records.length === 0 ? `<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum ada catatan rekor waktu.</td></tr>` : 
                    records.map((r, idx) => `
                        <tr class="hover:bg-slate-50">
                            <td class="p-4 font-medium text-slate-800">${r.gaya}</td>
                            <td class="p-4 text-slate-600">${r.jarak}</td>
                            <td class="p-4 font-bold font-mono text-primary">${r.waktu}</td>
                            <td class="p-4 text-slate-500 text-xs">${r.tanggal}</td>
                            ${isCoach ? `<td class="p-4"><button onclick="deletePB('${member.id}', ${idx})" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button></td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    renderPBChart(records);
    detailArea.scrollIntoView({ behavior: 'smooth' });
}

function renderPBChart(records) {
    const ctx = document.getElementById('pbChart').getContext('2d');
    if (pbChartInstance) pbChartInstance.destroy();

    const labels = records.map(r => `${r.gaya} (${r.jarak})`);
    const dataSeconds = records.map(r => parseTimeToSeconds(r.waktu));

    pbChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Waktu Tercepat (Detik)',
                data: dataSeconds,
                backgroundColor: 'rgba(14, 165, 233, 0.6)',
                borderColor: '#0ea5e9',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Detik' } }
            }
        }
    });
}

function parseTimeToSeconds(timeStr) {
    if (!timeStr) return Infinity;
    const parts = timeStr.trim().split(':');
    if (parts.length === 2) {
        return (parseFloat(parts[0]) || 0) * 60 + (parseFloat(parts[1]) || 0);
    } else if (parts.length === 1) {
        return parseFloat(parts[0]) || Infinity;
    }
    return Infinity;
}

function addPB(e, memberId) {
    e.preventDefault();
    const gaya = document.getElementById('pb-gaya').value;
    const jarak = document.getElementById('pb-jarak').value;
    const waktuInput = document.getElementById('pb-waktu').value.trim();
    const tanggal = new Date().toISOString().split('T')[0];

    if (!db.performance[memberId]) db.performance[memberId] = [];

    const newTimeInSeconds = parseTimeToSeconds(waktuInput);

    if (isNaN(newTimeInSeconds) || newTimeInSeconds === Infinity) {
        alert("Format waktu tidak valid! Gunakan format Cth: 00:28.45 atau 28.45");
        return;
    }

    const existingIndex = db.performance[memberId].findIndex(
        r => r.gaya === gaya && r.jarak === jarak
    );

    if (existingIndex !== -1) {
        const existingRecord = db.performance[memberId][existingIndex];
        const oldTimeInSeconds = parseTimeToSeconds(existingRecord.waktu);

        if (newTimeInSeconds < oldTimeInSeconds) {
            db.performance[memberId][existingIndex] = { gaya, jarak, waktu: waktuInput, tanggal };
            saveData();
            alert(`🎉 SELAMAT! Rekor baru terpecahkan!\n\nWaktu Lama: ${existingRecord.waktu}\nWaktu Baru: ${waktuInput}`);
        } else {
            alert(`ℹ️ Waktu (${waktuInput}) belum melewati rekor terbaik atlet saat ini (${existingRecord.waktu}). Data tidak diperbarui.`);
            return;
        }
    } else {
        db.performance[memberId].push({ gaya, jarak, waktu: waktuInput, tanggal });
        saveData();
        alert(`✅ Rekor awal untuk ${gaya} ${jarak} berhasil disimpan (${waktuInput}).`);
    }

    const squadFilter = document.getElementById('pb-squad-filter').value;
    const searchKeyword = document.getElementById('pb-search-athlete').value.toLowerCase();
    document.getElementById('pb-athletes-table-container').innerHTML = generatePBAthletesTable(squadFilter, searchKeyword);
    selectPBAthlete(memberId);
}

function deletePB(memberId, index) {
    if(confirm("Hapus rekor waktu ini?")) {
        db.performance[memberId].splice(index, 1);
        saveData();
        
        const squadFilter = document.getElementById('pb-squad-filter').value;
        const searchKeyword = document.getElementById('pb-search-athlete').value.toLowerCase();
        document.getElementById('pb-athletes-table-container').innerHTML = generatePBAthletesTable(squadFilter, searchKeyword);
        selectPBAthlete(memberId);
    }
}

// ==================== 5. MENU LATIHAN (WORKOUT PLANNER) ====================
function renderWorkout() {
    document.getElementById('page-title').innerText = "Menu Latihan Harian";
    const isCoach = currentRole === 'coach';

    let html = `
        ${isCoach ? `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <h3 class="text-md font-bold text-slate-800 mb-4">Buat Menu Latihan Baru</h3>
            <form onsubmit="addWorkout(event)" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="date" id="w-date" value="${new Date().toISOString().split('T')[0]}" class="border p-2 rounded-lg text-sm" required>
                    <select id="w-squad" class="border p-2 rounded-lg text-sm" required>
                        <option value="Semua Squad">Semua Squad</option>
                        <option value="Pemula">Kelas Pemula</option>
                        <option value="Reguler">Kelas Reguler</option>
                        <option value="Prestasi">Kelas Prestasi</option>
                    </select>
                    <input type="text" id="w-title" placeholder="Judul Menu (Cth: Speed & Endurance)" class="border p-2 rounded-lg text-sm" required>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <textarea id="w-warm" placeholder="Warm-up (Cth: 400m Bebas Easy)" class="border p-2 rounded-lg text-sm h-20" required></textarea>
                    <textarea id="w-main" placeholder="Main Set (Cth: 8x50m Best Average Rest 20s)" class="border p-2 rounded-lg text-sm h-20" required></textarea>
                    <textarea id="w-cool" placeholder="Cool-down (Cth: 200m Choice)" class="border p-2 rounded-lg text-sm h-20" required></textarea>
                </div>
                <button type="submit" class="bg-primary text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">Simpan Menu Latihan</button>
            </form>
        </div>` : ''}

        <div class="space-y-4">
            ${db.workouts.length === 0 ? `<div class="bg-white p-8 rounded-xl text-center text-slate-400">Belum ada menu latihan yang dicatat.</div>` : 
            db.workouts.map((w, idx) => `
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-primary">
                    <div class="flex justify-between items-center mb-3">
                        <div>
                            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold mr-2">${w.date}</span>
                            <span class="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">${w.squad}</span>
                            <h4 class="text-base font-bold text-slate-800 mt-1">${w.title}</h4>
                        </div>
                        ${isCoach ? `<button onclick="deleteWorkout(${idx})" class="text-red-500 hover:text-red-700 text-sm"><i class="fa-solid fa-trash"></i></button>` : ''}
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div><b class="text-blue-600">Warm-up:</b><p class="whitespace-pre-line text-slate-600 mt-1">${w.warm}</p></div>
                        <div><b class="text-teal-600">Main Set:</b><p class="whitespace-pre-line text-slate-600 mt-1">${w.main}</p></div>
                        <div><b class="text-indigo-600">Cool-down:</b><p class="whitespace-pre-line text-slate-600 mt-1">${w.cool}</p></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function addWorkout(e) {
    e.preventDefault();
    const date = document.getElementById('w-date').value;
    const squad = document.getElementById('w-squad').value;
    const title = document.getElementById('w-title').value;
    const warm = document.getElementById('w-warm').value;
    const main = document.getElementById('w-main').value;
    const cool = document.getElementById('w-cool').value;

    db.workouts.unshift({ date, squad, title, warm, main, cool });
    saveData();
    renderWorkout();
}

function deleteWorkout(idx) {
    if (confirm("Hapus menu latihan ini?")) {
        db.workouts.splice(idx, 1);
        saveData();
        renderWorkout();
    }
}

// ==================== 6. SPP & KEUANGAN ====================
function renderBilling() {
    document.getElementById('page-title').innerText = "Status SPP & Keuangan";
    
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    if(!db.spp[currentMonth]) {
        db.spp[currentMonth] = {};
        db.members.forEach(m => db.spp[currentMonth][m.id] = "Menunggak");
        saveData();
    }

    const isCoach = currentRole === 'coach';

    let html = `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 class="text-md font-bold text-slate-800">Filter Laporan SPP</h3>
                <p class="text-xs text-slate-500">Pilih bulan dan kelas untuk memantau status iuran</p>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <select id="spp-squad-filter" onchange="changeBillingMonth()" class="border border-slate-200 p-2 rounded-lg font-medium text-slate-700 text-sm outline-none bg-slate-50 focus:bg-white focus:border-primary w-full sm:w-auto">
                    <option value="All">Semua Kelas</option>
                    <option value="Pemula">Kelas Pemula</option>
                    <option value="Reguler">Kelas Reguler</option>
                    <option value="Prestasi">Kelas Prestasi</option>
                </select>

                <input type="month" id="spp-month" value="${currentMonth}" onchange="changeBillingMonth()" class="border-2 border-primary p-2 rounded-lg font-bold text-slate-700 text-sm outline-none w-full sm:w-auto">
                
                ${isCoach ? `<button onclick="exportBillingToCSV()" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg text-sm shadow-sm transition w-full sm:w-auto flex items-center justify-center gap-1"><i class="fa-solid fa-file-excel"></i> Export Excel</button>` : ''}
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
                <input type="text" id="search-spp" onkeyup="changeBillingMonth()" placeholder="Cari nama atlet di tagihan SPP..." class="bg-transparent border-none outline-none text-sm w-full text-slate-700">
            </div>

            <div id="billing-table-container">
                ${generateBillingTable(currentMonth, 'All', '')}
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function changeBillingMonth() {
    const monthStr = document.getElementById('spp-month').value;
    const squadFilter = document.getElementById('spp-squad-filter').value;
    const searchInput = document.getElementById('search-spp');
    const keyword = searchInput ? searchInput.value.toLowerCase() : '';

    document.getElementById('billing-table-container').innerHTML = generateBillingTable(monthStr, squadFilter, keyword);
}

function generateBillingTable(monthStr, squadFilter = 'All', keyword = '') {
    let filteredMembers = db.members;

    if (squadFilter !== 'All') {
        filteredMembers = filteredMembers.filter(m => m.squad === squadFilter);
    }

    if (keyword !== '') {
        filteredMembers = filteredMembers.filter(m => m.name.toLowerCase().includes(keyword));
    }

    if(filteredMembers.length === 0) {
        return `<p class="p-6 text-slate-500 text-center text-sm">Belum ada atlet yang sesuai filter.</p>`;
    }

    const isCoach = currentRole === 'coach';

    return `
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th class="p-4">Nama Atlet</th>
                    <th class="p-4">Kelas / Squad</th>
                    <th class="p-4">Status SPP</th>
                    ${isCoach ? `<th class="p-4">Aksi / Reminder</th>` : ''}
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
                ${filteredMembers.map(m => {
                    const status = db.spp[monthStr]?.[m.id] || "Menunggak";
                    const isLunas = status === "Lunas";
                    const badge = isLunas ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
                    const waText = encodeURIComponent(`Halo Bapak/Ibu Wali dari atlet ${m.name},\nTagihan SPP bulan *${monthStr}* masih *Menunggak*. Mohon untuk segera diselesaikan.`);

                    return `
                    <tr class="hover:bg-slate-50">
                        <td class="p-4 font-medium text-slate-800">${m.name}</td>
                        <td class="p-4 text-slate-500">${m.squad}</td>
                        <td class="p-4"><span class="px-3 py-1 rounded-full text-xs font-bold ${badge}">${status}</span></td>
                        ${isCoach ? `
                        <td class="p-4 flex items-center gap-2">
                            <button onclick="toggleSPP('${monthStr}', '${m.id}')" class="bg-slate-800 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-slate-700 transition">Ubah Status</button>
                            ${!isLunas ? `<a href="https://wa.me/${m.wa}?text=${waText}" target="_blank" class="bg-green-500 text-white px-2.5 py-1 rounded text-xs font-medium hover:bg-green-600 flex items-center gap-1 transition"><i class="fa-brands fa-whatsapp"></i> WA</a>` : ''}
                        </td>` : ''}
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

function toggleSPP(monthStr, memberId) {
    if(!db.spp[monthStr]) db.spp[monthStr] = {};
    const curr = db.spp[monthStr][memberId] || "Menunggak";
    db.spp[monthStr][memberId] = curr === "Lunas" ? "Menunggak" : "Lunas";
    saveData();
    changeBillingMonth();
}

function exportBillingToCSV() {
    const monthStr = document.getElementById('spp-month').value;
    const squadFilter = document.getElementById('spp-squad-filter').value;
    const searchInput = document.getElementById('search-spp');
    const keyword = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filteredMembers = db.members;
    if (squadFilter !== 'All') {
        filteredMembers = filteredMembers.filter(m => m.squad === squadFilter);
    }
    if (keyword !== '') {
        filteredMembers = filteredMembers.filter(m => m.name.toLowerCase().includes(keyword));
    }

    let csv = "Nama,Squad,WA,Status SPP\n";
    filteredMembers.forEach(m => {
        const st = db.spp[monthStr]?.[m.id] || "Menunggak";
        csv += `"${m.name}","${m.squad}","${m.wa}","${st}"\n`;
    });
    
    downloadCSV(csv, `SPP_${squadFilter}_${monthStr}.csv`);
}

// ==================== 7. KAS & INVENTARIS ====================
function renderInventory() {
    document.getElementById('page-title').innerText = "Kas & Inventaris Klub";
    const isCoach = currentRole === 'coach';

    // Hitung Total Saldo Kas
    const totalSaldo = db.treasury.reduce((acc, t) => t.type === 'masuk' ? acc + t.amount : acc - t.amount, 0);

    let html = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
                <h3 class="text-slate-500 text-sm font-semibold">Total Saldo Kas Klub</h3>
                <p class="text-2xl font-bold text-green-600 mt-1">Rp ${totalSaldo.toLocaleString('id-ID')}</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-primary">
                <h3 class="text-slate-500 text-sm font-semibold">Total Barang Inventaris</h3>
                <p class="text-2xl font-bold text-slate-800 mt-1">${db.inventory.length} Jenis Barang</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- TABEL KAS KLUB -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 class="text-md font-bold text-slate-800 mb-4">Pencatatan Kas Klub</h3>
                ${isCoach ? `
                <form onsubmit="addTreasury(event)" class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                    <input type="text" id="t-desc" placeholder="Keterangan" class="border p-2 rounded text-xs" required>
                    <input type="number" id="t-amount" placeholder="Jumlah (Rp)" class="border p-2 rounded text-xs" required>
                    <select id="t-type" class="border p-2 rounded text-xs">
                        <option value="masuk">Pemasukan (+)</option>
                        <option value="keluar">Pengeluaran (-)</option>
                    </select>
                    <button type="submit" class="bg-primary text-white text-xs font-bold py-2 rounded col-span-3">Tambah Kas</button>
                </form>` : ''}
                
                <div class="max-h-60 overflow-y-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 border-b">
                            <tr><th class="p-2">Tgl</th><th class="p-2">Ket</th><th class="p-2">Nominal</th></tr>
                        </thead>
                        <tbody class="divide-y">
                            ${db.treasury.map(t => `
                                <tr>
                                    <td class="p-2 text-slate-400">${t.date}</td>
                                    <td class="p-2 font-medium">${t.desc}</td>
                                    <td class="p-2 font-bold ${t.type === 'masuk' ? 'text-green-600' : 'text-red-500'}">
                                        ${t.type === 'masuk' ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TABEL INVENTARIS -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 class="text-md font-bold text-slate-800 mb-4">Inventaris Peralatan</h3>
                ${isCoach ? `
                <form onsubmit="addInventory(event)" class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                    <input type="text" id="i-name" placeholder="Nama Barang" class="border p-2 rounded text-xs" required>
                    <input type="number" id="i-qty" placeholder="Jumlah" class="border p-2 rounded text-xs" required>
                    <input type="text" id="i-cond" placeholder="Kondisi (Baik/Rusak)" class="border p-2 rounded text-xs" required>
                    <button type="submit" class="bg-secondary text-white text-xs font-bold py-2 rounded col-span-3">Tambah Barang</button>
                </form>` : ''}

                <div class="max-h-60 overflow-y-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 border-b">
                            <tr><th class="p-2">Barang</th><th class="p-2">Jumlah</th><th class="p-2">Kondisi</th></tr>
                        </thead>
                        <tbody class="divide-y">
                            ${db.inventory.map(i => `
                                <tr>
                                    <td class="p-2 font-medium">${i.name}</td>
                                    <td class="p-2 font-bold">${i.qty} Pcs</td>
                                    <td class="p-2"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">${i.condition}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function addTreasury(e) {
    e.preventDefault();
    const desc = document.getElementById('t-desc').value;
    const amount = parseInt(document.getElementById('t-amount').value);
    const type = document.getElementById('t-type').value;
    const date = new Date().toISOString().split('T')[0];

    db.treasury.unshift({ id: Date.now().toString(), date, desc, amount, type });
    saveData();
    renderInventory();
}

function addInventory(e) {
    e.preventDefault();
    const name = document.getElementById('i-name').value;
    const qty = parseInt(document.getElementById('i-qty').value);
    const condition = document.getElementById('i-cond').value;

    db.inventory.unshift({ id: Date.now().toString(), name, qty, condition });
    saveData();
    renderInventory();
}

// ==================== 8. PENDAFTARAN LOMBA KEJURPROV ====================
const EVENT_LIST = [
    { category: "GAYA BEBAS", events: [
        { id: "beb_50", name: "50 M" }, { id: "beb_100", name: "100 M" }, { id: "beb_200", name: "200 M" },
        { id: "beb_400", name: "400 M" }, { id: "beb_800", name: "800 M" }, { id: "beb_1500", name: "1500 M" }
    ]},
    { category: "GAYA KUPU-KUPU", events: [
        { id: "kup_50", name: "50 M" }, { id: "kup_100", name: "100 M" }, { id: "kup_200", name: "200 M" }
    ]},
    { category: "GAYA PUNGGUNG", events: [
        { id: "pung_50", name: "50 M" }, { id: "pung_100", name: "100 M" }, { id: "pung_200", name: "200 M" }
    ]},
    { category: "GAYA DADA", events: [
        { id: "dad_50", name: "50 M" }, { id: "dad_100", name: "100 M" }, { id: "dad_200", name: "200 M" }
    ]},
    { category: "GAYA GANTI", events: [
        { id: "gan_200", name: "200 M" }, { id: "gan_400", name: "400 M" }
    ]},
    { category: "ESTAFET", events: [
        { id: "est_beb", name: "EST. 4 X 100 BEBAS" }, { id: "est_gan", name: "EST. 4 X 100 GANTI" },
        { id: "est_mix_beb", name: "G. BEBAS MIX" }, { id: "est_mix_gan", name: "G. GANTI MIX" }
    ]}
];

function renderTournament() {
    document.getElementById('page-title').innerText = "Pendaftaran Lomba Kejurprov";
    const isCoach = currentRole === 'coach';
    const info = db.tournaments.info || {};

    let html = `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <h3 class="text-md font-bold text-slate-800 mb-3"><i class="fa-solid fa-id-card text-primary mr-2"></i>Informasi Perkumpulan & Official</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <label class="block text-xs text-slate-500 font-semibold mb-1">Perkumpulan / Klub</label>
                    <input type="text" id="info-club" value="${info.club || ''}" ${!isCoach ? 'disabled' : ''} class="w-full border p-2 rounded-lg text-sm outline-none focus:border-primary" placeholder="Nama Klub">
                </div>
                <div>
                    <label class="block text-xs text-slate-500 font-semibold mb-1">Kota / Kab.</label>
                    <input type="text" id="info-city" value="${info.city || ''}" ${!isCoach ? 'disabled' : ''} class="w-full border p-2 rounded-lg text-sm outline-none focus:border-primary" placeholder="Kota/Kab">
                </div>
                <div>
                    <label class="block text-xs text-slate-500 font-semibold mb-1">Pelatih / Official</label>
                    <input type="text" id="info-official" value="${info.official || ''}" ${!isCoach ? 'disabled' : ''} class="w-full border p-2 rounded-lg text-sm outline-none focus:border-primary" placeholder="Nama Official">
                </div>
                <div>
                    <label class="block text-xs text-slate-500 font-semibold mb-1">Nomor HP</label>
                    <input type="text" id="info-hp" value="${info.hp || ''}" ${!isCoach ? 'disabled' : ''} class="w-full border p-2 rounded-lg text-sm outline-none focus:border-primary" placeholder="08xx...">
                </div>
            </div>
            ${isCoach ? `<button onclick="saveOfficialInfo()" class="mt-4 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition">Simpan Info Official</button>` : ''}
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 class="text-md font-bold text-slate-800">Filter Pendaftaran Lomba</h3>
                <p class="text-xs text-slate-500">Pilih kelas untuk mempermudah pendaftaran acara lomba per kelas</p>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <select id="tour-squad-filter" onchange="filterTournamentTable()" class="border border-slate-200 p-2 rounded-lg font-medium text-slate-700 text-sm outline-none bg-slate-50 focus:bg-white focus:border-primary w-full sm:w-auto">
                    <option value="All">Semua Kelas</option>
                    <option value="Pemula">Kelas Pemula</option>
                    <option value="Reguler">Kelas Reguler</option>
                    <option value="Prestasi">Kelas Prestasi</option>
                </select>

                ${isCoach ? `
                <div class="flex gap-2 w-full sm:w-auto">
                    <button onclick="exportFormA1()" class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-xs shadow-sm transition flex items-center justify-center gap-1 w-full sm:w-auto">
                        <i class="fa-solid fa-file-excel"></i> Export FORM-A1
                    </button>
                    <button onclick="exportFormA3()" class="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-2 rounded-lg text-xs shadow-sm transition flex items-center justify-center gap-1 w-full sm:w-auto">
                        <i class="fa-solid fa-file-excel"></i> Export FORM-A3
                    </button>
                </div>` : ''}
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto" id="tour-table-container">
            ${generateTournamentTable('All')}
        </div>

        <div id="event-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4 fade-in">
            <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="text-lg font-bold text-slate-800" id="modal-athlete-name">Pilih Acara Lomba</h3>
                    <button onclick="closeRegisterModal()" class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                </div>
                
                <form id="event-form" onsubmit="saveAthleteEvents(event)">
                    <input type="hidden" id="modal-athlete-id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Tempat / Tanggal Lahir</label>
                            <input type="text" id="modal-birth" placeholder="Cth: Malang, 25/03/2010" class="w-full border p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">NISNAS</label>
                            <input type="text" id="modal-nisnas" placeholder="Cth: 20221006258" class="w-full border p-2 rounded-lg text-sm outline-none focus:border-primary" required>
                        </div>
                    </div>

                    <h4 class="font-bold text-sm text-slate-800 mb-3 border-b pb-1">Nomor Acara Lomba (Centang yang Diikuti):</h4>
                    
                    <div class="space-y-4">
                        ${EVENT_LIST.map(cat => `
                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <h5 class="text-xs font-bold text-primary mb-2">${cat.category}</h5>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    ${cat.events.map(ev => `
                                        <label class="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded border hover:bg-blue-50 cursor-pointer">
                                            <input type="checkbox" name="events" value="${ev.id}" class="rounded text-primary focus:ring-0">
                                            <span>${ev.name}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-6 flex justify-end gap-2">
                        <button type="button" onclick="closeRegisterModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold">Batal</button>
                        <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-600">Simpan Acara</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('content-area').innerHTML = html;
}

function filterTournamentTable() {
    const squadFilter = document.getElementById('tour-squad-filter').value;
    document.getElementById('tour-table-container').innerHTML = generateTournamentTable(squadFilter);
}

function generateTournamentTable(squadFilter = 'All') {
    let filteredMembers = db.members;
    if (squadFilter !== 'All') {
        filteredMembers = db.members.filter(m => m.squad === squadFilter);
    }

    if (filteredMembers.length === 0) {
        return `<p class="p-6 text-slate-500 text-center text-sm">Belum ada atlet di kelas ini.</p>`;
    }

    const isCoach = currentRole === 'coach';

    return `
        <table class="w-full text-left border-collapse text-sm">
            <thead>
                <tr class="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-100">
                    <th class="p-4">No</th>
                    <th class="p-4">Nama Atlet</th>
                    <th class="p-4">PA/PI</th>
                    <th class="p-4">KU / Squad</th>
                    <th class="p-4">Tempat / Tgl Lahir</th>
                    <th class="p-4">NISNAS</th>
                    <th class="p-4">Nomor Acara</th>
                    ${isCoach ? `<th class="p-4">Aksi</th>` : ''}
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                ${filteredMembers.map((m, idx) => {
                    const reg = db.tournaments.registrations[m.id] || { birthPlaceDate: '', nisnas: '', events: [] };
                    const eventCount = reg.events ? reg.events.length : 0;
                    return `
                    <tr class="hover:bg-slate-50">
                        <td class="p-4 font-bold text-slate-400">${idx + 1}</td>
                        <td class="p-4 font-medium text-slate-800">${m.name}</td>
                        <td class="p-4"><span class="px-2 py-0.5 rounded text-xs font-bold ${m.gender === 'PI' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}">${m.gender || 'PA'}</span></td>
                        <td class="p-4"><span class="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold">${m.squad}</span></td>
                        <td class="p-4 text-xs text-slate-600">${reg.birthPlaceDate || '-'}</td>
                        <td class="p-4 text-xs text-slate-600 font-mono">${reg.nisnas || '-'}</td>
                        <td class="p-4">
                            <span class="bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full text-xs">${eventCount} Acara</span>
                        </td>
                        ${isCoach ? `
                        <td class="p-4">
                            <button onclick="openRegisterModal('${m.id}')" class="bg-primary hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                                <i class="fa-solid fa-pen-to-square mr-1"></i> Pilih Acara
                            </button>
                        </td>` : ''}
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function saveOfficialInfo() {
    db.tournaments.info = {
        club: document.getElementById('info-club').value,
        city: document.getElementById('info-city').value,
        official: document.getElementById('info-official').value,
        hp: document.getElementById('info-hp').value
    };
    saveData();
    alert('Informasi official perkumpulan berhasil disimpan!');
}

function openRegisterModal(athleteId) {
    const member = db.members.find(m => m.id === athleteId);
    if (!member) return;

    const reg = db.tournaments.registrations[athleteId] || { birthPlaceDate: '', nisnas: '', events: [] };

    document.getElementById('modal-athlete-id').value = athleteId;
    document.getElementById('modal-athlete-name').innerText = `Pendaftaran Acara: ${member.name} (${member.squad})`;
    document.getElementById('modal-birth').value = reg.birthPlaceDate || (member.birthDate ? `Malang, ${member.birthDate}` : '');
    document.getElementById('modal-nisnas').value = reg.nisnas || '';

    const checkboxes = document.querySelectorAll('input[name="events"]');
    checkboxes.forEach(cb => {
        cb.checked = reg.events ? reg.events.includes(cb.value) : false;
    });

    document.getElementById('event-modal').classList.remove('hidden');
}

function closeRegisterModal() {
    document.getElementById('event-modal').classList.add('hidden');
}

function saveAthleteEvents(e) {
    e.preventDefault();
    const athleteId = document.getElementById('modal-athlete-id').value;
    const birthPlaceDate = document.getElementById('modal-birth').value;
    const nisnas = document.getElementById('modal-nisnas').value;

    const selectedEvents = [];
    document.querySelectorAll('input[name="events"]:checked').forEach(cb => {
        selectedEvents.push(cb.value);
    });

    db.tournaments.registrations[athleteId] = {
        birthPlaceDate,
        nisnas,
        events: selectedEvents
    };

    saveData();
    closeRegisterModal();
    renderTournament();
}

function exportFormA1() {
    const info = db.tournaments.info || {};
    const squadFilter = document.getElementById('tour-squad-filter') ? document.getElementById('tour-squad-filter').value : 'All';

    let filteredMembers = db.members;
    if (squadFilter !== 'All') {
        filteredMembers = db.members.filter(m => m.squad === squadFilter);
    }

    let csv = `FORMULIR PENDAFTARAN KEJURPROV\n`;
    csv += `PERKUMPULAN,${info.club || '-'}\n`;
    csv += `KOTA / KAB.,${info.city || '-'}\n`;
    csv += `PELATIH / OFFICIAL,${info.official || '-'}\n`;
    csv += `NOMOR HP,${info.hp || '-'}\n\n`;

    csv += `NO,NAMA,PA/PI,KU,DOMISILI,TEMPAT / TANGGAL LAHIR,NISNAS\n`;

    filteredMembers.forEach((m, idx) => {
        const reg = db.tournaments.registrations[m.id] || {};
        csv += `"${idx + 1}","${m.name}","${m.gender || 'PA'}","${m.squad}","${info.city || '-'}","${reg.birthPlaceDate || '-'}","'${reg.nisnas || '-'}"\n`;
    });

    downloadCSV(csv, `FORM-A1_KEJURPROV_${squadFilter}_${info.club || 'KLUB'}.csv`);
}

function exportFormA3() {
    const info = db.tournaments.info || {};
    const squadFilter = document.getElementById('tour-squad-filter') ? document.getElementById('tour-squad-filter').value : 'All';

    let filteredMembers = db.members;
    if (squadFilter !== 'All') {
        filteredMembers = db.members.filter(m => m.squad === squadFilter);
    }

    let csv = `FORMULIR PENDAFTARAN KEJURPROV (FORM-A3)\n`;
    csv += `PERKUMPULAN,${info.club || '-'}\n`;
    csv += `KOTA / KAB.,${info.city || '-'}\n`;
    csv += `PELATIH / OFFICIAL,${info.official || '-'}\n`;
    csv += `NOMOR HP,${info.hp || '-'}\n\n`;

    const allEvents = [];
    EVENT_LIST.forEach(cat => {
        cat.events.forEach(ev => allEvents.push(ev));
    });

    let header1 = `NO,NAMA,PA/PI,KU`;
    let header2 = `,,,`;

    EVENT_LIST.forEach(cat => {
        cat.events.forEach((ev, i) => {
            header1 += `,${i === 0 ? cat.category : ''}`;
            header2 += `,${ev.name}`;
        });
    });

    csv += header1 + `\n` + header2 + `\n`;

    filteredMembers.forEach((m, idx) => {
        const reg = db.tournaments.registrations[m.id] || { events: [] };
        let row = `"${idx + 1}","${m.name}","${m.gender || 'PA'}","${m.squad}"`;

        allEvents.forEach(ev => {
            const checked = reg.events && reg.events.includes(ev.id) ? 'x' : '';
            row += `,"${checked}"`;
        });

        csv += row + `\n`;
    });

    downloadCSV(csv, `FORM-A3_KEJURPROV_${squadFilter}_${info.club || 'KLUB'}.csv`);
}

// Helper Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}