import React, { Component } from "react";

const SIZE = 10;
const MINES = 15;

const createBoard = () => {
	const board = Array.from({ length: SIZE }, () =>
		Array.from({ length: SIZE }, () => ({
			isMine: false,
			isRevealed: false,
			isFlagged: false,
			neighbors: 0,
		})),
	);

	let placedMines = 0;
	while (placedMines < MINES) {
		const randomRow = Math.floor(Math.random() * SIZE);
		const randomColumn = Math.floor(Math.random() * SIZE);

		if (!board[randomRow][randomColumn].isMine) {
			board[randomRow][randomColumn].isMine = true;
			placedMines++;
		}
	}

	for (let row = 0; row < SIZE; row++) {
		for (let column = 0; column < SIZE; column++) {
			if (board[row][column].isMine) continue;

			let mineCount = 0;
			for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
				for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
					const neighborRow = row + rowOffset;
					const neighborColumn = column + columnOffset;

					const isOutsideBoard =
						neighborRow < 0 ||
						neighborRow >= SIZE ||
						neighborColumn < 0 ||
						neighborColumn >= SIZE;

					if (isOutsideBoard) continue;

					if (board[neighborRow][neighborColumn].isMine) {
						mineCount++;
					}
				}
			}

			board[row][column].neighbors = mineCount;
		}
	}

	return board;
};

export class Minesweeper extends Component {
	state = {
		board: createBoard(),
	};

	handleReveal = (row, column) => {
		const cell = this.state.board[row][column];
		if (cell.isRevealed || cell.isFlagged) return;

		const newBoard = this.state.board.map((boardRow) =>
			boardRow.map((boardCell) => ({ ...boardCell })),
		);

		newBoard[row][column].isRevealed = true;

		this.setState({ board: newBoard });
	};

	render() {
		const { board } = this.state;

		return (
			<div className="mines-board">
				{board.map((row, r) =>
					row.map((cell, c) => (
						<button key={`${r}-${c}`} className="mines-cell">
							{/* {cell.isMine ? "💣" : cell.neighbors} */}
						</button>
					)),
				)}
			</div>
		);
	}
}

export default Minesweeper;
