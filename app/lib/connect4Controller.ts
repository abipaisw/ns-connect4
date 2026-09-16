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

    // - Change player
    this.currentPlayer = this.currentPlayer === 2 ? 1 : 2;

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
