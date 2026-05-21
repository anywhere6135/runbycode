/* =====================================================================
 *  Fitness Tracker - Vanilla JS, LocalStorage only
 * ===================================================================== */

const STORAGE_KEY = 'fittrack.v1';

const DEFAULT_STATE = {
  exercises: [],
  workouts: [],
  currentWorkout: null,
  settings: { defaultRest: 90, unit: 'kg' },
};

const CATEGORIES = ['Maschine', 'Langhantel', 'Kurzhantel', 'Kabel', 'Körpergewicht', 'Cardio', 'Sonstiges'];

// ---------- Seed library (covers common gym equipment) ----------
const SEED_EXERCISES = [
  { name: 'Bench Press (Barbell)',        category: 'Langhantel' },
  { name: 'Incline Bench Press (Barbell)', category: 'Langhantel' },
  { name: 'Squat (Barbell)',              category: 'Langhantel' },
  { name: 'Deadlift (Barbell)',           category: 'Langhantel' },
  { name: 'Overhead Press (Barbell)',     category: 'Langhantel' },
  { name: 'Bent Over Row (Barbell)',      category: 'Langhantel' },
  { name: 'Bicep Curl (Dumbbell)',        category: 'Kurzhantel' },
  { name: 'Shoulder Press (Dumbbell)',    category: 'Kurzhantel' },
  { name: 'Lateral Raise (Dumbbell)',     category: 'Kurzhantel' },
  { name: 'Lat Pulldown (Cable)',         category: 'Kabel' },
  { name: 'Seated Row (Cable)',           category: 'Kabel' },
  { name: 'Triceps Pushdown (Cable)',     category: 'Kabel' },
  { name: 'Leg Press',                    category: 'Maschine' },
  { name: 'Leg Extension',                category: 'Maschine' },
  { name: 'Leg Curl',                     category: 'Maschine' },
  { name: 'Chest Press (Machine)',        category: 'Maschine' },
  { name: 'Pull Up',                      category: 'Körpergewicht' },
  { name: 'Dip',                          category: 'Körpergewicht' },
  { name: 'Plank',                        category: 'Körpergewicht' },
  { name: 'Running (Treadmill)',          category: 'Cardio' },
];

/* =====================================================================
 *  Storage
 * ===================================================================== */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) } };
  } catch (e) {
    console.warn('State corrupt, reseeding', e);
    return seedState();
  }
}

function seedState() {
  const s = structuredClone(DEFAULT_STATE);
  s.exercises = SEED_EXERCISES.map((e) => ({ id: uid(), ...e, defaultRest: 90 }));
  return s;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

/* =====================================================================
 *  Utils
 * ===================================================================== */

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function fmtDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function fmtDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const time = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  if (sameDay(d, today)) return `Heute, ${time}`;
  if (sameDay(d, yest))  return `Gestern, ${time}`;
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) + `, ${time}`;
}

function toast(msg, type = '') {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function getExerciseById(id) { return state.exercises.find((e) => e.id === id); }

function findExerciseByName(name) {
  const n = name.trim().toLowerCase();
  return state.exercises.find((e) => e.name.toLowerCase() === n);
}

/* =====================================================================
 *  Tabs
 * ===================================================================== */

$$('#tabbar button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    $$('#tabbar button').forEach((b) => b.classList.toggle('active', b === btn));
    $$('#app .tab').forEach((t) => t.classList.toggle('hidden', t.dataset.tab !== target));
    if (target === 'history') renderHistory();
    if (target === 'exercises') renderExerciseLibrary();
    if (target === 'settings') renderSettings();
  });
});

/* =====================================================================
 *  Workout tab
 * ===================================================================== */

let durationTimer = null;

function renderWorkout() {
  const cw = state.currentWorkout;
  $('#workout-empty').classList.toggle('hidden', !!cw);
  $('#workout-active').classList.toggle('hidden', !cw);
  $('#finish-workout-btn').classList.toggle('hidden', !cw);
  $('#cancel-workout-btn').classList.toggle('hidden', !cw);

  if (!cw) {
    if (durationTimer) { clearInterval(durationTimer); durationTimer = null; }
    return;
  }

  $('#workout-name-input').value = cw.name || '';
  $('#workout-notes-input').value = cw.notes || '';

  if (!durationTimer) {
    const tick = () => {
      $('#workout-duration').textContent = fmtDuration(Date.now() - cw.startedAt);
    };
    tick();
    durationTimer = setInterval(tick, 1000);
  }

  renderExerciseBlocks();
}

