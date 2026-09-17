import {
  Connect4Controller,
  GameStatus,
  Player,
} from "../connect4Controller";

const applyMoves = (controller: Connect4Controller, moves: number[]) => {
  moves.forEach((val) => controller.makeMove(val));
};

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

  describe("isGameWon", () => {
    it("should detect horizontal lines as wins", () => {
      const controller = new Connect4Controller(5, 5);
      controller.newGame();

      // x x x x x
      // x x x x x
      // x x x x 2
      // x x x x 2
      // 1 1 1 1 2
      applyMoves(controller, [0, 4, 1, 4, 2, 4]);

      const status = controller.makeMove(3);
      expect(status).not.toBeNull();
      expect(status?.state).toBe("won");
      expect(status?.currentPlayer).toBe(1);
    });

    it("should detect vertical lines as wins", () => {
      const controller = new Connect4Controller(5, 5);
      controller.newGame();

      // x x x x x
      // x x 2 x x
      // x x 2 x x
      // 1 1 2 x x
      // 1 1 2 x x
      applyMoves(controller, [0, 2, 1, 2, 0, 2, 1]);

      const status = controller.makeMove(2);
      expect(status).not.toBeNull();
      expect(status?.state).toBe("won");
      expect(status?.currentPlayer).toBe(2);
    });

    it("should detect left-diagonal lines as wins", () => {
      const controller = new Connect4Controller(5, 5);
      controller.newGame();

      // x x x x x
      // x x x 1 x
      // x x 1 2 1
      // x 1 2 2 1
      // 1 2 2 2 1
      applyMoves(controller, [0, 1, 1, 2, 4, 2, 2, 3, 4, 3, 4, 3]);

      const status = controller.makeMove(3);
      expect(status).not.toBeNull();
      expect(status?.state).toBe("won");
      expect(status?.currentPlayer).toBe(1);
    });

    it("should detect right-diagonal lines as wins", () => {
      const controller = new Connect4Controller(5, 5);
      controller.newGame();

      // x x x x x
      // x 1 x x x
      // 1 2 1 x x
      // 1 2 2 1 x
      // 1 2 2 2 1
      applyMoves(controller, [4, 3, 3, 2, 0, 2, 2, 1, 0, 1, 0, 1]);

      const status = controller.makeMove(1);
      expect(status).not.toBeNull();
      expect(status?.state).toBe("won");
      expect(status?.currentPlayer).toBe(1);
    });

    it("should detect full boards without any lines as draws", () => {
      const controller = new Connect4Controller(5, 1);
      controller.newGame();

      // 1 2 1 2 1
      applyMoves(controller, [0, 1, 2, 3]);

      const status = controller.makeMove(4);
      expect(status).not.toBeNull();
      expect(status?.state).toBe("draw");
      expect(status?.winner).toBeUndefined();
    });

    it("should detect non-full boards without any lines as not wins and not draws", () => {
      const controller = new Connect4Controller(5, 5);
      controller.newGame();

      // x x x x x
      // x x x x x
      // x x x x x
      // 1 2 x x x
      // 1 2 x x x
      applyMoves(controller, [0, 1, 0, 1]);

      const status = controller.makeMove(3);
      expect(status).not.toBeNull();
      expect(status?.state).toBe("ongoing");
      expect(status?.winner).toBeUndefined();
    });
  });
});
