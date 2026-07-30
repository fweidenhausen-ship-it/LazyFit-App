import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User, Dumbbell, Play, Pause, History, ChevronRight, ChevronLeft, Check, X,
  Plus, Minus, Sparkles, Clock, Flame, SkipForward, RotateCcw, ArrowLeft, Mic, GlassWater, Heart
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const INK = "#15140F";
const PANEL = "#211F19";
const PANEL2 = "#2A2820";
const CHALK = "#EDE8DD";
const CHALK_DIM = "#9C9686";
const HAZARD = "#E8B92E";
const RUST = "#C1432A";
const STEEL = "#514E44";
const SPUD = "#C89B6B";
const SPUD_DARK = "#9C7148";

const DISPLAY_FONT = "'Oswald', sans-serif";
const BODY_FONT = "'Inter', sans-serif";
const MONO_FONT = "'JetBrains Mono', monospace";

/* ---------------------------------------------------------
   MASCOT — Coach Potato: a spud with arms, legs, a headband,
   sneakers, and a wink. Doubles as the app icon artwork.
--------------------------------------------------------- */
function PotatoMascot({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* legs, mid-stride */}
      <line x1="26" y1="52" x2="18" y2="62" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" />
      <line x1="36" y1="52" x2="46" y2="60" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="15" cy="63" rx="6" ry="3" fill={HAZARD} transform="rotate(8 15 63)" />
      <ellipse cx="48" cy="61" rx="6" ry="3" fill={HAZARD} transform="rotate(-20 48 61)" />
      {/* arms — one flexing up, one out to the side */}
      <path d="M20 32 Q8 28 10 18" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="17" r="4" fill={SPUD} />
      <line x1="44" y1="34" x2="55" y2="40" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="56" cy="41" r="4" fill={SPUD} />
      {/* potato body */}
      <ellipse cx="32" cy="34" rx="17" ry="21" fill={SPUD} stroke={SPUD_DARK} strokeWidth="1.5" />
      <ellipse cx="22" cy="44" rx="2" ry="1.3" fill={SPUD_DARK} opacity="0.6" />
      <ellipse cx="40" cy="40" rx="1.6" ry="1" fill={SPUD_DARK} opacity="0.6" />
      <ellipse cx="30" cy="48" rx="1.4" ry="1" fill={SPUD_DARK} opacity="0.5" />
      {/* headband */}
      <path d="M17 24 Q32 16 47 24 L47 20 Q32 12 17 20 Z" fill={HAZARD} />
      {/* winking face */}
      <circle cx="26" cy="30" r="1.8" fill={INK} />
      <path d="M36 30 Q38.5 28 41 30" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M25 37 Q32 41 39 36" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------------------------------
   STATIC DATA
--------------------------------------------------------- */
const EQUIPMENT_CATALOG = [
  { id: "kurzhantel", label: "Kurzhanteln", detail: true, unit: "kg / Hantel" },
  { id: "langhantel", label: "Langhantel", detail: true, unit: "kg max." },
  { id: "klimmzug", label: "Klimmzugstange", detail: false },
  { id: "kabelzug", label: "Kabelzug / Turm", detail: false },
  { id: "band", label: "Widerstandsbänder", detail: true, unit: "Stärken" },
  { id: "kettlebell", label: "Kettlebell", detail: true, unit: "kg" },
  { id: "bank", label: "Trainingsbank", detail: false },
  { id: "box", label: "Box / Kiste", detail: false },
  { id: "seil", label: "Springseil", detail: false },
  { id: "matte", label: "Bodenmatte", detail: false },
  { id: "maschine", label: "Fitnessmaschine", detail: true, unit: "welche?" },
  { id: "bodyweight", label: "Nur Körpergewicht", detail: false },
];

const FOCUS_CATALOG = [
  { id: "brust", label: "Brust" },
  { id: "ruecken", label: "Rücken" },
  { id: "beine", label: "Beine" },
  { id: "bauch", label: "Bauch" },
  { id: "schultern", label: "Schultern" },
  { id: "arme", label: "Arme" },
  { id: "cardio", label: "Cardio" },
  { id: "ganzkoerper", label: "Ganzkörper" },
];

const LEVELS = ["Einsteiger", "Fortgeschritten", "Erfahren"];
const GOALS = ["Muskelaufbau", "Fettabbau", "Ausdauer", "Kraft", "Beweglichkeit"];

// This is the app's full exercise library for the free/offline version — no AI needed.
const EXERCISE_DB = [
  // push
  { name: "Liegestütze", category: "push", equipment: ["bodyweight"], mode: "reps", sets: 3, reps: 12, restSeconds: 60, cue: "Körper gerade, Ellbogen nah am Körper." },
  { name: "Diamant-Liegestütze", category: "push", equipment: ["bodyweight"], mode: "reps", sets: 3, reps: 8, restSeconds: 60, cue: "Hände unter der Brust zusammen, Ellbogen eng." },
  { name: "Kurzhantel Bankdrücken", category: "push", equipment: ["kurzhantel", "bank"], mode: "reps", sets: 4, reps: 10, restSeconds: 75, cue: "Schulterblätter zusammenziehen, kontrolliert ablassen." },
  { name: "Langhantel Bankdrücken", category: "push", equipment: ["langhantel", "bank"], mode: "reps", sets: 4, reps: 8, restSeconds: 90, cue: "Griff schulterbreit, Stange zur Brust führen." },
  { name: "Schulterdrücken Kurzhantel", category: "push", equipment: ["kurzhantel"], mode: "reps", sets: 3, reps: 10, restSeconds: 60, cue: "Rumpf anspannen, nicht ins Hohlkreuz fallen." },
  { name: "Kabelzug Brustpresse", category: "push", equipment: ["kabelzug"], mode: "reps", sets: 3, reps: 12, restSeconds: 60, cue: "Arme langsam nach vorne führen, kontrolliert zurück." },
  { name: "Dips", category: "push", equipment: ["bank", "box"], mode: "reps", sets: 3, reps: 10, restSeconds: 75, cue: "Ellbogen zeigen nach hinten, Schultern tief halten." },
  { name: "Pike Push-ups", category: "push", equipment: ["bodyweight"], mode: "reps", sets: 3, reps: 8, restSeconds: 60, cue: "Po hoch, Kopf Richtung Boden zwischen den Händen." },
  // pull
  { name: "Klimmzüge", category: "pull", equipment: ["klimmzug"], mode: "reps", sets: 4, reps: 6, restSeconds: 90, cue: "Voller Bewegungsumfang, kein Schwung." },
  { name: "Australian Pull-ups", category: "pull", equipment: ["klimmzug"], mode: "reps", sets: 3, reps: 10, restSeconds: 60, cue: "Körper gerade, Brust zur Stange ziehen." },
  { name: "Band Rudern", category: "pull", equipment: ["band"], mode: "reps", sets: 3, reps: 15, restSeconds: 45, cue: "Ellbogen eng am Körper vorbeiziehen." },
  { name: "Kabelzug Rudern", category: "pull", equipment: ["kabelzug"], mode: "reps", sets: 3, reps: 12, restSeconds: 60, cue: "Rücken gerade, Schulterblätter zusammenziehen." },
  { name: "Langhantel Rudern", category: "pull", equipment: ["langhantel"], mode: "reps", sets: 4, reps: 10, restSeconds: 75, cue: "Oberkörper leicht vorgebeugt, Rücken neutral." },
  { name: "Bizeps Curls", category: "pull", equipment: ["kurzhantel"], mode: "reps", sets: 3, reps: 12, restSeconds: 45, cue: "Ellbogen fixiert, kein Schwung." },
  { name: "Kettlebell Rudern", category: "pull", equipment: ["kettlebell"], mode: "reps", sets: 3, reps: 12, restSeconds: 60, cue: "Rumpf stabil, Ellbogen am Körper vorbeiziehen." },
  // legs
  { name: "Kniebeugen", category: "legs", equipment: ["bodyweight"], mode: "reps", sets: 4, reps: 15, restSeconds: 60, cue: "Knie in Zehenrichtung, Ferse am Boden." },
  { name: "Langhantel Kniebeugen", category: "legs", equipment: ["langhantel"], mode: "reps", sets: 4, reps: 8, restSeconds: 90, cue: "Rücken gerade, Blick nach vorne." },
  { name: "Kettlebell Goblet Squat", category: "legs", equipment: ["kettlebell"], mode: "reps", sets: 4, reps: 12, restSeconds: 75, cue: "Ellbogen zwischen den Knien führen." },
  { name: "Ausfallschritte", category: "legs", equipment: ["bodyweight"], mode: "reps", sets: 3, reps: 12, restSeconds: 60, cue: "Oberkörper aufrecht, tief absenken." },
  { name: "Kurzhantel Ausfallschritte", category: "legs", equipment: ["kurzhantel"], mode: "reps", sets: 3, reps: 10, restSeconds: 75, cue: "Kontrolliert absenken, Knie nicht nach innen kippen." },
  { name: "Box Step-ups", category: "legs", equipment: ["box"], mode: "reps", sets: 3, reps: 12, restSeconds: 60, cue: "Ganze Fußfläche auf die Box, sauber hochdrücken." },
  { name: "Wadenheben", category: "legs", equipment: ["bodyweight"], mode: "reps", sets: 3, reps: 20, restSeconds: 30, cue: "Oben kurz halten, langsam ablassen." },
  { name: "Beinpresse Maschine", category: "legs", equipment: ["maschine"], mode: "reps", sets: 4, reps: 12, restSeconds: 75, cue: "Knie nicht komplett durchdrücken." },
  // core
  { name: "Plank", category: "core", equipment: ["bodyweight", "matte"], mode: "timed", sets: 3, durationSeconds: 40, restSeconds: 30, cue: "Becken nicht durchhängen lassen." },
  { name: "Seitlicher Unterarmstütz", category: "core", equipment: ["bodyweight", "matte"], mode: "timed", sets: 2, durationSeconds: 30, restSeconds: 20, cue: "Hüfte hochdrücken, Körper in einer Linie." },
  { name: "Russian Twists", category: "core", equipment: ["bodyweight", "kettlebell"], mode: "reps", sets: 3, reps: 20, restSeconds: 30, cue: "Füße leicht abheben für mehr Spannung." },
  { name: "Crunches", category: "core", equipment: ["bodyweight", "matte"], mode: "reps", sets: 3, reps: 20, restSeconds: 30, cue: "Nur die Schulterblätter vom Boden lösen." },
  { name: "Beinheben hängend", category: "core", equipment: ["klimmzug"], mode: "reps", sets: 3, reps: 10, restSeconds: 45, cue: "Becken leicht einrollen, kein Schwung." },
  { name: "Mountain Climbers", category: "core", equipment: ["bodyweight"], mode: "timed", sets: 3, durationSeconds: 30, restSeconds: 30, cue: "Hüfte stabil halten, zügiges Tempo." },
  // cardio
  { name: "Kettlebell Swings", category: "cardio", equipment: ["kettlebell"], mode: "reps", sets: 4, reps: 15, restSeconds: 45, cue: "Schwung aus der Hüfte, nicht den Armen." },
  { name: "Seilspringen", category: "cardio", equipment: ["seil"], mode: "timed", sets: 4, durationSeconds: 45, restSeconds: 30, cue: "Locker auf dem Vorfuß bleiben." },
  { name: "Burpees", category: "cardio", equipment: ["bodyweight"], mode: "reps", sets: 3, reps: 10, restSeconds: 60, cue: "Zügiges Tempo, saubere Landung." },
  { name: "Jumping Jacks", category: "cardio", equipment: ["bodyweight"], mode: "timed", sets: 3, durationSeconds: 40, restSeconds: 20, cue: "Arme und Beine gleichzeitig öffnen und schließen." },
  { name: "Box Jumps", category: "cardio", equipment: ["box"], mode: "reps", sets: 3, reps: 10, restSeconds: 60, cue: "Weich landen, Knie leicht gebeugt." },
  { name: "Hochknie-Lauf", category: "cardio", equipment: ["bodyweight"], mode: "timed", sets: 3, durationSeconds: 30, restSeconds: 20, cue: "Knie bis zur Hüfte hochziehen, zügiges Tempo." },
  // mobility
  { name: "Dehnung Hüftbeuger", category: "mobility", equipment: ["bodyweight", "matte"], mode: "timed", sets: 2, durationSeconds: 30, restSeconds: 15, cue: "Ruhig atmen, Becken leicht kippen." },
  { name: "Schulterkreisen", category: "mobility", equipment: ["bodyweight"], mode: "timed", sets: 2, durationSeconds: 30, restSeconds: 10, cue: "Große, langsame Kreise in beide Richtungen." },
  { name: "Katze-Kuh", category: "mobility", equipment: ["bodyweight", "matte"], mode: "timed", sets: 2, durationSeconds: 30, restSeconds: 10, cue: "Wirbelsäule abwechselnd runden und strecken." },
  { name: "Band Schulteröffner", category: "mobility", equipment: ["band"], mode: "timed", sets: 2, durationSeconds: 30, restSeconds: 15, cue: "Band vor dem Körper über den Kopf führen." },
];

// English search terms for matching against the free-exercise-db photo library below.
const EXERCISE_EN_NAMES = {
  "Liegestütze": "Pushups",
  "Diamant-Liegestütze": "Diamond Push Up",
  "Kurzhantel Bankdrücken": "Dumbbell Bench Press",
  "Langhantel Bankdrücken": "Barbell Bench Press",
  "Schulterdrücken Kurzhantel": "Dumbbell Shoulder Press",
  "Kabelzug Brustpresse": "Cable Chest Press",
  "Dips": "Dips",
  "Pike Push-ups": "Pike Push Up",
  "Klimmzüge": "Pull-ups",
  "Australian Pull-ups": "Inverted Row",
  "Band Rudern": "Band Row",
  "Kabelzug Rudern": "Seated Cable Row",
  "Langhantel Rudern": "Barbell Row",
  "Bizeps Curls": "Dumbbell Bicep Curl",
  "Kettlebell Rudern": "Kettlebell Row",
  "Kniebeugen": "Bodyweight Squat",
  "Langhantel Kniebeugen": "Barbell Squat",
  "Kettlebell Goblet Squat": "Goblet Squat",
  "Ausfallschritte": "Lunge",
  "Kurzhantel Ausfallschritte": "Dumbbell Lunge",
  "Box Step-ups": "Step-up",
  "Wadenheben": "Calf Raise",
  "Beinpresse Maschine": "Leg Press",
  "Plank": "Plank",
  "Seitlicher Unterarmstütz": "Side Plank",
  "Russian Twists": "Russian Twist",
  "Crunches": "Crunches",
  "Beinheben hängend": "Hanging Leg Raise",
  "Mountain Climbers": "Mountain Climbers",
  "Kettlebell Swings": "Kettlebell Swing",
  "Seilspringen": "Jump Rope",
  "Burpees": "Burpee",
  "Jumping Jacks": "Jumping Jacks",
  "Box Jumps": "Box Jump",
  "Hochknie-Lauf": "High Knees",
  "Dehnung Hüftbeuger": "Hip Flexor Stretch",
  "Schulterkreisen": "Shoulder Circles",
  "Katze-Kuh": "Cat Cow",
  "Band Schulteröffner": "Band Shoulder Stretch",
};

// Public-domain exercise photo library (Unlicense — free for any use, incl. commercial).
// https://github.com/yuhonas/free-exercise-db
const EXDB_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const EXDB_IMG_PREFIX = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const EXDB_CACHE_KEY = "lazyfit:exdb_photo_index_v1";

async function loadExercisePhotoIndex() {
  try {
    const cached = window.localStorage.getItem(EXDB_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch { /* ignore, fall through to network */ }
  try {
    const res = await fetch(EXDB_URL);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    const index = {};
    data.forEach(ex => {
      if (ex.name && ex.images && ex.images.length) {
        index[ex.name.toLowerCase()] = ex.images.map(p => EXDB_IMG_PREFIX + p);
      }
    });
    try { window.localStorage.setItem(EXDB_CACHE_KEY, JSON.stringify(index)); } catch { /* ok, just skip caching */ }
    return index;
  } catch (e) {
    console.warn("Konnte Übungsfotos nicht laden, Skizzen werden als Rückfalloption genutzt.", e);
    return null;
  }
}

function lookupExercisePhotos(index, germanName) {
  if (!index) return null;
  const enName = EXERCISE_EN_NAMES[germanName] || germanName;
  const key = enName.toLowerCase();
  if (index[key]) return index[key];
  const fuzzyKey = Object.keys(index).find(k => k.includes(key) || key.includes(k));
  return fuzzyKey ? index[fuzzyKey] : null;
}

const CAT_MUSCLES = {
  push: "Brust, Trizeps, Schultern",
  pull: "Rücken, Bizeps",
  legs: "Beine, Gesäß",
  core: "Bauch, Rumpf",
  cardio: "Herz-Kreislauf, Ganzkörper",
  mobility: "Beweglichkeit, Faszien",
  plank: "Rumpf, Schultern",
  dip: "Trizeps, Brust, Schultern",
  lunge: "Beine, Gesäß",
};

const SKIP_REASONS = ["Zu hart", "Zu leicht", "Zu viele Wiederholungen", "Macht keinen Spaß"];

/* ---------------------------------------------------------
   ICONS — filled pictogram figures, crossfading between two
   clearly distinct poses (start / end of the movement).
--------------------------------------------------------- */

// Exercises whose name matches get a dedicated, more literal pose set instead of the broad category one.
const NAME_ICON_OVERRIDES = [
  { match: /plank|blank|unterarmst[üu]tz/i, key: "plank" },
  { match: /\bdips?\b/i, key: "dip" },
  { match: /ausfallschritt|lunge/i, key: "lunge" },
];
function resolveIconKey(name, cat) {
  const hit = NAME_ICON_OVERRIDES.find(o => o.match.test(name || ""));
  return hit ? hit.key : cat;
}

// Each pose: head [cx,cy] + limbs [x1,y1,x2,y2,strokeWidth] + joints [x,y] (accent dots).
const POSES = {
  push: {
    a: { head: [50, 24], limbs: [[42, 30, 20, 34, 7], [42, 30, 42, 44, 6], [20, 34, 10, 42, 6]], joints: [[42, 30], [20, 34]] },
    b: { head: [50, 31], limbs: [[42, 36, 20, 36, 7], [42, 36, 48, 42, 6], [20, 36, 10, 44, 6]], joints: [[42, 36], [20, 36]] },
  },
  pull: {
    bar: true,
    a: { head: [34, 26], limbs: [[34, 20, 34, 34, 7], [34, 20, 24, 8, 5], [34, 20, 44, 8, 5], [34, 34, 34, 46, 6]], joints: [[34, 20], [34, 34]] },
    b: { head: [34, 9], limbs: [[34, 13, 34, 29, 7], [34, 13, 24, 8, 5], [34, 13, 44, 8, 5], [34, 29, 34, 43, 6]], joints: [[34, 13], [34, 29]] },
  },
  legs: {
    a: { head: [32, 10], limbs: [[32, 16, 32, 30, 7], [32, 30, 24, 50, 6], [32, 30, 40, 50, 6]], joints: [[32, 16], [32, 30]] },
    b: { head: [32, 22], limbs: [[32, 26, 32, 38, 7], [32, 38, 19, 44, 6], [19, 44, 21, 52, 6], [32, 38, 45, 44, 6], [45, 44, 43, 52, 6]], joints: [[32, 26], [32, 38]] },
  },
  core: {
    a: { head: [14, 40], limbs: [[14, 40, 38, 40, 7], [38, 40, 44, 36, 6], [44, 36, 50, 40, 6]], joints: [[14, 40], [38, 40]] },
    b: { head: [22, 25], limbs: [[22, 25, 38, 40, 7], [38, 40, 44, 36, 6], [44, 36, 50, 40, 6]], joints: [[22, 25], [38, 40]] },
  },
  cardio: {
    a: { head: [32, 12], limbs: [[32, 18, 32, 34, 7], [32, 18, 26, 32, 5], [32, 18, 38, 32, 5], [32, 34, 28, 50, 6], [32, 34, 36, 50, 6]], joints: [[32, 18], [32, 34]] },
    b: { head: [32, 9], limbs: [[32, 15, 32, 31, 7], [32, 15, 15, 5, 5], [32, 15, 49, 5, 5], [32, 31, 13, 50, 6], [32, 31, 51, 50, 6]], joints: [[32, 15], [32, 31]] },
  },
  mobility: {
    a: { head: [32, 10], limbs: [[32, 16, 32, 32, 7], [32, 16, 24, 30, 5], [32, 16, 40, 30, 5], [32, 32, 26, 50, 6], [32, 32, 38, 50, 6]], joints: [[32, 16], [32, 32]] },
    b: { head: [41, 13], limbs: [[34, 18, 30, 32, 7], [34, 18, 51, 6, 5], [34, 18, 25, 27, 5], [30, 32, 25, 50, 6], [30, 32, 37, 50, 6]], joints: [[34, 18], [30, 32]] },
  },
  plank: {
    a: { head: [48, 20], limbs: [[43, 25, 14, 32, 7], [43, 25, 43, 50, 6], [14, 32, 14, 50, 6]], joints: [[43, 25], [14, 32]] },
    b: { head: [48, 21], limbs: [[43, 26, 14, 33, 7], [43, 26, 43, 50, 6], [14, 33, 14, 50, 6]], joints: [[43, 26], [14, 33]] },
  },
  // dips: fixed parallel bars, body moves up/down between them — clearly different from a push-up's horizontal body
  dip: {
    dipBars: true,
    a: { head: [32, 14], limbs: [[32, 22, 32, 34, 7], [32, 22, 20, 20, 5], [32, 22, 44, 20, 5], [32, 34, 28, 48, 6]], joints: [[32, 22], [32, 34]] },
    b: { head: [32, 24], limbs: [[32, 32, 32, 42, 7], [32, 32, 20, 20, 5], [32, 32, 44, 20, 5], [32, 42, 28, 54, 6]], joints: [[32, 32], [32, 42]] },
  },
  // lunge: split stance with a bent front leg and an extended back leg — distinct from the squat's symmetric bend
  lunge: {
    a: { head: [32, 10], limbs: [[32, 16, 32, 30, 7], [32, 30, 30, 50, 6], [32, 30, 34, 50, 6]], joints: [[32, 16], [32, 30]] },
    b: {
      head: [32, 20],
      limbs: [
        [32, 20, 32, 32, 7],
        [32, 32, 20, 38, 6], [20, 38, 18, 50, 6],
        [32, 32, 46, 44, 6], [46, 44, 48, 52, 5],
      ],
      joints: [[32, 20], [32, 32]],
    },
  },
};

function PoseParts({ pose }) {
  const [torso, ...limbs] = pose.limbs;
  return (
    <>
      {/* torso: thick filled capsule so the body reads as mass, not a wire */}
      {torso && (
        <line x1={torso[0]} y1={torso[1]} x2={torso[2]} y2={torso[3]} stroke={RUST} strokeWidth={(torso[4] || 7) + 4} strokeLinecap="round" />
      )}
      {/* limbs: chunky rounded strokes with a hand/foot blob at the tip */}
      {limbs.map(([x1, y1, x2, y2, w], i) => (
        <React.Fragment key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CHALK} strokeWidth={(w || 6) + 2} strokeLinecap="round" />
          <circle cx={x2} cy={y2} r="3.6" fill={CHALK} />
        </React.Fragment>
      ))}
      {/* head with a simple face so it reads as a person, not a ball */}
      <circle cx={pose.head[0]} cy={pose.head[1]} r="8" fill={CHALK} />
      <circle cx={pose.head[0] + 2.6} cy={pose.head[1] - 1.2} r="1" fill={INK} />
      {pose.joints && pose.joints.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill={HAZARD} />)}
    </>
  );
}

function CatIcon({ cat, size = 64, playing = false }) {
  const pose = POSES[cat] || POSES.mobility;
  const dur = cat === "plank" ? "2.4s" : "1.3s";
  const styleFor = (isA) => ({
    animationName: isA ? "poseCrossA" : "poseCrossB",
    animationDuration: dur,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationPlayState: playing ? "running" : "paused",
  });
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {pose.bar && <line x1="12" y1="8" x2="56" y2="8" stroke={STEEL} strokeWidth="3" strokeLinecap="round" />}
      {pose.dipBars && (
        <>
          <line x1="20" y1="16" x2="20" y2="50" stroke={STEEL} strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="16" x2="44" y2="50" stroke={STEEL} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {!pose.bar && !pose.dipBars && <line x1="4" y1="54" x2="60" y2="54" stroke={STEEL} strokeWidth="1.5" strokeDasharray="2 4" opacity="0.6" />}
      {!pose.bar && !pose.dipBars && <ellipse cx="32" cy="56" rx="16" ry="2.5" fill={INK} opacity="0.35" />}
      <g style={styleFor(true)}><PoseParts pose={pose.a} /></g>
      <g style={styleFor(false)}><PoseParts pose={pose.b} /></g>
    </svg>
  );
}

function ExerciseSketch({ cat, name, photoIndex }) {
  const [playing, setPlaying] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const iconKey = resolveIconKey(name, cat);
  const photos = photoFailed ? null : lookupExercisePhotos(photoIndex, name);
  const hasPhoto = photos && photos.length > 0;
  const crossfade = photos && photos.length > 1;

  const styleFor = (isA) => ({
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover", borderRadius: 22,
    animationName: isA ? "poseCrossA" : "poseCrossB",
    animationDuration: "1.6s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationPlayState: playing ? "running" : "paused",
  });

  return (
    <div className="flex flex-col items-center mb-2">
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ width: 112, height: 112, borderRadius: 22, background: `linear-gradient(160deg, ${PANEL2}, ${PANEL})`, boxShadow: `inset 0 0 0 1.5px ${STEEL}, 0 6px 18px rgba(0,0,0,0.35)` }}
      >
        {hasPhoto ? (
          <>
            <img src={photos[0]} alt={name} style={crossfade ? styleFor(true) : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 22 }} onError={() => setPhotoFailed(true)} />
            {crossfade && <img src={photos[1]} alt="" style={styleFor(false)} onError={() => setPhotoFailed(true)} />}
          </>
        ) : (
          <CatIcon cat={iconKey} size={78} playing={playing} />
        )}
        {(!hasPhoto || crossfade) && (
          <button
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? "Pausieren" : "Bewegung abspielen"}
            className="absolute transition-transform active:scale-90"
            style={{ bottom: 6, right: 6, width: 28, height: 28, borderRadius: "50%", background: HAZARD, color: INK, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
          >
            {playing ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 1 }} />}
          </button>
        )}
      </div>
      <span style={{ fontFamily: BODY_FONT, fontSize: 10, color: CHALK_DIM, marginTop: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
        {hasPhoto ? (crossfade ? (playing ? "Bewegung läuft…" : "Bewegung ansehen") : "Foto") : (playing ? "Skizze läuft…" : "Bewegungsskizze ansehen")}
      </span>
      <span style={{ fontFamily: BODY_FONT, fontSize: 11, color: HAZARD, marginTop: 3 }}>
        {CAT_MUSCLES[iconKey] || CAT_MUSCLES[cat]}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */
function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// Standalone version: uses the browser's own localStorage instead of the
// Claude-artifact window.storage API. This is what makes persistence reliable
// once the app runs on its own domain — no more session/account weirdness.
const LS_PREFIX = "lazyfit:";
async function safeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(LS_PREFIX + key);
    return { ok: true, value: raw ? JSON.parse(raw) : fallback };
  } catch (e) {
    console.warn("localStorage.getItem failed for", key, e);
    return { ok: false, value: fallback };
  }
}
async function safeSet(key, value) {
  try {
    window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("localStorage.setItem failed for", key, e);
    return false;
  }
}

