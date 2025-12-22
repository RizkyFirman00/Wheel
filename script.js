// =======================================
// STATE
// =======================================
let names = [];
let currentRotation = 0;
let spinning = false;

const colors = [
    "#f97316", "#22c55e", "#38bdf8",
    "#a855f7", "#facc15", "#ec4899", "#10b981",
];

// =======================================
// MODAL SYSTEM
// =======================================
const modalOverlay = document.getElementById("modalOverlay");
const modalMessage = document.getElementById("modalMessage");
const modalButtons = document.getElementById("modalButtons");

function showModal(message, buttons = []) {
    modalMessage.textContent = message;
    modalButtons.innerHTML = "";

    buttons.forEach(btn => {
        const b = document.createElement("button");
        b.className = "modal-btn " + (btn.type || "");
        b.textContent = btn.label;
        b.onclick = () => {
            hideModal();
            if (btn.onClick) btn.onClick();
        };
        modalButtons.appendChild(b);
    });

    modalOverlay.classList.remove("hidden");
    setTimeout(() => modalOverlay.classList.add("show"), 10);
}

function hideModal() {
    modalOverlay.classList.remove("show");
    setTimeout(() => modalOverlay.classList.add("hidden"), 200);
}

// =======================================
// IMPORT FROM TEXT MODAL
// =======================================
const importBtn = document.getElementById("importBtn");
const importModal = document.getElementById("importModal");
const importTextarea = document.getElementById("importTextarea");
const importConfirm = document.getElementById("importConfirm");
const importCancel = document.getElementById("importCancel");

importBtn.onclick = () => {
    importTextarea.value = "";
    importModal.classList.remove("hidden");
    setTimeout(() => importModal.classList.add("show"), 10);
};

importCancel.onclick = () => {
    importModal.classList.remove("show");
    setTimeout(() => importModal.classList.add("hidden"), 200);
};

importConfirm.onclick = () => {
    const lines = importTextarea.value
        .split("\n")
        .map(x => x.trim())
        .filter(x => x.length > 0);

    lines.forEach(n => {
        if (!names.includes(n)) names.push(n);
    });

    renderNames();
    updateControls();
    drawWheel();

    importModal.classList.remove("show");
    setTimeout(() => importModal.classList.add("hidden"), 200);
};

// =======================================
// SOUND SYSTEM
// =======================================
const audioCtx = new(window.AudioContext || window.webkitAudioContext)();

function playTick() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.value = 1800;
    osc.type = "square";

    gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.045);
}

function playDing() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(900, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.45, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// =======================================
// TICK LOOP
// =======================================
let tickTimer = null;

function startTickLoop() {
    let interval = 35;
    let slowdown = 1.048;
    let elapsed = 0;
    const maxDuration = 3600;

    function loop() {
        if (elapsed > maxDuration) {
            stopTickLoop();
            return;
        }
        playTick();
        elapsed += interval;
        interval *= slowdown;
        tickTimer = setTimeout(loop, interval);
    }

    loop();
}

function stopTickLoop() {
    clearTimeout(tickTimer);
    tickTimer = null;
}

// =======================================
// DOM
// =======================================
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const wheelWrapper = document.getElementById("wheelWrapper");
const spinTarget = canvas;

const spinBtn = document.getElementById("spinBtn");
const resultBox = document.getElementById("resultBox");
const removeOnPick = document.getElementById("removeOnPick");
const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");
const namesList = document.getElementById("namesList");
const clearBtn = document.getElementById("clearBtn");
const seedBtn = document.getElementById("seedBtn");
const countBadge = document.getElementById("countBadge");
const lastWinnerInfo = document.getElementById("lastWinnerInfo");

// =======================================
// CANVAS RESIZE
// =======================================
function resizeCanvas() {
    const size = wheelWrapper.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWheel();
}

window.addEventListener("resize", resizeCanvas);

// =======================================
// DRAW WHEEL
// =======================================
function drawWheel() {
    const size = canvas.width / (window.devicePixelRatio || 1);
    const radius = size / 2 - 8;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);

    if (!names.length) {
        ctx.fillStyle = "#6b7280";
        ctx.font = "600 15px 'Poppins'";
        ctx.textAlign = "center";
        ctx.fillText("Add names", 0, -4);
        ctx.fillText("to start spinning", 0, 18);
        ctx.restore();
        return;
    }

    const slice = (Math.PI * 2) / names.length;

    names.forEach((name, i) => {
        const start = i * slice;
        const end = start + slice;

        const grad = ctx.createLinearGradient(
            Math.cos(start) * radius, Math.sin(start) * radius,
            Math.cos(end) * radius, Math.sin(end) * radius
        );

        grad.addColorStop(0, colors[i % colors.length]);
        grad.addColorStop(1, "#fffce8");

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = "#00000055";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        const mid = start + slice / 2;
        ctx.rotate(mid);
        ctx.translate(radius * 0.82, 0);
        ctx.rotate(Math.PI / 2);

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        let total = names.length;
        let fontSize = 12;
        if (total > 12 && total <= 20) fontSize = 8;
        else if (total > 20) fontSize = 7;

        ctx.font = `600 ${fontSize}px 'Poppins'`;

        let shortName = name;
        if (shortName.length > 6) shortName = shortName.slice(0, 6);

        ctx.fillText(shortName, 0, 0);
        ctx.restore();
    });

    ctx.restore();
}

