(function () {
    // Shared Credit System.
    var site = window.BetonitSite;
    // Carries out the credits.
    var sharedProfile = site ? site.requireCurrentUser({ nextPage: "bj.html" }) : null;

    if (!site || !sharedProfile) {
        return;
    }


    ///____________________________result images____________________________///
    // Path to Images 
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
    
    // Constant Values to make the suits and the card numbers visible to the computer
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
	const suits = ["spades", "hearts", "diamonds", "clubs"];

				const originalcredits = sharedProfile.credits;
    var credits = originalcredits;
    var blackjackPlayerImage = RESULT_IMAGES.playerBlackjack;
    var blackjackDealerImage = RESULT_IMAGES.dealerBlackjack;
    var playerWinsImage = RESULT_IMAGES.playerWin;
    var dealerWinsImage = RESULT_IMAGES.dealerWin;
    var playerBustImage = RESULT_IMAGES.playerBust;
    var dealerBustImage = RESULT_IMAGES.dealerBust;
    var tieImage = RESULT_IMAGES.push;
    var noCreditsImage = RESULT_IMAGES.noCredits;

    function syncCreditsFromSystem() {
        const currentUser = site.getCurrentUser();
        credits = currentUser ? currentUser.credits : 0;
    }

    function changeCredits(amount) {
        const updatedProfile = site.changeCredits(amount);

        if (updatedProfile) {
            credits = updatedProfile.credits;
        } else {
            credits = Math.max(0, credits + amount);
        }

        updateCredits();
        return updatedProfile;
    }


    ///____________________________Define Variable____________________________///
				
	// 2nd Card of dealer (Hidden Card)			
	const dealerhiddencard = "../imgs/bj/CardImgs/backcard.png";

	var deck = []; ///define a deck of 52 cards, not player deck or dealer deck
	var playerdeck = [];
	var dealerdeck = [];

	var playerWins = 0;
	var dealerWins = 0;
	var ties = 0;
	var gamesPlayed = 0;
				
    var isAnimating = false; ///use to stop button spamming causing card to add rapidly
				// const originalcredits = 1000;
				// var credits = originalcredits;
				var wincredit = 30;
				var losecredit = -30;
				var tiecredit = 15;

///____________________________glowing effect____________________________///
				var goldGlow =
				  "drop-shadow(0 0 1vmin rgba(232, 208, 128, 1)) " +
				  "drop-shadow(0 0 3vmin rgba(232, 208, 128, 0.7)) " +
				  "drop-shadow(0 0 6vmin rgba(232, 208, 128, 0.4))";

				var redGlow =
				  "drop-shadow(0 0 1vmin rgba(235, 84, 84, 1)) " +
				  "drop-shadow(0 0 3vmin rgba(235, 84, 84, 0.7)) " +
				  "drop-shadow(0 0 6vmin rgba(235, 84, 84, 0.4))";

				var silverGlow =
				  "drop-shadow(0 0 1vmin rgba(161, 161, 161, 1)) " +
				  "drop-shadow(0 0 3vmin rgba(161, 161, 161, 0.7)) " +
				  "drop-shadow(0 0 6vmin rgba(161, 161, 161, 0.4))";

	///____________________________need at least 7 actions____________________________///

	    		var startnewround = document.querySelector("#startnewround");
	    		var hit = document.querySelector("#hit");
	    		var stand = document.querySelector("#stand");
	    		var resetscore = document.querySelector("#resetscore");

	    		startnewround.addEventListener("click", deal);
	    		hit.addEventListener("click", hitCard);
	    		stand.addEventListener("click", standCard);
	    		resetscore.addEventListener("click", resetScore);
	    		updateScore();
	    		updateCredits();

	    		var titleGlow = document.querySelector("#title");
				var h2Glow = document.querySelector("#dealertitle");
				var h3Glow = document.querySelector("#playertitle");

				titleGlow.addEventListener("mouseover", textWhenHover);
				titleGlow.addEventListener("mouseout", textReset);

				h2Glow.addEventListener("mouseover", textWhenHover);
				h2Glow.addEventListener("mouseout", textReset);

				h3Glow.addEventListener("mouseover", textWhenHover);
				h3Glow.addEventListener("mouseout", textReset);

	///____________________________define function____________________________///

	  			function buildDeck(){
					for (let i = 0; i < values.length; i++) {
		  				for (let j = 0; j < suits.length; j++) {
						    let fulldeck = {
						      value: values[i],
						      suit: suits[j],
						      image: "../imgs/bj/CardImgs/" + values[i] + suits[j] + ".png"
						    }

		    				deck.push(fulldeck); ///add card to array, doesn't replace the first element
						}
					}
	    		}

	  			function shuffle(){
	  				for (let i = deck.length - 1; i > 0; i--) {
	    				let j = Math.floor(Math.random() * (i + 1)); ///math.random generate random decimal number between 0 to 1. Then 

	    				let temp = deck[i]; ///create a temp variable where deck[i] is stored
	  					deck[i] = deck[j]; /// deck[j] to replace the position of deck[i]
	  			 		deck[j] = temp; ///deck[j] is replaced by the value of deck[i] store in temp. Basically these 3 lines swap i and j around
	  				}
				}


				function deal(){

					if (!checkCredits()) return; ///check if user has enough credit
					credits = credits - 10; ///cost to play
					updateCredits();

					// if (isAnimating) return;
				    // isAnimating = true;

                    var bet = parseInt(document.querySelector("#betamount").value);
					wincredit = bet * 3;
					losecredit = -bet * 3;
					tiecredit = Math.floor(bet * 1.5);

					if (bet > credits || credits < 0) {

						showResultImage(noCreditsImage,"lose");
						document.querySelector("#startnewround").disabled = true;
						return;
					}

					changeCredits(-bet); ///cost to play
					if (isAnimating) return;
				    isAnimating = true;


				    document.querySelector("#startnewround").disabled = true;
				    document.querySelector("#hit").disabled = true;
				    document.querySelector("#stand").disabled = true;

					///reset last game's player and dealer deck
					playerdeck = [];
					dealerdeck = [];

					///clear all card images from the screen and result(UI)
					clearResultImage();
					document.querySelector("#playercards").innerHTML = "";
					document.querySelector("#dealercards").innerHTML = "";
					document.querySelector("#playertotal").textContent = "";
	    			document.querySelector("#dealertotal").textContent = "";


					//rebuild full deck
					deck = [];
					buildDeck();

					///shuffle deck with math.random
					shuffle();
					shuffleAnimation();

					var playerCardPlacement = document.querySelector("#playercards");
					var dealerCardPlacement = document.querySelector("#dealercards");


					///draw cards
					var playercard1 = deck.pop(); ///use pop because it takes the element from the array and remove it, to prevent duplication
					var dealercard1 = deck.pop();
					var playercard2 = deck.pop();	
					var dealercard2 = deck.pop();				
					

					///deal card animation
					setTimeout(() => {
				        playerdeck.push(playercard1);
				        displayCard(playercard1, playerCardPlacement);
				        document.querySelector("#playertotal").textContent = "Total: " + getTotal(playerdeck);
				    }, 700);

				    setTimeout(() => {
				    	dealerdeck.push(dealercard1);
				        displayCard(dealercard1, dealerCardPlacement);
				        document.querySelector("#dealertotal").textContent = "Total: " + getTotal(dealerdeck);
				    }, 1000);

				    setTimeout(() => {
				    	playerdeck.push(playercard2);
				        displayCard(playercard2, playerCardPlacement);
				        document.querySelector("#playertotal").textContent = "Total: " + getTotal(playerdeck);
				    }, 1300);

				    setTimeout(() => {///this delay mimics the dealer checking his card
				    	dealerdeck.push(dealercard2);
				        displayCard(dealercard2, dealerCardPlacement, true);


						///check Blackjack on deal
				        setTimeout(() => {
					        if (isBlackjack(playerdeck) || isBlackjack(dealerdeck)) {
					            revealDealerCard();
					            updateScore();
					            document.querySelector("#dealertotal").textContent = "Total: " + getTotal(dealerdeck);

					            setTimeout(checkBlackjackOnDeal, 1200);///this delays the result popping up
					        } else {
					            gameStart();
					        }
					    }, 500);
				    }, 1600);				
					
				}

				function displayCard(cardinfo,cardplacement, hidden = false){
					var cardImage = document.createElement("img");///createElement means create image element in javascript
					cardImage.src = cardinfo.image;

					if (hidden) {
				        cardImage.src = dealerhiddencard;
				        cardImage.dataset.realImage = cardinfo.image;
				        cardImage.dataset.hidden = "true";
				    } else {
				        cardImage.src = cardinfo.image;
				    }


					if (cardplacement.id === "playercards") {
				        cardImage.classList.add("cardplayer");
				    } else {
				        cardImage.classList.add("carddealer");
				    }

					
					cardplacement.appendChild(cardImage);///appendChild means putting the cardimage inside the div with id playercards

								
					cardImage.offsetHeight; ///force browser to apply the initial state first
					cardImage.classList.add("cardenteractive");
				}

				function getTotal(cards){ ///the parameter is set so both player deck and dealer deck can use this function to calculate
					var total = 0;
					let aceCount = 0;

					for (let i=0; i < cards.length; i++){
						if(cards[i].value == "J" || cards[i].value == "Q" || cards[i].value == "K"){
							total = total + 10;
						}
						else if (cards[i].value == "A"){
							total = total + 11;
							aceCount = aceCount +1;
						}
						else{
							total = total + Number(cards[i].value);
						}
					}

					while (total > 21 && aceCount > 0) {
						total = total - 10;
						aceCount = aceCount - 1;
					}

					return total;
				}

				function hitCard(){
					//block spamming
					if (isAnimating) return;
    				isAnimating = true;
    				document.querySelector("#hit").disabled = true;
    				document.querySelector("#stand").disabled = true;



					var newPlayerCard = deck.pop(); ///take card from the full deck, full deck remove that card
					playerdeck.push(newPlayerCard); ///add that card to player deck


					///display new card on screen
					var newPlayerCardPlacement = document.querySelector("#playercards");
					displayCard(newPlayerCard, newPlayerCardPlacement);

					///recalculate with getTotal function
					var hitUpdateTotal = document.querySelector("#playertotal")
					hitUpdateTotal.textContent = "Total: " + getTotal(playerdeck);

					setTimeout(() => { ///timeout to prevent spamming
						if (getTotal(playerdeck) > 21) {
							setTimeout(() => {
								revealDealerCard();
								document.querySelector("#dealertotal").textContent = "Total: " + getTotal(dealerdeck);
							}, 200);
							setTimeout(() => { ///timeout before showing result
								showResultImage(playerBustImage,"lose");
								dealerWins = dealerWins + 1;
								changeCredits(losecredit);
								updateScore();
								gameOver();
								isAnimating = false;
							}, 1900);
						}
						else{
							isAnimating = false;
							document.querySelector("#hit").disabled = false;
							document.querySelector("#stand").disabled = false;
						}					
					}, 1000);

				}

				function standCard(){
					document.querySelector("#hit").disabled = true;
	    			document.querySelector("#stand").disabled = true;
					var newDealerCardPlacement = document.querySelector("#dealercards"); ///put outside while loop because the code doesn't need to find this element every iteration.
					var hitUpdateTotal = document.querySelector("#dealertotal")
					
					revealDealerCard();
	    			document.querySelector("#dealertotal").textContent = "Total: " + getTotal(dealerdeck);

					setTimeout(() => {
						if(getTotal(dealerdeck) < 17){
							var newDealerCard = deck.pop(); ///take card from the full deck, full deck remove that card
							dealerdeck.push(newDealerCard); ///add that card to dealer deck
							displayCard(newDealerCard, newDealerCardPlacement); 
							hitUpdateTotal.textContent = "Total: " + getTotal(dealerdeck); ///recalculate with getTotal function

							///timeout to mimick human speed, so the dealer doesn't look like it picks 2 cards at the same time
							setTimeout(dealerPlay, 1000);
						}
						else{
							setTimeout(checkWinner, 700);
						}
					}, 1200);
				}

				function revealDealerCard(){
				    const dealerCards = document.querySelector("#dealercards").children;

				    for (let i = 0; i < dealerCards.length; i++) {
				        if (dealerCards[i].dataset.hidden === "true") {
				            const card = dealerCards[i];

				            card.classList.add("flipcard");

				            // first half of flip
				            card.style.transform = "rotateY(90deg)";

				            setTimeout(() => {
				                // swap image at midpoint
				                card.src = card.dataset.realImage;
				                card.dataset.hidden = "false";

				                // second half of flip
				                card.style.transform = "rotateY(0deg)";
				            }, 350);

				            break;
				        }
				    }
				}

				function dealerPlay(){
					var newDealerCardPlacement = document.querySelector("#dealercards"); ///put outside while loop because the code doesn't need to find this element every iteration.
					var hitUpdateTotal = document.querySelector("#dealertotal")
					if(getTotal(dealerdeck) < 17){
						var newDealerCard = deck.pop(); ///take card from the full deck, full deck remove that card
						dealerdeck.push(newDealerCard); ///add that card to dealer deck
						displayCard(newDealerCard, newDealerCardPlacement); 
						hitUpdateTotal.textContent = "Total: " + getTotal(dealerdeck); ///recalculate with getTotal function

						///timeout to mimick human speed, so the dealer doesn't look like it picks 2 cards at the same time
						setTimeout(dealerPlay, 1000);
					}
					else{
						setTimeout(checkWinner, 700);
					}
				}

				function isBlackjack(cards){
					if (cards.length == 2 && getTotal(cards) == 21){
						return true;
					}
					else{
						return false;
					}
				}

				function checkBlackjackOnDeal() {
					if (isBlackjack(playerdeck) && isBlackjack(dealerdeck)) {
						showResultImage(tieImage,"tie");
						ties = ties + 1;
						changeCredits(tiecredit);
						updateScore();
						gameOver();
					}
					else if (isBlackjack(playerdeck)) {
						showResultImage(blackjackPlayerImage,"win");
						playerWins = playerWins + 1;
						changeCredits(wincredit);
						updateScore();
						gameOver();
					}
					else if (isBlackjack(dealerdeck)) {
						showResultImage(blackjackDealerImage,"lose");
						dealerWins = dealerWins +1;
						changeCredits(losecredit);
						updateScore();
						gameOver();
					}
				}

				function checkWinner(){
					var playerTotal = getTotal(playerdeck);
					var dealerTotal = getTotal(dealerdeck);

					if (dealerTotal > 21) {
						showResultImage(dealerBustImage,"win");
						playerWins = playerWins + 1;
						changeCredits(wincredit);
					}
					else if (playerTotal > dealerTotal) {
						showResultImage(playerWinsImage,"win");
						playerWins = playerWins + 1;
						changeCredits(wincredit);
					}
					else if (dealerTotal > playerTotal) {
						showResultImage(dealerWinsImage,"lose");
						dealerWins = dealerWins +1;
						changeCredits(losecredit);
					}
					else {
						showResultImage(tieImage,"tie");
						ties = ties + 1;
						changeCredits(tiecredit);
						
					}
					updateScore();
					gameOver();
				}

				function updateScore(){
					var updateScoreBoard = document.querySelector("#scoreboard");
					updateScoreBoard.textContent =
						"Win: " + playerWins + "\n" +
					 	"Loss: " + dealerWins + "\n" +
					 	"Tie: " + ties;
				}

				function updateCredits(){
				    var updateCreditsDisplay = document.querySelector("#creditsdisplay")
				    updateCreditsDisplay.textContent = "CREDITS: " + credits;
				    if (credits <= 0) {
				    	document.querySelector("#startnewround").disabled = true;
				    }
				}

				function resetScore(){
					isAnimating = false;
					gamesPlayed = 0;
					playerWins = 0;
					dealerWins = 0;
					ties = 0;
					playerdeck = [];
					dealerdeck = [];
					credits = originalcredits;
					updateScore();
					updateCredits();
					clearResultImage();
					document.querySelector("#startnewround").disabled = false;
					document.querySelector("#playercards").innerHTML = "";
					document.querySelector("#dealercards").innerHTML = "";
					document.querySelector("#hit").disabled = true;
					document.querySelector("#stand").disabled = true;
					document.querySelector("#resetscore").disabled = true;
					
					var updatePlayerTotal = document.querySelector("#playertotal");
					updatePlayerTotal.textContent = "";
					var updateDealerTotal = document.querySelector("#dealertotal");
					updateDealerTotal.textContent = "";

				}

				function gameOver(){
					gamesPlayed = gamesPlayed + 1;
					if (gamesPlayed > 0){
						document.querySelector("#resetscore").disabled = false;
					}
					isAnimating = false;

					if (credits > 0){
				        document.querySelector("#startnewround").disabled = false;
				    }
				    document.querySelector("#hit").disabled = true;
				    document.querySelector("#stand").disabled = true;
				}

				function gameStart(){
					isAnimating = false;
				    document.querySelector("#startnewround").disabled = false;
				    document.querySelector("#hit").disabled = false;
				    document.querySelector("#stand").disabled = false;
				}


				function shuffleAnimation() {
				    const deckStack = document.querySelector("#deckstack");
				    deckStack.classList.remove("shuffle");
				    void deckStack.offsetWidth;
				    deckStack.classList.add("shuffle");
				}

				function checkCredits(){
				    if (credits <= 0) {
				    	showResultImage(noCreditsImage,"lose");
				        document.querySelector("#startnewround").disabled = true;
				        return false;
				    }
				    return true;
				}

				function showResultImage(resultImageFile, glowType) {
				    var resultBox = document.querySelector("#result");
				    var resultImage = document.querySelector("#resultimage");

				    resultImage.src = resultImageFile;

				    // apply glow
				    if (glowType === "win") {
				        resultImage.style.filter = goldGlow;
				    }
				    else if (glowType === "lose") {
				        resultImage.style.filter = redGlow;
				    }
				    else if (glowType === "tie") {
				        resultImage.style.filter = silverGlow;
				    }

				    resultBox.classList.remove("show");
				    void resultBox.offsetWidth;
				    resultBox.classList.add("show");
				}

				function clearResultImage() {
				    var resultBox = document.querySelector("#result");
				    var resultImage = document.querySelector("#resultimage");

				    resultBox.classList.remove("show");
				    resultImage.src = "";
				    resultImage.style.filter = "none";
				}

				function textWhenHover(){
				    this.style.transform = "scale(1.05)";
				    this.style.textShadow = "0 0 10px #E8D080";
				}

				function textReset(){
				    this.style.transform = "scale(1)";
				    this.style.textShadow = "none";
				}

            })();
