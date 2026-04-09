(() => {
  // creating a global space for the credits system to interact with the page.
  const site = window.BetonitSite;


  if (!site) {
    return;
  }

  // parsing URL parameters and setting up initial state and DOM references.
  const params = new URLSearchParams(window.location.search);
  //Get 'currentProfile' site getCurrentUser() method to check if a user is currently signed in. 
  const currentProfile = site.getCurrentUser();

  
  const state = {
    redirectTarget: params.get("next") && params.get("next") !== "index.html" ? params.get("next") : ""
  };

  // DOM refrences for other elements on the JS file to interact with, coming from the HTML file.
  const dom = {
    signInOverlay: document.getElementById("signin-overlay"),
    nameInput: document.getElementById("player-name"),
    ageCheck: document.getElementById("age-check"),
    enterBtn: document.getElementById("btn-enter"),
    closeSignInBtn: document.getElementById("btn-signin-close"),
    openSignInBtn: document.getElementById("open-signin-btn"),
    signOutBtn: document.getElementById("sign-out-btn"),
    welcomeName: document.getElementById("welcome-name"),
    leaderboardList: document.getElementById("lb-list")
  };

  // like DOM, but this 2 are for the filters on the main page... (we can get rid on them if we want... we only have 6 elements.)
  const nodeLists = {
    filterBtns: Array.from(document.querySelectorAll(".filter-btn")),
    gameCards: Array.from(document.querySelectorAll(".game-card"))
  };

  // Function 'checkForm' checks if the form input is valid or not,
  // by checking if the name input is not empty and if the age checkbox is checked.
  function checkForm() {
    //enter.btn its disabled unless, 
    // 1. nameInput gets any value [trim () is used to trim any extra spaces ] 
    // 2. ageCheck is checked.
    dom.enterBtn.disabled = dom.nameInput.value.trim() === "" || !dom.ageCheck.checked;
  }

  //function for the leaderboard.
  function renderLeaderboardRow(player, index) {
    const rankClass = index === 0 ? "r1" : index === 1 ? "r2" : index === 2 ? "r3" : "";
    return `
      <div class="lb-row">
        <div class="lb-rank ${rankClass}">#${index + 1}</div>
        <div class="lb-av" style="background:${player.avatarBg};color:${player.avatarCol}">${player.avatar}</div>
        <div class="lb-info">
          <div class="lb-name">${player.name}</div>
          <div class="lb-game">${player.lastGame} · ${site.getTotalWins(player)} total wins</div>
        </div>
        <div class="lb-score">${player.credits} cr</div>
      </div>`;
  }

  function renderLeaderboard() {
    // Gets the list of players from the site. <- We are ranking by credits right now.  IMPORTANT -> *Leaderboard is not shared.*
    // Which means every one of us will have a different leaderboard. <- This is based on your cookies (I think there's nothing to solve this, except a centralized backend aka.database) 
    const players = site.getLeaderboard();

    //if statement if there's 0 players,
    if (players.length === 0) {
      // Show the following message in the leaderboard section.
      dom.leaderboardList.innerHTML = '<div class="leaderboard-empty">Sign in and play a game to create the first shared leaderboard entry.</div>';
      return;
    }

    // Gets the leaderboard list from the HTML. Creates a 'map' of the players in index.
    dom.leaderboardList.innerHTML = players.map(renderLeaderboardRow).join("");
  }

  // Function 'updateHeaderButtons' updates the golden letters on the top of the mainpage.
  function updateHeaderButtons(profile) {
    //gets the current user profile name.
    const hasUser = Boolean(profile);
    // Appears, disappears the sign in, sign out buttons based on the user status. (if there's a user, show sign out button, if there's no user, show sign in button.)
    dom.openSignInBtn.classList.toggle("hidden-ui", hasUser);
    dom.signOutBtn.classList.toggle("hidden-ui", !hasUser);
  }


  function renderHome() {
    const profile = site.getCurrentUser();
    site.refreshUi(profile);
    updateHeaderButtons(profile);
    dom.welcomeName.textContent = profile ? profile.name : "Guest";
    renderLeaderboard();
  }

  function syncHomeUi() {
    renderHome();
  }

  function openSignIn(forceRequired) {
    const profile = site.getCurrentUser();

    dom.signInOverlay.classList.add("open");
    dom.closeSignInBtn.classList.toggle("hidden-ui", !profile || forceRequired);
    dom.nameInput.value = profile ? profile.name : "";
    dom.ageCheck.checked = false;
    checkForm();
    window.setTimeout(() => dom.nameInput.focus(), 0);
  }

  function closeSignIn() {
    if (!site.getCurrentUser()) {
      return;
    }

    dom.signInOverlay.classList.remove("open");
  }

  function finishSignIn() {
    const enteredName = dom.nameInput.value.trim().replace(/\s+/g, " ");

    if (!enteredName || !dom.ageCheck.checked) {
      return;
    }

    const profile = site.setCurrentUser(enteredName);

    if (!profile) {
      return;
    }

    dom.signInOverlay.classList.remove("open");
    renderHome();

    if (state.redirectTarget) {
      window.location.href = state.redirectTarget;
      return;
    }

    window.history.replaceState({}, "", "index.html");
  }

  function applyFilter(filterKey) {
    nodeLists.filterBtns.forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-filter") === filterKey);
    });

    nodeLists.gameCards.forEach((card) => {
      const matchesCategory = card.getAttribute("data-cat") === filterKey;
      const matchesType = card.getAttribute("data-type") === filterKey;
      const isVisible = filterKey === "all" || matchesCategory || matchesType;
      card.classList.toggle("hidden", !isVisible);
    });
  }

  dom.nameInput.addEventListener("input", checkForm);
  dom.ageCheck.addEventListener("change", checkForm);
  dom.enterBtn.addEventListener("click", finishSignIn);
  dom.closeSignInBtn.addEventListener("click", closeSignIn);
  dom.openSignInBtn.addEventListener("click", () => {
    state.redirectTarget = "";
    openSignIn(false);
  });

  nodeLists.filterBtns.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.getAttribute("data-filter")));
  });

  nodeLists.gameCards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card.getAttribute("data-ready") !== "true") {
        window.alert("This page is still unfinished, so it is staying as a coming-soon card for now.");
        return;
      }

      if (!site.getCurrentUser()) {
        state.redirectTarget = card.getAttribute("data-route") || "";
        openSignIn(true);
        return;
      }

      window.location.href = card.getAttribute("data-route");
    });
  });

  window.addEventListener("storage", syncHomeUi);
  window.addEventListener("pageshow", syncHomeUi);
  window.addEventListener("focus", syncHomeUi);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncHomeUi();
    }
  });

  renderHome();
  applyFilter("all");
  checkForm();

  if (!currentProfile || params.get("signin") === "1") {
    openSignIn(!currentProfile);
  }
})();
