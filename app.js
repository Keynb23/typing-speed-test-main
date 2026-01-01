let allQuotesData = {};
let startTime = null;
let currentWpm = 0;
let currentAccuracy = 0;
let currentText = "";

const textDisplay = document.getElementById("text-display");
const inputField = document.getElementById("input-field");
const wpmLabel = document.getElementById("wpm");
const accuracyLabel = document.getElementById("accuracy");
const scoreLabel = document.getElementById("score");
const usernameInput = document.getElementById("username-input");
const difficultySelect = document.getElementById("difficulty-select");
const predWpmSpan = document.getElementById("pred-wpm");
const predAccSpan = document.getElementById("pred-acc");
const submitBtn = document.getElementById("submit-btn");

// --- MODAL LOGIC ---
const modal = document.getElementById("instruction-modal");
const overlay = document.getElementById("modal-overlay");
const closeBtn = document.getElementById("close-modal-btn");
const gotItBtn = document.getElementById("got-it-btn");

function closeModal() {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
}

if (closeBtn) closeBtn.onclick = closeModal;
if (gotItBtn) gotItBtn.onclick = closeModal;
if (overlay) overlay.onclick = closeModal;

// --- DATA LOADING ---
fetch('./data.json')
    .then(res => res.json())
    .then(data => { allQuotesData = data; })
    .catch(err => console.error('Failed to load data.json:', err));

// --- INPUT FIELD CONTROLS ---
inputField.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" || e.key === "Enter") {
        e.preventDefault();
    }
});

// --- START TEST ---
async function startTest() {
    const username = usernameInput.value.trim() || "Guest";
    const level = difficultySelect.value;
    
    if (!allQuotesData[level] || allQuotesData[level].length === 0) {
        alert('Please wait for quotes to load or check data.json');
        return;
    }

    const quote = allQuotesData[level][Math.floor(Math.random() * allQuotesData[level].length)].text;

    const oldFeedback = document.getElementById("test-feedback");
    if (oldFeedback) oldFeedback.remove();
    
    textDisplay.innerHTML = "";
    inputField.value = "";
    inputField.disabled = false;
    inputField.focus();
    startTime = null;
    submitBtn.style.display = "none";

    try {
        const res = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, text: quote })
        });
        const data = await res.json();
        predWpmSpan.innerText = data.wpm;
        predAccSpan.innerText = (typeof data.accuracy === 'number') ? data.accuracy + "%" : data.accuracy;
    } catch (err) {
        console.error('Prediction error:', err);
        predWpmSpan.innerText = "OFF";
        predAccSpan.innerText = "OFF";
    }

    quote.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        textDisplay.appendChild(span);
    });
}

// --- INPUT HANDLER ---
inputField.addEventListener("input", () => {
    if (!startTime) startTime = new Date();
    
    const arrayQuote = textDisplay.querySelectorAll("span");
    const arrayValue = inputField.value.split("");
    let correctCount = 0;

    arrayQuote.forEach((span, i) => {
        const char = arrayValue[i];
        if (char == null) {
            span.className = "";
        } else if (char === span.innerText) {
            span.className = "correct";
            correctCount++;
        } else {
            span.className = "incorrect";
        }
    });

    const elapsed = (new Date() - startTime) / 60000;
    const wpm = Math.round((correctCount / 5) / elapsed) || 0;
    const accuracy = arrayValue.length > 0 ? Math.round((correctCount / arrayValue.length) * 100) : 0;
    
    wpmLabel.innerText = wpm;
    accuracyLabel.innerText = accuracy + "%";
    scoreLabel.innerText = Math.round(wpm * (accuracy / 100));

    // Store values for later submission
    currentWpm = wpm;
    currentAccuracy = accuracy;
    currentText = textDisplay.innerText;

    // When test is complete, show submit button
    if (arrayValue.length === arrayQuote.length && arrayQuote.length > 0) {
        inputField.disabled = true;
        submitBtn.style.display = "inline-block";
        
        const feedback = document.createElement("p");
        feedback.id = "test-feedback";
        feedback.style.marginTop = "15px";
        feedback.style.color = "#6466e9";
        feedback.innerHTML = `Test Complete! Click "Submit Results" to save. Actual: ${wpm} WPM | AI Forecast: ${predWpmSpan.innerText}`;
        textDisplay.after(feedback);
    }
});

// --- SUBMIT RESULTS ---
async function submitResults() {
    const username = usernameInput.value.trim() || "Guest";
    
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    try {
        const response = await fetch('http://127.0.0.1:5000/train', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                text: currentText, 
                wpm: currentWpm, 
                accuracy: currentAccuracy 
            })
        });
        
        if (response.ok) {
            submitBtn.innerText = "Submitted ✓";
            submitBtn.style.backgroundColor = "#4ade80";
            
            const feedback = document.getElementById("test-feedback");
            if (feedback) {
                feedback.innerHTML = `Results Saved! Actual: ${currentWpm} WPM | AI Forecast: ${predWpmSpan.innerText}`;
            }
        } else {
            console.error('Train endpoint returned error:', response.status);
            submitBtn.innerText = "Error - Try Again";
            submitBtn.disabled = false;
        }
    } catch (e) { 
        console.error("Save error", e);
        submitBtn.innerText = "Error - Try Again";
        submitBtn.disabled = false;
    }
}

// --- BUTTON HANDLERS ---
document.getElementById("start-btn").onclick = startTest;

document.getElementById("reset-btn").onclick = () => {
    inputField.value = "";
    inputField.disabled = true;
    textDisplay.innerHTML = "";
    wpmLabel.innerText = "0";
    accuracyLabel.innerText = "0%";
    scoreLabel.innerText = "0";
    submitBtn.style.display = "none";
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Results";
    submitBtn.style.backgroundColor = "";
    const feedback = document.getElementById("test-feedback");
    if (feedback) feedback.remove();
};

submitBtn.onclick = submitResults;