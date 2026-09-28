// Dark Mode
const darkBtn = document.getElementById("darkModeToggle");
if (localStorage.getItem("dark") === "1") {
    document.body.classList.add("dark");
    darkBtn.textContent = "☀️";
}
darkBtn.onclick = () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    darkBtn.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("dark", isDark ? "1" : "0");
};

// Quote
const quotes = [
    "Konsistensi mengalahkan intensitas.",
    "Sedikit kemajuan setiap hari menambah hasil besar.",
    "Jangan tunggu motivasi, ciptakan disiplin.",
    "Hari ini adalah kesempatan untuk menjadi lebih baik."
];
document.getElementById("quote").textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;

// State
let habits = JSON.parse(localStorage.getItem("habits") || "[]");
let editId = null;
let filter = "all";
let pending = null;

// Helpers
const today = () => new Date().toISOString().slice(0, 10);

function last7() {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        arr.push({
            date: d.toISOString().slice(0, 10),
            label: d.toLocaleDateString("id-ID", { weekday: "short" }),
            isToday: i === 0
        });
    }
    return arr;
}

function streak(dates) {
    if (!dates.length) return 0;
    const set = new Set(dates);
    let s = 0;
    let d = new Date();
    if (!set.has(today())) d.setDate(d.getDate() - 1);
    while (set.has(d.toISOString().slice(0, 10))) {
        s++;
        d.setDate(d.getDate() - 1);
    }
    return s;
}

function weekCount(dates) {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return dates.filter(d => new Date(d) >= start).length;
}

function save() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function color(c) {
    return { blue: "#0ea5e9", green: "#22c55e", purple: "#a855f7", orange: "#f97316", pink: "#ec4899", teal: "#14b8a6" }[c] || "#0ea5e9";
}

// Render
function render() {
    const list = document.getElementById("list");
    const empty = document.getElementById("empty");
    list.innerHTML = "";

    let data = [...habits];
    if (filter === "active") data = data.filter(h => !h.dates.includes(today()));
    if (filter === "done") data = data.filter(h => h.dates.includes(today()));

    document.getElementById("statTotal").textContent = habits.length;
    document.getElementById("statToday").textContent = habits.filter(h => h.dates.includes(today())).length;
    document.getElementById("statBest").textContent = Math.max(0, ...habits.map(h => streak(h.dates)));

    if (!data.length) {
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");

    const days = last7();

    data.forEach((h, i) => {
        const realIndex = habits.indexOf(h);
        const s = streak(h.dates);
        const wc = weekCount(h.dates);
        const target = h.target || 7;
        const pct = Math.min(100, Math.round(wc / target * 100));

        const el = document.createElement("div");
        el.className = `habit ${h.color || "blue"}`;
        el.innerHTML = `
            <div class="habit-top">
                <h3>${h.name}</h3>
                <div>
                    <button data-edit="${realIndex}">✎</button>
                    <button data-del="${realIndex}">×</button>
                </div>
            </div>
            <div class="meta">
                <span>Streak: <strong>${s}</strong></span>
                <span>Minggu: <strong>${wc}/${target}</strong></span>
            </div>
            <div class="progress-label">
                <span>Progress</span>
                <span>${pct}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${pct}%;background:${color(h.color)}"></div>
            </div>
            <div class="days">
                ${days.map(d => `
                    <div class="day">
                        <span>${d.label}</span>
                        <button class="${h.dates.includes(d.date) ? "done" : ""} ${d.isToday ? "today" : ""}"
                            data-toggle="${realIndex}" data-date="${d.date}">
                            ${h.dates.includes(d.date) ? "✓" : ""}
                        </button>
                    </div>
                `).join("")}
            </div>
            ${h.notes && h.notes[today()] ? `<div class="note">📝 ${h.notes[today()]}</div>` : ""}
        `;
        list.appendChild(el);
    });
}

// Events
document.getElementById("habitForm").onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById("habitName").value.trim();
    if (!name) return;

    const colorVal = document.getElementById("habitColor").value;
    const target = +document.getElementById("habitTarget").value || 7;

    if (editId !== null) {
        habits[editId].name = name;
        habits[editId].color = colorVal;
        habits[editId].target = target;
        editId = null;
        document.getElementById("submitBtn").textContent = "+ Tambah Habit";
        document.getElementById("cancelBtn").classList.add("hidden");
    } else {
        habits.push({ name, color: colorVal, target, dates: [], notes: {} });
    }
    save();
    render();
    e.target.reset();
    document.getElementById("habitTarget").value = 7;
};

document.getElementById("cancelBtn").onclick = () => {
    editId = null;
    document.getElementById("habitForm").reset();
    document.getElementById("habitTarget").value = 7;
    document.getElementById("submitBtn").textContent = "+ Tambah Habit";
    document.getElementById("cancelBtn").classList.add("hidden");
};

document.getElementById("list").onclick = e => {
    const edit = e.target.dataset.edit;
    const del = e.target.dataset.del;
    const toggle = e.target.dataset.toggle;
    const date = e.target.dataset.date;

    if (edit !== undefined) {
        const h = habits[edit];
        document.getElementById("habitName").value = h.name;
        document.getElementById("habitColor").value = h.color || "blue";
        document.getElementById("habitTarget").value = h.target || 7;
        editId = +edit;
        document.getElementById("submitBtn").textContent = "Simpan";
        document.getElementById("cancelBtn").classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (del !== undefined) {
        if (confirm("Hapus habit ini?")) {
            habits.splice(del, 1);
            save();
            render();
        }
    }

    if (toggle !== undefined) {
        const h = habits[toggle];
        if (h.dates.includes(date)) {
            h.dates = h.dates.filter(d => d !== date);
            if (h.notes) delete h.notes[date];
            save();
            render();
        } else {
            pending = { index: +toggle, date };
            document.getElementById("modalTitle").textContent = h.name;
            document.getElementById("modalDate").textContent = new Date(date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
            document.getElementById("modalNote").value = (h.notes && h.notes[date]) || "";
            document.getElementById("modal").classList.remove("hidden");
        }
    }
};

document.getElementById("modalSave").onclick = () => {
    if (!pending) return;
    const h = habits[pending.index];
    if (!h.dates.includes(pending.date)) h.dates.push(pending.date);
    if (!h.notes) h.notes = {};
    const note = document.getElementById("modalNote").value.trim();
    if (note) h.notes[pending.date] = note;
    else delete h.notes[pending.date];
    save();
    render();
    document.getElementById("modal").classList.add("hidden");
    pending = null;
};

document.getElementById("modalCancel").onclick = () => {
    document.getElementById("modal").classList.add("hidden");
    pending = null;
};

document.querySelectorAll(".filter").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filter = btn.dataset.filter;
        render();
    };
});

document.getElementById("exportBtn").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(habits, null, 2)]));
    a.download = `habits-${today()}.json`;
    a.click();
};

document.getElementById("importBtn").onclick = () => document.getElementById("importFile").click();
document.getElementById("importFile").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            habits = JSON.parse(ev.target.result);
            save();
            render();
            alert("Import berhasil!");
        } catch {
            alert("File tidak valid");
        }
    };
    reader.readAsText(file);
};

document.getElementById("resetBtn").onclick = () => {
    if (confirm("Hapus semua data?")) {
        habits = [];
        save();
        render();
    }
};

// Start
render();