function renderExerciseBlocks() {
  const root = $('#exercise-list');
  root.innerHTML = '';
  const cw = state.currentWorkout;
  if (!cw) return;

  cw.exercises.forEach((ex, exIdx) => {
    const tpl = $('#tpl-exercise-block').content.cloneNode(true);
    const block = tpl.querySelector('.exercise-block');
    const exerciseDef = getExerciseById(ex.exerciseId);
    block.dataset.exerciseId = ex.exerciseId;
    block.querySelector('.exercise-block-title').textContent = exerciseDef?.name || '(unbekannt)';
    block.querySelector('.exercise-block-cat').textContent = exerciseDef?.category || '';

    const rows = block.querySelector('.set-rows');
    const lastSets = getLastSetsForExercise(ex.exerciseId, cw.id);

    ex.sets.forEach((set, setIdx) => {
      const rowTpl = $('#tpl-set-row').content.cloneNode(true);
      const row = rowTpl.querySelector('.set-row');
      row.querySelector('.set-index').textContent = setIdx + 1;
      const prev = lastSets[setIdx];
      row.querySelector('.set-prev').textContent = prev ? `${prev.weight}×${prev.reps}` : '—';

      const wInput = row.querySelector('.set-weight');
      const rInput = row.querySelector('.set-reps');
      wInput.value = set.weight ?? '';
      rInput.value = set.reps ?? '';
      wInput.addEventListener('input', () => { set.weight = parseFloat(wInput.value) || 0; saveState(); });
      rInput.addEventListener('input', () => { set.reps = parseInt(rInput.value, 10) || 0; saveState(); });

      const doneBtn = row.querySelector('.set-done');
      const updateDone = () => {
        doneBtn.textContent = set.done ? '✓' : '○';
        doneBtn.classList.toggle('done', !!set.done);
        row.classList.toggle('done', !!set.done);
      };
      updateDone();
      doneBtn.addEventListener('click', () => {
        // Use the previous set's values as fallback when no weight/reps entered
        if (!set.done && !set.weight && prev) set.weight = prev.weight;
        if (!set.done && !set.reps && prev) set.reps = prev.reps;
        wInput.value = set.weight ?? '';
        rInput.value = set.reps ?? '';
        set.done = !set.done;
        updateDone();
        saveState();
        if (set.done) startRestTimer(exerciseDef?.defaultRest || state.settings.defaultRest);
      });

      rows.appendChild(row);
    });

    block.querySelector('.add-set-btn').addEventListener('click', () => {
      ex.sets.push({ weight: 0, reps: 0, done: false });
      saveState();
      renderExerciseBlocks();
    });

    block.querySelector('.exercise-menu-btn').addEventListener('click', () => {
      openExerciseMenu(exIdx);
    });

    root.appendChild(block);
  });
}