// =======================================
// RENDER NAME LIST
// =======================================
function renderNames() {
    namesList.innerHTML = "";

    if (!names.length) {
        const li = document.createElement("li");
        li.textContent = "No names yet.";
        li.className = "empty-hint";
        namesList.appendChild(li);
    } else {
        names.forEach((name, index) => {
            const li = document.createElement("li");

            const label = document.createElement("div");
            label.className = "name-label";

            const dot = document.createElement("div");
            dot.className = "name-badge";

            const text = document.createElement("span");
            text.textContent = name;

            label.append(dot, text);

            const btn = document.createElement("button");
            btn.className = "name-remove";
            btn.textContent = "X";
            btn.onclick = () => {
                names.splice(index, 1);
                renderNames();
                updateControls();
            };

            li.append(label, btn);
            namesList.appendChild(li);
        });
    }

    drawWheel();
}

// =======================================
// UPDATE UI
// =======================================
function updateControls() {
    const count = names.length;
    countBadge.textContent = count + " entries";
    spinBtn.disabled = count === 0;

    const quickGuide = document.getElementById("quickGuide");

    if (!count) {
        resultBox.innerHTML = "Add some names, then press&nbsp;<strong>Spin</strong>.";
        quickGuide.style.display = "block";
    } else {
        quickGuide.style.display = "none";
    }
}

// =======================================
// INPUT HANDLERS
// =======================================
nameForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    if (!names.includes(name)) names.push(name);

    nameInput.value = "";
    renderNames();
    updateControls();
});

clearBtn.onclick = () => {
    if (!names.length) {
        showModal("The list is already empty.", [{
            label: "OK",
            type: "ok"
        }]);
        return;
    }

    showModal("Clear all names?", [{
            label: "Cancel",
            type: "cancel"
        },
        {
            label: "Clear",
            type: "ok",
            onClick: () => {
                names = [];
                currentRotation = 0;

                spinTarget.style.transition = "none";
                spinTarget.style.transform = "rotate(0deg)";

                renderNames();
                updateControls();
                lastWinnerInfo.textContent = "";
            }
        }
    ]);
};

seedBtn.onclick = () => {
    names = ["Alex", "Mira", "Lucas", "Sophie", "Daniel", "Eva", "John"];
    currentRotation = 0;
    spinTarget.style.transition = "none";
    spinTarget.style.transform = "rotate(0deg)";
    renderNames();
    updateControls();
};

// =======================================
// SERVER REQUEST
// =======================================
async function requestWinnerIndex(list) {
    const res = await fetch("script.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        cache: "no-store",
        body: JSON.stringify({
            names: list
        }),
    });

    if (!res.ok) throw new Error("Server HTTP error");
    return res.json();
}

// =======================================
// SPIN LOGIC (FIXED)
// =======================================
spinBtn.onclick = async () => {
    if (spinning || names.length === 0) return;

    spinning = true;
    spinBtn.disabled = true;

    let winnerIndex;
    try {
        const pick = await requestWinnerIndex(names);

        if (!pick || !pick.ok) {
            spinning = false;
            spinBtn.disabled = !names.length;
            showModal(pick?.message || "No valid names available.", [{
                label: "OK",
                type: "ok"
            }]);
            return;
        }

        winnerIndex = pick.index;

        if (typeof winnerIndex !== "number" || winnerIndex < 0 || winnerIndex >= names.length) {
            throw new Error("Invalid winner index");
        }
    } catch (e) {
        spinning = false;
        spinBtn.disabled = !names.length;
        showModal("Failed to pick winner.", [{
            label: "OK",
            type: "ok"
        }]);
        return;
    }


    startTickLoop();

    const total = names.length;
    const degPerSlice = 360 / total;

    const centerAngle = degPerSlice * (winnerIndex + 0.5);
    const extraSpins = 4 + Math.floor(Math.random() * 3);
    const norm = ((currentRotation % 360) + 360) % 360;

    const delta = extraSpins * 360 - (centerAngle + norm);
    currentRotation += delta;

    spinTarget.style.transition = "transform 4s cubic-bezier(0.16,1,0.3,1)";
    spinTarget.style.transform = `rotate(${currentRotation}deg)`;

    const winner = names[winnerIndex];

    setTimeout(() => {
        stopTickLoop();
        playDing();

        resultBox.innerHTML = `Result:&nbsp;<strong>${winner}</strong> 🎉`;
        lastWinnerInfo.textContent = `Last winner: ${winner}`;

        if (removeOnPick.checked) {
            names.splice(winnerIndex, 1);
            renderNames();
            updateControls();

            showModal(`Winner: ${winner}`, [{
                label: "OK",
                type: "ok"
            }]);
        } else {
            showModal(`Winner: ${winner}`, [{
                    label: "Remove",
                    type: "ok",
                    onClick: () => {
                        names.splice(winnerIndex, 1);
                        renderNames();
                        updateControls();
                    }
                },
                {
                    label: "Keep",
                    type: "cancel"
                }
            ]);
        }

        spinning = false;
        spinBtn.disabled = !names.length;
    }, 4000);
};

// =======================================
// INIT
// =======================================
resizeCanvas();
renderNames();
updateControls();