/*
  Higher or Lower: 
  - Uses the existing HTML structure as a foundation
  - Fetches album/artist data from a local database series of 25 albums (ALBUMS.JS)
  - Uses stored data by default for easy local testing
*/

const DOM = {
  leftSection: document.querySelector(".left-section"),
  rightSection: document.querySelector(".right-section"),
  leftCard: document.querySelector(".left-card"),
  rightCard: document.querySelector(".right-card"),
  leftCover: document.querySelector(".left-section .album-cover"),
  rightCover: document.querySelector(".right-section .album-cover"),
  leftHeading: document.querySelector(".left-heading"),
  leftDescription: document.querySelector(".left-description"),
  leftValue: document.querySelector(".left-sub-heading"),
  rightHeading: document.querySelector(".right-heading"),
  rightDescription: document.querySelector(".right-description"),
  higherBtn: document.querySelector(".higher-btn"),
  lowerBtn: document.querySelector(".lower-btn"),
  scoreDisplay: document.querySelector(".score"),
  highScoreDisplay: document.querySelector(".high-score"),
  feedback: null
};

const state = {
  currentAlbum: null,
  nextAlbum: null,
  score: 0,
  highScore: Number(localStorage.getItem("albumHigherLowerHighScore") || 0),
  gameActive: true
};

// Create feedback element
DOM.feedback = document.createElement("p");
DOM.feedback.className = "feedback";
DOM.rightSection.insertBefore(DOM.feedback, DOM.scoreDisplay);

// Functions
function getRandomAlbum(exclude = null) {
  let album;
  do {
    album = CONFIG.MOCK_ALBUMS[Math.floor(Math.random() * CONFIG.MOCK_ALBUMS.length)];
  } while (exclude && album.id === exclude.id);
  return album;
}

function updateDisplay() {
  // Update left card
  DOM.leftCover.src = state.currentAlbum.albumCover;
  DOM.leftHeading.textContent = state.currentAlbum.albumName;
  DOM.leftDescription.textContent = `By ${state.currentAlbum.artistName}`;
  // Show total records sold for current album
  DOM.leftValue.textContent = `Records sold: ${state.currentAlbum.sales} million`;


  // Update right card
  DOM.rightCover.src = state.nextAlbum.albumCover;
  DOM.rightHeading.textContent = state.nextAlbum.albumName;
  DOM.rightDescription.textContent = `By ${state.nextAlbum.artistName}`;

  // Update scores
  DOM.scoreDisplay.textContent = `Score: ${state.score}`;
  DOM.highScoreDisplay.textContent = `High Score: ${state.highScore}`;

  // Clear feedback
  DOM.feedback.textContent = "";
  DOM.feedback.className = "feedback";
}

function checkGuess(isHigher) {
  if (!state.gameActive) return;

  const correct = isHigher ? state.nextAlbum.sales > state.currentAlbum.sales : state.nextAlbum.sales < state.currentAlbum.sales;

  if (correct) {
    state.score++;
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem("albumHigherLowerHighScore", state.highScore);
    }
    
    // Add 4 credits to the player's profile
    window.BetonitSite.changeCredits(4);
    
    DOM.feedback.textContent = "Correct!";
    DOM.feedback.classList.add("correct");
    // Move to next round
    state.currentAlbum = state.nextAlbum;
    state.nextAlbum = getRandomAlbum(state.currentAlbum);
    updateDisplay();
  } else {

    DOM.feedback.textContent = "Wrong!";
    DOM.feedback.classList.add("incorrect");
    state.gameActive = false;
    DOM.higherBtn.disabled = true;
    DOM.lowerBtn.disabled = true;
    // Reset after delay
    setTimeout(() => {
      state.score = 0;
      state.gameActive = true;
      DOM.higherBtn.disabled = false;
      DOM.lowerBtn.disabled = false;
      initGame();
    }, 3000);
  }
}

function initGame() {
  state.currentAlbum = getRandomAlbum();
  state.nextAlbum = getRandomAlbum(state.currentAlbum);
  updateDisplay();
}

// Event listeners
DOM.higherBtn.addEventListener("click", () => checkGuess(true));
DOM.lowerBtn.addEventListener("click", () => checkGuess(false));

// Start the game
initGame();
