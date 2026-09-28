// ========== Dark Mode ==========
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
}

darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    if (body.classList.contains("dark-mode")) {
        darkModeToggle.textContent = "☀️";
        localStorage.setItem("darkMode", "enabled");
    } else {
        darkModeToggle.textContent = "🌙";
        localStorage.setItem("darkMode", "disabled");
    }
});

// ========== Habit Tracker ==========
const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitsList = document.getElementById("habitsList");
const emptyMessage = document.getElementById("emptyMessage");
const totalHabitsEl = document.getElementById("totalHabits");
const completedTodayEl = document.getElementById("completedToday");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

// Helper: format tanggal YYYY-MM-DD
function getDateString(date = new Date()) {
    return date.toISOString().split("T")[0];
}

// Helper: dapatkan 7 hari terakhir
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

// Hitung streak
function calculateStreak(completedDates) {
    if (!completedDates || completedDates.length === 0) return 0;

    const sorted = [...completedDates].sort().reverse();
    let streak = 0;
    let current = new Date();
    
    // Jika hari ini belum dicentang, mulai dari kemarin
    if (!sorted.includes(getDateString(current))) {
        current.setDate(current.getDate() - 1);
    }

    while (true) {
        const dateStr = getDateString(current);
        if (sorted.includes(dateStr)) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function updateStats() {
    totalHabitsEl.textContent = habits.length;
    
    const today = getDateString();
    const completed = habits.filter(h => h.completedDates.includes(today)).length;
    completedTodayEl.textContent = completed;
}

function renderHabits() {
    habitsList.innerHTML = "";

    if (habits.length === 0) {
        emptyMessage.classList.remove("hidden");
        updateStats();
        return;
    }

    emptyMessage.classList.add("hidden");
    const last7Days = getLast7Days();

    habits.forEach((habit, index) => {
        const streak = calculateStreak(habit.completedDates);
        const card = document.createElement("div");
        card.className = "habit-card";

        let calendarHTML = "";
        last7Days.forEach(day => {
            const isCompleted = habit.completedDates.includes(day.date);
            calendarHTML += `
                <div class="day">
                    <div class="day-label">${day.label}</div>
                    <button 
                        class="day-btn ${isCompleted ? "completed" : ""} ${day.isToday ? "today" : ""}"
                        data-index="${index}"
                        data-date="${day.date}"
                    >
                        ${isCompleted ? "✓" : ""}
                    </button>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="habit-header">
                <span class="habit-name">${habit.name}</span>
                <button class="delete-habit" data-index="${index}">×</button>
            </div>
            <div class="habit-streak">
                Streak: <strong>${streak} hari</strong>
            </div>
            <div class="calendar">
                ${calendarHTML}
            </div>
        `;

        habitsList.appendChild(card);
    });

    updateStats();
}

// Tambah habit
habitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (!name) return;

    habits.push({
        name,
        completedDates: []
    });

    saveHabits();
    renderHabits();
    habitInput.value = "";
    habitInput.focus();
});

// Toggle complete & delete
habitsList.addEventListener("click", (e) => {
    // Delete
    if (e.target.classList.contains("delete-habit")) {
        const index = e.target.dataset.index;
        if (confirm(`Hapus habit "${habits[index].name}"?`)) {
            habits.splice(index, 1);
            saveHabits();
            renderHabits();
        }
        return;
    }

    // Toggle day
    if (e.target.classList.contains("day-btn")) {
        const index = e.target.dataset.index;
        const date = e.target.dataset.date;
        const habit = habits[index];

        if (habit.completedDates.includes(date)) {
            // Uncomplete
            habit.completedDates = habit.completedDates.filter(d => d !== date);
        } else {
            // Complete
            habit.completedDates.push(date);
        }

        saveHabits();
        renderHabits();
    }
});

// Render awal
renderHabits();