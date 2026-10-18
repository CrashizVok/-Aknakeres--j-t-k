import React, { Component } from "react";
import bcrypt from "bcryptjs";

const SIZE = 10;
const MINES = 15;

const randomIndex = async (max) => {
	const hash = await bcrypt.hash(crypto.randomUUID(), 8);
	return hash.codePointAt(hash.length - 1) % max;
};

const createBoard = async () => {
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
		// const randomRow = Math.floor(Math.random() * SIZE);
		// const randomColumn = Math.floor(Math.random() * SIZE);
		const randomRow = await randomIndex(SIZE);
		const randomColumn = await randomIndex(SIZE);

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

const copyBoard = (board) =>
	board.map((boardRow) => boardRow.map((boardCell) => ({ ...boardCell })));

export class Minesweeper extends Component {
	state = {
		board: null,
		gameOver: false,
		won: false,
	};

	async componentDidMount() {
		const board = await createBoard();
		this.setState({ board });
	}

	handleReveal = (row, column) => {
		if (this.state.gameOver) return;

		const cell = this.state.board[row][column];
		if (cell.isRevealed || cell.isFlagged) return;

		const newBoard = copyBoard(this.state.board);
		newBoard[row][column].isRevealed = true;

		if (newBoard[row][column].isMine) {
			newBoard.forEach((boardRow) =>
				boardRow.forEach((boardCell) => {
					if (boardCell.isMine) boardCell.isRevealed = true;
				}),
			);
			this.setState({ board: newBoard, gameOver: true, won: false });
			return;
		}

		const allSafeRevealed = newBoard.every((boardRow) =>
			boardRow.every((boardCell) => boardCell.isMine || boardCell.isRevealed),
		);

		this.setState({ board: newBoard, gameOver: allSafeRevealed, won: allSafeRevealed });
	};

	handleFlag = (event, row, column) => {
		event.preventDefault();
		if (this.state.gameOver) return;

		const cell = this.state.board[row][column];
		if (cell.isRevealed) return;

		const newBoard = copyBoard(this.state.board);
		newBoard[row][column].isFlagged = !newBoard[row][column].isFlagged;

		this.setState({ board: newBoard });
	};

	handleRestart = async () => {
		this.setState({ board: null, gameOver: false, won: false });
		const board = await createBoard();
		this.setState({ board });
	};

	render() {
		const { board, gameOver, won } = this.state;

		if (!board) return <h3>éppen töltök, pill</h3>;

		return (
			<div>
				<div className="mines-board">
					{board.map((boardRow, row) =>
						boardRow.map((cell, column) => (
							<button
								key={`${row}-${column}`}
								className="mines-cell"
								onClick={() => this.handleReveal(row, column)}
								onContextMenu={(event) => this.handleFlag(event, row, column)}
							>
								{cell.isRevealed
									? cell.isMine
										? "💣"
										: cell.neighbors
									: cell.isFlagged
										? "🚩"
										: ""}
							</button>
						)),
					)}
				</div>

				{gameOver && (
					<div>
						<h2>{won ? "Yoouu wooon!" : "Game over, looser"}</h2>
						<button onClick={this.handleRestart}>New játék</button>
					</div>
				)}
			</div>
		);
	}
}

export default Minesweeper;
