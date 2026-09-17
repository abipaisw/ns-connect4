import {add, complex, Complex} from "mathjs"; // TODO: is there any way to scope these imports?

export type GameState = "ongoing" | "won" | "draw" | "idle";
export type Player = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2

export interface GameStatus {
  state: GameState;
  winner?: Player;
  currentPlayer: Player;
  board: Player[][];
}

export class Connect4Controller {
  public width: number;
  private height: number;
  private board: Player[][];
  private currentPlayer: Player = 1;
  private gameState: GameState = "idle";

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.board = this.initializeBoard();
  }

  private initializeBoard(): Player[][] {
    return Array.from({ length: this.height }, () => Array(this.width).fill(0));
  }

  public newGame(): GameStatus {
    this.board = this.initializeBoard();
    this.currentPlayer = 1;
    this.gameState = "ongoing";
    return this.getStatus();
  }

  private isGameWon(): boolean | null {
    /*
    isGameWon returns true if the current player has won the game, false if not, and null if a draw has occurred and no
    player can win.
     */

    // Here, coordinates are represented with complex numbers, where the real component is the row and the imaginary
    // component is the column. This is a good way to represent coordinates in languages with complex number support
    // built-in (eg. Python) but makes considerably less sense in a language like JS/TS where you would need to bring in
    // a library Mathjs.
    //
    // I would not add a library to a real codebase to do this, and would probably just implement a very basic
    // coordinate type that supports addition and the like instead.

    // General strategy: work left-to-right, top-to-bottom through the board. When a counter that has not already been
    // visited is found, count the number of adjacent counters of the same type, marking them as visited as you go.
    // Any counter with 3 or more adjacent counters of the same type triggers a win for that player.

    // Only counters placed by the current player are checked, as only that player will have added new counters since
    // the last time this was checked at the end of the previous turn.

    const visitedCells: Complex[] = [];
    const board = this.board;

    const getCellValue = (cell: Complex): Player => board[cell.re][cell.im];
    const isCellOutOfBounds = (cell: Complex): boolean => board[cell.re] === undefined || board[cell.re][cell.im] === undefined;
    const hasCellBeenVisited = (cell: Complex): boolean => visitedCells.indexOf(cell) !== -1;

    const countAdjacentCellsOfType = (cell: Complex, direction: Complex, type: Player): number => {
      visitedCells.push(cell);
      const next = add(cell, direction);

      if (isCellOutOfBounds(next)) {
        return 0;
      }

      if (getCellValue(next) === type) {
        if (hasCellBeenVisited(next)) {
          throw new Error("programming error: visited cells should never be explored again")
        }
        return 1 + countAdjacentCellsOfType(next, direction, type);
      }

      return 0;
    }

    for (let row = 0; row < this.height; row += 1) {
      for (let col = 0; col < this.width; col += 1) {
        const cell = complex(row, col);
        const cellValue = getCellValue(cell);

        if (hasCellBeenVisited(cell) || cellValue !== this.currentPlayer) {
          continue;
        }

        const magnitudes: Complex[] = [
          // vertical (anything above must have been visited first, so we only check below)
          complex(1, 0),
          // horizontal (anything behind must have been visited first, so we only check further to the right)
          complex(0, 1),
          // diagonal right
          complex(1, 1),
          // diagonal left (we must check cells below and behind explicitly, nothing in any rows below will have been
          // visited yet, regardless of if they are in to the left or right)
          complex(1, -1),
        ];

        for (let i = 0; i < magnitudes.length; i += 1) {
          const magnitude = magnitudes[i];
          const count = countAdjacentCellsOfType(cell, magnitude, cellValue);
          if (count >= 3) {
            return true;
          }
        }
      }
    }

    // Reaching here means there are no clear winners.

    // Lazy check for draws (ie. top row of board is completely full, therefore board is completely full)
    const isTopRowFull = this.board[0].reduce(
        (acc, val) => acc && val !== 0,
        true
    )
    if (isTopRowFull) {
      return null;
    }

    return false;
  }

  public makeMove(column: number): GameStatus | null {
    console.log("Dropping a token into a column:", column);

    // - Validate column input
    if (column < 0 || column >= this.width) {
      throw new RangeError("column index out of bounds");
    }

    // - Find the lowest row
    // The board is stored rows first, then columns
    const columnState = this.board.map((row) => row[column]);
    const lowestOpenCell = columnState.findLastIndex(
      (cellState) => cellState === 0,
    );

    if (lowestOpenCell === -1) {
      throw new Error(`column ${column} has no open cells`); // TODO: are there more specific Error classes? eg. ValueError in Python
    }

    // - Place a counter
    this.board[lowestOpenCell][column] = this.currentPlayer;

    const winStatus = this.isGameWon();
    if (winStatus === null) {
      this.gameState = "draw";
    } else if (winStatus) {
      this.gameState = "won";
    } else {
      // Alternate player
      this.currentPlayer = this.currentPlayer === 2 ? 1 : 2;
    }

    return this.getStatus();
  }

  public getStatus(): GameStatus {
    return {
      board: this.board,
      state: this.gameState,
      winner: this.gameState === "won" ? this.currentPlayer : undefined,
      currentPlayer: this.currentPlayer,
    };
  }
}
