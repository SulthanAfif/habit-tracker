// ========== Dark Mode ==========
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
}

darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    darkModeToggle.textContent = body.classList.contains("dark-mode") ? "☀️" : "🌙";
    localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled");
});

// ========== State ==========
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let editIndex = null;
let currentFilter = "all";

// ========== Elements ==========
const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitColor = document.getElementById("habitColor");
const habitTarget = document.getElementById("habitTarget");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const habitsList = document.getElementById("habitsList");
const emptyMessage = document.getElementById("emptyMessage");
const totalHabitsEl = document.getElementById("totalHabits");
const completedTodayEl = document.getElementById("completedToday");
const bestStreakEl = document.getElementById("bestStreak");
const filterButtons = document.querySelectorAll(".filter-btn");

// ========== Helpers ==========
function getDateString(date = new Date()) {
    return date.toISOString().split("T")[0];
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            date: getDateString(d),
            label: d.toLocaleDateString("id-ID", { weekday: "short" }),
            isToday: i === 0
        });
    }
    return days;
}

function calculateStreak(completedDates) {
    if (!completedDates.length) return 0;
    const sorted = [...completedDates].sort().reverse();
    let streak = 0;
    let current = new Date();

    if (!sorted.includes(getDateString(current))) {
        current.setDate(current.getDate() - 1);
    }

    while (sorted.includes(getDateString(current))) {
        streak++;
        current.setDate(current.getDate() - 1);
    }
    return streak;
}

function getWeekCompletions(completedDates) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Minggu sebagai awal
    startOfWeek.setHours(0, 0, 0, 0);

    return completedDates.filter(dateStr => {
        const d = new Date(dateStr);
        return d >= startOfWeek;
    }).length;
}

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function updateStats() {
    totalHabitsEl.textContent = habits.length;

    const today = getDateString();
    completedTodayEl.textContent = habits.filter(h => h.completedDates.includes(today)).length;

    let best = 0;
    habits.forEach(h => {
        const s = calculateStreak(h.completedDates);
        if (s > best) best = s;
    });
    bestStreakEl.textContent = best;
}

function renderHabits() {
    habitsList.innerHTML = "";
    const today = getDateString();
    const last7Days = getLast7Days();

    let filtered = [...habits];

    if (currentFilter === "active") {
        filtered = habits.filter(h => !h.completedDates.includes(today));
    } else if (currentFilter === "completed") {
        filtered = habits.filter(h => h.completedDates.includes(today));
    }

    if (filtered.length === 0) {
        emptyMessage.classList.remove("hidden");
        emptyMessage.innerHTML = currentFilter === "all"
            ? "Belum ada habit.<br>Yuk mulai bangun kebiasaan baik!"
            : "Tidak ada habit di filter ini.";
        updateStats();
        return;
    }

    emptyMessage.classList.add("hidden");

    filtered.forEach((habit) => {
        const realIndex = habits.indexOf(habit);
        const streak = calculateStreak(habit.completedDates);
        const weekCount = getWeekCompletions(habit.completedDates);
        const target = habit.target || 7;
        const progress = Math.min((weekCount / target) * 100, 100);

        const card = document.createElement("div");
        card.className = `habit-card ${habit.color || "blue"}`;

        let calendarHTML = last7Days.map(day => {
            const isCompleted = habit.completedDates.includes(day.date);
            return `
                <div class="day">
                    <div class="day-label">${day.label}</div>
                    <button class="day-btn ${isCompleted ? "completed" : ""} ${day.isToday ? "today" : ""}"
                        data-index="${realIndex}" data-date="${day.date}">
                        ${isCompleted ? "✓" : ""}
                    </button>
                </div>
            `;
        }).join("");

        card.innerHTML = `
            <div class="habit-header">
                <span class="habit-name">${habit.name}</span>
                <div class="habit-actions">
                    <button class="edit-btn" data-index="${realIndex}" title="Edit">✎</button>
                    <button class="delete-btn" data-index="${realIndex}" title="Hapus">×</button>
                </div>
            </div>

            <div class="habit-meta">
                <span>Streak: <strong>${streak} hari</strong></span>
                <span>Minggu ini: <strong>${weekCount}/${target}</strong></span>
            </div>

            <div class="progress-section">
                <div class="progress-info">
                    <span>Progress Mingguan</span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%; background: ${getColor(habit.color)}"></div>
                </div>
            </div>

            <div class="calendar">${calendarHTML}</div>
        `;

        habitsList.appendChild(card);
    });

    updateStats();
}

function getColor(color) {
    const map = {
        blue: "#0ea5e9", green: "#22c55e", purple: "#a855f7",
        orange: "#f97316", pink: "#ec4899", teal: "#14b8a6"
    };
    return map[color] || "#0ea5e9";
}

// ========== Events ==========
habitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (!name) return;

    const color = habitColor.value;
    const target = Number(habitTarget.value) || 7;

    if (editIndex !== null) {
        habits[editIndex].name = name;
        habits[editIndex].color = color;
        habits[editIndex].target = target;
        editIndex = null;
        submitBtn.textContent = "+ Tambah Habit";
        cancelEditBtn.classList.add("hidden");
    } else {
        habits.push({
            name,
            color,
            target,
            completedDates: []
        });
    }

    saveHabits();
    renderHabits();
    habitForm.reset();
    habitTarget.value = 7;
    habitInput.focus();
});

cancelEditBtn.addEventListener("click", () => {
    editIndex = null;
    habitForm.reset();
    habitTarget.value = 7;
    submitBtn.textContent = "+ Tambah Habit";
    cancelEditBtn.classList.add("hidden");
});

habitsList.addEventListener("click", (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains("delete-btn")) {
        if (confirm(`Hapus habit "${habits[index].name}"?`)) {
            habits.splice(index, 1);
            saveHabits();
            renderHabits();
        }
        return;
    }

    if (e.target.classList.contains("edit-btn")) {
        const h = habits[index];
        habitInput.value = h.name;
        habitColor.value = h.color || "blue";
        habitTarget.value = h.target || 7;
        editIndex = Number(index);
        submitBtn.textContent = "Simpan Perubahan";
        cancelEditBtn.classList.remove("hidden");
        habitInput.focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    if (e.target.classList.contains("day-btn")) {
        const date = e.target.dataset.date;
        const habit = habits[index];

        if (habit.completedDates.includes(date)) {
            habit.completedDates = habit.completedDates.filter(d => d !== date);
        } else {
            habit.completedDates.push(date);
        }

        saveHabits();
        renderHabits();
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderHabits();
    });
});

// Init
renderHabits();