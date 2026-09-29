// ===================== DARK MODE =====================
const darkModeToggle = document.getElementById("darkModeToggle");
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeToggle.textContent = "☀️";
}
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  darkModeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
});

// ===================== QUOTE =====================
const quotes = [
  "Konsistensi mengalahkan intensitas.",
  "Sedikit kemajuan setiap hari menambah hasil besar.",
  "Kebiasaan baik adalah bunga yang mekar perlahan.",
  "Jangan tunggu motivasi, ciptakan disiplin.",
  "Hari ini adalah kesempatan untuk menjadi lebih baik.",
  "Streak kecil yang konsisten lebih berharga dari usaha besar yang jarang.",
];
document.getElementById("dailyQuote").textContent =
  `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;

// ===================== STATE =====================
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let editIndex = null;
let currentFilter = "all";
let currentTab = "list";
let currentMonth = new Date();
let pendingComplete = null;
let progressChart = null;

// ===================== HELPERS =====================
function getDateString(d = new Date()) {
  return d.toISOString().split("T")[0];
}

function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function calculateStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  let streak = 0;
  let cur = new Date();
  if (!sorted.includes(getDateString(cur))) cur.setDate(cur.getDate() - 1);
  while (sorted.includes(getDateString(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

function getWeekCount(dates) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return dates.filter((d) => new Date(d) >= start).length;
}

function getColor(c) {
  const map = {
    blue: "#0ea5e9",
    green: "#22c55e",
    purple: "#a855f7",
    orange: "#f97316",
    pink: "#ec4899",
    teal: "#14b8a6",
  };
  return map[c] || "#0ea5e9";
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: getDateString(d),
      label: d.toLocaleDateString("id-ID", { weekday: "short" }),
      isToday: i === 0,
    });
  }
  return days;
}

// ===================== RENDER LIST =====================
function updateStats() {
  document.getElementById("totalHabits").textContent = habits.length;
  const today = getDateString();
  document.getElementById("completedToday").textContent = habits.filter((h) =>
    h.completedDates.includes(today),
  ).length;

  let best = 0;
  habits.forEach((h) => {
    const s = calculateStreak(h.completedDates);
    if (s > best) best = s;
    if (!h.bestStreak || s > h.bestStreak) h.bestStreak = s;
  });
  document.getElementById("bestStreak").textContent = best;
  save();
}

function renderList() {
  const list = document.getElementById("habitsList");
  const empty = document.getElementById("emptyMessage");
  const today = getDateString();
  const last7 = getLast7Days();

  let filtered = [...habits];
  if (currentFilter === "active")
    filtered = habits.filter((h) => !h.completedDates.includes(today));
  if (currentFilter === "completed")
    filtered = habits.filter((h) => h.completedDates.includes(today));
  if (currentFilter === "challenge")
    filtered = habits.filter((h) => h.challenge);

  list.innerHTML = "";
  if (filtered.length === 0) {
    empty.classList.remove("hidden");
    updateStats();
    return;
  }
  empty.classList.add("hidden");

  filtered.forEach((habit) => {
    const idx = habits.indexOf(habit);
    const streak = calculateStreak(habit.completedDates);
    const week = getWeekCount(habit.completedDates);
    const target = habit.target || 7;
    const progress = Math.min((week / target) * 100, 100);

    const card = document.createElement("div");
    card.className = `habit-card ${habit.color || "blue"}`;

    const daysHtml = last7
      .map(
        (d) => `
      <div class="day">
        <div class="day-label">${d.label}</div>
        <button class="day-btn ${habit.completedDates.includes(d.date) ? "completed" : ""} ${d.isToday ? "today" : ""}"
          data-index="${idx}" data-date="${d.date}">
          ${habit.completedDates.includes(d.date) ? "✓" : ""}
        </button>
      </div>
    `,
      )
      .join("");

    const note = habit.notes?.[today]
      ? `<div style="font-size:0.8rem;color:var(--muted);margin-top:0.5rem;font-style:italic">📝 ${habit.notes[today]}</div>`
      : "";

    card.innerHTML = `
      <div class="habit-header">
        <div>
          <div class="habit-name">${habit.name}</div>
          <div style="margin-top:0.25rem">
            <span class="badge">${habit.category || "Lainnya"}</span>
            ${habit.challenge ? '<span class="badge challenge">30 Hari</span>' : ""}
          </div>
        </div>
        <div class="habit-actions">
          <button class="edit-btn" data-index="${idx}">✎</button>
          <button class="delete-btn" data-index="${idx}">×</button>
        </div>
      </div>
      <div class="habit-meta">
        <span>Streak: <strong>${streak}</strong></span>
        <span>Best: <strong>${habit.bestStreak || streak}</strong></span>
        <span>Minggu: <strong>${week}/${target}</strong></span>
      </div>
      <div class="progress-section">
        <div class="progress-info">
          <span>Progress Mingguan</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${progress}%;background:${getColor(habit.color)}"></div>
        </div>
      </div>
      <div class="calendar-week">${daysHtml}</div>
      ${note}
    `;
    list.appendChild(card);
  });
  updateStats();
}

// ===================== MONTHLY CALENDAR =====================
function renderMonthCalendar() {
  const label = document.getElementById("currentMonthLabel");
  const grid = document.getElementById("monthGrid");
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  label.textContent = currentMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = getDateString();

  grid.innerHTML = "";

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement("div");
    cell.className = "month-day other";
    grid.appendChild(cell);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "month-day" + (dateStr === todayStr ? " today" : "");

    // Count completions on this day
    const count = habits.filter((h) =>
      h.completedDates.includes(dateStr),
    ).length;
    const dots =
      count > 0
        ? `<div class="dots">${"<div class='dot'></div>".repeat(Math.min(count, 3))}</div>`
        : "";

    cell.innerHTML = `<span>${d}</span>${dots}`;
    grid.appendChild(cell);
  }
}

// ===================== CHART =====================
function renderChart() {
  const ctx = document.getElementById("progressChart").getContext("2d");
  if (progressChart) progressChart.destroy();

  // Last 30 days
  const labels = [];
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getDateString(d);
    labels.push(d.getDate());
    const count = habits.filter((h) =>
      h.completedDates.includes(dateStr),
    ).length;
    data.push(count);
  }

  progressChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Habit Selesai",
          data,
          backgroundColor: "#0ea5e9",
          borderRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}

// ===================== EVENTS =====================
document.getElementById("habitForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("habitInput").value.trim();
  if (!name) return;

  const data = {
    name,
    category: document.getElementById("habitCategory").value,
    color: document.getElementById("habitColor").value,
    target: Number(document.getElementById("habitTarget").value) || 7,
    challenge: document.getElementById("habitChallenge").checked,
    completedDates: [],
    notes: {},
    bestStreak: 0,
    createdAt: getDateString(),
  };

  if (editIndex !== null) {
    habits[editIndex] = { ...habits[editIndex], ...data };
    editIndex = null;
    document.getElementById("submitBtn").textContent = "+ Tambah Habit";
    document.getElementById("cancelEditBtn").classList.add("hidden");
  } else {
    habits.push(data);
  }

  save();
  renderList();
  document.getElementById("habitForm").reset();
  document.getElementById("habitTarget").value = 7;
});

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  editIndex = null;
  document.getElementById("habitForm").reset();
  document.getElementById("habitTarget").value = 7;
  document.getElementById("submitBtn").textContent = "+ Tambah Habit";
  document.getElementById("cancelEditBtn").classList.add("hidden");
});

document.getElementById("habitsList").addEventListener("click", (e) => {
  const idx = e.target.dataset.index;
  if (idx === undefined) return;

  if (e.target.classList.contains("delete-btn")) {
    if (confirm(`Hapus "${habits[idx].name}"?`)) {
      habits.splice(idx, 1);
      save();
      renderList();
    }
    return;
  }

  if (e.target.classList.contains("edit-btn")) {
    const h = habits[idx];
    document.getElementById("habitInput").value = h.name;
    document.getElementById("habitCategory").value = h.category || "Lainnya";
    document.getElementById("habitColor").value = h.color || "blue";
    document.getElementById("habitTarget").value = h.target || 7;
    document.getElementById("habitChallenge").checked = !!h.challenge;
    editIndex = Number(idx);
    document.getElementById("submitBtn").textContent = "Simpan Perubahan";
    document.getElementById("cancelEditBtn").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (e.target.classList.contains("day-btn")) {
    const date = e.target.dataset.date;
    const habit = habits[idx];
    const done = habit.completedDates.includes(date);

    if (done) {
      habit.completedDates = habit.completedDates.filter((d) => d !== date);
      if (habit.notes) delete habit.notes[date];
      save();
      renderList();
    } else {
      pendingComplete = { index: Number(idx), date };
      document.getElementById("modalHabitName").textContent = habit.name;
      document.getElementById("modalDate").textContent = new Date(
        date + "T00:00:00",
      ).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      document.getElementById("noteInput").value = habit.notes?.[date] || "";
      document.getElementById("noteModal").classList.remove("hidden");
    }
  }
});

// Modal
document.getElementById("saveNoteBtn").addEventListener("click", () => {
  if (!pendingComplete) return;
  const { index, date } = pendingComplete;
  const habit = habits[index];
  if (!habit.completedDates.includes(date)) habit.completedDates.push(date);
  if (!habit.notes) habit.notes = {};
  const note = document.getElementById("noteInput").value.trim();
  if (note) habit.notes[date] = note;
  else delete habit.notes[date];
  save();
  renderList();
  document.getElementById("noteModal").classList.add("hidden");
  pendingComplete = null;
});

document.getElementById("cancelNoteBtn").addEventListener("click", () => {
  document.getElementById("noteModal").classList.add("hidden");
  pendingComplete = null;
});

// Filter
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderList();
  });
});

// Tabs
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTab = btn.dataset.tab;

    document
      .getElementById("listView")
      .classList.toggle("hidden", currentTab !== "list");
    document
      .getElementById("calendarView")
      .classList.toggle("hidden", currentTab !== "calendar");
    document
      .getElementById("chartView")
      .classList.toggle("hidden", currentTab !== "chart");

    if (currentTab === "calendar") renderMonthCalendar();
    if (currentTab === "chart") renderChart();
  });
});

// Month navigation
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderMonthCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderMonthCalendar();
});

// Export / Import / Reset
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(habits, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `habits-${getDateString()}.json`;
  a.click();
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (Array.isArray(data)) {
        habits = data;
        save();
        renderList();
        alert("Import berhasil!");
      }
    } catch {
      alert("File tidak valid");
    }
  };
  reader.readAsText(file);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Yakin hapus SEMUA data?")) {
    habits = [];
    save();
    renderList();
  }
});

// Notification
document.getElementById("notifBtn").addEventListener("click", async () => {
  if (!("Notification" in window)) {
    alert("Browser tidak mendukung notifikasi");
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("Habit Tracker", {
      body: "Notifikasi berhasil diaktifkan! Kamu akan diingatkan setiap hari.",
    });
    localStorage.setItem("notifEnabled", "true");
  }
});

// Simple daily reminder check
if (
  localStorage.getItem("notifEnabled") === "true" &&
  "Notification" in window
) {
  const lastNotif = localStorage.getItem("lastNotifDate");
  const today = getDateString();
  if (lastNotif !== today && Notification.permission === "granted") {
    const incomplete = habits.filter((h) => !h.completedDates.includes(today));
    if (incomplete.length > 0) {
      new Notification("Habit Tracker", {
        body: `Kamu masih punya ${incomplete.length} habit yang belum dikerjakan hari ini.`,
      });
      localStorage.setItem("lastNotifDate", today);
    }
  }
}

// Init
renderList();