function TallyGroup({ k }) {
  const sticks = Math.min(k, 4);
  return (
    <span className="inline-flex items-end relative mr-2" style={{ height: 20 }}>
      {Array.from({ length: sticks }).map((_, i) => (
        <span key={i} style={{ width: 2, height: 18, background: CHALK_DIM, marginRight: 3 }} />
      ))}
      {k === 5 && (
        <span
          style={{
            position: "absolute", left: 0, top: 6, width: 18, height: 2,
            background: RUST, transform: "rotate(-32deg)",
          }}
        />
      )}
    </span>
  );
}
function Tally({ n }) {
  if (n <= 0) return <span style={{ color: CHALK_DIM, fontFamily: MONO_FONT, fontSize: 12 }}>—</span>;
  const groups = [];
  for (let i = 0; i < n; i += 5) groups.push(Math.min(5, n - i));
  return <span className="inline-flex">{groups.map((k, i) => <TallyGroup key={i} k={k} />)}</span>;
}

/* ---------------------------------------------------------
   RULE-BASED WORKOUT GENERATION (free, no AI/API needed)
--------------------------------------------------------- */
const FOCUS_TO_CATEGORY = {
  brust: "push", schultern: "push",
  ruecken: "pull", arme: "pull",
  beine: "legs",
  bauch: "core",
  cardio: "cardio",
  ganzkoerper: null, // no filter — spread across everything
};

