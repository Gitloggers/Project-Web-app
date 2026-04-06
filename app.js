// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Timer Logic
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startPauseBtn = document.getElementById('start-pause');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const timerInput = document.getElementById('timer-input');
const progressCircle = document.querySelector('.orbit-progress');
const timerContainer = document.querySelector('.timer-container');

let timer;
let isRunning = false;
let timeLeft = 25 * 60; 
let totalTime = 25 * 60;
const radius = 45;
const circumference = 2 * Math.PI * radius;

function setCustomTime() {
    if (isRunning) return;
    const minutes = parseInt(timerInput.value);
    if (minutes > 0 && minutes <= 120) {
        timeLeft = minutes * 60;
        totalTime = timeLeft;
        updateDisplay();
    }
}

timerInput.addEventListener('change', setCustomTime);
timerInput.addEventListener('keyup', setCustomTime);

// Background interaction logic
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.body.style.setProperty('--mouse-x', `${x}%`);
    document.body.style.setProperty('--mouse-y', `${y}%`);
});

// Initial progress circle setup
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = 0;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');

    // Update SVG progress
    const offset = circumference - (timeLeft / totalTime) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function startTimer() {
    if (isRunning) return;
    setCustomTime(); // Final sync before starting
    isRunning = true;
    timerInput.disabled = true; // Lock input while running
    startPauseBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    timerContainer.classList.add('running');

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            timerInput.disabled = false; // Re-enable input
            startPauseBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            timerContainer.classList.remove('running');
            timerContainer.classList.add('finished');
            setTimeout(() => timerContainer.classList.remove('finished'), 1000);
            playNotificationSound();
            alert('Time is up!');
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timer);
    timerInput.disabled = false; // Re-enable input while paused
    startPauseBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    timerContainer.classList.remove('running');
}

function resetTimer() {
    pauseTimer();
    timeLeft = totalTime;
    updateDisplay();
}

function playNotificationSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4 note

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

startPauseBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial display
updateDisplay();
