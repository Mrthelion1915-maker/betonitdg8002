(function () {
    var site = window.BetonitSite;
    var sharedProfile = site ? site.requireCurrentUser({ nextPage: "bj.html" }) : null;

    if (!site || !sharedProfile) {
        return;
    }

    var RESULT_IMAGES = {
        playerBlackjack: "../imgs/bj/Images/blackjackplayer.png",
        dealerBlackjack: "../imgs/bj/Images/blackjackdealer.png",
        playerWin: "../imgs/bj/Images/playerwins.png",
        dealerWin: "../imgs/bj/Images/dealerwins.png",
        playerBust: "../imgs/bj/Images/playerbust.png",
        dealerBust: "../imgs/bj/Images/dealerbust.png",
        push: "../imgs/bj/Images/tie.png",
        noCredits: "../imgs/bj/Images/nocredits.png"
    };

    var SUITS = ["clubs", "diamonds", "hearts", "spades"];
    var RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    var dom = {
        startRoundButton: document.getElementById("startnewround"),
        hitButton: document.getElementById("hit"),
        standButton: document.getElementById("stand"),
        betInput: document.getElementById("betamount"),
        dealerCards: document.getElementById("dealercards"),
        playerCards: document.getElementById("playercards"),
        dealerTotal: document.getElementById("dealertotal"),
        playerTotal: document.getElementById("playertotal"),
        scoreboard: document.getElementById("scoreboard"),
        creditsDisplay: document.getElementById("creditsdisplay"),
        roundMessage: document.getElementById("roundmessage"),
        resultBox: document.getElementById("result"),
        resultImage: document.getElementById("resultimage")
    };

    var state = {
        credits: sharedProfile.credits,
        currentUser: sharedProfile.name,
        currentBet: 0,
        deck: [],
        playerHand: [],
        dealerHand: [],
        roundActive: false,
        revealDealer: false,
        stats: {
            wins: sharedProfile.stats.blackjack.wins,
            losses: sharedProfile.stats.blackjack.losses,
            pushes: sharedProfile.stats.blackjack.pushes
        }
    };

    dom.startRoundButton.addEventListener("click", startRound);
    dom.hitButton.addEventListener("click", hitPlayer);
    dom.standButton.addEventListener("click", standPlayer);
    dom.betInput.addEventListener("input", clampBetInput);
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("pageshow", syncFromStorage);
    window.addEventListener("focus", syncFromStorage);
    document.addEventListener("visibilitychange", syncFromVisibility);

    updateDisplay();
    clampBetInput();

    function applySharedProfile(profile) {
        if (!profile) {
            return;
        }

        state.credits = profile.credits;
        state.currentUser = profile.name;
        state.stats.wins = profile.stats.blackjack.wins;
        state.stats.losses = profile.stats.blackjack.losses;
        state.stats.pushes = profile.stats.blackjack.pushes;
    }

    function syncFromStorage() {
        if (state.roundActive) {
            return;
        }

        var latestProfile = site.getCurrentUser();

        if (!latestProfile) {
            return;
        }

        applySharedProfile(latestProfile);
        clampBetInput();
        updateDisplay();
    }

    function syncFromVisibility() {
        if (document.visibilityState === "visible") {
            syncFromStorage();
        }
    }

    function createDeck() {
        var deck = [];
        var rankIndex = 0;
        var suitIndex = 0;

        for (suitIndex = 0; suitIndex < SUITS.length; suitIndex = suitIndex + 1) {
            for (rankIndex = 0; rankIndex < RANKS.length; rankIndex = rankIndex + 1) {
                deck.push({
                    rank: RANKS[rankIndex],
                    suit: SUITS[suitIndex],
                    image: "../imgs/bj/CardImgs/" + RANKS[rankIndex] + SUITS[suitIndex] + ".png"
                });
            }
        }

        return shuffle(deck);
    }

    function shuffle(deck) {
        var copy = deck.slice();
        var index = 0;
        var swapIndex = 0;
        var temp = null;

        for (index = copy.length - 1; index > 0; index = index - 1) {
            swapIndex = Math.floor(Math.random() * (index + 1));
            temp = copy[index];
            copy[index] = copy[swapIndex];
            copy[swapIndex] = temp;
        }

        return copy;
    }

    function drawCard() {
        return state.deck.pop();
    }

    function getCardValue(card) {
        if (card.rank === "A") {
            return 11;
        }

        if (card.rank === "K" || card.rank === "Q" || card.rank === "J") {
            return 10;
        }

        return parseInt(card.rank, 10);
    }

    function getHandTotal(hand) {
        var total = 0;
        var aces = 0;
        var index = 0;

        for (index = 0; index < hand.length; index = index + 1) {
            total = total + getCardValue(hand[index]);

            if (hand[index].rank === "A") {
                aces = aces + 1;
            }
        }

        while (total > 21 && aces > 0) {
            total = total - 10;
            aces = aces - 1;
        }

        return total;
    }

    function renderHands() {
        renderHand(dom.playerCards, state.playerHand, false);
        renderHand(dom.dealerCards, state.dealerHand, !state.revealDealer && state.roundActive);

        dom.playerTotal.textContent = state.playerHand.length > 0 ? "Total: " + getHandTotal(state.playerHand) : "";

        if (state.dealerHand.length === 0) {
            dom.dealerTotal.textContent = "";
        }
        else if (!state.revealDealer && state.roundActive) {
            dom.dealerTotal.textContent = "Showing: " + getCardValue(state.dealerHand[0]);
        }
        else {
            dom.dealerTotal.textContent = "Total: " + getHandTotal(state.dealerHand);
        }
    }

    function renderHand(container, hand, hideSecondCard) {
        var html = "";
        var index = 0;
        var card = null;

        for (index = 0; index < hand.length; index = index + 1) {
            card = hand[index];

            if (hideSecondCard && index === 1) {
                html = html + '<img src="../imgs/bj/CardImgs/backcard.png" alt="Hidden card">';
            }
            else {
                html = html + '<img src="' + card.image + '" alt="' + card.rank + " of " + card.suit + '">';
            }
        }

        container.innerHTML = html;
    }

    function updateDisplay() {
        renderHands();
        dom.scoreboard.textContent =
            "Wins: " + state.stats.wins + "\n" +
            "Losses: " + state.stats.losses + "\n" +
            "Pushes: " + state.stats.pushes;
        dom.creditsDisplay.textContent =
            "Credits: " + state.credits + "\n" +
            "Current Bet: " + getSelectedBet();
        dom.betInput.max = Math.max(state.credits, 1);
        site.refreshUi();
    }

    function setRoundMessage(message) {
        dom.roundMessage.textContent = message;
    }

    function clampBetInput() {
        var selectedBet = parseInt(dom.betInput.value, 10);

        if (state.credits <= 0) {
            dom.betInput.value = 0;
            return;
        }

        if (isNaN(selectedBet) || selectedBet < 1) {
            selectedBet = 1;
        }

        if (selectedBet > state.credits) {
            selectedBet = state.credits;
        }

        dom.betInput.value = selectedBet;
        updateDisplay();
    }

    function getSelectedBet() {
        var selectedBet = parseInt(dom.betInput.value, 10);

        if (isNaN(selectedBet) || selectedBet < 1) {
            return 0;
        }

        return selectedBet;
    }

    function setControlsForRound(isRoundActive) {
        state.roundActive = isRoundActive;
        dom.startRoundButton.disabled = isRoundActive;
        dom.hitButton.disabled = !isRoundActive;
        dom.standButton.disabled = !isRoundActive;
        dom.betInput.disabled = isRoundActive || state.credits <= 0;
    }

    function saveCreditsOnly(betAmount) {
        var roundStarted = false;
        var updatedProfile = site.updateCurrentUser(function (profile) {
            if (betAmount <= 0 || betAmount > profile.credits) {
                return profile;
            }

            profile.credits = profile.credits - betAmount;
            profile.lastGame = "Blackjack";
            roundStarted = true;
            return profile;
        });

        if (updatedProfile) {
            applySharedProfile(updatedProfile);
        }

        return roundStarted;
    }

    function saveFinishedRound(resultType) {
        var updatedProfile = site.updateCurrentUser(function (profile) {
            profile.lastGame = "Blackjack";

            if (resultType === "win") {
                profile.credits = profile.credits + (state.currentBet * 2);
                profile.stats.blackjack.wins = profile.stats.blackjack.wins + 1;
            }

            if (resultType === "loss") {
                profile.stats.blackjack.losses = profile.stats.blackjack.losses + 1;
            }

            if (resultType === "push") {
                profile.credits = profile.credits + state.currentBet;
                profile.stats.blackjack.pushes = profile.stats.blackjack.pushes + 1;
            }

            return profile;
        });

        if (updatedProfile) {
            applySharedProfile(updatedProfile);
        }
    }

    function startRound() {
        var betAmount = getSelectedBet();
        var playerTotal = 0;
        var dealerTotal = 0;
        var latestProfile = null;
        var roundStarted = false;

        if (state.roundActive) {
            return;
        }

        latestProfile = site.getCurrentUser();

        if (latestProfile) {
            applySharedProfile(latestProfile);
            clampBetInput();
            betAmount = getSelectedBet();
        }

        if (state.credits <= 0 || betAmount <= 0) {
            showResultImage("noCredits");
            setRoundMessage("You have no credits left here. Use a reward game from the hub to earn more.");
            updateDisplay();
            return;
        }

        if (betAmount > state.credits) {
            setRoundMessage("That bet is higher than your current credits.");
            return;
        }

        roundStarted = saveCreditsOnly(betAmount);

        if (!roundStarted) {
            state.currentBet = 0;
            setRoundMessage("That bet is higher than your current credits.");
            clampBetInput();
            updateDisplay();
            return;
        }

        state.currentBet = betAmount;
        state.deck = createDeck();
        state.playerHand = [drawCard(), drawCard()];
        state.dealerHand = [drawCard(), drawCard()];
        state.revealDealer = false;

        setControlsForRound(true);
        renderHands();
        updateDisplay();
        setRoundMessage("Round started. Hit for another card or stand to hold.");

        playerTotal = getHandTotal(state.playerHand);
        dealerTotal = getHandTotal(state.dealerHand);

        if (playerTotal === 21 && dealerTotal === 21) {
            finishRound("push", "Both sides hit blackjack. Bet returned.", "push");
            return;
        }

        if (playerTotal === 21) {
            finishRound("win", "Blackjack! You win this round.", "playerBlackjack");
            return;
        }

        if (dealerTotal === 21) {
            finishRound("loss", "Dealer blackjack. You lose this round.", "dealerBlackjack");
        }
    }

    function hitPlayer() {
        var playerTotal = 0;

        if (!state.roundActive) {
            return;
        }

        state.playerHand.push(drawCard());
        renderHands();
        updateDisplay();

        playerTotal = getHandTotal(state.playerHand);

        if (playerTotal > 21) {
            finishRound("loss", "Player busts. Dealer wins.", "playerBust");
            return;
        }

        if (playerTotal === 21) {
            setRoundMessage("You hit 21. Stand to make the dealer play.");
            return;
        }

        setRoundMessage("Player total is " + playerTotal + ". Hit again or stand.");
    }

    function standPlayer() {
        var dealerTotal = 0;
        var playerTotal = 0;

        if (!state.roundActive) {
            return;
        }

        state.revealDealer = true;

        while (getHandTotal(state.dealerHand) < 17) {
            state.dealerHand.push(drawCard());
        }

        dealerTotal = getHandTotal(state.dealerHand);
        playerTotal = getHandTotal(state.playerHand);
        renderHands();
        updateDisplay();

        if (dealerTotal > 21) {
            finishRound("win", "Dealer busts. You win this round.", "dealerBust");
            return;
        }

        if (playerTotal > dealerTotal) {
            finishRound("win", "Player beats the dealer.", "playerWin");
            return;
        }

        if (playerTotal < dealerTotal) {
            finishRound("loss", "Dealer beats the player.", "dealerWin");
            return;
        }

        finishRound("push", "Push. Your bet is returned.", "push");
    }

    function finishRound(resultType, message, imageKey) {
        state.revealDealer = true;

        saveFinishedRound(resultType);
        setControlsForRound(false);
        renderHands();
        updateDisplay();
        setRoundMessage(message);
        showResultImage(imageKey);
        clampBetInput();

        if (state.credits <= 0) {
            setRoundMessage(message + " You are out of credits, so head to a reward game to build your balance back up.");
        }
    }

    function showResultImage(imageKey) {
        dom.resultImage.src = RESULT_IMAGES[imageKey];
        dom.resultBox.classList.remove("show");

        void dom.resultBox.offsetWidth;

        dom.resultBox.classList.add("show");

        window.setTimeout(function () {
            dom.resultBox.classList.remove("show");
        }, 1600);
    }
})();