const LEVEL_SCALE = { "Einsteiger": 0.8, "Fortgeschritten": 1.0, "Erfahren": 1.2 };

function equipmentLabel(ids) {
  return ids.map(id => EQUIPMENT_CATALOG.find(e => e.id === id)?.label || id).join(" + ");
}

// Reads the last 1-3 sessions' feedback and turns it into a simple adjustment factor
// and an avoid-list — this replaces what the AI used to infer from free-form context.
function deriveAdjustment(history) {
  let repFactor = 1;
  const avoidNames = new Set();
  (history || []).forEach(h => {
    if (h.rpe >= 8) repFactor -= 0.12;
    if (h.rpe <= 3 && h.rpe > 0) repFactor += 0.12;
    (h.skipped || []).forEach(sk => {
      if (sk.reasons?.includes("Zu hart")) repFactor -= 0.15;
      if (sk.reasons?.includes("Zu leicht")) repFactor += 0.15;
      if (sk.reasons?.includes("Zu viele Wiederholungen")) repFactor -= 0.2;
      if (sk.reasons?.includes("Macht keinen Spaß")) avoidNames.add(sk.name);
    });
    if (h.stuckExercise) avoidNames.add(h.stuckExercise);
  });
  repFactor = Math.max(0.6, Math.min(1.4, repFactor));
  return { repFactor, avoidNames };
}

