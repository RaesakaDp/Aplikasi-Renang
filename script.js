// ==================== DATABASE LOCALSTORAGE ====================
let db = JSON.parse(localStorage.getItem('aquaTrackDB')) || {
    members: [
        { id: '1', name: 'Abdul Kadir Malik Salampessy', squad: 'Prestasi', gender: 'PA', wa: '628123456789' },
        { id: '2', name: 'Fitrah Fadillah Subagyo', squad: 'Reguler', gender: 'PA', wa: '628987654321' },
        { id: '3', name: 'Chloe Dafina Putri', squad: 'Pemula', gender: 'PI', wa: '628112233445' }
    ],
    spp: {}, 
    announcements: [
        { date: new Date().toISOString().split('T')[0], text: 'Selamat datang di Aplikasi Web AquaTrack!' }
    ],
    attendance: {}, 
    performance: {},
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

// Guard clause untuk menjamin struktur DB
if (!db.attendance) db.attendance = {};
if (!db.performance) db.performance = {};
if (!db.tournaments) db.tournaments = { info: {}, registrations: {} };

let currentRole = localStorage.getItem('aquaTrackRole') || 'parent';
let currentPage = 'dashboard';

function saveData() {
    localStorage.setItem('aquaTrackDB', JSON.stringify(db));
}

// ==================== INISIALISASI APLIKASI ====================
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
        case 'billing': renderBilling(); break;
        case 'tournament': renderTournament(); break;
    }
}

// ==================== 1. DASHBOARD ====================
function renderDashboard() {
    document.getElementById('page-title').innerText = "Dashboard Utama";
    const totalMembers = db.members.length;
    const isCoach = currentRole === 'coach';
    
    let html = `
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

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
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
            <form onsubmit="addMember(event)" class="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <input type="text" id="m-wa" placeholder="No WA Wali (Cth: 0812...)" class="border border-slate-200 p-2 rounded-lg text-sm outline-none focus:border-primary" required>
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
                    <th class="p-4">No. WA Wali</th>
                    ${isCoach ? `<th class="p-4">Aksi</th>` : ''}
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
                        <td class="p-4 text-slate-600"><i class="fa-brands fa-whatsapp text-green-500 mr-1"></i> ${m.wa}</td>
                        ${isCoach ? `
                        <td class="p-4">
                            <button onclick="deleteMember(${originalIndex})" class="text-red-500 hover:text-red-700 text-sm"><i class="fa-solid fa-trash"></i></button>
                        </td>` : ''}
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
    let wa = document.getElementById('m-wa').value;
    if(wa.startsWith('0')) wa = '62' + wa.substring(1);

    db.members.push({ id: Date.now().toString(), name, squad, gender, wa });
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

// ==================== 4. REKOR WAKTU (PERSONAL BEST / PB) ====================

function renderPerformance() {
    document.getElementById('page-title').innerText = "Rekor Waktu (Personal Best)";
    
    let html = `
        <!-- Filter Kelas & Search Bar Atlet -->
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

        <!-- Tabel Daftar Atlet di Kelas yang Dipilih -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6" id="pb-athletes-table-container">
            ${generatePBAthletesTable('All', '')}
        </div>

        <!-- Area Detail & Form Input PB Atlet yang Dipilih -->
        <div id="pb-detail-area"></div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

// Dipanggil saat Filter Kelas atau Search Bar diubah
function filterPerformancePage() {
    const squadFilter = document.getElementById('pb-squad-filter').value;
    const searchKeyword = document.getElementById('pb-search-athlete').value.toLowerCase();
    
    document.getElementById('pb-athletes-table-container').innerHTML = generatePBAthletesTable(squadFilter, searchKeyword);
    document.getElementById('pb-detail-area').innerHTML = ''; // Reset detail saat filter berubah
}

// Generate Tabel Ringkasan Atlet
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
                                <i class="fa-solid fa-stopwatch"></i> Lihat / Catat PB
                            </button>
                        </td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Dipanggil saat tombol "Lihat / Catat PB" diklik
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
                    ${records.length === 0 ? `<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum ada catatan rekor waktu untuk atlet ini.</td></tr>` : 
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

    // Scroll halus ke area detail
    detailArea.scrollIntoView({ behavior: 'smooth' });
}

// Helper konversi format waktu "MM:SS.ms" atau "SS.ms" menjadi detik (float)
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

// Logika Simpan & Auto-Update Record PB
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

    // Refresh tabel & detail
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

// ==================== 5. SPP & KEUANGAN ====================
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

// ==================== 6. PENDAFTARAN LOMBA KEJURPROV ====================
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
        <!-- Form Informasi Official Perkumpulan -->
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

        <!-- Filter Kelas & Tombol Ekspor -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 class="text-md font-bold text-slate-800">Filter Pendaftaran Lomba</h3>
                <p class="text-xs text-slate-500">Pilih kelas untuk mempermudah pendaftaran acara lomba per kelas</p>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <!-- Filter Kelas / Squad -->
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

        <!-- Tabel Atlet Pendaftaran Lomba -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto" id="tour-table-container">
            ${generateTournamentTable('All')}
        </div>

        <!-- Modal Pilihan Nomor Acara -->
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

// Handler Filter Kelas Pendaftaran Lomba
function filterTournamentTable() {
    const squadFilter = document.getElementById('tour-squad-filter').value;
    document.getElementById('tour-table-container').innerHTML = generateTournamentTable(squadFilter);
}

// Generate Tabel berdasarkan Filter Kelas
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

// 1. Ekspor FORM-A1 (Sesuai Filter Kelas)
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

// 2. Ekspor FORM-A3 (Sesuai Filter Kelas)
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

// Helper Download CSV / Excel
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}