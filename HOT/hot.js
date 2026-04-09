// Function to get the 'sharedProfile' current user data. 
(function () {
    var site = window.BetonitSite;
    var sharedProfile = site ? site.requireCurrentUser({ nextPage: "hot.html" }) : null;

    if (!site || !sharedProfile) {
        return;
    }
    //determine the reward amount for winning a round.
    var REWARD_AMOUNT = 5;
    var state = {
        //get the user's current credits.
        credits: sharedProfile.credits,
        //get the user's current wins and losses for this game.
        wins: sharedProfile.stats.headsOrTails.wins,
        losses: sharedProfile.stats.headsOrTails.losses,
        //If there's no flipping animation
        isFlipping: false,
        recentFlips: []
    };

    //DOM Elements linked by id's from the hot.html file.
    var dom = {
        coinDisplay: document.getElementById("coin-display"),
        coinMessage: document.getElementById("coin-message"),
        recordText: document.getElementById("record-text"),
        historyList: document.getElementById("flip-history"),
        choiceButtons: Array.prototype.slice.call(document.querySelectorAll(".coin-button"))
    };


    dom.choiceButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            flipCoin(button.getAttribute("data-choice"));
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

    // Function to get the updated shared player's profile.
    function applySharedProfile(profile) {
        if (!profile) {
            return;
        }

        //show's the state of credits
        state.credits = profile.credits;
        //wins in the heads or tails.
        state.wins = profile.stats.headsOrTails.wins;
        //losses in the heads or tails.
        state.losses = profile.stats.headsOrTails.losses;
    }

    // Function to syncFromStorage that is responsible for syncing the game state with the latest player data from storage.
    function syncFromStorage() {
        //callback in case the player is in the middle of flipping.
        if (state.isFlipping) {
            return;
        }

        // get the latest profile data from the site
        var latestProfile = site.getCurrentUser();

        //if latest profile data is not available, exit the function
        if (!latestProfile) {
            return;
        }

        //apply the latest profile data to the game from the Shared profile.
        applySharedProfile(latestProfile);
        render();
    }

    // function to ensure the game is still on sync even with the play switching tabs or closing the browser and coming back to the game.
    function syncFromVisibility() {
        if (document.visibilityState === "visible") {
            syncFromStorage();
        }
    }

    // Function to render the player's record of wins and losses, and the history of recent flips
    function render() {
        //refresh UI
        site.refreshUi();
        // update the DOM elements: wins + new state wins + losses + new state losses.
        dom.recordText.textContent = "Wins: " + state.wins + " · Losses: " + state.losses;

        //If there's no recent flips. 
        if (state.recentFlips.length === 0) {
            //modify the linked HTML element to show the message "No flips yet. Choose a side to start"
            dom.historyList.innerHTML = '<li><span>No flips yet.</span><strong>Choose a side to start</strong></li>';
            //exit the function
            return;
        }

        // Modify the DOM element to show the history of recent flips. 
        dom.historyList.innerHTML = state.recentFlips.map(function (entry) {
            return "<li><span>" + entry.summary + "</span><strong>" + entry.outcome + "</strong></li>";
        }).join("");
    }

    // Disable both buttons during flip.
    function setButtonsDisabled(disabledState) {
        dom.choiceButtons.forEach(function (button) {
            button.disabled = disabledState;
        });
    }

    // Function to add to history the recent outcome of the latest flip.
    function addHistoryLine(summary, outcome) {
        state.recentFlips.unshift({
            summary: summary,
            outcome: outcome
        });

        // Limit the history to the 6 most recent flips. And renew the history list onwards.
        if (state.recentFlips.length > 6) {
            //pop is used to eliminate the oldest flip and return the function to the caller.
            state.recentFlips.pop();
        }
    }

    // Function to handle the coin flip logic when a player makes a choice.
    function flipCoin(playerChoice) {
        // If the coin is currently flipping, cancel.
        if (state.isFlipping) {
            return;
        }

        //if the coin is flipping,
        state.isFlipping = true;
        //if buttons are disbaled
        setButtonsDisabled(true);

        // Force a reflow to restart the CSS animation.
        //getting rid of the class forces the animation to stop and reset 
        dom.coinDisplay.classList.remove("flipping");
        // void is used to determine the widtth of the coin. which forces the browser to recognize the change made and allows the animation to play again.
        void dom.coinDisplay.offsetWidth;
        // Add the "flipping" class to start the animation, and update the display and message to indicate that the coin is flipping.
        dom.coinDisplay.classList.add("flipping");
        // Update the coin display to show "..." while flipping, and set the message to indicate that the coin is being flipped.
        dom.coinDisplay.textContent = "...";
        // Update the message to indicate that the coin is being flipped.
        dom.coinMessage.textContent = "Flipping the coin...";

        //Set a timeout for the processes above.
        window.setTimeout(function () {
            //simulate the coin flip. Mathrandom generates a random number between 0 and 1.
            //if number is below 0.5, the result is "Heads". If it's 0.5 or above, the result its "Tails".
            var result = Math.random() < 0.5 ? "Heads" : "Tails";
            // Determine if the player's choice matches the result of the coin flip.
            var playerWon = playerChoice === result;

            //Stops the flipping animation and updates the coin.
            dom.coinDisplay.classList.remove("flipping");
            dom.coinDisplay.textContent = result.charAt(0);

            //If the player won, update their profile.
            if (playerWon) {
                //update the player's profile with the reward amount, 
                var updatedProfile = site.updateCurrentUser(function (profile) {
                    //update profile credits by adding the reward amount
                    profile.credits = profile.credits + REWARD_AMOUNT;
                    //update the last game played to "Heads or Tails"
                    profile.lastGame = "Heads or Tails";
                    //update the wins for heads or tails by adding 1 to the current wins.
                    profile.stats.headsOrTails.wins = profile.stats.headsOrTails.wins + 1;
                    return profile;
                });

                //apply changes to the current shared profile.
                applySharedProfile(updatedProfile);
                //update the message below the coin to show the result of the coin flip and the reward amount won.
                dom.coinMessage.textContent = "It landed on " + result + ". You win +" + REWARD_AMOUNT + " credits.";
                //adds the outcome of the flip to the history, showing the player's choice, the result of the flip, and that it was a win.
                addHistoryLine("Picked " + playerChoice + ", coin landed on " + result, "Win");
            } else {
                //else if the player lost, update their profile with the loss, 
                var updatedProfile = site.updateCurrentUser(function (profile) {
                    profile.lastGame = "Heads or Tails";
                    profile.stats.headsOrTails.losses = profile.stats.headsOrTails.losses + 1;
                    return profile;
                });

                //update the current shared profile with the loss.
                applySharedProfile(updatedProfile);
                //update the message below the coin to show the result of the coin flip and that no credits were lost.
                dom.coinMessage.textContent = "It landed on " + result + ". No credits lost this round.";
                addHistoryLine("Picked " + playerChoice + ", coin landed on " + result, "Loss");
            }
            // After the flip is resolved, set a timeout to reset the flipping state and enable the buttons again.
            state.isFlipping = false;
            setButtonsDisabled(false);
            render();
        }, 800);
    }
})();
