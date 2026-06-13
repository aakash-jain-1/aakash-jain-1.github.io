// ---------- State ----------
const LS_KEY = "copyforge_openai_key";
const LS_MODEL = "copyforge_model";

const els = {
  form: document.getElementById("genForm"),
  type: document.getElementById("contentType"),
  topic: document.getElementById("topic"),
  tone: document.getElementById("tone"),
  count: document.getElementById("count"),
  results: document.getElementById("results"),
  empty: document.getElementById("emptyState"),
  generateBtn: document.getElementById("generateBtn"),
  clearBtn: document.getElementById("clearBtn"),
  hint: document.getElementById("hint"),
  modePill: document.getElementById("modePill"),
  // modal
  settingsBtn: document.getElementById("settingsBtn"),
  modal: document.getElementById("modal"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  modelSelect: document.getElementById("modelSelect"),
  saveKeyBtn: document.getElementById("saveKeyBtn"),
  cancelKeyBtn: document.getElementById("cancelKeyBtn"),
  clearKeyBtn: document.getElementById("clearKeyBtn"),
};

function getKey() { return localStorage.getItem(LS_KEY) || ""; }
function getModel() { return localStorage.getItem(LS_MODEL) || "gpt-4o-mini"; }

function refreshMode() {
  if (getKey()) {
    els.modePill.textContent = "Live · " + getModel();
    els.modePill.classList.add("live");
  } else {
    els.modePill.textContent = "Demo mode";
    els.modePill.classList.remove("live");
  }
}

// ---------- Modal ----------
els.settingsBtn.addEventListener("click", () => {
  els.apiKeyInput.value = getKey();
  els.modelSelect.value = getModel();
  els.modal.hidden = false;
});
els.cancelKeyBtn.addEventListener("click", () => (els.modal.hidden = true));
els.modal.addEventListener("click", (e) => { if (e.target === els.modal) els.modal.hidden = true; });
els.saveKeyBtn.addEventListener("click", () => {
  const k = els.apiKeyInput.value.trim();
  if (k) localStorage.setItem(LS_KEY, k);
  localStorage.setItem(LS_MODEL, els.modelSelect.value);
  els.modal.hidden = true;
  refreshMode();
});
els.clearKeyBtn.addEventListener("click", () => {
  localStorage.removeItem(LS_KEY);
  els.apiKeyInput.value = "";
  els.modal.hidden = true;
  refreshMode();
});

// ---------- Helpers ----------
function titleCase(s) {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
}
function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}
function hashtags(topic) {
  const stop = new Set(["the","a","an","for","and","with","in","of","to","on","at","our","your","that","this"]);
  return topic.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w)).slice(0, 4)
    .map((w) => "#" + w.replace(/\b\w/, (c) => c.toUpperCase()));
}

// Tone flavour
const TONE = {
  professional: { emoji: "", adj: ["trusted","reliable","results-driven","expert","proven"], close: "Get in touch today." },
  friendly:     { emoji: "😊", adj: ["welcoming","easy","feel-good","approachable","handcrafted"], close: "Come say hi!" },
  bold:         { emoji: "🔥", adj: ["game-changing","unstoppable","next-level","powerful","bold"], close: "Don't wait. Start now." },
  playful:      { emoji: "✨", adj: ["delightful","fun","fresh","quirky","irresistible"], close: "Let's make it happen!" },
  luxury:       { emoji: "✦", adj: ["exquisite","elevated","bespoke","refined","unparalleled"], close: "Experience the difference." },
};

