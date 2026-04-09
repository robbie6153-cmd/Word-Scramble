const rounds = [
  {
    round: 1,
    letters: 4,
    time: 10,
    penalty: 1,
    sets: [
      { letters: "POTS", answers: ["STOP", "POST", "SPOT", "TOPS", "POTS", "OPTS"] },
      { letters: "RACE", answers: ["CARE", "RACE", "ACRE"] },
      { letters: "EAST", answers: ["EAST", "SEAT", "EATS", "TEAS"] },
      { letters: "NOTE", answers: ["NOTE", "TONE"] },
      { letters: "MEAT", answers: ["TEAM", "MEAT", "MATE", "TAME"] }
    ]
  },
  {
    round: 2,
    letters: 5,
    time: 15,
    penalty: 2,
    sets: [
      { letters: "SILENT", answers: ["LISTEN", "SILENT", "ENLIST", "TINSEL", "INLETS"] }, // optional extra long alt, remove if wanted
      { letters: "HEART", answers: ["EARTH", "HEART", "HATER"] },
      { letters: "ALERT", answers: ["ALERT", "ALTER", "LATER", "ARTEL", "RATEL"] },
      { letters: "THING", answers: ["NIGHT", "THING"] },
      { letters: "SCARE", answers: ["SCARE", "RACES", "CARES", "ACRES"] }
    ].map(set => ({
      ...set,
      answers: set.answers.filter(word => word.length === 5)
    }))
  },
  {
    round: 3,
    letters: 6,
    time: 20,
    penalty: 3,
    sets: [
      { letters: "STREAM", answers: ["MASTER", "STREAM", "TAMERS"] },
      { letters: "REPAID", answers: ["PAIRED", "REPAID"] },
      { letters: "SECURE", answers: ["SECURE", "RESCUE", "RECUSE"] },
      { letters: "STALE", answers: ["STEAL", "STALE", "STAEL", "TALES", "TESLA"] }, // filtered below
      { letters: "ANGEL", answers: ["ANGLE", "ANGEL", "GLEAN"] }
    ].map(set => ({
      ...set,
      answers: set.answers.filter(word => word.length === 6)
    }))
  },
  {
    round: 4,
    letters: 7,
    time: 25,
    penalty: 4,
    sets: [
      { letters: "RETAINS", answers: ["STAINER", "RETAINS", "RETINAS", "STEARIN", "ANTSIER"] },
      { letters: "PAINTER", answers: ["PAINTER", "PERTAIN", "REPAINT"] },
      { letters: "DEALING", answers: ["DEALING", "LEADING"] },
      { letters: "RELATES", answers: ["RELATES", "STEALER", "RETALES"] },
      { letters: "HEATING", answers: ["HEATING", "TEAHING"] } // filtered later by exact length, TEAHING removed if wanted
    ].map(set => ({
      ...set,
      answers: [...new Set(set.answers.filter(word => word.length === 7))]
    }))
  },
  {
    round: 5,
    letters: 8,
    time: 30,
    penalty: 5,
    sets: [
      { letters: "INTEGRAL", answers: ["TRIANGLE", "INTEGRAL", "ALTERING", "RELATING"] },
      { letters: "REACTION", answers: ["CREATION", "REACTION"] },
      { letters: "LISTENED", answers: ["SILENTED", "LISTENED"] }, // one simple direct option
      { letters: "DIRECTOR", answers: ["DIRECTOR", "CREDITOR"] },
      { letters: "NOTEBOOK", answers: ["NOTEBOOK"] }
    ].map(set => ({
      ...set,
      answers: [...new Set(set.answers.filter(word => word.length === 8))]
    }))
  },
  {
    round: 6,
    letters: 9,
    time: 35,
    penalty: 6,
    sets: [
      { letters: "EDUCATION", answers: ["EDUCATION"] },
      { letters: "SOMETHING", answers: ["SOMETHING"] },
      { letters: "TELEPHONE", answers: ["TELEPHONE"] },
      { letters: "CHOCOLATE", answers: ["CHOCOLATE"] },
      { letters: "IMPORTANT", answers: ["IMPORTANT"] }
    ].map(set => ({
      ...set,
      answers: [...new Set(set.answers.filter(word => word.length === 9))]
    }))
  },
  {
    round: 7,
    letters: 10,
    time: 40,
    penalty: 7,
    sets: [
      { letters: "BACKGROUND", answers: ["BACKGROUND"] },
      { letters: "BLUEBERRYS", answers: ["BLUEBERRYS"] }, // placeholder; filtered/replace later
      { letters: "BLACKBERRY", answers: ["BLACKBERRY"] },
      { letters: "BASKETBALL", answers: ["BASKETBALL"] },
      { letters: "BOOKSELLER", answers: ["BOOKSELLER"] }
    ].map(set => ({
      ...set,
      answers: [...new Set(set.answers.filter(word => word.length === 10))]
    }))
  }
];

