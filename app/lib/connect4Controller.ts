export type GameState = "ongoing" | "won" | "draw" | "idle";
export type Player = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2

export interface GameStatus {
  state: GameState;
  winner?: Player;
  currentPlayer: Player;
  board: Player[][];
}

type Coordinate = [number, number];

const addCoordinate = (a: Coordinate, b: Coordinate): Coordinate => {
  return [a[0] + b[0], a[1] + b[1]];
};

const negateCoordinate = (a: Coordinate): Coordinate => {
  return [-a[0], -a[1]];
}

const WIN_LENGTH = 4;

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

  private getNextGameState(lastPlacedPieceRow: number, lastPlacedPieceCol: number): GameState {
    /*
    getNextGameState returns "won" if the current player has won the game, "ongoing" if not, and "draw" if a draw has
    occurred and no player can win.
     */

    // Here, coordinates are represented row-first to match the way the game board is indexed.

    // Only the most recently placed counter can create a win, as all previously placed counters were checked in
    // previous turns, and if a win was triggered then, no more counters would have been placed.

    // Therefore, from the last placed counter, the number of adjacent counters is counted for each direction that could
    // create a connected line of 4. If any direction with 3 or more adjacent counters exists, a win is triggered.

    const lastPlacedPiece: Coordinate = [lastPlacedPieceRow, lastPlacedPieceCol];

    const getCellValue = ([row, col]: Coordinate): Player => this.board[row][col];
    const isCellOutOfBounds = ([row, col]: Coordinate): boolean => !(row >= 0 && row < this.height && col >= 0 && col < this.width);

    const countAdjacentCellsOfType = (cell: Coordinate, direction: Coordinate, type: Player): number => {
      const next = addCoordinate(cell, direction);

      if (isCellOutOfBounds(next)) {
        return 0;
      }

      if (getCellValue(next) === type) {
        return 1 + countAdjacentCellsOfType(next, direction, type);
      }

      return 0;
    }

    const scanDirections: Coordinate[] = [
      // vertical
      [1, 0],
      // horizontal
      [0, 1],
      // down-right diagonal
      [1, 1],
      // down-left diagonal
      [1, -1],
    ];

    for (let i = 0; i < scanDirections.length; i += 1) {
      const scanDirection = scanDirections[i];
      const count = countAdjacentCellsOfType(lastPlacedPiece, scanDirection, this.currentPlayer) +
          countAdjacentCellsOfType(lastPlacedPiece, negateCoordinate(scanDirection), this.currentPlayer);
      if (count + 1 >= WIN_LENGTH) {
        return "won";
      }
    }

    // Reaching here means there are no clear winners.

    // Lazy check for draws (ie. top row of board is completely full, therefore board is completely full)
    const isTopRowFull = this.board[0].reduce(
        (acc, val) => acc && val !== 0,
        true
    )
    if (isTopRowFull) {
      return "draw";
    }

    return "ongoing";
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

    this.gameState = this.getNextGameState(lowestOpenCell, column);
    if (this.gameState === "ongoing") {
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
