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

  private getWinner(): Player | null {
    /*
    getWinner returns a player number if one player has won, 0 if there is a draw, and null if the game has not yet
    reached a conclusion.
    TODO: does not check draws.
    TODO: could be optimised by only checking the current player? Only the current player can win.
     */

    const visitedCells: Complex[] = [];
    const board = this.board;

    const getCellValue = (cell: Complex): Player => board[cell.re][cell.im];
    const isCellOutOfBounds = (cell: Complex): boolean => board[cell.re] === undefined || board[cell.re][cell.im] === undefined;
    const hasCellBeenVisited = (cell: Complex): boolean => visitedCells.indexOf(cell) !== -1;

    const countAdjacentCellsOfType = (cell: Complex, direction: Complex, type: Player): number => {
      visitedCells.push(cell);
      const next = add(cell, direction);
      console.log("countadjacent", "cell", cell, "direction", direction, "type", type, "next", next)
      if (isCellOutOfBounds(next)) {
        console.log("stop, next out of bounds")
        return 0;
      }
      if (getCellValue(next) === type) {
        console.log("next right type")
        if (hasCellBeenVisited(next)) {
          throw new Error("programming error: visited cells should never be explored again")
        }
        return 1 + countAdjacentCellsOfType(next, direction, type);
      }
      console.log("next wrong type");
      return 0;
    }

    for (let row = 0; row < this.height; row += 1) {
      for (let col = 0; col < this.width; col += 1) {
        const cell = complex(row, col);
        const cellValue = getCellValue(cell);

        if (hasCellBeenVisited(cell) || cellValue === 0) {
          // we do not visit any cells more than once because any sequence they are a part of is either a win or not, and we check an entire sequence in one go
          continue;
        }

        const magnitudes: Complex[] = [
          // vertical (by definition, behind must have been visited first)
          complex(1, 0),
          // horizontal (by definition, behind must have been visited first)
          complex(0, 1),
          // diagonal left
          complex(1, 1),
          // diagonal right
          complex(1, -1),
        ];

        console.log("looking at", cell);

        for (let i = 0; i < magnitudes.length; i += 1) {
          const magnitude = magnitudes[i];
          console.log("mag is", magnitude);

          let count = countAdjacentCellsOfType(cell, magnitude, cellValue);

          console.log("result is", count)

          if (count >= 3) {
            return cellValue;
          }
        }
      }
    }

    return null;
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

    if (this.getWinner() !== null) {
      // TODO: getWinner could return the other player
      this.gameState = "won";
    } else {
      // - Change player
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