// Clean up any accidental bad data
rounds.forEach(r => {
  r.sets = r.sets.filter(set => set.answers.length > 0 && set.letters.length >= r.letters);
});

const els = {
  startScreen: document.getElementById("start-screen"),
  gameScreen: document.getElementById("game-screen"),
  recapScreen: document.getElementById("recap-screen"),
  endScreen: document.getElementById("end-screen"),

  startBtn: document.getElementById("start-btn"),
  submitBtn: document.getElementById("submit-btn"),
  nextRoundBtn: document.getElementById("next-round-btn"),
  playAgainBtn: document.getElementById("play-again-btn"),
  changeBtn: document.getElementById("change-btn"),

  scrambleDisplay: document.getElementById("scramble-display"),
  answerInput: document.getElementById("answer-input"),
  timer: document.getElementById("timer"),
  round: document.getElementById("round"),
  totalScore: document.getElementById("total-score"),
  message: document.getElementById("message"),

  recapTitle: document.getElementById("recap-title"),
  recapText: document.getElementById("recap-text"),
  countdownText: document.getElementById("countdown-text"),

  finalScore: document.getElementById("final-score"),
  finalSummary: document.getElementById("final-summary")
};

let currentRoundIndex = 0;
let currentSet = null;
let timeLeft = 0;
let timerInterval = null;
let totalScore = 0;
let usedChange = false;
let roundSolved = false;
let lastRoundPoints = 0;
let lastRoundPenaltyUsed = 0;

// ---------- Utility ----------
function shuffleString(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function getRandomSetForRound(roundObj) {
  const index = Math.floor(Math.random() * roundObj.sets.length);
  const selected = roundObj.sets[index];
  return {
    letters: selected.letters.toUpperCase(),
    answers: selected.answers.map(a => a.toUpperCase())
  };
}

function showScreen(screenName) {
  els.startScreen.style.display = "none";
  els.gameScreen.style.display = "none";
  els.recapScreen.style.display = "none";
  els.endScreen.style.display = "none";

  if (screenName === "start") els.startScreen.style.display = "block";
  if (screenName === "game") els.gameScreen.style.display = "block";
  if (screenName === "recap") els.recapScreen.style.display = "block";
  if (screenName === "end") els.endScreen.style.display = "block";
}

function setMessage(text, type = "normal") {
  els.message.textContent = text;
  els.message.className = "";
  els.message.classList.add(type);
}

function updateHUD() {
  els.round.textContent = `Round ${currentRoundIndex + 1} of ${rounds.length}`;
  els.timer.textContent = timeLeft;
  els.totalScore.textContent = totalScore;
}

function updateChangeButton() {
  const penalty = rounds[currentRoundIndex].penalty;

  if (usedChange) {
    els.changeBtn.disabled = true;
    els.changeBtn.textContent = "✖ Used";
    els.changeBtn.classList.add("used");
    els.changeBtn.classList.remove("available");
  } else {
    els.changeBtn.disabled = false;
    els.changeBtn.textContent = `Change Letters (-${penalty} point${penalty > 1 ? "s" : ""})`;
    els.changeBtn.classList.add("available");
    els.changeBtn.classList.remove("used");
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateHUD();

    if (timeLeft <= 5 && timeLeft > 0) {
      els.timer.classList.add("warning");
    } else {
      els.timer.classList.remove("warning");
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timeLeft = 0;
      updateHUD();
      endRound(false);
    }
  }, 1000);
}

function renderScramble(baseLetters) {
  let scrambled = shuffleString(baseLetters);

  // Avoid accidental unchanged layout if possible
  let safety = 0;
  while (scrambled === baseLetters && safety < 10) {
    scrambled = shuffleString(baseLetters);
    safety++;
  }

  els.scrambleDisplay.innerHTML = "";
  scrambled.split("").forEach(letter => {
    const tile = document.createElement("div");
    tile.className = "letter-tile";
    tile.textContent = letter;
    els.scrambleDisplay.appendChild(tile);
  });
}

function startRound() {
  roundSolved = false;
  usedChange = false;
  lastRoundPoints = 0;
  lastRoundPenaltyUsed = 0;

  const roundObj = rounds[currentRoundIndex];
  currentSet = getRandomSetForRound(roundObj);
  timeLeft = roundObj.time;

  els.answerInput.value = "";
  els.answerInput.maxLength = roundObj.letters;
  els.answerInput.focus();
  setMessage(`Solve the ${roundObj.letters}-letter anagram`, "normal");
  updateChangeButton();
  updateHUD();
  renderScramble(currentSet.letters);
  showScreen("game");
  startTimer();
}

