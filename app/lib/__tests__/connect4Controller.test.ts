import {
  Connect4Controller,
  GameStatus,
  Player,
} from "../connect4Controller";

describe("Connect4Controller", () => {
  describe("makeMove", () => {
    it("should fill a 1x1 grid when making a move in column 0", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();

      const status = controller.makeMove(0);

      expect(status).not.toBeNull();
      expect(status?.board[0][0]).toBe(1);
    });

    it("should not accept out-of-bounds columns and should accept boundary columns", () => {
      const [width, height] = [3, 3];
      const controller = new Connect4Controller(width, height);
      controller.newGame();

      // out of bounds
      expect(() => controller.makeMove(-1)).toThrow("out of bounds");
      expect(() => controller.makeMove(width)).toThrow("out of bounds");

      // boundary columns
      expect(() => controller.makeMove(width - 1)).not.toThrow();
      expect(() => controller.makeMove(0)).not.toThrow();
    });

    it("should not accept tokens in full columns", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();

      controller.makeMove(0);

      expect(() => controller.makeMove(0)).toThrow("no open cells");
    });

    it("should place a token of the correct type in the expected cell", () => {
      // (incl. where cell not empty)
      const height = 3;
      const controller = new Connect4Controller(1, height);
      controller.newGame();

      let status = controller.makeMove(0);
      expect(status).not.toBeNull();
      expect(status?.board[height - 1][1]).not.toBe(0);

      status = controller.makeMove(0);
      expect(status).not.toBeNull();
      expect(status?.board[height - 2][1]).not.toBe(0);
    });

    it("should alternate between players each turn", () => {
      const controller = new Connect4Controller(3, 3);
      controller.newGame();

      let previousPlayer: Player = 0;
      let state: GameStatus | null = null;
      for (let i = 0; i < 3; i += 1) {
        state = controller.makeMove(0);
        expect(state).not.toBeNull();
        expect(state?.currentPlayer).not.toBeNull();
        expect(previousPlayer).not.toEqual(state?.currentPlayer);
        previousPlayer = state?.currentPlayer || 0; // state will never be null
      }
    });
  });
});
