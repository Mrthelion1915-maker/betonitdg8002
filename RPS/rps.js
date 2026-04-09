// Rock Paper Scissors game logic
 

(
    // Function to retrieve the player data.
    function () {
    var site = window.BetonitSite;
    var sharedProfile = site ? site.requireCurrentUser({ nextPage: "rps.html" }) : null;

    // if statement to return early if the site or sharedProfile is not available, preventing errors in the console.
    if (!site || !sharedProfile) {
        return;
    }

    // Variables for the game,
    // WIN_REWARD is the amount of credits the player gets for winning a round,
    //you can modify this value to increase or decrease the reward for winning.
    var WIN_REWARD = 3;

    //SYMBOLS is an object that maps the choices to their corresponding emoji.
    var SYMBOLS = {
        rock: "✊",
        paper: "✋",
        scissors: "✌"
    };

    // 'state' object to keep track of the game's current status
    var state = {
        playerScore: 0,
        computerScore: 0,
        gameStarted: false,
        isPlaying: false,
        // Initialize wins, losses, and ties from the shared profile stats, Sends the current player's wins, losses, and ties to the state object, allowing the game to display the player's record and update it as they play.
        wins: sharedProfile.stats.rps.wins,
        losses: sharedProfile.stats.rps.losses,
        ties: sharedProfile.stats.rps.ties
    };

    // DOM elements for the game, These variables store references to the rps.html 
    var dom = {
        // Using document.getElementById to access specific buttons by Id
        startButton: document.getElementById("start-btn"),
        playerHand: document.getElementById("player-hand"),
        computerHand: document.getElementById("computer-hand"),
        resultText: document.getElementById("result-text"),
        scoreBoard: document.getElementById("score-board"),
        recordText: document.getElementById("record-text"),
        // Using document.querySelectorAll to select all elements with the class "choice-btn" 
        // and converting the NodeList to an array using Array.prototype.slice.call, allowing for easier manipulation of the choice buttons in the game.
        choiceButtons: Array.prototype.slice.call(document.querySelectorAll(".choice-btn"))
    };

    // Event listeners for the game, These event listeners handle user interactions with the game.
    // allows for quick play without 'Start Game' button after the first game is started.
    dom.startButton.addEventListener("click", startGame);
    
    dom.choiceButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            playRound(button.getAttribute("data-choice"));
        });
    });

    // Event listener to storage credits.
    window.addEventListener("storage", syncFromStorage);
    // Event listener to sync the game state when the page is shown. This ensures that if the player navigates away from the page and then returns, the game will update with the latest wins, losses, and ties from storage. 
    window.addEventListener("pageshow", syncFromStorage);
    // Event listener 'focus' event is fired when the page gains focus, such as when the user clicks on the tab or window containing the game. Both events trigger the syncFromStorage function to update the game state with the latest player data from storage.
    window.addEventListener("focus", syncFromStorage);
    
    // Event listener to sync the game state when the visibility of the page changes. page is minimized or the user switches to a different tab.
    document.addEventListener("visibilitychange", syncFromVisibility);

    // Initial render of the game state, This ensures that when the page loads, the player's record is displayed correctly.
    renderRecord();
    //Update accordingly
    updateChoiceButtons();

    // Function to sync the game state with the latest player data from storage. This function checks if a game is currently in progress (state.isPlaying) and if not, it 
    function syncFromStorage() {
        if (state.isPlaying) {
            return;
        }
        // if points aren't updated, retieve the 'latestProfile' information saved from the user.
        var latestProfile = site.getCurrentUser();

        // if statement confirming the function and calling the specific details to search for.
        if (!latestProfile) {
            return;
        }

        // Return wins, loses, ties, update the function latestProfile accordingly.
        state.wins = latestProfile.stats.rps.wins;
        state.losses = latestProfile.stats.rps.losses;
        state.ties = latestProfile.stats.rps.ties;
        renderRecord();
    }

    // Function for sync progress from storage. 
    function syncFromVisibility() {
        if (document.visibilityState === "visible") {
            syncFromStorage();
        }
    }

    function renderRecord() {
        //refresh the site's UI with the specific number of wins, losses, or ties.
        site.refreshUi();
        // Update the DOM element 'recordText' to display the player's current record of wins, losses, and ties.
        dom.recordText.textContent = state.wins + "W " + state.losses + "L " + state.ties + "T";
    }

    // Update the state of 'rock' , 'paper' , and 'scissors' buttons based on if the 'start game' has been pressed and if a round has been played or not.
    function updateChoiceButtons() {
        dom.choiceButtons.forEach(function (button) {
            button.disabled = !state.gameStarted || state.isPlaying;
        });
        // allows the player to continue playing rounds without having to click the 'Start Game' button again after the first game has been started.
    } 

    // Function that start the game when 'Start Game' button is cliked.
    function startGame() {
        state.gameStarted = true;
        // hides Start game button, 
        dom.startButton.style.display = "none";
        //updates text to "Choose!" 
        dom.resultText.innerText = "Choose!";
        //Enables the choice buttons, 'rock' , 'paper' and 'scissors'.
        updateChoiceButtons();
    }

    //Update scoreboard. 
    function updateRoundScore() {
        // state.playerScore or computerScore + number of rounds (1) 
        dom.scoreBoard.innerText = state.playerScore + " - " + state.computerScore;
    }

    // Call the variable symbols and display on the screen.
    function showHands(playerChoice, computerChoice) {
        //display based on user choice.
        dom.playerHand.textContent = SYMBOLS[playerChoice];
        //display based on computer choice.
        dom.computerHand.textContent = SYMBOLS[computerChoice];

        //Animation calls, makes the animations visible or hidden based on the state of the game, and triggers them.
        dom.playerHand.classList.remove("hidden", "animate");
        dom.computerHand.classList.remove("hidden", "animate");
        dom.playerHand.classList.add("animate");
        dom.computerHand.classList.add("animate");
    }

    // function to translate the player's choice and the computer's choice.
    function playRound(playerChoice) {
        // configure the 3 different choices.
        var choices = ["rock", "paper", "scissors"];
        //let the computer randomly select one of the 3 choices.
        var computerChoice = "";
        //variable to track if the player won the round, initialized to false at the start of each round.
        var playerWon = false;
        // if result type isn't win by computer, or win by player then declare it's a tie.
        var resultType = "tie";

        // Check if the game has started.
        if (!state.gameStarted || state.isPlaying) {
            return;
        }

        // If playing, update the buttons to disble and show the "Wait..." text while the round is being processed.
        state.isPlaying = true;
        updateChoiceButtons();
        dom.resultText.innerText = "Wait...";

        // Show initial hands as rock. 
        dom.playerHand.textContent = SYMBOLS.rock;
        dom.computerHand.textContent = SYMBOLS.rock;

        // Once player chose, trigger animations.
        dom.playerHand.classList.remove("hidden", "animate");
        dom.computerHand.classList.remove("hidden", "animate");
        dom.playerHand.classList.add("shake");
        dom.computerHand.classList.add("shake");

        //Computer Math.
        window.setTimeout(function () {
            //Declare to the computer the options and let it randomly select one of the 3 choices.
            computerChoice = choices[Math.floor(Math.random() * choices.length)];
            //Once computer and player chose, remove share animation.
            dom.playerHand.classList.remove("shake");
            dom.computerHand.classList.remove("shake");
            //Show each one's hand based on the choice.
            showHands(playerChoice, computerChoice);

            // GAME LOGIC 
            //teaching the computer how to determine if it's a win, loss, or tie based on the player's choice and the computer's choice.
            if (playerChoice === computerChoice) {
                // If it's a tie, update the state to reflect the tie and 
                state.ties = state.ties + 1;
                resultType = "tie";
                // update the result text accordingly.
                dom.resultText.innerText = "Tie!";

            } else if (
                // if player's choice is a winner one, and computer isn't.
                (playerChoice === "rock" && computerChoice === "scissors") ||
                (playerChoice === "paper" && computerChoice === "rock") ||
                (playerChoice === "scissors" && computerChoice === "paper")
            ) {
                //Update score and wins if player won, and update the result text accordingly.
                state.playerScore = state.playerScore + 1;
                state.wins = state.wins + 1;
                resultType = "win";
                //show player won, and the amount of credits won.
                playerWon = true;
                dom.resultText.innerText = "You win! +" + WIN_REWARD + " credits";
            } else {
                //interpret anything else as a loss for the player, 
                //update score and losses, 
                state.computerScore = state.computerScore + 1;
                state.losses = state.losses + 1;
                // and update the result text accordingly.
                resultType = "loss";
                dom.resultText.innerText = "You lose! No credits lost";
            }

            //Save the results of the round and update the score round.
            saveResult(resultType, playerWon);
            updateRoundScore();
            renderRecord();
            state.isPlaying = false;
            updateChoiceButtons();
            
            //small delay of 800ms before next round can be played.
        }, 800);
    }

    // Function Save wins loses and ties to the player's profile and update it. 
    function saveResult(resultType, playerWon) {
        site.updateCurrentUser(function (profile) {
            profile.lastGame = "Rock Paper Scissors";

            // if result of game is a win, update the win counter
            if (resultType === "win") {
                profile.credits = profile.credits + WIN_REWARD;
                profile.stats.rps.wins = profile.stats.rps.wins + 1;
            }

            // if result of game is a loss, update the loss counter
            if (resultType === "loss") {
                profile.stats.rps.losses = profile.stats.rps.losses + 1;
            }

            // if result is a tie, update the tie counter
            if (resultType === "tie") {
                profile.stats.rps.ties = profile.stats.rps.ties + 1;
            }

            return profile;
        });
        //If player won, update the credit system.
        if (playerWon) {
            site.refreshUi();
        }
    }
})();