function pickExercises({ pool, wantedCats, focus, surprise, count }) {
  let weighted = [];
  if (surprise || !wantedCats.length) {
    weighted = pool;
  } else {
    pool.forEach(ex => {
      const lvl = wantedCats.includes(ex.category) ? (Math.max(1, ...Object.entries(focus).filter(([k]) => FOCUS_TO_CATEGORY[k] === ex.category).map(([, v]) => v || 1))) : 0.4;
      for (let i = 0; i < Math.max(1, Math.round(lvl * 2)); i++) weighted.push(ex);
    });
  }
  const shuffled = [...weighted].sort(() => Math.random() - 0.5);
  const chosen = [];
  const usedNames = new Set();
  for (const ex of shuffled) {
    if (chosen.length >= count) break;
    if (usedNames.has(ex.name)) continue;
    usedNames.add(ex.name);
    chosen.push(ex);
  }
  // top up with anything from the pool if we came up short (e.g. very narrow equipment)
  if (chosen.length < count) {
    for (const ex of pool) {
      if (chosen.length >= count) break;
      if (usedNames.has(ex.name)) continue;
      usedNames.add(ex.name);
      chosen.push(ex);
    }
  }
  return chosen;
}

async function generateWorkout({ profile, equipment, duration, focus, surprise, history }) {
  const have = new Set(equipment.filter(e => e.checked).map(e => e.id));
  have.add("bodyweight");

  const { repFactor, avoidNames } = deriveAdjustment(history);
  const levelScale = LEVEL_SCALE[profile.level] || 1;
  const totalFactor = repFactor * levelScale;

  let pool = EXERCISE_DB.filter(ex => ex.equipment.some(eq => have.has(eq)));
  // prefer avoiding exercises that were flagged boring/stuck last time, but don't
  // let that empty the pool if equipment is very limited
  const filteredPool = pool.filter(ex => !avoidNames.has(ex.name));
  if (filteredPool.length >= 3) pool = filteredPool;

  const wantedCats = surprise ? [] : Object.entries(focus).filter(([, v]) => v > 0).map(([k]) => FOCUS_TO_CATEGORY[k]).filter(Boolean);

  const count = Math.max(3, Math.min(8, Math.round(duration / 8)));
  const chosen = pickExercises({ pool, wantedCats, focus, surprise, count });

  const exercises = chosen.map(ex => {
    const scaled = { ...ex, equipment: equipmentLabel(ex.equipment) };
    if (ex.mode === "reps") {
      scaled.reps = Math.max(4, Math.round(ex.reps * totalFactor));
    } else {
      scaled.durationSeconds = Math.max(15, Math.round(ex.durationSeconds * totalFactor));
    }
    return scaled;
  });

  let intro = "Dein Training für heute — passend zu deiner Ausrüstung und deiner Zeit.";
  if (repFactor < 0.95) intro = "Etwas leichter dosiert als sonst, nach deinem letzten Feedback.";
  else if (repFactor > 1.05) intro = "Etwas mehr Wumms drin — du meintest, es durfte ruhig fordernder sein.";

  return { ok: true, plan: { title: "Dein Workout", intro, exercises, totalFactor } };
}

/* ---------------------------------------------------------
   SHARED UI BITS
--------------------------------------------------------- */
function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm transition-all active:scale-95"
      style={{
        fontFamily: BODY_FONT,
        borderRadius: 999,
        border: `1.5px solid ${active ? HAZARD : STEEL}`,
        color: active ? INK : CHALK,
        background: active ? HAZARD : "transparent",
        letterSpacing: 0.3,
        boxShadow: active ? "0 3px 10px rgba(232,185,46,0.25)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      className="mb-3"
      style={{ fontFamily: DISPLAY_FONT, textTransform: "uppercase", letterSpacing: 2, fontSize: 13, color: HAZARD }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{
        fontFamily: DISPLAY_FONT, textTransform: "uppercase", letterSpacing: 1.5, fontSize: 16,
        borderRadius: 14,
        background: disabled ? STEEL : HAZARD, color: INK, opacity: disabled ? 0.6 : 1,
        boxShadow: disabled ? "none" : "0 8px 20px rgba(232,185,46,0.22)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------
   PROFILE TAB
--------------------------------------------------------- */
function ProfileTab({ profile, setProfile, onSave, savedFlash, equipment, sessions, onImport }) {
  const update = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const field = (label, node) => (
    <div className="mb-5">
      <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      {node}
    </div>
  );
  const inputStyle = {
    width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK,
    padding: "11px 13px", fontFamily: BODY_FONT, fontSize: 15, borderRadius: 10,
  };

  const looksEmpty = !profile.age && !profile.height && !profile.weight && (sessions || []).length === 0;

  return (
    <div className="px-5 pt-6 pb-28">
      {looksEmpty && (
        <div className="mb-5 p-3" style={{ borderRadius: 12, border: `1.5px solid ${HAZARD}`, background: "rgba(232,185,46,0.08)" }}>
          <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: CHALK }}>
            Sieht nach einem leeren Profil aus. Falls du vorher schon Daten gespeichert hattest — ganz unten bei „Daten sichern" kannst du eine frühere Sicherung importieren.
          </p>
        </div>
      )}
      <SectionLabel>Über dich</SectionLabel>
      <div className="grid grid-cols-2 gap-4">
        {field("Alter", <input type="number" style={inputStyle} value={profile.age} onChange={e => update("age", e.target.value)} />)}
        {field("Größe (cm)", <input type="number" style={inputStyle} value={profile.height} onChange={e => update("height", e.target.value)} />)}
        {field("Gewicht (kg)", <input type="number" style={inputStyle} value={profile.weight} onChange={e => update("weight", e.target.value)} />)}
        {field("Geschlecht", (
          <select style={inputStyle} value={profile.gender} onChange={e => update("gender", e.target.value)}>
            <option>Weiblich</option><option>Männlich</option><option>Divers</option><option>Keine Angabe</option>
          </select>
        ))}
      </div>

      {field("Trainingsniveau", (
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map(l => <Chip key={l} active={profile.level === l} onClick={() => update("level", l)}>{l}</Chip>)}
        </div>
      ))}

      {field("Trainingsziele (mehrfach wählbar)", (
        <div className="flex gap-2 flex-wrap">
          {GOALS.map(g => (
            <Chip
              key={g}
              active={profile.goals.includes(g)}
              onClick={() => update("goals", profile.goals.includes(g) ? profile.goals.filter(x => x !== g) : [...profile.goals, g])}
            >{g}</Chip>
          ))}
        </div>
      ))}

      {field(`Grobe Orientierung: ${profile.weeklyFreq}× pro Woche (kein fester Plan)`, (
        <input type="range" min="1" max="7" value={profile.weeklyFreq} onChange={e => update("weeklyFreq", Number(e.target.value))} className="w-full" style={{ accentColor: HAZARD }} />
      ))}

      <div className="mb-5">
        <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Sag's mir (optional)</div>
        <SagsMir value={profile.sagsmir || ""} onChange={v => update("sagsmir", v)} />
      </div>

      <PrimaryButton
        onClick={onSave}
        style={savedFlash === "error" ? { background: RUST, color: CHALK } : undefined}
      >
        {savedFlash === "ok" ? "Gespeichert ✓" : savedFlash === "error" ? "Fehlgeschlagen — noch mal versuchen" : "Speichern"}
      </PrimaryButton>

      <BackupPanel profile={profile} equipment={equipment} sessions={sessions} onImport={onImport} />
    </div>
  );
}

function SagsMir({ value, onChange }) {
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const recRef = useRef(null);

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMicSupported(false); return; }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "de-DE";
      rec.interimResults = false;
      rec.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join(" ");
        onChange((value ? value + " " : "") + text);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setMicSupported(false);
    }
  };

  return (
    <div>
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          placeholder="Wie bei einem Trainer: Warum willst du trainieren, was willst du erreichen?"
          style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK, padding: "11px 44px 11px 13px", fontFamily: BODY_FONT, fontSize: 14, resize: "none", borderRadius: 10 }}
        />
        {micSupported && (
          <button
            onClick={toggleMic}
            aria-label={listening ? "Aufnahme stoppen" : "Per Mikro einsprechen"}
            className="absolute transition-all active:scale-90"
            style={{ top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: listening ? RUST : HAZARD, color: INK }}
          >
            <Mic size={13} />
          </button>
        )}
      </div>
      {listening && <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: RUST, marginTop: 4 }}>hört zu…</div>}
      {!micSupported && <div style={{ fontFamily: BODY_FONT, fontSize: 11, color: CHALK_DIM, marginTop: 4 }}>Spracheingabe hier nicht verfügbar — einfach eintippen.</div>}
    </div>
  );
}

