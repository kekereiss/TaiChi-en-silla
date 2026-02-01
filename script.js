// --- CONFIGURACIÓN DE RUTINA (12 EJERCICIOS) ---
const baseRoutine = [
    { name: "Apertura del Cofre", baseDuration: 30, phase: "Calentamiento", img: "assets/Apertura del Cofre.mp4", cals: 8, inst: "Abre brazos y expande tu pecho suavemente. Abre brazos resistiendo como si estiraras una banda elástica" },
    { name: "Prensa de Palma Zen", baseDuration: 35, phase: "Fuerza", img: "assets/Prensa de Palma Zen.mp4", cals: 15, inst: "Junta las palmas frente al pecho y presiona una contra otra con fuerza mientras exhalas y estiras los brazos hacia adelante." },
    { name: "Sostener la Luna", baseDuration: 35, phase: "Fuerza", img: "assets/Sostener la Luna.mp4", cals: 12, inst: "Sube las manos sobre la cabeza con las palmas hacia arriba. Tensa los hombros como si levantaras un peso real." },
    { name: "Elevación Lateral", baseDuration: 30, phase: "Fuerza", img: "assets/Elevación Lateral.mp4", cals: 14, inst: "Sube brazos muy lento con los puños cerrados y en tensión.." },
    { name: "Giro de Dragón", baseDuration: 40, phase: "Core", img: "assets/Giro de Dragón.mp4", cals: 18, inst: "Brazos en ángulo de 90°. Gira el torso apretando el abdomen al máximo en cada rotación-" },
    { name: "Remo en Silla", baseDuration: 40, phase: "Fuerza", img: "assets/Remo en Silla.mp4", cals: 20, inst: "Tira de los codos hacia atrás apretando las escápulas." },
    { name: "Patinador Cruzado", baseDuration: 45, phase: "Cardio", img: "assets/Patinador Cruzado.mp4", cals: 30, inst: "Ritmo rápido: mano a pie contrario. Estira una pierna lateralmente mientras mueves el brazo contrario hacia adelante" },
    { name: "Patada Frontal", baseDuration: 40, phase: "Fuerza", img: "assets/Patada Frontal.mp4", cals: 22, inst: "Extiende pierna y mantén 3 segundos arriba." },
    { name: "Abdominales Grulla", baseDuration: 40, phase: "Core", img: "assets/Abdominales Grulla.mp4", cals: 20, inst: "Sube rodilla al pecho mientras bajas codos (crunch)." },
    { name: "Boxeo Tai Chi", baseDuration: 45, phase: "Cardio", img: "assets/Boxeo Tai Chi.mp4", cals: 25, inst: "Golpes lentos pero con el brazo totalmente tenso." },
    { name: "Movilidad de Tobillo", baseDuration: 30, phase: "Movilidad", img: "assets/Movilidad de Tobillo.mp4", cals: 8, inst: "Levanta la pierna, mantenla estirada y haz círculos pequeños con el tobillo mientras mantienes el muslo en tensión." },
    { name: "Cierre de Energía", baseDuration: 40, phase: "Core", img: "assets/Cierre de Energía.mp4", cals: 15, inst: "Manos en rodillas, presiona hacia abajo y mete ombligo activando core." }
];

let routine = [];
let currentIndex = 0;
let timeLeft = 0;
let timerInterval = null;
let isPaused = false;
let breathInterval = null;
let difficultyMultiplier = 1;
let selectedLevelName = "Principiante";
let totalCalories = 0;
const synth = window.speechSynthesis;

// Al cargar
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.opacity = '0';
        setTimeout(() => document.getElementById('splash-screen').style.display = 'none', 500);
    }, 2000);
    updateProgressUI();
});

// Selector de Nivel
function setLevel(name, multiplier) {
    selectedLevelName = name;
    difficultyMultiplier = multiplier;
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.includes(name === "Principiante" ? "Bajo" : name === "Intermedio" ? "Medio" : "Alto"));
    });
}

function startRoutine() {
    routine = baseRoutine.map(ex => ({
        ...ex,
        duration: Math.round(ex.baseDuration * difficultyMultiplier),
        calories: Math.round(ex.cals * difficultyMultiplier)
    }));
    currentIndex = 0;
    totalCalories = 0;
    showScreen('workout-screen');
    speak(`Iniciando nivel ${selectedLevelName}.`);
    loadExercise();
}

function loadExercise() {
    const exercise = routine[currentIndex];
    timeLeft = exercise.duration;
    
    document.getElementById('exercise-name').innerText = exercise.name;
    document.getElementById('phase-badge').innerText = exercise.phase;
    document.getElementById('exercise-instruction').innerText = exercise.inst;
    
    const video = document.getElementById('exercise-video');
    const source = document.getElementById('video-source');
    source.src = exercise.img;
    video.load();
    video.play().catch(e => console.log("Auto-play blocked"));

    speak(`${exercise.name}. ${exercise.inst}`);
    updateTimerDisplay();
    startTimer();
    startBreathing();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            updateTimerDisplay();
            const progress = ((routine[currentIndex].duration - timeLeft) / routine[currentIndex].duration) * 100;
            setProgress(progress);
            if (timeLeft <= 0) nextExercise();
        }
    }, 1000);
}

function setProgress(percent) {
    const circle = document.querySelector('.progress-ring__circle');
    const offset = 226 - (percent / 100) * 226;
    circle.style.strokeDashoffset = offset;
}

function startBreathing() {
    const overlay = document.getElementById('breathing-indicator');
    if(breathInterval) clearInterval(breathInterval);
    let inhala = true;
    overlay.className = 'breath-overlay inhale';
    breathInterval = setInterval(() => {
        if(isPaused) return;
        inhala = !inhala;
        overlay.className = inhala ? 'breath-overlay inhale' : 'breath-overlay exhale';
    }, 3000);
}

function nextExercise() {
    totalCalories += routine[currentIndex].calories;
    document.getElementById('cal-counter').innerText = totalCalories;
    clearInterval(timerInterval);
    currentIndex++;
    if (currentIndex < routine.length) {
        speak("Siguiente.");
        setTimeout(() => loadExercise(), 1500);
    } else {
        finishRoutine();
    }
}

function finishRoutine() {
    clearInterval(timerInterval);
    clearInterval(breathInterval);
    saveData(totalCalories);
    showScreen('finish-screen');
    speak("Rutina completada. ¡Buen trabajo!");
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').innerText = isPaused ? "▶" : "II";
    if(isPaused) synth.cancel();
}

function quitRoutine() {
    clearInterval(timerInterval);
    clearInterval(breathInterval);
    synth.cancel();
    showScreen('home-screen');
}

function speak(t) {
    if (synth.speaking) synth.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'es-ES';
    u.rate = 0.9;
    synth.speak(u);
}

// Persistencia
function saveData(cals) {
    const today = new Date();
    const day = (today.getDay() === 0) ? 6 : today.getDay() - 1;
    let data = JSON.parse(localStorage.getItem('taichi_v2')) || [0,0,0,0,0,0,0];
    data[day] += cals;
    localStorage.setItem('taichi_v2', JSON.stringify(data));
}

function updateProgressUI() {
    const data = JSON.parse(localStorage.getItem('taichi_v2')) || [0,0,0,0,0,0,0];
    document.getElementById('weekly-cals').innerText = data.reduce((a,b)=>a+b, 0);
    const max = Math.max(...data, 200);
    data.forEach((v, i) => {
        const b = document.getElementById(`bar-${i}`);
        if(b) {
            b.style.height = `${Math.max((v/max)*100, 5)}%`;
            if(v > 0) b.classList.add('active');
        }
    });
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}