// Configuración de Rutina
// NOTA: Reemplaza las URLs de 'img' con tus propios archivos GIFs/JPGs
const routine = [
    { 
        name: "Rotación de Cuello", 
        duration: 30, 
        phase: "Calentamiento", 
        img: "assets/Rotacion de cuello.mp4", // Cambiar por: 'assets/cuello.gif'
        instruction: "Gira el cuello suavemente. No fuerces." 
    },
    { 
        name: "Acariciar las Nubes", 
        duration: 45, 
        phase: "Calentamiento", 
        img: "assets/Acariciar las nubes.mp4", 
        instruction: "Inhala subiendo brazos, exhala bajando." 
    },
    { 
        name: "Giro de Cintura", 
        duration: 45, 
        phase: "Calentamiento", 
        img: "assets/Giro de cintura.mp4", 
        instruction: "Manos en rodillas, gira el torso suavemente." 
    },
    { 
        name: "Repeler al Mono", 
        duration: 60, 
        phase: "Tonificación", 
        img: "assets/Repeler al mono.mp4", 
        instruction: "Empuja una mano, retira la otra mirando atrás." 
    },
    { 
        name: "Manos como Nubes", 
        duration: 60, 
        phase: "Tonificación", 
        img: "assets/Manos como nubes.mp4", 
        instruction: "Mueve los brazos de lado a lado fluidamente." 
    },
    { 
        name: "Patear con Talón", 
        duration: 45, 
        phase: "Tonificación", 
        img: "assets/Patear con talon.mp4", 
        instruction: "Extiende la pierna lento. Sostén 2 segundos." 
    },
    { 
        name: "Empujar la Ola", 
        duration: 60, 
        phase: "Tonificación", 
        img: "assets/Empujar la ola.mp4", 
        instruction: "Inclínate adelante empujando, atrás recogiendo." 
    },
    { 
        name: "Marcha Sentada", 
        duration: 120, 
        phase: "Quema-Grasa", 
        img: "assets/Marcha sentada.mp4", 
        instruction: "¡Sube el ritmo! Marcha moviendo brazos." 
    },
    { 
        name: "El Gran Abrazo", 
        duration: 30, 
        phase: "Estiramiento", 
        img: "assets/El gran abrazo.mp4", 
        instruction: "Abre brazos y abrázate fuerte." 
    },
    { 
        name: "Estirar Pierna", 
        duration: 30, 
        phase: "Estiramiento", 
        img: "assets/Estirar pierna.mp4", 
        instruction: "Pierna recta, inclínate un poco adelante." 
    }
];

let currentIndex = 0;
let timeLeft = 0;
let timerInterval = null;
let isPaused = false;
let breathInterval = null;
const synth = window.speechSynthesis;

// Setup Timer Ring
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function speak(text) {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    synth.speak(utterance);
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startRoutine() {
    currentIndex = 0;
    showScreen('workout-screen');
    speak("Bienvenido. Siéntate en el borde de la silla con la espalda recta. Comenzamos.");
    loadExercise();
}

function loadExercise() {
    const exercise = routine[currentIndex];
    timeLeft = exercise.duration;
    
    // Actualizar UI Texto
    document.getElementById('exercise-name').innerText = exercise.name;
    document.getElementById('phase-badge').innerText = exercise.phase;
    document.getElementById('exercise-instruction').innerText = exercise.instruction;
    
    // --- CAMBIO PARA VIDEO ---
    const video = document.getElementById('exercise-video');
    const source = document.getElementById('video-source');
    
    source.src = exercise.img; // Aquí exercise.img ahora será la ruta al .mp4
    video.load(); // Carga el nuevo video
    video.play(); // Lo reproduce
    // Colores dinámicos según fase
    let color = '#4A90E2'; // Default
    if(exercise.phase === "Quema-Grasa") color = '#FF7F50';
    if(exercise.phase === "Estiramiento") color = '#9B59B6';
    
    document.getElementById('exercise-name').style.color = color;
    document.querySelector('.progress-ring__circle').style.stroke = color;

    speak(`${exercise.name}. ${exercise.instruction}`);
    
    updateTimerDisplay();
    startTimer();
    startBreathingGuide();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            updateTimerDisplay();
            
            const totalTime = routine[currentIndex].duration;
            const progress = ((totalTime - timeLeft) / totalTime) * 100;
            setProgress(progress);

            if (timeLeft === Math.floor(routine[currentIndex].duration / 2)) {
                speak("Muy bien, sigue respirando.");
            }

            if (timeLeft <= 0) {
                nextExercise();
            }
        }
    }, 1000);
}

// Simulación visual de respiración (Inhalar/Exhalar) sobre la imagen
function startBreathingGuide() {
    const overlay = document.getElementById('breathing-indicator');
    if(breathInterval) clearInterval(breathInterval);
    
    // Ciclo de 6 segundos (3 in, 3 out)
    let inhaling = true;
    overlay.className = 'breath-overlay inhale'; // Inicio
    
    breathInterval = setInterval(() => {
        if(isPaused) return;
        
        inhaling = !inhaling;
        if(inhaling) {
            overlay.className = 'breath-overlay inhale';
        } else {
            overlay.className = 'breath-overlay exhale';
        }
    }, 3000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').innerText = 
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('pause-btn');
    if (isPaused) {
        btn.innerText = "▶";
        speak("Pausa.");
    } else {
        btn.innerText = "II";
        speak("Continuamos.");
    }
}

function nextExercise() {
    clearInterval(timerInterval);
    clearInterval(breathInterval);
    currentIndex++;
    if (currentIndex < routine.length) {
        speak("Cambio.");
        // Pequeño delay para transición visual
        setTimeout(() => loadExercise(), 1000); 
    } else {
        finishRoutine();
    }
}

function finishRoutine() {
    clearInterval(breathInterval);
    showScreen('finish-screen');
    speak("¡Felicidades! Has completado tu rutina de hoy.");
}

function quitRoutine() {
    clearInterval(timerInterval);
    clearInterval(breathInterval);
    synth.cancel();
    showScreen('home-screen');
}