function BackupPanel({ profile, equipment, sessions, onImport }) {
  const [mode, setMode] = useState(null); // null | "export" | "import"
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

  const exportText = JSON.stringify({ profile, equipment, sessions }, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyMsg("Kopiert ✓");
    } catch {
      setCopyMsg("Kopieren nicht möglich — Text unten manuell markieren");
    }
    setTimeout(() => setCopyMsg(""), 2500);
  };

  const applyImport = () => {
    try {
      const parsed = JSON.parse(importText);
      onImport(parsed);
      setImportMsg("Übernommen ✓");
      setImportText("");
    } catch {
      setImportMsg("Konnte den Text nicht lesen — bitte kompletten Export-Text einfügen.");
    }
  };

  return (
    <div className="mt-8 pt-6" style={{ borderTop: `1.5px solid ${STEEL}` }}>
      <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Daten sichern</div>
      <p style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 10 }}>
        Falls das automatische Speichern mal aussetzt: hier alles als Text sichern und bei Bedarf wieder einspielen.
      </p>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode(mode === "export" ? null : "export")} className="flex-1 py-2.5 transition-all active:scale-95" style={{ borderRadius: 10, border: `1.5px solid ${STEEL}`, color: CHALK, fontFamily: BODY_FONT, fontSize: 13 }}>Exportieren</button>
        <button onClick={() => setMode(mode === "import" ? null : "import")} className="flex-1 py-2.5 transition-all active:scale-95" style={{ borderRadius: 10, border: `1.5px solid ${STEEL}`, color: CHALK, fontFamily: BODY_FONT, fontSize: 13 }}>Importieren</button>
      </div>

      {mode === "export" && (
        <div>
          <textarea readOnly value={exportText} rows={6} onFocus={e => e.target.select()}
            style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK_DIM, padding: "10px 12px", fontFamily: MONO_FONT, fontSize: 11, borderRadius: 10, marginBottom: 8 }} />
          <button onClick={copyToClipboard} className="w-full py-2.5 transition-all active:scale-95" style={{ borderRadius: 10, background: HAZARD, color: INK, fontFamily: BODY_FONT, fontSize: 13 }}>
            {copyMsg || "In Zwischenablage kopieren"}
          </button>
        </div>
      )}

      {mode === "import" && (
        <div>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={6} placeholder="Vorher exportierten Text hier einfügen…"
            style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK, padding: "10px 12px", fontFamily: MONO_FONT, fontSize: 11, borderRadius: 10, marginBottom: 8 }} />
          <button onClick={applyImport} className="w-full py-2.5 transition-all active:scale-95" style={{ borderRadius: 10, background: HAZARD, color: INK, fontFamily: BODY_FONT, fontSize: 13 }}>Übernehmen</button>
          {importMsg && <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: importMsg.startsWith("Übernommen") ? HAZARD : RUST, marginTop: 6 }}>{importMsg}</div>}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   EQUIPMENT TAB
