const historyDiv = document.getElementById('history');
const userInput = document.getElementById('userInput');
const ghostInput = document.getElementById('ghostInput');
const terminalBody = document.getElementById('terminalBody');
const clockElement = document.getElementById('clock');

let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

// 1. Audio Generator (Mechanical Click tanpa file eksternal)
let audioCtx = null;
function playKeyClick() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        let oscillator = audioCtx.createOscillator();
        let gainNode = audioCtx.createGain();
        
        oscillator.type = 'triangle';
        // Frekuensi acak kecil agar suara ketikan terdengar natural/mekanikal
        oscillator.frequency.setValueAtTime(400 + Math.random() * 200, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
        // Fallback jika browser memblokir audio context sebelum interaksi
    }
}

// 2. Real-time Clock di Status Bar
setInterval(() => {
    const now = new Date();
    clockElement.textContent = now.toTimeString().split(' ')[0];
}, 1000);

terminalBody.addEventListener('click', () => {
    if (!isTyping) userInput.focus();
});

const commands = {
    help: "Perintah tersedia:\n- about: Ringkasan profil\n- skills: Daftar keahlian & tech stack\n- projects: Portofolio proyek\n- contact: Kontak & sosial media\n- clear: Bersihkan layar",
    about: "Halo! Saya seorang Fullstack Developer yang hobi mengeksplorasi berbagai teknologi baru. Memiliki pengalaman kuat dalam membangun aplikasi web secara menyeluruh, serta gemar menuangkan kreativitas ke dalam pengembangan game.",
    skills: "Tech Stack & Role Expertise:\n\n> Frontend & Mobile Development\n- React, Vue.js, JavaScript, HTML/CSS\n- UI/UX Design, Mobile App (Flutter)\n\n> Backend & System Architecture\n- Node.js (Express), PHP (Laravel)\n- Java, C/C++\n- RESTful APIs, Microservices, Kafka\n\n> Data Science & Artificial Intelligence\n- Python, Computer Vision (Deepfake & Object Detection)\n- Data Prep, Matplotlib, PowerBI\n- Web Scraping & RPA (Selenium, BeautifulSoup, UiPath)\n\n> DevOps, Infrastructure & QA\n- Docker, Kubernetes, Git, CI/CD Pipeline\n- QA Automation & Testing (Selenium, JUnit)\n\n> Databases & Game Development\n- SQL (Relational) & NoSQL (MongoDB, Graph DB)\n- Game Engines & Libraries (Unity, Godot, Phaser.js)",
    projects: "Featured Projects:\n1. Interactive CLI Portfolio - Web CV berbasis terminal (Proyek ini).\n2. Sistem Backend Lainnya - Proyek sistem kustom.",
    contact: "Let's Connect:\n- Email: zahrananugerah1@gmail.com\n- LinkedIn: linkedin.com/in/zahran-anugerah-rizqullah/\n- GitHub: github.com/Zahran2"
};

const allCommands = [...Object.keys(commands), 'clear'];

// Update Ghost Text untuk Sugesti Otomatis
function updateGhostText() {
    let val = userInput.value.toLowerCase();
    if (val === '') {
        ghostInput.textContent = '';
        return;
    }
    let match = allCommands.find(cmd => cmd.startsWith(val) && cmd !== val);
    if (match) {
        // Tampilkan sisa teks yang belum diketik user secara redup
        ghostInput.textContent = userInput.value + match.slice(val.length);
    } else {
        ghostInput.textContent = '';
    }
}

function typeWriter(text, element, speed = 25, callback) {
    isTyping = true;
    userInput.disabled = true;
    ghostInput.textContent = '';
    let i = 0;
    let formattedText = text.replace(/\n/g, '<br>');

    function typing() {
        if (i < formattedText.length) {
            if (formattedText.substring(i, i + 4) === '<br>') {
                element.innerHTML += '<br>';
                i += 4;
            } else {
                element.innerHTML += formattedText.charAt(i);
                i++;
            }
            terminalBody.scrollTop = terminalBody.scrollHeight;
            setTimeout(typing, speed);
        } else {
            isTyping = false;
            userInput.disabled = false;
            userInput.focus();
            if (callback) callback();
        }
    }
    typing();
}

userInput.addEventListener('input', () => {
    playKeyClick();
    updateGhostText();
});

userInput.addEventListener('keydown', function(event) {
    if (isTyping) return;

    let command = userInput.value.trim().toLowerCase();

    if (event.key === 'Enter') {
        ghostInput.textContent = '';
        if (command !== '') {
            commandHistory.push(userInput.value.trim());
            historyIndex = commandHistory.length;
        }
        
        let commandLog = document.createElement('p');
        commandLog.innerHTML = `<span class="prompt">visitor@portfolio:~$</span> ${userInput.value}`;
        historyDiv.appendChild(commandLog);

        userInput.value = '';

        if (command === 'clear') {
            historyDiv.innerHTML = '';
            terminalBody.scrollTop = terminalBody.scrollHeight;
        } else if (commands[command]) {
            let responseLog = document.createElement('div');
            responseLog.className = 'response-box';
            historyDiv.appendChild(responseLog);
            typeWriter(commands[command], responseLog, 20);
        } else if (command !== '') {
            let errorLog = document.createElement('p');
            errorLog.className = 'error-text';
            errorLog.innerHTML = `zsh: command not found: ${command}. Ketik 'help' untuk bantuan.`;
            historyDiv.appendChild(errorLog);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    } 
    // Terima Ghost Text menggunakan Tombol Panah Kanan atau Tab
    else if (event.key === 'ArrowRight' || event.key === 'Tab') {
        event.preventDefault();
        let val = userInput.value.toLowerCase();
        let match = allCommands.find(cmd => cmd.startsWith(val));
        if (match) {
            userInput.value = match;
            ghostInput.textContent = '';
        }
    }
    else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (commandHistory.length > 0 && historyIndex > 0) {
            historyIndex--;
            userInput.value = commandHistory[historyIndex];
            updateGhostText();
        }
    } 
    else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
            historyIndex++;
            userInput.value = commandHistory[historyIndex];
            updateGhostText();
        } else {
            historyIndex = commandHistory.length;
            userInput.value = '';
            ghostInput.textContent = '';
        }
    }
});