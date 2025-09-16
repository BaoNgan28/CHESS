// js/main.js (Phiên bản Alpha-Beta vs Minimax)

// BƯỚC 1: IMPORT CẢ HAI AI VÀ ĐỔI TÊN
import { findBestMove as findBestMoveAlphaBeta } from './AI_alphaBeta.js';
import { findBestMove as findBestMoveMinimax } from './AI_minmax.js';

// BƯỚC 2: CẤU HÌNH ĐỘ SÂU RIÊNG BIỆT
const AI_DEPTH_WHITE = 3; // Độ sâu cho AI Trắng (Alpha-Beta)
const AI_DEPTH_BLACK = 3; // Độ sâu cho AI Đen (Minimax)
const MOVE_DELAY = 10;   // Thời gian chờ giữa mỗi nước đi

import { gameState, resetGameState } from './state.js';
import { getValidMoves, isKingInCheck, isCheckmate } from './logic.js';
import { 
    createBoard, renderBoard, updateStatus, clearHighlights, 
    highlightSquare, highlightValidMoves, showGameOver, 
    hideGameOver, showPromotionAnimation 
} from './ui.js';

function initGame() {
    createBoard(onSquareClick);
    renderBoard();
    document.getElementById('restart-button').addEventListener('click', restartGame);

    console.log("Bắt đầu trận đấu: Alpha-Beta (Trắng) vs Minimax (Đen)");
    setTimeout(makeAIMove, MOVE_DELAY);
}

function restartGame() {
    resetGameState();
    hideGameOver();
    renderBoard();
    setTimeout(makeAIMove, MOVE_DELAY);
}

function onSquareClick(row, col) { return; }

/**
 * Hàm để AI (người chơi hiện tại) tìm và thực hiện nước đi tốt nhất.
 */
function makeAIMove() {
    if (gameState.isGameOver) {
        console.log("Trận đấu đã kết thúc!");
        return;
    }

    const currentPlayerColor = gameState.currentPlayer;
    let bestMove;

    // BƯỚC 3: GỌI ĐÚNG HÀM AI TƯƠNG ỨNG VỚI MÀU QUÂN
    if (currentPlayerColor === 'w') {
        // Lượt của quân Trắng -> Dùng Alpha-Beta
        console.log(`Lượt của Trắng (Alpha-Beta). AI đang suy nghĩ với độ sâu ${AI_DEPTH_WHITE}...`);
        bestMove = findBestMoveAlphaBeta(gameState.board, AI_DEPTH_WHITE, currentPlayerColor);
    } else {
        // Lượt của quân Đen -> Dùng Minimax
        console.log(`Lượt của Đen (Minimax). AI đang suy nghĩ với độ sâu ${AI_DEPTH_BLACK}...`);
        bestMove = findBestMoveMinimax(gameState.board, AI_DEPTH_BLACK, currentPlayerColor);
    }

    if (!bestMove) {
        gameState.isGameOver = true;
        if (isKingInCheck(currentPlayerColor, gameState.board)) {
            gameState.winner = currentPlayerColor === 'w' ? 'b' : 'w';
            console.log("Chiếu hết!");
        } else {
            gameState.winner = null;
            console.log("Hòa cờ!");
        }
        updateStatus();
        showGameOver(gameState.winner);
        return;
    }

    movePiece(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    const movedPiece = gameState.board[fromRow][fromCol];
    gameState.board[toRow][toCol] = movedPiece;
    gameState.board[fromRow][fromCol] = null;
    clearHighlights();

    const pieceColor = movedPiece.charAt(0);
    const isPawn = movedPiece.endsWith('_pawn');
    const isFinalRank = (pieceColor === 'w' && toRow === 0) || (pieceColor === 'b' && toRow === 7);

    if (isPawn && isFinalRank) {
        gameState.isPromoting = true;
        showPromotionAnimation(pieceColor, (promotedPieceType) => {
            const newPiece = `${pieceColor}_${promotedPieceType}`;
            gameState.board[toRow][toCol] = newPiece;
            gameState.isPromoting = false;
            continueGameFlow();
        });
    } else {
        continueGameFlow();
    }
}

function continueGameFlow() {
    switchPlayer();
    renderBoard();

    if (isCheckmate(gameState.currentPlayer, gameState.board)) {
        gameState.isGameOver = true;
        gameState.winner = gameState.currentPlayer === 'w' ? 'b' : 'w';
        showGameOver(gameState.winner);
    }
    
    updateStatus();

    if (!gameState.isGameOver) {
        setTimeout(makeAIMove, MOVE_DELAY);
    }
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'w' ? 'b' : 'w';
}

function selectPiece(row, col) { return; }

document.addEventListener('DOMContentLoaded', initGame);