--------------------------------------------------------- */
function EquipmentTab({ equipment, setEquipment, onSave, savedFlash }) {
  const toggle = (id) => setEquipment(eq => eq.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  const setDetail = (id, v) => setEquipment(eq => eq.map(e => e.id === id ? { ...e, detailValue: v } : e));

  return (
    <div className="px-5 pt-6 pb-28">
      <SectionLabel>Dein Gerätespind</SectionLabel>
      <p style={{ fontFamily: BODY_FONT, color: CHALK_DIM, fontSize: 14, marginBottom: 18 }}>
        Hak ab, was dir gerade zur Verfügung steht. Der Coach plant nur damit.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {equipment.map(e => (
          <div
            key={e.id}
            className="p-3 transition-all"
            style={{
              borderRadius: 14,
              border: `1.5px solid ${e.checked ? HAZARD : STEEL}`,
              background: e.checked ? "rgba(232,185,46,0.09)" : PANEL2,
              boxShadow: e.checked ? "0 4px 14px rgba(232,185,46,0.15)" : "none",
            }}
          >
            <button onClick={() => toggle(e.id)} className="w-full flex items-center gap-2 text-left">
              <span
                className="flex items-center justify-center flex-shrink-0 transition-all"
                style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${e.checked ? HAZARD : STEEL}`, background: e.checked ? HAZARD : "transparent" }}
              >
                {e.checked && <Check size={14} color={INK} />}
              </span>
              <span style={{ fontFamily: BODY_FONT, fontSize: 14, color: CHALK }}>{e.label}</span>
            </button>
            {e.checked && e.detail && (
              <input
                placeholder={e.unit}
                value={e.detailValue || ""}
                onChange={ev => setDetail(e.id, ev.target.value)}
                className="mt-2 w-full"
                style={{ background: "transparent", border: "none", borderBottom: `1px solid ${STEEL}`, color: HAZARD, fontFamily: MONO_FONT, fontSize: 13, padding: "4px 2px" }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={onSave}>{savedFlash ? "Gespeichert ✓" : "Speichern"}</PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   WORKOUT SETUP TAB
--------------------------------------------------------- */
function WorkoutSetupTab({ equipment, duration, setDuration, focus, setFocus, surprise, setSurprise, onStart, loading }) {
  const equippedCount = equipment.filter(e => e.checked).length;
  const cycleFocus = (id) => setFocus(f => ({ ...f, [id]: ((f[id] || 0) + 1) % 4 }));

  return (
    <div className="px-5 pt-6 pb-28">
      <SectionLabel>Heute trainieren</SectionLabel>

      {equippedCount === 0 && (
        <div className="mb-5 p-3" style={{ border: `1.5px solid ${RUST}`, color: RUST, fontFamily: BODY_FONT, fontSize: 13 }}>
          Noch nichts im Gerätespind ausgewählt — der Coach plant dann nur mit Körpergewicht.
        </div>
      )}

      <div className="mb-6">
        <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          Zeit, die du jetzt hast: <span style={{ color: HAZARD, fontFamily: MONO_FONT }}>{duration} Min</span>
        </div>
        <input type="range" min="10" max="90" step="5" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full" style={{ accentColor: HAZARD }} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, textTransform: "uppercase", letterSpacing: 1 }}>Fokus heute</span>
        <button
          onClick={() => setSurprise(s => !s)}
          className="flex items-center gap-1 px-3 py-1.5 transition-all active:scale-95"
          style={{ borderRadius: 999, border: `1.5px solid ${surprise ? HAZARD : STEEL}`, background: surprise ? HAZARD : "transparent", color: surprise ? INK : CHALK, fontFamily: BODY_FONT, fontSize: 12, boxShadow: surprise ? "0 3px 10px rgba(232,185,46,0.25)" : "none" }}
        >
          <Sparkles size={13} /> Überrasch mich
        </button>
      </div>

      {!surprise && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {FOCUS_CATALOG.map(f => {
            const lvl = focus[f.id] || 0;
            return (
              <button
                key={f.id}
                onClick={() => cycleFocus(f.id)}
                className="p-3 flex items-center justify-between transition-all active:scale-[0.97]"
                style={{ borderRadius: 14, border: `1.5px solid ${lvl > 0 ? HAZARD : STEEL}`, background: lvl > 0 ? "rgba(232,185,46,0.09)" : PANEL2, boxShadow: lvl > 0 ? "0 4px 14px rgba(232,185,46,0.15)" : "none" }}
              >
                <span style={{ fontFamily: BODY_FONT, fontSize: 14, color: CHALK }}>{f.label}</span>
                <span className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i <= lvl ? HAZARD : STEEL }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <PrimaryButton onClick={onStart} disabled={loading}>
        {loading ? "Coach denkt nach…" : <span className="flex items-center gap-2"><Play size={16} /> Training starten</span>}
      </PrimaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   WORKOUT PREVIEW — shown after generation, before the workout starts
--------------------------------------------------------- */
function WorkoutPreview({ plan, onSwap, onStart, onBack }) {
  return (
    <div className="px-5 pt-6 pb-28">
      <SectionLabel>Das kommt jetzt</SectionLabel>
      <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: CHALK_DIM, marginBottom: 18 }}>{plan.intro}</p>

      <div className="flex flex-col gap-2 mb-6">
        {plan.exercises.map((ex, i) => (
          <div key={i} className="p-3 flex items-center justify-between" style={{ borderRadius: 12, border: `1.5px solid ${STEEL}`, background: PANEL2 }}>
            <div>
              <div style={{ fontFamily: BODY_FONT, fontSize: 14, color: CHALK }}>{ex.name}</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: CHALK_DIM }}>
                {ex.mode === "timed" ? `${ex.sets}× ${ex.durationSeconds}s` : `${ex.sets}× ${ex.reps}`} · {CAT_MUSCLES[resolveIconKey(ex.name, ex.category)] || CAT_MUSCLES[ex.category]}
              </div>
            </div>
            <button
              onClick={() => onSwap(i)}
              aria-label="Übung tauschen"
              className="flex items-center gap-1 px-3 py-2 transition-all active:scale-95 flex-shrink-0"
              style={{ borderRadius: 999, border: `1.5px solid ${STEEL}`, color: CHALK_DIM, fontFamily: BODY_FONT, fontSize: 12 }}
            >
              <RotateCcw size={13} /> Tauschen
            </button>
          </div>
        ))}
      </div>

      <PrimaryButton onClick={onStart}>
        <span className="flex items-center gap-2"><Play size={16} /> Training starten</span>
      </PrimaryButton>
      <button onClick={onBack} className="w-full mt-3 py-2 text-center" style={{ fontFamily: BODY_FONT, fontSize: 13, color: CHALK_DIM }}>
        Zurück zur Auswahl
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   ACTIVE WORKOUT
--------------------------------------------------------- */
function RestTimer({ seconds, onDone, onSkip }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const id = setInterval(() => {
      setLeft(l => {
        if (l <= 1) { clearInterval(id); onDone(); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return (
    <div className="flex flex-col items-center py-10">
      <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Pause</div>
      <div style={{ fontFamily: MONO_FONT, fontSize: 56, color: HAZARD }}>{fmtTime(left)}</div>
      <button onClick={onSkip} className="mt-6 flex items-center gap-2 px-4 py-2 transition-all active:scale-95" style={{ borderRadius: 999, border: `1.5px solid ${STEEL}`, color: CHALK, fontFamily: BODY_FONT, fontSize: 13 }}>
        <SkipForward size={14} /> Pause überspringen
      </button>
    </div>
  );
}

function TimedExercise({ ex, onSetDone }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(ex.durationSeconds || 30);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); onSetDone(); return; }
    const id = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left, onSetDone]);

  return (
    <div className="flex flex-col items-center py-6">
      <div style={{ fontFamily: MONO_FONT, fontSize: 64, color: running ? HAZARD : CHALK }}>{fmtTime(left)}</div>
      {!running ? (
        <button onClick={() => { setLeft(ex.durationSeconds || 30); setRunning(true); }} className="mt-5 px-6 py-3 flex items-center gap-2 transition-all active:scale-95" style={{ borderRadius: 14, background: HAZARD, color: INK, fontFamily: DISPLAY_FONT, textTransform: "uppercase", letterSpacing: 1, boxShadow: "0 8px 20px rgba(232,185,46,0.22)" }}>
          <Play size={16} /> Start
        </button>
      ) : (
        <div style={{ fontFamily: BODY_FONT, color: CHALK_DIM, fontSize: 13, marginTop: 10 }}>läuft…</div>
      )}
    </div>
  );
}

function RepsExercise({ ex, setNum, onSetDone }) {
  return (
    <div className="flex flex-col items-center py-8">
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 44, color: CHALK }}>{ex.reps}</div>
      <div style={{ fontFamily: BODY_FONT, fontSize: 13, color: CHALK_DIM, marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>Wiederholungen · Satz {setNum}/{ex.sets}</div>
      <button onClick={onSetDone} className="px-8 py-4 flex items-center gap-2 transition-all active:scale-95" style={{ borderRadius: 14, background: HAZARD, color: INK, fontFamily: DISPLAY_FONT, textTransform: "uppercase", letterSpacing: 1, fontSize: 15, boxShadow: "0 8px 20px rgba(232,185,46,0.22)" }}>
        <Check size={18} /> Satz erledigt
      </button>
    </div>
  );
}

function SkipModal({ exerciseName, onCancel, onConfirm }) {
  const [reasons, setReasons] = useState([]);
  const [note, setNote] = useState("");
  const toggle = (r) => setReasons(rs => rs.includes(r) ? rs.filter(x => x !== r) : [...rs, r]);
  return (
    <div className="fixed inset-0 z-20 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="w-full mx-auto p-5" style={{ maxWidth: 480, background: PANEL, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTop: `1.5px solid ${STEEL}` }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 18, color: CHALK, textTransform: "uppercase", marginBottom: 4 }}>Übung überspringen</div>
        <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: CHALK_DIM, marginBottom: 14 }}>Kein Ding — kurz sagen warum, dann passt der Coach das nächste Mal besser an.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SKIP_REASONS.map(r => (
            <Chip key={r} active={reasons.includes(r)} onClick={() => toggle(r)}>{r}</Chip>
          ))}
        </div>
        <textarea
          value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Noch was dazu? (optional)"
          style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: 13, resize: "none", borderRadius: 10, marginBottom: 14 }}
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3" style={{ borderRadius: 12, border: `1.5px solid ${STEEL}`, color: CHALK, fontFamily: BODY_FONT, fontSize: 14 }}>Doch weiter</button>
          <button onClick={() => onConfirm({ reasons, note })} className="flex-1 py-3" style={{ borderRadius: 12, background: HAZARD, color: INK, fontFamily: DISPLAY_FONT, textTransform: "uppercase", letterSpacing: 1, fontSize: 14 }}>Überspringen</button>
        </div>
      </div>
    </div>
  );
}

// Keeps the phone screen from dimming/locking while a workout is running.
// Best-effort: silently does nothing on browsers that don't support it (e.g. older iOS).
function useWakeLock(active) {
  const lockRef = useRef(null);

  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let cancelled = false;
    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) { lock.release(); return; }
        lockRef.current = lock;
      } catch (e) {
        console.warn("Wake Lock nicht verfügbar", e);
      }
    };
    acquire();

    const onVisible = () => {
      if (document.visibilityState === "visible" && !lockRef.current) acquire();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      lockRef.current?.release();
      lockRef.current = null;
    };
  }, [active]);
}

function ActiveWorkout({ plan, onFinish, onExit, onSkip, photoIndex }) {
  useWakeLock(true);
  const [exIdx, setExIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [phase, setPhase] = useState("exercise"); // exercise | rest
  const [showSkip, setShowSkip] = useState(false);
  const exercises = plan.exercises;
  const ex = exercises[exIdx];
  const isLast = exIdx === exercises.length - 1;
  const isLastSet = setNum >= ex.sets;

  const advance = useCallback(() => {
    if (!isLastSet) {
      setPhase("rest");
    } else if (!isLast) {
      setPhase("rest");
    } else {
      onFinish();
    }
  }, [isLastSet, isLast, onFinish]);

  const handleRestDone = () => {
    if (!isLastSet) {
      setSetNum(n => n + 1);
      setPhase("exercise");
    } else {
      setExIdx(i => i + 1);
      setSetNum(1);
      setPhase("exercise");
    }
  };

  const confirmSkip = (detail) => {
    onSkip({ name: ex.name, ...detail });
    setShowSkip(false);
    if (isLast) { onFinish(); }
    else { setExIdx(i => i + 1); setSetNum(1); setPhase("exercise"); }
  };

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onExit} style={{ color: CHALK_DIM }}><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-2">
          <Tally n={exIdx + (phase === "rest" && isLastSet ? 1 : 0)} />
          <span style={{ fontFamily: MONO_FONT, fontSize: 12, color: CHALK_DIM }}>{exIdx + 1}/{exercises.length}</span>
        </div>
      </div>

      {phase === "exercise" && (
        <>
          <ExerciseSketch cat={ex.category} name={ex.name} photoIndex={photoIndex} />
          <h2 className="text-center mb-1" style={{ fontFamily: DISPLAY_FONT, fontSize: 26, color: CHALK, textTransform: "uppercase" }}>{ex.name}</h2>
          <p className="text-center mb-4" style={{ fontFamily: BODY_FONT, fontSize: 13, color: HAZARD }}>{ex.equipment}</p>
          <p className="text-center mb-2 px-4" style={{ fontFamily: BODY_FONT, fontSize: 14, color: CHALK_DIM, fontStyle: "italic" }}>{ex.cue}</p>

          {ex.mode === "timed"
            ? <TimedExercise ex={ex} onSetDone={advance} />
            : <RepsExercise ex={ex} setNum={setNum} onSetDone={advance} />}

          <div className="flex justify-center mt-2">
            <button onClick={() => setShowSkip(true)} className="flex items-center gap-1 px-3 py-2" style={{ color: CHALK_DIM, fontFamily: BODY_FONT, fontSize: 12 }}>
              <SkipForward size={13} /> Übung überspringen
            </button>
          </div>
        </>
      )}

      {phase === "rest" && (
        <RestTimer
          seconds={ex.restSeconds || 45}
          onDone={handleRestDone}
          onSkip={handleRestDone}
        />
      )}

      {!isLastSet && phase === "exercise" && (
        <div className="mt-4 text-center" style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM }}>
          Noch {ex.sets - setNum} {ex.sets - setNum === 1 ? "Satz" : "Sätze"} für diese Übung
        </div>
      )}

      {showSkip && <SkipModal exerciseName={ex.name} onCancel={() => setShowSkip(false)} onConfirm={confirmSkip} />}
    </div>
  );
}

/* ---------------------------------------------------------
   COOLDOWN
--------------------------------------------------------- */
function Cooldown({ plan, onSubmit }) {
  const [rpe, setRpe] = useState(6);
  const [best, setBest] = useState(plan.exercises[0]?.name || "");
  const [stuck, setStuck] = useState("");
  const [stuckReason, setStuckReason] = useState("");
  const [missing, setMissing] = useState("");

  return (
    <div className="px-5 pt-6 pb-28">
      <SectionLabel>Cooldown</SectionLabel>
      <h2 className="mb-6" style={{ fontFamily: DISPLAY_FONT, fontSize: 24, color: CHALK, textTransform: "uppercase" }}>Wie war's?</h2>

      <div className="mb-6">
        <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          Wie hart, 1–10: <span style={{ color: HAZARD, fontFamily: MONO_FONT }}>{rpe}/10</span>
        </div>
        <input type="range" min="1" max="10" value={rpe} onChange={e => setRpe(Number(e.target.value))} className="w-full" style={{ accentColor: HAZARD }} />
      </div>

      <div className="mb-6">
        <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Liebste Übung (optional)</div>
        <select value={best} onChange={e => setBest(e.target.value)} style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK, padding: "11px 13px", fontFamily: BODY_FONT, fontSize: 15, borderRadius: 10 }}>
          <option value="">—</option>
          {plan.exercises.map((e, i) => <option key={i} value={e.name}>{e.name}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Welche Übung hat gehakt? (optional)</div>
        <select value={stuck} onChange={e => setStuck(e.target.value)} style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK, padding: "11px 13px", fontFamily: BODY_FONT, fontSize: 15, borderRadius: 10, marginBottom: 8 }}>
          <option value="">—</option>
          {plan.exercises.map((e, i) => <option key={i} value={e.name}>{e.name}</option>)}
        </select>
        {stuck && (
          <input value={stuckReason} onChange={e => setStuckReason(e.target.value)} placeholder="Warum? (optional)"
            style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: 13, borderRadius: 10 }} />
        )}
      </div>

      <div className="mb-8">
        <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Was hat gefehlt? (optional)</div>
        <textarea value={missing} onChange={e => setMissing(e.target.value)} rows={3} placeholder="z. B. mehr Cardio, weniger Beine…"
          style={{ width: "100%", background: PANEL2, border: `1.5px solid ${STEEL}`, color: CHALK, padding: "11px 13px", fontFamily: BODY_FONT, fontSize: 14, resize: "none", borderRadius: 10 }} />
      </div>

      <PrimaryButton onClick={() => onSubmit({ rpe, best, stuck, stuckReason, missing })}>Session abschließen</PrimaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   THANK YOU / SIGN-OFF
--------------------------------------------------------- */
function PotatoWithBottle({ size = 88 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {/* legs */}
      <line x1="26" y1="52" x2="18" y2="62" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" />
      <line x1="36" y1="52" x2="46" y2="60" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="15" cy="63" rx="6" ry="3" fill={HAZARD} transform="rotate(8 15 63)" />
      <ellipse cx="48" cy="61" rx="6" ry="3" fill={HAZARD} transform="rotate(-20 48 61)" />
      {/* arm holding a water bottle up */}
      <path d="M20 32 Q10 24 12 12" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="6" y="0" width="9" height="15" rx="2.5" fill="none" stroke={HAZARD} strokeWidth="2" />
      <rect x="8.5" y="-3" width="4" height="4" rx="1" fill={HAZARD} />
      {/* other arm, relaxed on hip */}
      <path d="M44 34 Q52 36 50 44" stroke={SPUD_DARK} strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* potato body */}
      <ellipse cx="32" cy="34" rx="17" ry="21" fill={SPUD} stroke={SPUD_DARK} strokeWidth="1.5" />
      <ellipse cx="22" cy="44" rx="2" ry="1.3" fill={SPUD_DARK} opacity="0.6" />
      <ellipse cx="40" cy="40" rx="1.6" ry="1" fill={SPUD_DARK} opacity="0.6" />
      <ellipse cx="30" cy="48" rx="1.4" ry="1" fill={SPUD_DARK} opacity="0.5" />
      {/* headband */}
      <path d="M17 24 Q32 16 47 24 L47 20 Q32 12 17 20 Z" fill={HAZARD} />
      {/* content, closed-eyes smile — mid water break */}
      <path d="M23 30 Q25.5 28 28 30" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M36 30 Q38.5 28 41 30" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M25 37 Q32 41 39 36" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ThankYou({ onDone, saveOk }) {
  return (
    <div className="px-5 pt-10 pb-28 flex flex-col items-center text-center">
      <PotatoWithBottle />
      <h2 className="mt-4 mb-2" style={{ fontFamily: DISPLAY_FONT, fontSize: 24, color: CHALK, textTransform: "uppercase" }}>Danke fürs Feedback</h2>
      {saveOk ? (
        <p style={{ fontFamily: BODY_FONT, fontSize: 14, color: CHALK_DIM, maxWidth: 280, marginBottom: 4 }}>
          Ich merk's mir fürs nächste Mal — dein nächstes Training wird entsprechend angepasst.
        </p>
      ) : (
        <p style={{ fontFamily: BODY_FONT, fontSize: 14, color: RUST, maxWidth: 280, marginBottom: 4 }}>
          Konnte diese Einheit gerade nicht dauerhaft speichern. Schau im Profil-Reiter kurz bei „Daten sichern" vorbei, falls dir das öfter passiert.
        </p>
      )}
      <p style={{ fontFamily: MONO_FONT, fontSize: 11, color: HAZARD, marginBottom: 28, textTransform: "uppercase", letterSpacing: 1 }}>Stay Hydrated</p>
      <PrimaryButton onClick={onDone} style={{ maxWidth: 260 }}>Fertig</PrimaryButton>
    </div>
  );
}

/* ---------------------------------------------------------
   ARCHIVE / LOGBUCH TAB
--------------------------------------------------------- */
function LogbookTab({ sessions, onRepeat }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (sessions.length === 0) {
    return (
      <div className="px-5 pt-6 pb-28">
        <SectionLabel>Logbuch</SectionLabel>
        <p style={{ fontFamily: BODY_FONT, color: CHALK_DIM, fontSize: 14 }}>Noch keine Einheiten abgeschlossen. Dein erstes Training landet hier.</p>
      </div>
    );
  }
  return (
    <div className="px-5 pt-6 pb-28">
      <SectionLabel>Logbuch</SectionLabel>
      <div className="flex flex-col gap-3">
        {[...sessions].reverse().map((s, i) => {
          const idx = sessions.length - 1 - i;
          const open = openIdx === idx;
          return (
            <div key={idx} style={{ borderRadius: 14, border: `1.5px solid ${STEEL}`, background: PANEL2, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}>
              <button className="w-full p-3 flex items-center justify-between text-left transition-colors" onClick={() => setOpenIdx(open ? null : idx)}>
                <div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16, color: CHALK, textTransform: "uppercase" }}>{s.title}</div>
                  <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: CHALK_DIM }}>{s.date} · {s.duration} Min · {s.exercises.length} Übungen</div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: MONO_FONT, fontSize: 13, color: HAZARD }}>RPE {s.feedback?.rpe ?? "–"}</span>
                  <ChevronRight size={16} color={CHALK_DIM} style={{ transform: open ? "rotate(90deg)" : "none" }} />
                </div>
              </button>
              {open && (
                <div className="px-3 pb-3">
                  <ul className="mb-3">
                    {s.exercises.map((e, j) => (
                      <li key={j} style={{ fontFamily: BODY_FONT, fontSize: 13, color: CHALK_DIM, marginBottom: 4 }}>
                        • {e.name} — {e.mode === "timed" ? `${e.sets}× ${e.durationSeconds}s` : `${e.sets}× ${e.reps}`}
                      </li>
                    ))}
                  </ul>
                  {s.feedback?.best && <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 2 }}>Beste Übung: {s.feedback.best}</div>}
                  {s.feedback?.missing && <div style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK_DIM, marginBottom: 10 }}>Gefehlt: {s.feedback.missing}</div>}
                  <button onClick={() => onRepeat(s)} className="flex items-center gap-2 px-3 py-2 transition-all active:scale-95" style={{ borderRadius: 10, border: `1.5px solid ${HAZARD}`, color: HAZARD, fontFamily: BODY_FONT, fontSize: 13 }}>
                    <RotateCcw size={14} /> Nochmal trainieren
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */
export default function App() {
  const [tab, setTab] = useState("workout"); // profile | equipment | workout | log
  const [loaded, setLoaded] = useState(false);

  const [profile, setProfile] = useState({
    age: "", height: "", weight: "", gender: "Keine Angabe",
    level: "Fortgeschritten", goals: [], weeklyFreq: 3,
  });
  const [equipment, setEquipment] = useState(EQUIPMENT_CATALOG.map(e => ({ ...e, checked: false, detailValue: "" })));
  const [sessions, setSessions] = useState([]);

  const [profileFlash, setProfileFlash] = useState(null); // null | "ok" | "error"
  const [equipFlash, setEquipFlash] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);

  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState({});
  const [surprise, setSurprise] = useState(false);

  const [stage, setStage] = useState("setup"); // setup | preview | active | cooldown | thanks
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [skips, setSkips] = useState([]);
  const [lastSessionSaveOk, setLastSessionSaveOk] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await safeGet("profile", null);
      const eq = await safeGet("equipment", null);
      const s = await safeGet("sessions", []);
      if (p.value) setProfile(p.value);
      if (eq.value) setEquipment(eq.value);
      setSessions(s.value);
      if (!p.ok || !eq.ok || !s.ok) setStorageWarning(true);
      setLoaded(true);
    })();
    // Load the exercise photo library in the background — never blocks the app,
    // and ExerciseSketch quietly falls back to the drawn pictogram until/unless it's ready.
    loadExercisePhotoIndex().then(setPhotoIndex);
  }, []);

  const saveProfile = async () => {
    const ok = await safeSet("profile", profile);
    setProfileFlash(ok ? "ok" : "error");
    if (!ok) setStorageWarning(true);
    setTimeout(() => setProfileFlash(null), 2000);
  };
  const saveEquipment = async () => {
    const ok = await safeSet("equipment", equipment);
    setEquipFlash(ok ? "ok" : "error");
    if (!ok) setStorageWarning(true);
    setTimeout(() => setEquipFlash(null), 2000);
  };

  const importBackup = async (data) => {
    if (data.profile) setProfile(data.profile);
    if (data.equipment) setEquipment(data.equipment);
    if (data.sessions) setSessions(data.sessions);
    if (data.profile) await safeSet("profile", data.profile);
    if (data.equipment) await safeSet("equipment", data.equipment);
    if (data.sessions) await safeSet("sessions", data.sessions);
  };

  const startWorkout = async () => {
    setLoadingPlan(true);
    setSkips([]);
    const history = sessions.slice(-3).map(s => ({
      rpe: s.feedback?.rpe, best: s.feedback?.best, missing: s.feedback?.missing,
      stuckExercise: s.feedback?.stuck, stuckReason: s.feedback?.stuckReason,
      skipped: (s.skips || []).map(sk => ({ name: sk.name, reasons: sk.reasons, note: sk.note })),
      focus: s.focusLabel,
    }));
    const res = await generateWorkout({ profile, equipment, duration, focus, surprise, history });
    setPlan(res.plan);
    setLoadingPlan(false);
    setStage("preview");
  };

  const swapExercise = (idx) => {
    if (!plan) return;
    const have = new Set(equipment.filter(e => e.checked).map(e => e.id));
    have.add("bodyweight");
    const current = plan.exercises[idx];
    const usedNames = new Set(plan.exercises.map(e => e.name));
    let candidates = EXERCISE_DB.filter(ex => ex.category === current.category && ex.equipment.some(eq => have.has(eq)) && !usedNames.has(ex.name));
    if (candidates.length === 0) {
      candidates = EXERCISE_DB.filter(ex => ex.equipment.some(eq => have.has(eq)) && !usedNames.has(ex.name));
    }
    if (candidates.length === 0) return; // nothing left to swap to
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const factor = plan.totalFactor || 1;
    const scaled = { ...pick, equipment: equipmentLabel(pick.equipment) };
    if (pick.mode === "reps") scaled.reps = Math.max(4, Math.round(pick.reps * factor));
    else scaled.durationSeconds = Math.max(15, Math.round(pick.durationSeconds * factor));
    const nextExercises = [...plan.exercises];
    nextExercises[idx] = scaled;
    setPlan({ ...plan, exercises: nextExercises });
  };

  const backToSetup = () => { setPlan(null); setStage("setup"); };

  const finishWorkout = () => setStage("cooldown");
  const recordSkip = (detail) => setSkips(s => [...s, detail]);

  const submitCooldown = async (feedback) => {
    const focusLabel = surprise ? "Überrasch mich" : Object.entries(focus).filter(([, v]) => v > 0).map(([k]) => FOCUS_CATALOG.find(f => f.id === k)?.label).join(", ") || "—";
    const session = {
      date: new Date().toLocaleDateString("de-DE"),
      title: plan.title || "Workout",
      duration,
      focusLabel,
      exercises: plan.exercises,
      feedback,
      skips,
    };
    const updated = [...sessions, session];
    setSessions(updated);
    const ok = await safeSet("sessions", updated);
    setLastSessionSaveOk(ok);
    if (!ok) setStorageWarning(true);
    setStage("thanks");
  };

  const closeThanks = () => {
    setStage("setup");
    setPlan(null);
    setSkips([]);
    setTab("workout");
  };

  const repeatSession = (session) => {
    setPlan({ title: session.title, intro: "Wiederholte Einheit aus dem Logbuch.", exercises: session.exercises });
    setDuration(session.duration);
    setSkips([]);
    setStage("active");
    setTab("workout");
  };

  const exitWorkout = () => { setStage("setup"); setPlan(null); setSkips([]); };

  if (!loaded) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: INK, minHeight: 600 }}>
        <div style={{ fontFamily: DISPLAY_FONT, color: HAZARD, letterSpacing: 2, textTransform: "uppercase" }}>Lädt…</div>
      </div>
    );
  }

  const navItems = [
    { id: "profile", label: "Profil", icon: User },
    { id: "equipment", label: "Spind", icon: Dumbbell },
    { id: "workout", label: "Training", icon: Play },
    { id: "log", label: "Logbuch", icon: History },
  ];

  return (
    <div className="w-full mx-auto relative" style={{ maxWidth: 480, minHeight: 700, background: INK, fontFamily: BODY_FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        input[type=range] { height: 4px; background: ${STEEL}; border-radius: 999px; -webkit-appearance: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${HAZARD}; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: pointer; }
        input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: ${HAZARD}; border: none; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: pointer; }
        select, textarea, input { outline: none; }
        select:focus, textarea:focus, input:focus, button:focus-visible { outline: 2px solid ${HAZARD}; outline-offset: 2px; }
        ::placeholder { color: ${CHALK_DIM}; }
        .content-fade { animation: fadeSlide .3s ease; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes poseCrossA { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes poseCrossB { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      `}</style>

      {/* HEADER */}
      <div className="px-5 pt-7 pb-4 flex items-center gap-3" style={{ borderBottom: `1.5px solid ${STEEL}`, background: `linear-gradient(180deg, ${PANEL} 0%, ${INK} 100%)` }}>
        <PotatoMascot size={48} />
        <div>
          <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 26, color: CHALK, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Coach <span style={{ color: HAZARD }}>Potato</span>
          </h1>
          <p style={{ fontFamily: MONO_FONT, fontSize: 11, color: CHALK_DIM, marginTop: 2, letterSpacing: 0.5 }}>
            Training that fits your habits.
          </p>
        </div>
      </div>

      {storageWarning && (
        <div className="px-5 py-2.5 flex items-center justify-between gap-3" style={{ background: "rgba(193,67,42,0.15)", borderBottom: `1.5px solid ${RUST}` }}>
          <span style={{ fontFamily: BODY_FONT, fontSize: 12, color: CHALK }}>Speichern hat gerade nicht geklappt — sichere deine Daten im Profil-Reiter über „Daten sichern".</span>
          <button onClick={() => setStorageWarning(false)} style={{ color: CHALK_DIM, flexShrink: 0 }}><X size={16} /></button>
        </div>
      )}

      {/* CONTENT */}
      <div key={`${tab}-${stage}`} className="content-fade">
        {tab === "profile" && <ProfileTab profile={profile} setProfile={setProfile} onSave={saveProfile} savedFlash={profileFlash} equipment={equipment} sessions={sessions} onImport={importBackup} />}
        {tab === "equipment" && <EquipmentTab equipment={equipment} setEquipment={setEquipment} onSave={saveEquipment} savedFlash={equipFlash} />}
        {tab === "log" && <LogbookTab sessions={sessions} onRepeat={repeatSession} />}
        {tab === "workout" && stage === "setup" && (
          <WorkoutSetupTab
            equipment={equipment} duration={duration} setDuration={setDuration}
            focus={focus} setFocus={setFocus} surprise={surprise} setSurprise={setSurprise}
            onStart={startWorkout} loading={loadingPlan}
          />
        )}
        {tab === "workout" && stage === "preview" && plan && (
          <WorkoutPreview plan={plan} onSwap={swapExercise} onStart={() => setStage("active")} onBack={backToSetup} />
        )}
        {tab === "workout" && stage === "active" && plan && (
          <ActiveWorkout plan={plan} onFinish={finishWorkout} onExit={exitWorkout} onSkip={recordSkip} photoIndex={photoIndex} />
        )}
        {tab === "workout" && stage === "cooldown" && plan && (
          <Cooldown plan={plan} onSubmit={submitCooldown} />
        )}
        {tab === "workout" && stage === "thanks" && (
          <ThankYou onDone={closeThanks} saveOk={lastSessionSaveOk} />
        )}
      </div>

      {/* BOTTOM NAV */}
      {stage === "setup" && (
        <div className="fixed bottom-0 left-0 right-0 flex mx-auto" style={{ maxWidth: 480, background: PANEL, borderTop: `1.5px solid ${STEEL}` }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} className="flex-1 flex flex-col items-center gap-1 py-3">
                <Icon size={20} color={active ? HAZARD : CHALK_DIM} />
                <span style={{ fontFamily: BODY_FONT, fontSize: 10, color: active ? HAZARD : CHALK_DIM, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

