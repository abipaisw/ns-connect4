import {render, screen} from "@testing-library/react";
import Grid from "../Grid";
import {Connect4Controller} from "../../lib/connect4Controller";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

describe("Grid", () => {
    it("should should display a win status when a player 1 wins", async () => {
        const controller = new Connect4Controller(7, 6);

        jest.spyOn(controller, "makeMove").mockReturnValue({
            board: [],
            winner: 1,
            state: "won",
            currentPlayer: 1
        });

        render(<Grid controller={controller}/>);

        await userEvent.click(screen.getByTestId("grid-0-0"));

        expect(screen.getByTestId("statusMessage")).toHaveTextContent("Player 1 wins!")
    });

    it("should should display a win status when a player 2 wins", async () => {
        // TODO: This is duplicated. Duplication is bad.
        const controller = new Connect4Controller(7, 6);

        jest.spyOn(controller, "makeMove").mockReturnValue({
            board: [],
            winner: 2,
            state: "won",
            currentPlayer: 2
        });

        render(<Grid controller={controller}/>);
        await userEvent.click(screen.getByTestId("grid-0-0"));

        expect(screen.getByTestId("statusMessage")).toHaveTextContent("Player 2 wins!")
    });

    it("should display a draw status when appropriate", async () => {
        const controller = new Connect4Controller(7, 6);

        jest.spyOn(controller, "makeMove").mockReturnValue({
            board: [],
            state: "draw",
            currentPlayer: 1
        });

        render(<Grid controller={controller}/>);
        await userEvent.click(screen.getByTestId("grid-0-0"));

        expect(screen.getByTestId("statusMessage")).toHaveTextContent("Draw!");
    })
});