function openExerciseMenu(exIdx) {
  const cw = state.currentWorkout;
  const ex = cw.exercises[exIdx];
  const exerciseDef = getExerciseById(ex.exerciseId);
  openModal({
    title: exerciseDef?.name || 'Übung',
    body: () => {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <button class="btn btn-block" data-act="remove-last">Letzten Set entfernen</button>
        <button class="btn btn-danger btn-block" data-act="remove-exercise">Übung entfernen</button>
      `;
      wrap.querySelector('[data-act="remove-last"]').addEventListener('click', () => {
        if (ex.sets.length > 0) { ex.sets.pop(); saveState(); renderExerciseBlocks(); }
        closeModal();
      });
      wrap.querySelector('[data-act="remove-exercise"]').addEventListener('click', () => {
        cw.exercises.splice(exIdx, 1);
        saveState();
        renderExerciseBlocks();
        closeModal();
      });
      return wrap;
    },
    actions: [{ label: 'Schließen', onClick: closeModal }],
  });
}

function getLastSetsForExercise(exerciseId, excludeWorkoutId = null) {
  // Search history for most recent workout that contains this exercise
  for (let i = state.workouts.length - 1; i >= 0; i--) {
    const w = state.workouts[i];
    if (excludeWorkoutId && w.id === excludeWorkoutId) continue;
    const ex = w.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) return ex.sets;
  }
  return [];
}

$('#start-workout-btn').addEventListener('click', startNewWorkout);

function startNewWorkout() {
  state.currentWorkout = {
    id: uid(),
    name: '',
    startedAt: Date.now(),
    endedAt: null,
    notes: '',
    exercises: [],
  };
  saveState();
  renderWorkout();
}

$('#workout-name-input').addEventListener('input', (e) => {
  if (state.currentWorkout) { state.currentWorkout.name = e.target.value; saveState(); }
});
$('#workout-notes-input').addEventListener('input', (e) => {
  if (state.currentWorkout) { state.currentWorkout.notes = e.target.value; saveState(); }
});

$('#add-exercise-btn').addEventListener('click', () => {
  openExercisePicker((exercise) => {
    state.currentWorkout.exercises.push({
      exerciseId: exercise.id,
      sets: [{ weight: 0, reps: 0, done: false }],
    });
    saveState();
    renderExerciseBlocks();
    closeModal();
  });
});

$('#finish-workout-btn').addEventListener('click', finishWorkout);
$('#cancel-workout-btn').addEventListener('click', () => {
  if (!confirm('Workout abbrechen? Alle Eingaben dieses Workouts gehen verloren.')) return;
  state.currentWorkout = null;
  saveState();
  renderWorkout();
});

function finishWorkout() {
  const cw = state.currentWorkout;
  if (!cw) return;
  if (cw.exercises.length === 0) {
    if (!confirm('Workout enthält keine Übungen. Trotzdem speichern?')) return;
  }
  cw.endedAt = Date.now();
  state.workouts.push(cw);
  state.currentWorkout = null;
  stopRestTimer();
  saveState();
  renderWorkout();
  toast('Workout gespeichert', 'success');
  // Switch to history view
  $('#tabbar button[data-target="history"]').click();
}

/* =====================================================================
 *  Exercise picker (modal)
 * ===================================================================== */

function openExercisePicker(onPick) {
  let query = '';
  const render = () => {
    const list = body.querySelector('.picker-list');
    list.innerHTML = '';
    const filtered = state.exercises
      .filter((e) => !query || e.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length === 0) {
      list.innerHTML = `
        <p class="muted small center" style="padding:1rem;">Keine Übung gefunden.</p>
        <button class="btn btn-primary btn-block" id="picker-create">"${escapeHtml(query)}" anlegen</button>`;
      const createBtn = list.querySelector('#picker-create');
      if (createBtn) {
        createBtn.addEventListener('click', () => {
          openExerciseEditor({ name: query }, (created) => onPick(created));
        });
      }
      return;
    }

    filtered.forEach((ex) => {
      const item = document.createElement('div');
      item.className = 'picker-item';
      item.innerHTML = `<div class="name"></div><div class="cat"></div>`;
      item.querySelector('.name').textContent = ex.name;
      item.querySelector('.cat').textContent = ex.category || '';
      item.addEventListener('click', () => onPick(ex));
      list.appendChild(item);
    });
  };

  const body = document.createElement('div');
  body.innerHTML = `
    <input type="search" class="picker-search" placeholder="Suchen oder Name eintippen..." autofocus />
    <div class="picker-list"></div>
    <button class="btn btn-secondary btn-block" id="picker-new-blank">+ Neue Übung anlegen</button>
  `;
  body.querySelector('.picker-search').addEventListener('input', (e) => {
    query = e.target.value;
    render();
  });
  body.querySelector('#picker-new-blank').addEventListener('click', () => {
    openExerciseEditor({ name: query }, (created) => onPick(created));
  });

  openModal({
    title: 'Übung wählen',
    body: () => body,
    actions: [{ label: 'Abbrechen', onClick: closeModal, ghost: true }],
  });
  render();
}

/* =====================================================================
 *  Exercise editor (create/edit)
 * ===================================================================== */

function openExerciseEditor(seed, onSaved) {
  const isEdit = !!seed.id;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <label>Name</label>
    <input type="text" id="ed-name" />
    <label>Kategorie</label>
    <select id="ed-category">
      ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
    </select>
    <label>Standard-Ruhezeit (Sek.)</label>
    <input type="number" id="ed-rest" min="0" step="5" />
    <label>Notizen</label>
    <textarea id="ed-notes" rows="2"></textarea>
  `;
  wrap.querySelector('#ed-name').value = seed.name || '';
  wrap.querySelector('#ed-category').value = seed.category || 'Sonstiges';
  wrap.querySelector('#ed-rest').value = seed.defaultRest ?? state.settings.defaultRest;
  wrap.querySelector('#ed-notes').value = seed.notes || '';

  openModal({
    title: isEdit ? 'Übung bearbeiten' : 'Neue Übung',
    body: () => wrap,
    actions: [
      { label: 'Abbrechen', onClick: closeModal, ghost: true },
      { label: 'Speichern', primary: true, onClick: () => {
        const name = wrap.querySelector('#ed-name').value.trim();
        if (!name) { toast('Name fehlt', 'error'); return; }
        const dup = state.exercises.find((e) => e.name.toLowerCase() === name.toLowerCase() && e.id !== seed.id);
        if (dup) { toast('Übung existiert bereits', 'error'); return; }
        const data = {
          name,
          category: wrap.querySelector('#ed-category').value,
          defaultRest: parseInt(wrap.querySelector('#ed-rest').value, 10) || 0,
          notes: wrap.querySelector('#ed-notes').value.trim(),
        };
        let saved;
        if (isEdit) {
          const ex = getExerciseById(seed.id);
          Object.assign(ex, data);
          saved = ex;
        } else {
          saved = { id: uid(), ...data };
          state.exercises.push(saved);
        }
        saveState();
        closeModal();
        toast('Gespeichert', 'success');
        if (onSaved) onSaved(saved);
      } },
    ],
  });
}

/* =====================================================================
 *  Exercise library tab
 * ===================================================================== */

$('#new-exercise-btn').addEventListener('click', () => {
  openExerciseEditor({}, () => renderExerciseLibrary());
});

$('#exercise-search').addEventListener('input', renderExerciseLibrary);

function renderExerciseLibrary() {
  const root = $('#exercise-library');
  const query = $('#exercise-search').value.toLowerCase();
  root.innerHTML = '';
  const items = state.exercises
    .filter((e) => !query || e.name.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (items.length === 0) {
    root.innerHTML = `<p class="muted small center">Keine Übung gefunden.</p>`;
    return;
  }
  items.forEach((ex) => {
    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.innerHTML = `<div><div class="name"></div><div class="cat"></div></div><span class="muted">›</span>`;
    row.querySelector('.name').textContent = ex.name;
    row.querySelector('.cat').textContent = ex.category || '';
    row.addEventListener('click', () => {
      openExerciseEditor(ex, () => renderExerciseLibrary());
    });
    root.appendChild(row);
  });
}

/* =====================================================================
 *  History tab
 * ===================================================================== */

function renderHistory() {
  const root = $('#history-list');
  root.innerHTML = '';
  const list = [...state.workouts].sort((a, b) => b.startedAt - a.startedAt);
  $('#history-empty').classList.toggle('hidden', list.length > 0);
  list.forEach((w) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const totalSets = w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0), 0);
    const duration = w.endedAt ? fmtDuration(w.endedAt - w.startedAt) : '—';
    card.innerHTML = `
      <div class="history-card-head">
        <h3></h3>
        <span class="history-card-meta"></span>
      </div>
      <div class="history-card-meta meta-detail"></div>
      <div class="history-card-summary"></div>
    `;
    card.querySelector('h3').textContent = w.name || 'Workout';
    card.querySelector('.history-card-head .history-card-meta').textContent = fmtDate(w.startedAt);
    card.querySelector('.meta-detail').textContent = `${duration} · ${w.exercises.length} Übungen · ${totalSets} Sets · ${Math.round(totalVolume)} ${state.settings.unit} Volumen`;
    card.querySelector('.history-card-summary').textContent = w.exercises
      .map((ex) => getExerciseById(ex.exerciseId)?.name || '?')
      .join(', ');
    card.addEventListener('click', () => openWorkoutDetail(w));
    root.appendChild(card);
  });
}

function openWorkoutDetail(w) {
  const wrap = document.createElement('div');
  let html = '';
  w.exercises.forEach((ex) => {
    const def = getExerciseById(ex.exerciseId);
    html += `<h3 style="margin-top:1rem;color:var(--primary);">${escapeHtml(def?.name || '?')}</h3>`;
    html += `<table class="set-table"><thead><tr><th>Set</th><th>kg</th><th>Wdh</th></tr></thead><tbody>`;
    ex.sets.forEach((set, i) => {
      html += `<tr><td>${i + 1}</td><td>${set.weight ?? '-'}</td><td>${set.reps ?? '-'}</td></tr>`;
    });
    html += `</tbody></table>`;
  });
  if (w.notes) html += `<p class="muted small" style="margin-top:1rem;">${escapeHtml(w.notes)}</p>`;
  wrap.innerHTML = html;

  openModal({
    title: w.name || 'Workout',
    body: () => wrap,
    actions: [
      { label: 'Löschen', danger: true, onClick: () => {
        if (!confirm('Workout endgültig löschen?')) return;
        state.workouts = state.workouts.filter((x) => x.id !== w.id);
        saveState();
        closeModal();
        renderHistory();
        toast('Gelöscht');
      } },
      { label: 'Schließen', onClick: closeModal },
    ],
  });
}

/* =====================================================================
 *  Settings tab
 * ===================================================================== */

function renderSettings() {
  $('#default-rest-input').value = state.settings.defaultRest;
  $$('input[name="unit"]').forEach((r) => { r.checked = r.value === state.settings.unit; });
}

$('#default-rest-input').addEventListener('change', (e) => {
  state.settings.defaultRest = parseInt(e.target.value, 10) || 0;
  saveState();
});
$$('input[name="unit"]').forEach((r) => {
  r.addEventListener('change', () => {
    state.settings.unit = r.value;
    saveState();
  });
});

$('#export-json-btn').addEventListener('click', () => {
  downloadBlob('fittrack-backup.json', JSON.stringify(state, null, 2), 'application/json');
});

$('#json-file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const txt = await file.text();
    const parsed = JSON.parse(txt);
    if (!parsed.exercises || !parsed.workouts) throw new Error('Format unbekannt');
    if (!confirm('Aktuelle Daten überschreiben?')) return;
    state = { ...DEFAULT_STATE, ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) } };
    saveState();
    toast('Import erfolgreich', 'success');
    renderWorkout(); renderHistory(); renderExerciseLibrary(); renderSettings();
  } catch (err) {
    toast('Import fehlgeschlagen: ' + err.message, 'error');
  }
  e.target.value = '';
});

