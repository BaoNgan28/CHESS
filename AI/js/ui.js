// js/ui.js
// File này chỉ chịu trách nhiệm cập nhật giao diện người dùng (DOM).
// Nó không chứa logic game, chỉ nhận dữ liệu và hiển thị.

import { PIECES, PROMOTABLE_PIECES } from './constants.js';
import { gameState } from './state.js';
import { isKingInCheck } from './logic.js';

// Lấy các phần tử HTML cần thiết
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const gameOverOverlay = document.getElementById('game-over-overlay');
const gameOverMessage = document.getElementById('game-over-message');
const promotionOverlay = document.getElementById('promotion-overlay');
const promotionSpinner = document.getElementById('promotion-spinner');


/**
 * Tạo các ô cờ (div) và gắn sự kiện click cho chúng.
 * @param {Function} onSquareClick - Hàm callback sẽ được gọi khi một ô được click.
 */
export function createBoard(onSquareClick) {
    boardElement.innerHTML = ''; // Xóa bàn cờ cũ
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark'); // xen kẽ màu
            square.dataset.row = row; // lưu tọa độ vào data-attributes
            square.dataset.col = col;
            square.addEventListener('click', () => onSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}

/**
 * Vẽ lại toàn bộ quân cờ lên bàn cờ từ `gameState`.
 */
export function renderBoard() {
    const kingInCheckPos = findKingPos(gameState.currentPlayer, gameState.board);
    
    // Kiểm tra xem vua của người chơi hiện tại có đang bị chiếu không
    const isChecked = isKingInCheck(gameState.currentPlayer, gameState.board);

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            square.innerHTML = ''; // Xóa quân cờ cũ
            square.classList.remove('check'); // Xóa highlight chiếu
            
            const pieceName = gameState.board[r][c];
            if (pieceName) {
                const pieceElement = document.createElement('span');
                pieceElement.innerText = PIECES[pieceName];
                pieceElement.className = pieceName.startsWith('w') ? 'piece-white' : 'piece-black';
                square.appendChild(pieceElement);
            }

            // Nếu vua đang bị chiếu, thêm class 'check' để highlight ô đó
            if (isChecked && kingInCheckPos && kingInCheckPos.row === r && kingInCheckPos.col === c) {
                square.classList.add('check');
            }
        }
    }
    updateStatus();
}

/**
 * Tìm vị trí vua trên bàn cờ để highlight.
 */
function findKingPos(color, board) {
    const kingName = `${color}_king`;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === kingName) return { row: r, col: c };
        }
    }
    return null;
}

/**
 * Cập nhật dòng trạng thái của game.
 */
export function updateStatus() {
    if (gameState.isGameOver) {
        let winnerText = gameState.winner === 'w' ? 'Trắng' : 'Đen';
        statusElement.innerText = `Kết thúc! Quân ${winnerText} thắng!`;
    } else {
        let playerText = gameState.currentPlayer === 'w' ? 'Trắng' : 'Đen';
        let checkText = isKingInCheck(gameState.currentPlayer, gameState.board) ? " (Đang bị chiếu!)" : "";
        statusElement.innerText = `Lượt của quân ${playerText}${checkText}`;
    }
}

/**
 * Xóa tất cả các highlight (ô được chọn, nước đi hợp lệ).
 */
export function clearHighlights() {
    document.querySelectorAll('.selected, .valid-move').forEach(el => {
        el.classList.remove('selected', 'valid-move');
    });
}

/**
 * Highlight một ô cờ.
 * @param {number} row 
 * @param {number} col 
 */
export function highlightSquare(row, col) {
    const square = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (square) square.classList.add('selected');
}

/**
 * Highlight các ô là nước đi hợp lệ.
 * @param {Array<[number, number]>} moves - Mảng các nước đi.
 */
export function highlightValidMoves(moves) {
    moves.forEach(([r, c]) => {
        const square = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
        if (square) square.classList.add('valid-move');
    });
}

/**
 * Hiển thị thông báo kết thúc game.
 * @param {string} winner - Người thắng cuộc ('w' hoặc 'b').
 */
export function showGameOver(winner) {
    const winnerText = winner === 'w' ? 'Trắng' : 'Đen';
    gameOverMessage.innerText = `Quân ${winnerText} Thắng!`;
    gameOverOverlay.classList.remove('hidden');
}

/**
 * Ẩn thông báo kết thúc game.
 */
export function hideGameOver() {
    gameOverOverlay.classList.add('hidden');
}

/**
 * Hiển thị hiệu ứng thăng cấp quân tốt.
 * @param {string} color - Màu của quân tốt ('w' hoặc 'b').
 * @param {Function} onPromotionComplete - Callback được gọi khi hiệu ứng kết thúc.
 */
export function showPromotionAnimation(color, onPromotionComplete) {
    promotionOverlay.classList.remove('hidden');
    
    let spinCount = 0;
    const maxSpins = 50;
    const spinInterval = 50;

    const intervalId = setInterval(() => {
        const randomPieceType = PROMOTABLE_PIECES[Math.floor(Math.random() * PROMOTABLE_PIECES.length)];
        const pieceName = `${color}_${randomPieceType}`;
        
        promotionSpinner.innerText = PIECES[pieceName];
        promotionSpinner.className = color === 'w' ? 'piece-white' : 'piece-black';

        spinCount++;
        if (spinCount >= maxSpins) {
            clearInterval(intervalId);
            const finalPromotedPieceType = PROMOTABLE_PIECES[Math.floor(Math.random() * PROMOTABLE_PIECES.length)];
            const finalPieceName = `${color}_${finalPromotedPieceType}`;
            promotionSpinner.innerText = PIECES[finalPieceName];
            
            setTimeout(() => {
                promotionOverlay.classList.add('hidden');
                onPromotionComplete(finalPromotedPieceType);
            }, 500);
        }
    }, spinInterval);
}