// ---------- Demo generators ----------
function genProduct(topic, t) {
  const a = t.adj;
  return [
    `Introducing ${titleCase(topic)} — a ${a[0]} way to get exactly what you need. Designed with care, built to last, and made to fit seamlessly into your life. ${t.close}`,
    `Meet ${topic}. ${titleCase(a[1])} by design and ${a[2]} where it counts, it's the upgrade you didn't know you were missing. Quality you can feel from the very first use.`,
    `Say hello to ${topic} — thoughtfully crafted for people who care about the details. ${titleCase(a[3])}, dependable, and genuinely a pleasure to use. ${t.emoji}`.trim(),
    `${titleCase(topic)} brings together everything you love and nothing you don't. A ${a[0]}, ${a[4]} experience that just works — every single time.`,
    `Why settle? ${titleCase(topic)} is the ${a[2]} choice for those who expect more. Premium feel, honest value, zero compromise.`,
  ];
}
function genSocial(topic, t) {
  const tags = hashtags(topic).join(" ");
  const e = t.emoji;
  return [
    `${e} Big news — ${topic} is here, and it's everything you hoped for.\n\nTap the link in bio to see what the buzz is about. ${tags}`.trim(),
    `Stop scrolling 👀 ${titleCase(topic)} just landed.\n\n${titleCase(t.adj[0])}. ${titleCase(t.adj[3])}. Yours.\n\n${tags}`,
    `We made ${topic} for one reason: you deserve better. ${e}\n\nReady when you are. ${tags}`.trim(),
    `POV: you finally found ${topic} that actually delivers. ${e}\n\nYou're welcome. 😉 ${tags}`.trim(),
    `${titleCase(topic)} — because life's too short for anything less than ${t.adj[4]}.\n\n${t.close} ${tags}`,
  ];
}
function genAd(topic, t) {
  return [
    `${titleCase(topic)} — ${t.adj[0]} results, zero hassle.`,
    `The ${t.adj[2]} ${topic} you've been waiting for.`,
    `Finally. ${titleCase(topic)} done right.`,
    `${titleCase(t.adj[3])} ${topic}. Try it today.`,
    `Less effort, more wow. That's ${topic}.`,
    `Your search ends here: ${topic}.`,
  ];
}
function genEmail(topic, t) {
  return [
    `Subject: A quick idea for you\n\nHi [Name],\n\nI came across what you're doing and thought of ${topic}. A lot of people in your position are using it to save time and get ${t.adj[0]} results — I'd love to show you how.\n\nOpen to a quick chat this week?\n\nBest,\n[Your Name]`,
    `Subject: ${titleCase(topic)} — worth 2 minutes?\n\nHi [Name],\n\nKeeping this short: if ${topic} is on your radar, I can help you get there faster and with less guesswork. ${t.close}\n\nWould a 15-minute call make sense?\n\nCheers,\n[Your Name]`,
    `Subject: Thought you'd want to see this\n\nHi [Name],\n\nMost teams I talk to struggle with the same thing — and ${topic} is exactly how they fix it. Happy to share a couple of ${t.adj[1]} examples.\n\nWorth a conversation?\n\nWarmly,\n[Your Name]`,
  ];
}
function genTagline(topic, t) {
  return [
    `${titleCase(topic)}. ${titleCase(t.adj[0])} by nature.`,
    `Where ${topic} meets ${t.adj[3]}.`,
    `${titleCase(topic)}, reimagined.`,
    `Simply ${t.adj[4]}.`,
    `${titleCase(topic)} — done beautifully.`,
    `Less ordinary. More you.`,
  ];
}

function generateDemo(type, topic, toneKey, count) {
  const t = TONE[toneKey];
  const map = { product: genProduct, social: genSocial, ad: genAd, email: genEmail, tagline: genTagline };
  const all = map[type](topic.trim(), t);
  return pick(all, Math.min(count, all.length));
}

// ---------- OpenAI (live) ----------
async function generateLive(type, topic, toneKey, count) {
  const labels = {
    product: "product descriptions", social: "social media posts",
    ad: "short ad headlines", email: "cold outreach emails", tagline: "taglines/slogans",
  };
  const prompt = `Write ${count} distinct ${labels[type]} in a ${toneKey} tone for the following:\n"${topic}"\n\nReturn each option separated by a line with only "---". No numbering, no extra commentary.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + getKey() },
    body: JSON.stringify({
      model: getModel(),
      messages: [
        { role: "system", content: "You are an expert direct-response marketing copywriter. Be concise, specific, and on-brand." },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error (${res.status})`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return text.split(/\n-{2,}\n|\n?---\n?/).map((s) => s.trim()).filter(Boolean);
}

// ---------- Render ----------
function showLoading() {
  els.empty.hidden = true;
  els.results.innerHTML = `<div class="loading"><span></span><span></span><span></span></div>`;
}
function renderResults(items) {
  els.results.innerHTML = "";
  if (!items.length) {
    els.results.innerHTML = `<div class="empty"><p>No results — try a more specific description.</p></div>`;
    return;
  }
  items.forEach((text) => {
    const card = document.createElement("div");
    card.className = "result-card";
    const body = document.createElement("div");
    body.className = "result-card__text";
    body.textContent = text;
    const bar = document.createElement("div");
    bar.className = "result-card__bar";
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(text);
      btn.textContent = "✓ Copied";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1500);
    });
    bar.appendChild(btn);
    card.appendChild(body);
    card.appendChild(bar);
    els.results.appendChild(card);
  });
  els.clearBtn.hidden = false;
}

// ---------- Submit ----------
els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = els.topic.value.trim();
  if (!topic) {
    els.hint.textContent = "Please describe what you want to write first.";
    els.topic.focus();
    return;
  }
  const type = els.type.value;
  const tone = els.tone.value;
  const count = parseInt(els.count.value, 10);

  els.generateBtn.disabled = true;
  els.generateBtn.textContent = "Generating…";
  showLoading();

  try {
    let items;
    if (getKey()) {
      items = await generateLive(type, topic, tone, count);
    } else {
      await new Promise((r) => setTimeout(r, 600)); // small delay so the demo feels real
      items = generateDemo(type, topic, tone, count);
    }
    renderResults(items);
    els.hint.textContent = getKey() ? "Generated live with OpenAI." : "Generated in demo mode — add an API key for live GPT output.";
  } catch (err) {
    els.results.innerHTML = `<div class="empty"><p>⚠️ ${err.message}</p><p class="empty__sub">Check your API key in settings, or remove it to use demo mode.</p></div>`;
  } finally {
    els.generateBtn.disabled = false;
    els.generateBtn.textContent = "✨ Generate copy";
  }
});

els.clearBtn.addEventListener("click", () => {
  els.results.innerHTML = "";
  els.results.appendChild(els.empty);
  els.empty.hidden = false;
  els.clearBtn.hidden = true;
});

refreshMode();