$('#wipe-data-btn').addEventListener('click', () => {
  if (!confirm('Wirklich ALLE Daten löschen? Das kann nicht rückgängig gemacht werden.')) return;
  if (!confirm('Sicher? Letzte Warnung.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  saveState();
  toast('Alle Daten gelöscht');
  renderWorkout(); renderHistory(); renderExerciseLibrary(); renderSettings();
});

$('#export-csv-btn').addEventListener('click', exportStrongCSV);

/* =====================================================================
 *  CSV Import (Strong format)
 *  Strong columns vary slightly across versions. Common headers:
 *    Date, Workout Name, Duration, Exercise Name, Set Order,
 *    Weight, Reps, Distance, Seconds, Notes, Workout Notes, RPE
 * ===================================================================== */

$('#csv-file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  handleCsvImport(text);
  e.target.value = '';
});

$('#import-paste-btn').addEventListener('click', () => {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <p class="muted small">Strong-CSV-Inhalt einfügen (mit Header-Zeile):</p>
    <textarea id="paste-csv" rows="10" placeholder="Date,Workout Name,..."></textarea>
  `;
  openModal({
    title: 'CSV einfügen',
    body: () => wrap,
    actions: [
      { label: 'Abbrechen', ghost: true, onClick: closeModal },
      { label: 'Import', primary: true, onClick: () => {
        const text = wrap.querySelector('#paste-csv').value;
        if (!text.trim()) { toast('Leerer Inhalt', 'error'); return; }
        closeModal();
        handleCsvImport(text);
      } },
    ],
  });
});

/** Robust CSV parser supporting quoted fields with embedded commas/quotes. */
function parseCSV(text) {
  const rows = [];
  let cur = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { cur.push(field); field = ''; }
      else if (ch === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
      else if (ch === '\r') { /* skip */ }
      else field += ch;
    }
  }
  if (field !== '' || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ''));
}

/** Normalize a header for matching. */
function normH(s) { return (s || '').toLowerCase().replace(/[\s_\-]/g, ''); }

function handleCsvImport(text) {
  let rows;
  try { rows = parseCSV(text); }
  catch (e) { toast('CSV parse error: ' + e.message, 'error'); return; }
  if (rows.length < 2) { toast('CSV enthält keine Daten', 'error'); return; }

  const header = rows[0].map(normH);
  // Strong-typical column aliases
  const idx = {
    date:       header.findIndex((h) => h === 'date' || h === 'starttime' || h === 'startdate' || h === 'datum'),
    workout:    header.findIndex((h) => h === 'workoutname' || h === 'workout'),
    duration:   header.findIndex((h) => h === 'duration' || h === 'workoutduration'),
    exercise:   header.findIndex((h) => h === 'exercisename' || h === 'exercise'),
    setOrder:   header.findIndex((h) => h === 'setorder' || h === 'set' || h === 'setindex'),
    weight:     header.findIndex((h) => h === 'weight' || h === 'weightkg' || h === 'weightlb' || h === 'gewicht'),
    reps:       header.findIndex((h) => h === 'reps' || h === 'wiederholungen'),
    rpe:        header.findIndex((h) => h === 'rpe'),
    seconds:    header.findIndex((h) => h === 'seconds' || h === 'durationseconds'),
    distance:   header.findIndex((h) => h === 'distance' || h === 'distancekm' || h === 'distancemi'),
    notes:      header.findIndex((h) => h === 'notes' || h === 'exercisenotes'),
    wnotes:     header.findIndex((h) => h === 'workoutnotes'),
  };

  if (idx.date < 0 || idx.exercise < 0) {
    toast('Pflichtspalten fehlen (Date, Exercise Name)', 'error');
    return;
  }

  // Group rows by (date + workout name) → workout, then by exercise → exercise
  const grouped = new Map();
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const date     = (row[idx.date] || '').trim();
    if (!date) continue;
    const workout  = idx.workout  >= 0 ? (row[idx.workout] || '').trim()  : '';
    const exercise = (row[idx.exercise] || '').trim();
    if (!exercise) continue;
    const weight   = idx.weight   >= 0 ? parseFloat(row[idx.weight])  : 0;
    const reps     = idx.reps     >= 0 ? parseInt(row[idx.reps], 10)  : 0;
    const rpe      = idx.rpe      >= 0 ? parseFloat(row[idx.rpe])     : null;
    const setOrder = idx.setOrder >= 0 ? row[idx.setOrder]              : null;
    const notes    = idx.notes    >= 0 ? (row[idx.notes] || '').trim() : '';
    const wnotes   = idx.wnotes   >= 0 ? (row[idx.wnotes] || '').trim() : '';
    const duration = idx.duration >= 0 ? (row[idx.duration] || '').trim() : '';

    const key = date + '|' + workout;
    if (!grouped.has(key)) grouped.set(key, { date, name: workout, duration, notes: wnotes, exMap: new Map() });
    const w = grouped.get(key);
    if (!w.exMap.has(exercise)) w.exMap.set(exercise, { name: exercise, notes, sets: [] });
    w.exMap.get(exercise).sets.push({ weight: isNaN(weight) ? 0 : weight, reps: isNaN(reps) ? 0 : reps, rpe, setOrder });
  }

  if (grouped.size === 0) { toast('Keine importierbaren Zeilen', 'error'); return; }

  // Collect unique exercises in the import
  const uniqueNames = new Set();
  grouped.forEach((w) => w.exMap.forEach((ex) => uniqueNames.add(ex.name)));
  const exerciseStatus = [...uniqueNames].map((n) => ({
    name: n,
    existing: findExerciseByName(n),
  }));

  showImportPreview(grouped, exerciseStatus);
}

function showImportPreview(grouped, exerciseStatus) {
  const wrap = document.createElement('div');
  const summary = `${grouped.size} Workouts · ${exerciseStatus.length} verschiedene Übungen`;
  wrap.innerHTML = `<p>${summary}</p><div class="picker-list" id="imp-rows"></div>`;
  const rowsRoot = wrap.querySelector('#imp-rows');

  // For each unique exercise: either show "known" or let the user map / create
  exerciseStatus.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'import-row';
    if (entry.existing) {
      row.innerHTML = `
        <div class="import-row-head">
          <span class="name"></span>
          <span class="status known">Bekannt</span>
        </div>`;
      row.querySelector('.name').textContent = entry.name;
    } else {
      row.innerHTML = `
        <div class="import-row-head">
          <span class="name"></span>
          <span class="status unknown">Neu</span>
        </div>
        <select class="map-select"></select>
      `;
      row.querySelector('.name').textContent = entry.name;
      const select = row.querySelector('.map-select');
      const opts = [
        `<option value="__create__">+ Als neue Übung anlegen</option>`,
        ...state.exercises
          .slice().sort((a, b) => a.name.localeCompare(b.name))
          .map((e) => `<option value="${e.id}">→ ${escapeHtml(e.name)}</option>`),
      ];
      select.innerHTML = opts.join('');
      select.addEventListener('change', () => {
        entry.mapping = select.value;
      });
      entry.mapping = '__create__';
    }
    rowsRoot.appendChild(row);
  });

  openModal({
    title: 'CSV-Import — Vorschau',
    body: () => wrap,
    actions: [
      { label: 'Abbrechen', ghost: true, onClick: closeModal },
      { label: 'Importieren', primary: true, onClick: () => {
        commitImport(grouped, exerciseStatus);
        closeModal();
      } },
    ],
  });
}

function commitImport(grouped, exerciseStatus) {
  // Build name → exerciseId map
  const nameToId = new Map();
  exerciseStatus.forEach((entry) => {
    if (entry.existing) {
      nameToId.set(entry.name, entry.existing.id);
    } else if (entry.mapping && entry.mapping !== '__create__') {
      nameToId.set(entry.name, entry.mapping);
    } else {
      const created = { id: uid(), name: entry.name, category: 'Sonstiges', defaultRest: state.settings.defaultRest };
      state.exercises.push(created);
      nameToId.set(entry.name, created.id);
    }
  });

  let importedCount = 0;
  grouped.forEach((w) => {
    const startedAt = parseStrongDate(w.date);
    const durationMs = parseStrongDuration(w.duration);
    const workout = {
      id: uid(),
      name: w.name,
      startedAt,
      endedAt: durationMs ? startedAt + durationMs : startedAt,
      notes: w.notes,
      exercises: [],
      imported: true,
    };
    w.exMap.forEach((ex) => {
      // Sort sets by setOrder if numeric
      ex.sets.sort((a, b) => {
        const an = parseInt(a.setOrder, 10);
        const bn = parseInt(b.setOrder, 10);
        if (isNaN(an) || isNaN(bn)) return 0;
        return an - bn;
      });
      workout.exercises.push({
        exerciseId: nameToId.get(ex.name),
        notes: ex.notes,
        sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, rpe: s.rpe, done: true })),
      });
    });
    state.workouts.push(workout);
    importedCount++;
  });

  // Sort workouts by date
  state.workouts.sort((a, b) => a.startedAt - b.startedAt);
  saveState();
  toast(`${importedCount} Workout${importedCount === 1 ? '' : 's'} importiert`, 'success');
  renderExerciseLibrary();
  renderHistory();
}

function parseStrongDate(s) {
  // Strong uses formats like "2023-01-15 10:30:00" or ISO
  const t = Date.parse(s);
  if (!isNaN(t)) return t;
  // Fallback: try "DD.MM.YYYY"
  const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (m) {
    const yr = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
    return new Date(yr, parseInt(m[2], 10) - 1, parseInt(m[1], 10)).getTime();
  }
  return Date.now();
}

function parseStrongDuration(s) {
  if (!s) return 0;
  // Examples: "45m", "1h 5m", "1:05:00", "3600"
  if (/^\d+$/.test(s)) return parseInt(s, 10) * 1000;
  const colon = s.match(/^(\d+):(\d+)(?::(\d+))?$/);
  if (colon) {
    const a = parseInt(colon[1], 10), b = parseInt(colon[2], 10), c = parseInt(colon[3] || '0', 10);
    return ((a * 60 + b) * 60 + c) * 1000;
  }
  let ms = 0;
  const h = s.match(/(\d+)\s*h/i); if (h) ms += parseInt(h[1], 10) * 3600 * 1000;
  const m = s.match(/(\d+)\s*m(?!s)/i); if (m) ms += parseInt(m[1], 10) * 60 * 1000;
  const sec = s.match(/(\d+)\s*s/i); if (sec) ms += parseInt(sec[1], 10) * 1000;
  return ms;
}

/* =====================================================================
 *  CSV Export (Strong-compatible)
 * ===================================================================== */

function exportStrongCSV() {
  if (state.workouts.length === 0) { toast('Keine Workouts zum Export', 'error'); return; }
  const header = ['Date','Workout Name','Duration','Exercise Name','Set Order','Weight','Reps','Distance','Seconds','Notes','Workout Notes','RPE'];
  const lines = [header.join(',')];
  const pad = (n) => String(n).padStart(2, '0');
  const toCSVField = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  state.workouts
    .slice().sort((a, b) => a.startedAt - b.startedAt)
    .forEach((w) => {
      const d = new Date(w.startedAt);
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      const dur = w.endedAt ? `${Math.round((w.endedAt - w.startedAt)/60000)}m` : '';
      w.exercises.forEach((ex) => {
        const def = getExerciseById(ex.exerciseId);
        ex.sets.forEach((set, i) => {
          lines.push([
            toCSVField(dateStr),
            toCSVField(w.name),
            toCSVField(dur),
            toCSVField(def?.name || ''),
            toCSVField(i + 1),
            toCSVField(set.weight ?? 0),
            toCSVField(set.reps ?? 0),
            '', // Distance
            '', // Seconds
            toCSVField(ex.notes || ''),
            toCSVField(w.notes || ''),
            toCSVField(set.rpe ?? ''),
          ].join(','));
        });
      });
    });
  downloadBlob('fittrack-export.csv', lines.join('\n'), 'text/csv');
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* =====================================================================
 *  Rest timer
 * ===================================================================== */

let restEnd = 0;
let restDuration = 0;
let restInterval = null;

function startRestTimer(seconds) {
  if (!seconds || seconds <= 0) return;
  restDuration = seconds;
  restEnd = Date.now() + seconds * 1000;
  $('#rest-timer').classList.remove('hidden');
  $('#rest-bar-fill').style.transition = 'none';
  $('#rest-bar-fill').style.width = '100%';
  requestAnimationFrame(() => {
    $('#rest-bar-fill').style.transition = `width ${seconds}s linear`;
    $('#rest-bar-fill').style.width = '0%';
  });
  if (restInterval) clearInterval(restInterval);
  const tick = () => {
    const left = Math.max(0, Math.ceil((restEnd - Date.now()) / 1000));
    $('#rest-countdown').textContent = left;
    if (left <= 0) {
      stopRestTimer();
      notifyRestDone();
    }
  };
  tick();
  restInterval = setInterval(tick, 250);
}

function stopRestTimer() {
  if (restInterval) { clearInterval(restInterval); restInterval = null; }
  $('#rest-timer').classList.add('hidden');
}

function notifyRestDone() {
  try {
    // Short beep using WebAudio
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch {}
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  toast('Pause vorbei 💪');
}

$('#rest-plus').addEventListener('click', () => { restEnd += 15000; });
$('#rest-minus').addEventListener('click', () => { restEnd -= 15000; });
$('#rest-skip').addEventListener('click', stopRestTimer);

/* =====================================================================
 *  Modal
 * ===================================================================== */

function openModal({ title, body, actions = [] }) {
  closeModal();
  const root = $('#modal-root');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-head"><h2></h2><button class="btn btn-ghost icon-btn" data-close>✕</button></div>
      <div class="modal-body"></div>
      <div class="modal-foot"></div>
    </div>
  `;
  backdrop.querySelector('h2').textContent = title;
  const bodyEl = body();
  backdrop.querySelector('.modal-body').appendChild(bodyEl);
  const foot = backdrop.querySelector('.modal-foot');
  actions.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (a.primary ? 'btn-primary' : a.danger ? 'btn-danger' : a.ghost ? 'btn-ghost' : '');
    btn.textContent = a.label;
    btn.addEventListener('click', a.onClick);
    foot.appendChild(btn);
  });
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  backdrop.querySelector('[data-close]').addEventListener('click', closeModal);
  root.appendChild(backdrop);
}

function closeModal() {
  $('#modal-root').innerHTML = '';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =====================================================================
 *  Boot
 * ===================================================================== */

renderWorkout();
renderSettings();

// Save state before unload (safety net)
window.addEventListener('beforeunload', saveState);
