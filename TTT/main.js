const site = window.BetonitSite;
//contant to get the 'sharedProfile' from the main site to this page.
const sharedProfile = site ? site.requireCurrentUser({ nextPage: "TTT/index.html" }) : null;

// COMPUTER GAME LOGIC. 
// Declaration of what each player is.
if (site && sharedProfile) {
    // Player always plays as "X"
    const player = "X"; 
    // Computer always plays as "O"
    const computer = "O";
    // Set the credit reward amount to 5 credits for winning a game of Tic-Tac-Toe.
    const WIN_REWARD = 5;

    // GRID MAKING LOGIC.
    // Draws the board for the computer
    // 'board' is an array of 9 elements, each representing a square on the grid, with no fill.
    // ⬛⬛⬛ 0 , 1 , 2
    // ⬛⬛⬛ 3 , 4 , 5
    // ⬛⬛⬛ 6 , 7 ,8 
    let board = Array(9).fill("");
    // 'currentTurn' represents whose turn it is. Player always starts first.
    let currentTurn = player;
    // 'isGameOver' indicates whether the game has ended or not.
    let isGameOver = false;
    // 'score' keeps track of the number of wins for the player, computer, and ties.
    let score = { player: 0, computer: 0, ties: 0 };

    // COMMUNICATING WITH HTML ELEMENTS (DOM)
    // DOM elements for the game status, board, reset button, and scoreboard.
    const statusElement = document.getElementById("status");
    const boardElement = document.getElementById("board");
    const resetButton = document.getElementById("resetButton");
    const scoreboardElement = document.getElementById("scoreboard");

    // WINNING LINES LOGIC.
    // Constant 'winningLines' defines all the possible winning combinations for the computer.
    const winningLines = [
        // [0,1,2] [3,4,5] [6,7,8] are the standard winning lines.
        // [0,3,6] [2,5,8] [0,4,8] [2,4,6] are included here to make the machine fail sometimes. So player wins.
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Event listeners for the reset button and various window events to synchronize the UI with the user's profile and game state.
    resetButton.addEventListener("click", resetGame);
    window.addEventListener("storage", syncRewardUi);
    window.addEventListener("pageshow", syncRewardUi);
    window.addEventListener("focus", syncRewardUi);
    document.addEventListener("visibilitychange", syncRewardUiOnVisible);

    //create the board. Based on the grid above
    // ⬛⬛⬛ 0 , 1 , 2
    // ⬛⬛⬛ 3 , 4 , 5
    // ⬛⬛⬛ 6 , 7 ,8 
    createBoard();

    // Refresh the UI to reflect credits on user's profile.
    site.refreshUi();
    function syncRewardUi() {
        site.refreshUi();
    }

    // Makes the new credits visible, even when the user changes page or goes out or refreshes the page.
    function syncRewardUiOnVisible() {
        if (document.visibilityState === "visible") {
            syncRewardUi();
        }
    }

    // Fucnction to actually draw the board on the page, and to update it after every move.
    function createBoard() {
        boardElement.innerHTML = "";

        // Draw an empty div for each cell in the grid, and add a click event listener to handle player moves.
        for (let i = 0; i < 9; i += 1) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            cell.addEventListener("click", onCellClick);
            boardElement.appendChild(cell);
        }

        // update the board to reflect the initial state of the game.
        updateBoard();
    }

    // UPDATE THE GRID BASED ON GAME STATUS. 
    // Cells = squares on the grid. 
    function updateBoard() {
        const cells = boardElement.querySelectorAll(".cell");
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            // Disable cells that are already occupied or if the game is over.
            cell.classList.toggle("disabled", board[index] !== "" || isGameOver);
        });
        //update Status message to reflect the current game state.
        updateStatus();
        // update scoreboard if game is finished.
        updateScoreboard();
    }

   // FUNCTION THAT MODIFIES THE STATUS MESSAGE BASED ON THE CURRENT GAME STATE.
    function updateStatus(message) {
        if (message) {
            statusElement.textContent = message;
            return;
        }

        if (isGameOver) {
            return;
        }

        // If it's the player's turn, show "Your turn: X". 
        // If it's the computer's turn, show "Computer is thinking...".
        statusElement.textContent = currentTurn === player ? "Your turn: X" : "Computer is thinking...";
    }

    // FUNCTION THAT HANDLES THE PLAYER'S MOVE WHEN THEY CLICK ON A CELL.
    function onCellClick(event) {
        // Get the index of the clicked cell from the data attribute.
        const index = Number(event.currentTarget.dataset.index);

        // if 'look at board', 'if game is over', or it's the player's turn, do nothing.
        if (board[index] || isGameOver || currentTurn !== player) {
            return;
        }

        // Make a move after the player clicks on a cell.
        makeMove(index, player);

        // If the game is not over after the player's move, switch to the computer's turn and let the computer make its move.
        if (!isGameOver) {
            currentTurn = computer;
            updateBoard();
            //300ms delay for the computer to make a move.
            setTimeout(computerTurn, 300);
        }
    }

    // Function 'makeMove' updates the board state with the player's or computer's move, checks for a winner or tie, and updates the game status accordingly.
    function makeMove(index, symbol) {
        board[index] = symbol;
        const winner = getWinner(board);

        if (winner || isBoardFull(board)) {
            endGame(winner);
        } else {
            // telling the computer to recognize pattern played.
            currentTurn = symbol === player ? computer : player;
        }

        // Update the board after the move is made.
        updateBoard();
    }

    // DETECT WINNER OR TIE.
    function getWinner(boardState) {
        
        // Get winning lines
        for (const line of winningLines) {
            const [a, b, c] = line;
            if (isWinningLine(boardState, a, b, c)) {
                return boardState[a];
            }
        }
        return null;
    }

    // Basicaly asking the computer, Is there a winning line on the board?    
    function isWinningLine(boardState, a, b, c) {
        return boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c];
    }

    // Check if the board is full (i.e., all cells are occupied) to determine if the game is a tie.
    function isBoardFull(boardState) {
        return boardState.every((cell) => cell !== "");
    }

    // END THE GAME AND UPDATE THE STATUS MESSAGE BASED ON THE OUTCOME (WIN, LOSS, OR TIE).
    function endGame(winner) {
        isGameOver = true;
        // Player wins scenario
        if (winner === player) {
            statusElement.textContent = `You win! +${WIN_REWARD} credits`;
            score.player += 1;
            awardWin();

         // Computer wins scenario   
        } else if (winner === computer) {
            statusElement.textContent = "Computer wins. No credits lost.";
            score.computer += 1;
            recordLoss();

         // Tie scenario   
        } else {
            statusElement.textContent = "It is a tie. No credits lost.";
            score.ties += 1;
            recordTie();
        }

        // Update the board and scoreboard to reflect the end of the game.
        updateBoard();
    }

    // Update the scoreboard (bottom right of the grid) to show the current score of the player, computer, and ties.
    function updateScoreboard() {
        scoreboardElement.innerHTML = `You: ${score.player} · Computer: ${score.computer} · Ties: ${score.ties}`;
    }

    // DECLARE THE COMPUTER'S MOVE LOGIC.
    function computerTurn() {
        const index = chooseComputerMove(board);
        // Make a move for the computer based on the state of the board.
        makeMove(index, computer);

        // If the game is not over after the computer's move, switch back to the player's turn.
        if (!isGameOver) {
            currentTurn = player;
            updateBoard();
        }
    }

    // PRIORITIZING MOVES
    function chooseComputerMove(boardState) {
        // find a move based on the state of the grid, and previous computer turns.
        const winningMove = findWinningMove(boardState, computer);

        // If there's a winning move available, take it.
        if (winningMove !== null) {
            return winningMove;
        }

        // BLOCK THE PLAYER 
        // Same code as 'winningMove' but looking at the boardstate and the last move for the player, so the computer can block the player's winning move.
        const blockingMove = findWinningMove(boardState, player);

        // If there's a move that can block the player from winning, take it.
        if (blockingMove !== null) {
            return blockingMove;
        }

        // Get best move based on the board state using the following algorithm minmax.
        const bestMove = getBestMove(boardState);

        // MAKE THE COMPUTER UNPREDICTABLE (ALLOW PLAYER TO WIN SOMETIMES)
        // 25% chance the computer will make a random move instead of the best move, to make the game more fun and less predictable, allowing the player to win sometimes.
        if (Math.random() < 0.25) {
            return getRandomMove(boardState);
        }

        //make said move.
        return bestMove;
    }

    // GET BEST MOVE ALGORITHM (MINIMAX)
    function getBestMove(boardState) {
        //let current score be 0, and best score be negative infinity, and move be null.
        let bestScore = -Infinity;
        let move = null;

        // loop to look through each cell of the board, and simulate a move for the computer in each empty cell,
        // then use the minimax algorithm to evaluate the score of that move,
        for (let i = 0; i < 9; i += 1) {
            if (!boardState[i]) {
                // Make a shallow copy of the board before simulating the move
                const newBoard = boardState.slice();
                newBoard[i] = computer;

                const nextScore = minimax(newBoard, 0, false);
                // keep track of the move with the highest score. 
                if (nextScore > bestScore) {
                    bestScore = nextScore;
                    move = i;
                }
            }
        }

        // Execute best rated move. 
        return move;
    }

    // FINDING WINNING MOVES for player and computer. 
    // This function checks if there's a move that can lead to an immediate win for the given symbol (either player or computer).
    // Helps computer to either win or block the player's winning move.
    function findWinningMove(boardState, symbol) {
        for (let i = 0; i < 9; i += 1) {
            if (!boardState[i]) {
                boardState[i] = symbol;

                if (getWinner(boardState) === symbol) {
                    boardState[i] = "";
                    return i;
                }

                boardState[i] = "";
            }
        }

        // return an specific value.
        return null;
    }

    // RANDOMIZES COMPUTER'S MOVE.
    function getRandomMove(boardState) {
        // 'availableMoves' collects all the empty squares on the grid.
        const availableMoves = [];

        for (let i = 0; i < 9; i += 1) {
            if (!boardState[i]) {
                availableMoves.push(i);
            }
        }

        // If there are no available moves, fallback to the best move.
        if (availableMoves.length === 0) {
            return getBestMove(boardState);
        }
        // 'Math.random() [randomizes the computers choice.] * 'availableMoves.length' [looks into the available moves.]
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // USING THE MINMAX ALGORITHM to evaluate the socre of a given board state. 
    // Minimax algorithm to evaluate the score of a given board state, recursively simulating future moves for the player
    function minimax(boardState, depth, isMaximizing) {
        const winner = getWinner(boardState);

        if (winner === computer) return 10 - depth;
        if (winner === player) return depth - 10;
        if (isBoardFull(boardState)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;

            for (let i = 0; i < 9; i += 1) {
                if (!boardState[i]) {
                    boardState[i] = computer;
                    const nextScore = minimax(boardState, depth + 1, false);
                    boardState[i] = "";
                    bestScore = Math.max(nextScore, bestScore);
                }
            }

            return bestScore;
        }

        let bestScore = Infinity;

        for (let i = 0; i < 9; i += 1) {
            if (!boardState[i]) {
                boardState[i] = player;
                const nextScore = minimax(boardState, depth + 1, true);
                boardState[i] = "";
                bestScore = Math.min(nextScore, bestScore);
            }
        }

        return bestScore;
    }

    // FUNCTION TO RESET THE GAME TO ITS INITIAL STATE, allowing the player to start a new game.
    function resetGame() {
        board = Array(9).fill("");
        currentTurn = player;
        isGameOver = false;
        updateBoard();
        updateStatus("Your turn: X");
    }

    // FUNCTIONS TO UPDATE THE USER'S PROFILE BASED ON THE OUTCOME OF THE GAME (WIN, LOSS, OR TIE).
    function awardWin() {
        const updatedProfile = site.updateCurrentUser((profile) => {
            profile.credits = profile.credits + WIN_REWARD;
            profile.lastGame = "Tic-Tac-Toe";
            // Increment the player's win count, +1 
            profile.stats.ticTacToe.wins = profile.stats.ticTacToe.wins + 1;
            return profile;
        });

        // Refresh the UI to reflect the updated profile with the new credits and win count.
        if (updatedProfile) {
            site.refreshUi(updatedProfile);
        }
    }

    // RECORD A LOSS IN THE USER'S PROFILE, .
    function recordLoss() {
        site.updateCurrentUser((profile) => {
            profile.lastGame = "Tic-Tac-Toe";
            // Increment the player's loss count, +1 
            profile.stats.ticTacToe.losses = profile.stats.ticTacToe.losses + 1;
            return profile;
        });
    }

    // RECORD A TIE IN HE USER'S PROFILE
    function recordTie() {
        site.updateCurrentUser((profile) => {
            profile.lastGame = "Tic-Tac-Toe";
            // Increment the player's tie count, +1 
            profile.stats.ticTacToe.ties = profile.stats.ticTacToe.ties + 1;
            return profile;
        });
    }
}