function runCountdownAndStartRound() {
  showScreen("recap");
  let count = 3;
  const nextRoundNum = currentRoundIndex + 1;

  els.recapTitle.textContent = `Get ready for Round ${nextRoundNum}`;
  els.recapText.textContent = `${rounds[currentRoundIndex].letters}-letter anagram coming up`;
  els.countdownText.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      els.countdownText.textContent = count;
    } else if (count === 0) {
      els.countdownText.textContent = "Go!";
    } else {
      clearInterval(countdownInterval);
      startRound();
    }
  }, 1000);
}

function validateAnswer() {
  if (!currentSet || roundSolved) return;

  const guess = els.answerInput.value.trim().toUpperCase();
  const requiredLength = rounds[currentRoundIndex].letters;

  if (guess.length !== requiredLength) {
    setMessage(`Enter a ${requiredLength}-letter word`, "error");
    return;
  }

  if (currentSet.answers.includes(guess)) {
    roundSolved = true;
    clearInterval(timerInterval);

    const earned = Math.max(0, timeLeft - lastRoundPenaltyUsed);
    lastRoundPoints = earned;
    totalScore += earned;
    updateHUD();
    endRound(true, guess);
  } else {
    setMessage("Not a valid answer for these letters", "error");
  }
}

function useChangeLetters() {
  if (usedChange || roundSolved || !currentSet) return;

  usedChange = true;
  lastRoundPenaltyUsed = rounds[currentRoundIndex].penalty;

  renderScramble(currentSet.letters);
  updateChangeButton();
  setMessage(`Letters changed. Penalty applied: -${lastRoundPenaltyUsed}`, "normal");
}

function endRound(solved, answer = "") {
  clearInterval(timerInterval);

  const roundNumber = currentRoundIndex + 1;
  const answerList = currentSet ? currentSet.answers.join(", ") : "";
  showScreen("recap");

  if (solved) {
    els.recapTitle.textContent = `Round ${roundNumber} complete`;
    els.recapText.innerHTML = `
      You answered <strong>${answer}</strong><br>
      Time left: <strong>${timeLeft}</strong><br>
      Penalty used: <strong>${lastRoundPenaltyUsed}</strong><br>
      Round score: <strong>${lastRoundPoints}</strong><br>
      Total score: <strong>${totalScore}</strong>
    `;
  } else {
    els.recapTitle.textContent = `Round ${roundNumber} over`;
    els.recapText.innerHTML = `
      Time ran out.<br>
      Possible answer${currentSet.answers.length > 1 ? "s" : ""}: <strong>${answerList}</strong><br>
      Round score: <strong>0</strong><br>
      Total score: <strong>${totalScore}</strong>
    `;
  }

  els.countdownText.textContent = "";

  if (currentRoundIndex >= rounds.length - 1) {
    setTimeout(showEndScreen, 1800);
  } else {
    setTimeout(() => {
      currentRoundIndex++;
      runCountdownAndStartRound();
    }, 1800);
  }
}

function showEndScreen() {
  showScreen("end");
  els.finalScore.textContent = totalScore;
  els.finalSummary.textContent = `You completed ${currentRoundIndex + 1} round${currentRoundIndex + 1 > 1 ? "s" : ""}. Final score: ${totalScore}`;
}

function resetGame() {
  clearInterval(timerInterval);
  currentRoundIndex = 0;
  currentSet = null;
  timeLeft = 0;
  totalScore = 0;
  usedChange = false;
  roundSolved = false;
  lastRoundPoints = 0;
  lastRoundPenaltyUsed = 0;

  els.answerInput.value = "";
  els.message.textContent = "";
  els.timer.classList.remove("warning");
  updateHUD();
  showScreen("start");
}

// ---------- Events ----------
els.startBtn.addEventListener("click", () => {
  currentRoundIndex = 0;
  totalScore = 0;
  runCountdownAndStartRound();
});

els.submitBtn.addEventListener("click", validateAnswer);

els.answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") validateAnswer();
});

els.changeBtn.addEventListener("click", useChangeLetters);

els.playAgainBtn.addEventListener("click", resetGame);

// optional if you add a next-round button later
if (els.nextRoundBtn) {
  els.nextRoundBtn.addEventListener("click", () => {
    if (currentRoundIndex < rounds.length - 1) {
      currentRoundIndex++;
      runCountdownAndStartRound();
    } else {
      showEndScreen();
    }
  });
}

// ---------- Start ----------
resetGame();