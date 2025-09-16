// js/AI_alphaBeta.js
// PHIÊN BẢN NÂNG CẤP HOÀN CHỈNH
// Tối ưu hóa với:
// 1. Kỹ thuật "Dễ": Hàm đánh giá vị trí (Piece-Square Tables).
// 2. Kỹ thuật "Trung bình": Sắp xếp nước đi (Move Ordering).
// 3. Kỹ thuật "Khó": Tìm kiếm tĩnh (Quiescence Search).

import { getValidMoves, isKingInCheck } from './logic.js';

// --- CÁC HẰNG SỐ VÀ BẢNG ĐIỂM ---

// 1. Giá trị vật chất của quân cờ (sử dụng centipawns)
const pieceValues = {
    'pawn': 100, 'knight': 320, 'bishop': 330, 'rook': 500, 'queen': 900, 'king': 20000
};

// 2. Bảng điểm vị trí cho từng quân cờ (Piece-Square Tables - PSTs)
const pawnPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 27, 27, 10,  5,  5],
    [0,  0,  0, 25, 25,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-25,-25, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightPST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopPST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookPST = [
    [0,  0,  0,  5,  5,  0,  0,  0],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const queenPST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
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

    if (isMaximizing) {
        let bestValue = -Infinity;
        for (const move of allMoves) {
            const newBoard = simulateMove(board, move);
            const moveValue = alphaBeta(newBoard, depth - 1, -Infinity, Infinity, false);
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
        console.log(`AlphaBeta (MAX): Nước đi tốt nhất có điểm ${bestValue}`);
        return bestMove;
    } else {
        let bestValue = Infinity;
        for (const move of allMoves) {
            const newBoard = simulateMove(board, move);
            const moveValue = alphaBeta(newBoard, depth - 1, -Infinity, Infinity, true);
            if (moveValue < bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
        console.log(`AlphaBeta (MIN): Nước đi tốt nhất có điểm ${bestValue}`);
        return bestMove;
    }
}

/**
 * Hàm đệ quy Alpha-Beta.
 */
function alphaBeta(board, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
        return quiescenceSearch(board, alpha, beta, isMaximizing);
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
            const evalValue = alphaBeta(newBoard, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evalValue);
            alpha = Math.max(alpha, evalValue);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of allMoves) {
            const newBoard = simulateMove(board, move);
            const evalValue = alphaBeta(newBoard, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evalValue);
            beta = Math.min(beta, evalValue);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

/**
 * Hàm Tìm Kiếm Tĩnh (Quiescence Search).
 */
function quiescenceSearch(board, alpha, beta, isMaximizing) {
    const stand_pat = evaluateBoard(board);

    if (isMaximizing) {
        if (stand_pat >= beta) return beta;
        alpha = Math.max(alpha, stand_pat);
    } else {
        if (stand_pat <= alpha) return alpha;
        beta = Math.min(beta, stand_pat);
    }

    const color = isMaximizing ? 'w' : 'b';
    const captureMoves = getAllPossibleMoves(board, color, true);

    for (const move of captureMoves) {
        const newBoard = simulateMove(board, move);
        const score = quiescenceSearch(newBoard, alpha, beta, !isMaximizing);

        if (isMaximizing) {
            if (score >= beta) return beta;
            alpha = Math.max(alpha, score);
        } else {
            if (score <= alpha) return alpha;
            beta = Math.min(beta, score);
        }
    }
    return isMaximizing ? alpha : beta;
}


// --- CÁC HÀM HỖ TRỢ ---

/**
 * Hàm đánh giá bàn cờ, kết hợp cả giá trị vật chất và giá trị vị trí.
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
 * Lấy tất cả các nước đi hợp lệ và sắp xếp chúng (Sắp Xếp Nước Đi).
 */
function getAllPossibleMoves(board, color, capturesOnly = false) {
    const regularMoves = [];
    const captureMoves = [];

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
                    const moveObject = { from: [r, c], to: move };
                    if (board[move[0]][move[1]]) {
                        captureMoves.push(moveObject);
                    } else if (!capturesOnly) {
                        regularMoves.push(moveObject);
                    }
                });
            }
        }
    }
    return [...captureMoves, ...regularMoves];
}

/**
 * Tạo bàn cờ giả định với một nước đi.
 */
function simulateMove(board, move) {
    const newBoard = JSON.parse(JSON.stringify(board));
    const piece = newBoard[move.from[0]][move.from[1]];
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = null;
    return newBoard;
}