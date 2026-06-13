const LS_BOOKINGS = "medibook_bookings";

const el = (id) => document.getElementById(id);
const state = { service: "", date: "", time: "" };

// All possible daily slots
const ALL_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];

function getBookings() {
  try { return JSON.parse(localStorage.getItem(LS_BOOKINGS)) || []; }
  catch { return []; }
}
function saveBooking(b) {
  const all = getBookings();
  all.push(b);
  localStorage.setItem(LS_BOOKINGS, JSON.stringify(all));
}

// Deterministic "already booked" slots per date so the demo feels real
function bookedSlotsFor(dateStr) {
  const taken = new Set();
  // existing user bookings
  getBookings().filter((b) => b.date === dateStr).forEach((b) => taken.add(b.time));
  // pseudo-random pre-filled slots based on the date (stable per day)
  let seed = 0;
  for (const c of dateStr) seed += c.charCodeAt(0);
  ALL_SLOTS.forEach((s, i) => { if ((seed + i * 7) % 3 === 0) taken.add(s); });
  return taken;
}

// ---------- Step navigation ----------
function goToStep(n) {
  document.querySelectorAll(".bstep").forEach((s) => {
    s.hidden = Number(s.dataset.step) !== n;
  });
  document.querySelectorAll(".step").forEach((s) => {
    const sn = Number(s.dataset.step);
    s.classList.toggle("active", sn === n);
    s.classList.toggle("done", sn < n);
  });
}

document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = Number(btn.dataset.next);
    if (next === 2) state.service = el("service").value;
    updateSummary();
    goToStep(next);
  });
});
document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => goToStep(Number(btn.dataset.back)));
});

// ---------- Date & slots ----------
const dateInput = el("date");
const today = new Date();
const minDate = today.toISOString().split("T")[0];
dateInput.min = minDate;

dateInput.addEventListener("change", () => {
  state.date = dateInput.value;
  state.time = "";
  el("toStep3").disabled = true;
  renderSlots();
  updateSummary();
});

function renderSlots() {
  const wrap = el("slots");
  wrap.innerHTML = "";
  if (!state.date) {
    wrap.innerHTML = `<p class="slots__empty">Select a date to see available times.</p>`;
    return;
  }
  const day = new Date(state.date + "T00:00:00").getDay();
  if (day === 0) {
    wrap.innerHTML = `<p class="slots__empty">We're closed on Sundays — please pick another day.</p>`;
    return;
  }
  const taken = bookedSlotsFor(state.date);
  ALL_SLOTS.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.textContent = slot;
    if (taken.has(slot)) btn.disabled = true;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".slot").forEach((s) => s.classList.remove("selected"));
      btn.classList.add("selected");
      state.time = slot;
      el("toStep3").disabled = false;
      updateSummary();
    });
    wrap.appendChild(btn);
  });
}

// ---------- Summary ----------
function prettyDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function updateSummary() {
  el("sumService").textContent = state.service || el("service").value || "—";
  el("sumDate").textContent = prettyDate(state.date);
  el("sumTime").textContent = state.time || "—";
}

// ---------- Submit ----------
el("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = el("name").value.trim();
  const email = el("email").value.trim();
  const phone = el("phone").value.trim();

  if (!name || !email || !phone) { alert("Please fill in your name, email and phone."); return; }
  if (!state.date || !state.time) { alert("Please choose a date and time."); return; }

  const booking = { service: state.service, date: state.date, time: state.time, name, email, phone, notes: el("notes").value.trim(), createdAt: new Date().toISOString() };
  saveBooking(booking);

  el("confirmText").textContent = `${name}, your ${state.service} is booked for ${prettyDate(state.date)} at ${state.time}.`;
  el("confirmModal").classList.add("open");
});

el("closeModal").addEventListener("click", () => {
  el("confirmModal").classList.remove("open");
  // reset flow
  el("bookingForm").reset();
  state.service = ""; state.date = ""; state.time = "";
  el("toStep3").disabled = true;
  el("slots").innerHTML = `<p class="slots__empty">Select a date to see available times.</p>`;
  updateSummary();
  goToStep(1);
});

el("confirmModal").addEventListener("click", (e) => {
  if (e.target === el("confirmModal")) el("confirmModal").classList.remove("open");
});

// init
renderSlots();
updateSummary();
