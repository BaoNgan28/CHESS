// js/AI_minmax.js
// PHIÊN BẢN NÂNG CẤP HÀM ĐÁNH GIÁ
// Chỉ tối ưu hóa hàm evaluateBoard với Bảng Vị Trí Quân Cờ (PSTs).
// Vẫn sử dụng thuật toán Minimax cơ bản, không có cắt tỉa hay tìm kiếm tĩnh.

import { getValidMoves, isKingInCheck } from './logic.js';

// --- CÁC HẰNG SỐ VÀ BẢNG ĐIỂM (GIỐNG HỆT FILE ALPHABETA) ---
const pieceValues = {
    'pawn': 100, 'knight': 320, 'bishop': 330, 'rook': 500, 'queen': 900, 'king': 20000
};

const pawnPST = [
    [0,  0,  0,  0,  0,  0,  0,  0], [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10], [5,  5, 10, 27, 27, 10,  5,  5],
    [0,  0,  0, 25, 25,  0,  0,  0], [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-25,-25, 10, 10,  5], [0,  0,  0,  0,  0,  0,  0,  0]
];
const knightPST = [
    [-50,-40,-30,-30,-30,-30,-40,-50], [-40,-20,  0,  5,  5,  0,-20,-40],
    [-30,  5, 10, 15, 15, 10,  5,-30], [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30], [-30,  0, 10, 15, 15, 10,  0,-30],
    [-40,-20,  0,  0,  0,  0,-20,-40], [-50,-40,-30,-30,-30,-30,-40,-50]
];
const bishopPST = [
    [-20,-10,-10,-10,-10,-10,-10,-20], [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10], [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10], [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10], [-20,-10,-10,-10,-10,-10,-10,-20]
];
const rookPST = [
    [0,  0,  0,  5,  5,  0,  0,  0], [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5], [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5], [-5,  0,  0,  0,  0,  0,  0, -5],
    [5, 10, 10, 10, 10, 10, 10,  5], [0,  0,  0,  0,  0,  0,  0,  0]
];
const queenPST = [
    [-20,-10,-10, -5, -5,-10,-10,-20], [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10], [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5], [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10], [-20,-10,-10, -5, -5,-10,-10,-20]
];
const piecePSTs = {
    'pawn': pawnPST, 'knight': knightPST, 'bishop': bishopPST, 'rook': rookPST, 'queen': queenPST
};

// --- CÁC HÀM CỦA AI ---

/**
 * Hàm chính để tìm nước đi tốt nhất.
 */
export function findBestMove(board, depth, color) {
    const isMaximizing = color === 'w';
    const allMoves = getAllPossibleMoves(board, color);
    let bestMove = null;
    let bestValue = isMaximizing ? -Infinity : Infinity;

    for (const move of allMoves) {
        const newBoard = simulateMove(board, move);
        const moveValue = minimax(newBoard, depth - 1, !isMaximizing);

        if (isMaximizing) {
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        } else {
            if (moveValue < bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
    }
    console.log(`Minimax: Nước đi tốt nhất có điểm ${bestValue}`);
    return bestMove;
}

/**
 * Hàm đệ quy Minimax cơ bản.
 */
function minimax(board, depth, isMaximizing) {
    if (depth === 0) {
        return evaluateBoard(board); // Sử dụng hàm đánh giá đã nâng cấp
    }

    const color = isMaximizing ? 'w' : 'b';
    const allMoves = getAllPossibleMoves(board, color);

    if (allMoves.length === 0) {
        return isKingInCheck(color, board) ? (isMaximizing ? -Infinity : Infinity) : 0;
    }
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of allMoves) {
            const newBoard = simulateMove(board, move);
            const evalValue = minimax(newBoard, depth - 1, false);
            maxEval = Math.max(maxEval, evalValue);
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of allMoves) {
            const newBoard = simulateMove(board, move);
            const evalValue = minimax(newBoard, depth - 1, true);
            minEval = Math.min(minEval, evalValue);
        }
        return minEval;
    }
}

// --- CÁC HÀM HỖ TRỢ ---

/**
 * Hàm đánh giá bàn cờ đã được nâng cấp.
 */
function evaluateBoard(board) {
    let totalScore = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const pieceType = piece.substring(2);
                const value = pieceValues[pieceType];
                const colorMultiplier = piece.startsWith('w') ? 1 : -1;
                
                totalScore += value * colorMultiplier;

                const pst = piecePSTs[pieceType];
                if (pst) {
                    const positionalScore = piece.startsWith('w') ? pst[r][c] : -pst[7 - r][c];
                    totalScore += positionalScore;
                }
            }
        }
    }
    return totalScore;
}

/**
 * Lấy tất cả các nước đi hợp lệ (phiên bản chưa sắp xếp).
 */
function getAllPossibleMoves(board, color) {
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.startsWith(color)) {
                const validMoves = getValidMoves(piece, r, c, board);
                const legalMoves = validMoves.filter(move => {
                    const tempBoard = simulateMove(board, { from: [r, c], to: move });
                    return !isKingInCheck(color, tempBoard);
                });
                legalMoves.forEach(move => {
                    allMoves.push({ from: [r, c], to: move });
                });
            }
        }
    }
    return allMoves;
}

/**
 * Tạo bàn cờ giả định.
 */
function simulateMove(board, move) {
    const newBoard = JSON.parse(JSON.stringify(board));
    const piece = newBoard[move.from[0]][move.from[1]];
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = null;
    return newBoard;
}