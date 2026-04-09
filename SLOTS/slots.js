var site = window.BetonitSite;
var sharedProfile = site ? site.requireCurrentUser({ nextPage: "slots.html" }) : null;

if (site && sharedProfile) {

var SYMBOLS = {
    seven: { key: "seven", icon: "7", label: "Seven", className: "seven" },
    bar: { key: "bar", icon: "BAR", label: "BAR", className: "bar" },
    bell: { key: "bell", icon: "🔔", label: "Bell", className: "bell" },
    cherry: { key: "cherry", icon: "🍒", label: "Cherry", className: "cherry" },
    lemon: { key: "lemon", icon: "🍋", label: "Lemon", className: "lemon" },
    orange: { key: "orange", icon: "🍊", label: "Orange", className: "orange" },
    grape: { key: "grape", icon: "🍇", label: "Grape", className: "grape" },
    watermelon: { key: "watermelon", icon: "🍉", label: "Watermelon", className: "watermelon" }
};

var ALL_KEYS = ["seven", "bar", "bell", "cherry", "lemon", "orange", "grape", "watermelon"];
var FRUIT_KEYS = ["cherry", "lemon", "orange", "grape", "watermelon"];
var SAFE_KEYS = ["bar", "bell", "lemon", "orange", "grape", "watermelon"];

var CELL_HEIGHT = 100;
var BASE_SPIN_ITEMS = 22;

var currentUser = sharedProfile.name;
var credits = sharedProfile.credits;
var spinning = false;

var currentBetMode = "fixed";
var currentBetValue = 1;

var userNameBox = document.querySelector("#userName");
var creditsValueBox = document.querySelector("#creditsValue");
var betValueBox = document.querySelector("#betValue");
var messageBox = document.querySelector("#messageBox");

function setMessage(text) {
    if (messageBox) {
        messageBox.textContent = text;
    }
}

var spinButton = document.querySelector("#spinButton");
var betButtons = document.querySelectorAll(".bet-button");
var betStepButtons = document.querySelectorAll(".bet-step-button");
var customBetInput = document.querySelector("#customBetInput");

var reel1 = document.querySelector("#reel1");
var reel2 = document.querySelector("#reel2");
var reel3 = document.querySelector("#reel3");
var reels = [reel1, reel2, reel3];

attachBetButtonEvents();
attachActionEvents();
randomizeAllReels();
syncFromProfile(sharedProfile);
syncBetUI();

window.addEventListener("storage", syncFromStorage);
window.addEventListener("pageshow", syncFromStorage);
window.addEventListener("focus", syncFromStorage);
document.addEventListener("visibilitychange", syncFromVisibility);

function syncFromStorage() {
    var latestProfile = site.getCurrentUser();

    if (!latestProfile) {
        return;
    }

    applySharedProfile(latestProfile);
    normalizeBetSelection();
    syncBetUI();
}

function syncFromVisibility() {
    if (document.visibilityState === "visible") {
        syncFromStorage();
    }
}

function syncFromProfile(profile) {
    applySharedProfile(profile);
    normalizeBetSelection();
    syncBetUI();
}

function applySharedProfile(profile) {
    if (!profile) {
        return;
    }

    currentUser = profile.name;
    credits = profile.credits;
}

function saveProfileUpdate(wonSpin, winAmount) {
    var updatedProfile = site.updateCurrentUser(function (profile) {
        if (winAmount > 0) {
            profile.credits = profile.credits + winAmount;
        }

        profile.lastGame = "Slots";
        profile.stats.slots.spins = profile.stats.slots.spins + 1;

        if (wonSpin == true) {
            profile.stats.slots.wins = profile.stats.slots.wins + 1;
        }

        return profile;
    });

    if (updatedProfile) {
        applySharedProfile(updatedProfile);
    }
}

function saveSpinStart(betAmount) {
    var spinStarted = false;
    var updatedProfile = site.updateCurrentUser(function (profile) {
        if (betAmount <= 0 || betAmount > profile.credits) {
            return profile;
        }

        profile.credits = profile.credits - betAmount;
        profile.lastGame = "Slots";
        spinStarted = true;
        return profile;
    });

    if (updatedProfile) {
        applySharedProfile(updatedProfile);
    }

    return spinStarted;
}

function attachBetButtonEvents() {
    var i = 0;

    for (i = 0; i < betButtons.length; i = i + 1) {
        betButtons[i].addEventListener("click", changeBet);
    }

    for (i = 0; i < betStepButtons.length; i = i + 1) {
        betStepButtons[i].addEventListener("click", adjustBet);
    }

    customBetInput.addEventListener("input", applyCustomBet);
}

function attachActionEvents() {
    spinButton.addEventListener("click", spinMachine);
}

function randomFrom(list) {
    var randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

function shuffleArray(list) {
    var copy = list.slice();
    var i = 0;
    var j = 0;
    var temp = "";

    for (i = copy.length - 1; i > 0; i = i - 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }

    return copy;
}

function getSymbolObject(key) {
    return SYMBOLS[key];
}

function changeBet() {
    if (spinning == true) {
        return;
    }

    var selectedBet = this.getAttribute("data-bet");

    if (selectedBet == "all") {
        currentBetMode = "all";
    }
    else {
        setFixedBet(parseInt(selectedBet, 10));
    }

    if (credits > 0) {
        setMessage("Bet set to " + getActualBet() + " credits.");
    }

    syncBetUI();
}

function adjustBet() {
    if (spinning == true || credits <= 0) {
        return;
    }

    var adjustValue = parseInt(this.getAttribute("data-adjust"), 10);
    var nextBet = getActualBet() + adjustValue;

    setFixedBet(nextBet);
    setMessage("Bet set to " + getActualBet() + " credits.");
    syncBetUI();
}

function applyCustomBet() {
    if (spinning == true || credits <= 0) {
        return;
    }

    var typedBet = parseInt(customBetInput.value, 10);

    if (isNaN(typedBet) == true) {
        typedBet = currentBetMode == "all" ? credits : currentBetValue;
    }

    setFixedBet(typedBet);
    setMessage("Bet set to " + getActualBet() + " credits.");
    syncBetUI();
}

function setFixedBet(nextBet) {
    currentBetMode = "fixed";
    currentBetValue = clampBet(nextBet);
}

function clampBet(nextBet) {
    if (credits <= 0) {
        return 0;
    }

    if (isNaN(nextBet) == true || nextBet < 1) {
        return 1;
    }

    if (nextBet > credits) {
        return credits;
    }

    return nextBet;
}

function syncCustomBetInput() {
    if (credits <= 0) {
        customBetInput.value = "";
        customBetInput.max = 1;
        return;
    }

    customBetInput.max = credits;
    customBetInput.value = getActualBet();
}

function syncBetUI() {
    updateBetButtons();
    updateStatus();
    syncCustomBetInput();
}

function normalizeBetSelection() {
    if (credits <= 0) {
        currentBetValue = 0;
        return;
    }

    if (currentBetMode == "fixed" && currentBetValue > credits) {
        currentBetValue = credits;
    }

    if (currentBetMode == "fixed" && currentBetValue < 1) {
        currentBetValue = 1;
    }
}

function getActualBet() {
    if (credits <= 0) {
        return 0;
    }

    if (currentBetMode == "all") {
        return credits;
    }

    return currentBetValue;
}

function updateStatus() {
    userNameBox.textContent = currentUser;
    creditsValueBox.textContent = credits;
    betValueBox.textContent = getActualBet();
    site.refreshUi();
}

function updateBetButtons() {
    var i = 0;
    var buttonValue = "";
    var isSelected = false;
    var numericValue = 0;
    var currentAmount = getActualBet();
    var adjustedValue = 0;

    for (i = 0; i < betButtons.length; i = i + 1) {
        buttonValue = betButtons[i].getAttribute("data-bet");
        isSelected = false;

        if (currentBetMode == "all" && buttonValue == "all") {
            isSelected = true;
        }

        if (currentBetMode == "fixed" && buttonValue != "all") {
            numericValue = parseInt(buttonValue, 10);
            if (numericValue == currentBetValue) {
                isSelected = true;
            }
        }

        if (isSelected == true) {
            betButtons[i].classList.add("selected");
        }
        else {
            betButtons[i].classList.remove("selected");
        }

        if (buttonValue == "all") {
            betButtons[i].disabled = (credits <= 0);
        }
        else {
            numericValue = parseInt(buttonValue, 10);
            betButtons[i].disabled = (numericValue > credits || credits <= 0);
        }
    }

    for (i = 0; i < betStepButtons.length; i = i + 1) {
        if (credits <= 0) {
            betStepButtons[i].disabled = true;
        }
        else {
            adjustedValue = currentAmount + parseInt(betStepButtons[i].getAttribute("data-adjust"), 10);
            betStepButtons[i].disabled = (adjustedValue < 1 || adjustedValue > credits);
        }
    }

    customBetInput.disabled = (credits <= 0);
}

function setControlsDisabled(disabledState) {
    var i = 0;

    spinButton.disabled = disabledState;

    for (i = 0; i < betButtons.length; i = i + 1) {
        betButtons[i].disabled = disabledState;
    }

    for (i = 0; i < betStepButtons.length; i = i + 1) {
        betStepButtons[i].disabled = disabledState;
    }

    customBetInput.disabled = disabledState;

    if (disabledState == false) {
        updateBetButtons();
        syncCustomBetInput();
    }
}

function buildStaticStrip(centerKey) {
    return [randomFrom(ALL_KEYS), centerKey, randomFrom(ALL_KEYS)];
}

function randomizeAllReels() {
    var i = 0;
    clearMatchedCells();

    for (i = 0; i < reels.length; i = i + 1) {
        setStaticReel(reels[i], randomFrom(ALL_KEYS));
    }
}

function setStaticReel(reelElement, centerKey) {
    var track = reelElement.querySelector(".reel-track");
    var strip = buildStaticStrip(centerKey);

    track.innerHTML = "";

    appendSymbol(track, strip[0], "side");
    appendSymbol(track, strip[1], "center");
    appendSymbol(track, strip[2], "side");

    track.style.transition = "none";
    track.style.transform = "translateY(0px)";
}

function appendSymbol(trackElement, key, positionClass) {
    var symbolObject = getSymbolObject(key);
    var symbolElement = document.createElement("div");

    symbolElement.className = "reel-symbol " + symbolObject.className + " " + positionClass;
    symbolElement.textContent = symbolObject.icon;
    symbolElement.setAttribute("data-key", key);

    trackElement.appendChild(symbolElement);
}

function buildSpinSequence(targetKey) {
    var sequence = [];
    var i = 0;

    for (i = 0; i < BASE_SPIN_ITEMS; i = i + 1) {
        sequence.push(randomFrom(ALL_KEYS));
    }

    sequence.push(randomFrom(ALL_KEYS));
    sequence.push(targetKey);
    sequence.push(randomFrom(ALL_KEYS));

    return sequence;
}

function clearMatchedCells() {
    var matched = document.querySelectorAll(".reel-symbol.matched");
    var i = 0;

    for (i = 0; i < matched.length; i = i + 1) {
        matched[i].classList.remove("matched");
    }
}

function spinReel(reelElement, targetKey, duration) {
    return new Promise(function (resolve) {
        var track = reelElement.querySelector(".reel-track");
        var sequence = buildSpinSequence(targetKey);
        var finalTranslate = -((sequence.length - 3) * CELL_HEIGHT);
        var i = 0;

        track.innerHTML = "";

        for (i = 0; i < sequence.length; i = i + 1) {
            if (i == sequence.length - 3 || i == sequence.length - 1) {
                appendSymbol(track, sequence[i], "side");
            }
            else if (i == sequence.length - 2) {
                appendSymbol(track, sequence[i], "center");
            }
            else {
                appendSymbol(track, sequence[i], "center");
            }
        }

        reelElement.classList.add("spinning");
        track.style.transition = "none";
        track.style.transform = "translateY(0px)";

        track.offsetHeight;

        requestAnimationFrame(function () {
            track.style.transition = "transform " + duration + "ms cubic-bezier(0.12, 0.8, 0.2, 1)";
            track.style.transform = "translateY(" + finalTranslate + "px)";
        });

        function handleTransitionEnd(event) {
            if (event.propertyName != "transform") {
                return;
            }

            track.removeEventListener("transitionend", handleTransitionEnd);
            reelElement.classList.remove("spinning");

            resolve({
                reel: reelElement,
                centerCell: track.children[sequence.length - 2]
            });
        }

        track.addEventListener("transitionend", handleTransitionEnd);
    });
}

function createOutcome(betAmount) {
    var roll = Math.random() * 100;
    var result = {
        centers: [],
        matched: [false, false, false],
        win: 0,
        message: ""
    };

    if (roll < 2) {
        result.centers = ["seven", "seven", "seven"];
        result.matched = [true, true, true];
        result.win = betAmount * 30;
        result.message = "777 JACKPOT. +" + result.win + " credits.";
        return result;
    }

    if (roll < 5) {
        result.centers = ["bar", "bar", "bar"];
        result.matched = [true, true, true];
        result.win = betAmount * 18;
        result.message = "Triple BAR. +" + result.win + " credits.";
        return result;
    }

    if (roll < 10) {
        result.centers = ["bell", "bell", "bell"];
        result.matched = [true, true, true];
        result.win = betAmount * 10;
        result.message = "Triple bells. +" + result.win + " credits.";
        return result;
    }

    if (roll < 18) {
        var fruitKey = randomFrom(FRUIT_KEYS);
        result.centers = [fruitKey, fruitKey, fruitKey];
        result.matched = [true, true, true];
        result.win = betAmount * 7;
        result.message = "Three matching fruit. +" + result.win + " credits.";
        return result;
    }

    if (roll < 26) {
        return createTwoOfKindOutcome("seven", 5, "Two 7s. +5 credits.");
    }

    if (roll < 36) {
        return createTwoOfKindOutcome("cherry", 3, "Two cherries. +3 credits.");
    }

    if (roll < 51) {
        return createGenericPairOutcome();
    }

    if (roll < 61) {
        return createSingleSymbolOutcome("seven", 1, "One 7. +1 credit.");
    }

    if (roll < 72) {
        return createSingleSymbolOutcome("cherry", 1, "One cherry. +1 credit.");
    }

    return createLoseOutcome();
}

function createTwoOfKindOutcome(targetKey, payout, message) {
    var positions = shuffleArray([0, 1, 2]);
    var pairPositions = [positions[0], positions[1]];
    var thirdKey = randomFrom(SAFE_KEYS.slice());

    var centers = ["", "", ""];
    centers[pairPositions[0]] = targetKey;
    centers[pairPositions[1]] = targetKey;
    centers[positions[2]] = thirdKey;

    return {
        centers: centers,
        matched: [
            centers[0] == targetKey,
            centers[1] == targetKey,
            centers[2] == targetKey
        ],
        win: payout,
        message: message
    };
}

function createGenericPairOutcome() {
    var pairKey = randomFrom(["bar", "bell", "lemon", "orange", "grape", "watermelon"]);
    var positions = shuffleArray([0, 1, 2]);
    var otherChoices = SAFE_KEYS.filter(function (key) {
        return key != pairKey;
    });
    var thirdKey = randomFrom(otherChoices);

    var centers = ["", "", ""];
    centers[positions[0]] = pairKey;
    centers[positions[1]] = pairKey;
    centers[positions[2]] = thirdKey;

    return {
        centers: centers,
        matched: [
            centers[0] == pairKey,
            centers[1] == pairKey,
            centers[2] == pairKey
        ],
        win: 2,
        message: "Pair of " + getSymbolObject(pairKey).label + ". +2 credits."
    };
}

function createSingleSymbolOutcome(targetKey, payout, message) {
    var targetPosition = Math.floor(Math.random() * 3);
    var others = shuffleArray(SAFE_KEYS).slice(0, 2);

    var centers = ["", "", ""];
    centers[targetPosition] = targetKey;

    if (targetPosition == 0) {
        centers[1] = others[0];
        centers[2] = others[1];
    }
    else if (targetPosition == 1) {
        centers[0] = others[0];
        centers[2] = others[1];
    }
    else {
        centers[0] = others[0];
        centers[1] = others[1];
    }

    return {
        centers: centers,
        matched: [
            centers[0] == targetKey,
            centers[1] == targetKey,
            centers[2] == targetKey
        ],
        win: payout,
        message: message
    };
}

function createLoseOutcome() {
    var keys = shuffleArray(SAFE_KEYS).slice(0, 3);

    return {
        centers: keys,
        matched: [false, false, false],
        win: 0,
        message: "No win this spin."
    };
}

async function spinMachine() {
    if (spinning == true) {
        return;
    }

    var latestProfile = site.getCurrentUser();

    if (latestProfile) {
        applySharedProfile(latestProfile);
    }

    normalizeBetSelection();
    syncBetUI();

    var betAmount = getActualBet();
    var spinStarted = false;

    if (credits <= 0 || betAmount <= 0) {
        setMessage(currentUser + " is out of credits. Try a reward game from the home page to earn more.");
        return;
    }

    if (betAmount > credits) {
        setMessage("That bet is too high for your current credits.");
        return;
    }

    spinning = true;
    clearMatchedCells();
    spinStarted = saveSpinStart(betAmount);

    if (spinStarted == false) {
        spinning = false;
        setMessage("That bet is too high for your current credits.");
        normalizeBetSelection();
        syncBetUI();
        return;
    }

    syncBetUI();
    setControlsDisabled(true);

    setMessage("Spinning for " + betAmount + " credits...");

    var outcome = createOutcome(betAmount);

    var spinResults = await Promise.all([
        spinReel(reel1, outcome.centers[0], 1400),
        spinReel(reel2, outcome.centers[1], 1850),
        spinReel(reel3, outcome.centers[2], 2300)
    ]);

    finishSpin(outcome, spinResults);
}

function finishSpin(outcome, spinResults) {
    var i = 0;
    var wonSpin = outcome.win > 0;

    for (i = 0; i < spinResults.length; i = i + 1) {
        if (outcome.matched[i] == true) {
            spinResults[i].centerCell.classList.add("matched");
        }
    }

    saveProfileUpdate(wonSpin, outcome.win);
    normalizeBetSelection();
    syncBetUI();
    setControlsDisabled(false);

    spinning = false;
    setMessage(outcome.message);

    if (credits <= 0) {
        setMessage(outcome.message + " " + currentUser + " is now out of credits.");
    }
}
}
