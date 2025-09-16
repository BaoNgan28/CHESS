// Đây là tệp chính, đóng vai trò điều phối viên.
// Nó lắng nghe sự kiện từ người dùng và gọi các hàm từ các module khác (logic, ui, state).

import { gameState, resetGameState } from './state.js';
import { getValidMoves, isKingInCheck, isCheckmate } from './logic.js';
import { 
    createBoard, renderBoard, updateStatus, clearHighlights, 
    highlightSquare, highlightValidMoves, showGameOver, 
    hideGameOver, showPromotionAnimation 
} from './ui.js';

/**
 * Hàm khởi tạo game, được gọi khi trang web tải xong.
 */
function initGame() {
    // Tạo bàn cờ và truyền vào hàm xử lý sự kiện click
    createBoard(onSquareClick);
    // Vẽ các quân cờ lên bàn cờ
    renderBoard();
    // Gắn sự kiện cho nút chơi lại
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

/**
 * Hàm xử lý khi người dùng click vào nút "Chơi Lại".
 */
function restartGame() {
    resetGameState(); // Đặt lại trạng thái game về ban đầu
    hideGameOver();   // Ẩn thông báo thắng thua
    renderBoard();    // Vẽ lại bàn cờ
}

/**
 * Hàm xử lý chính khi người dùng click vào một ô cờ.
 * @param {number} row - Tọa độ hàng của ô được click.
 * @param {number} col - Tọa độ cột của ô được click.
 */
function onSquareClick(row, col) {
    // Nếu game đã kết thúc hoặc đang thăng cấp, không làm gì cả
    if (gameState.isGameOver || gameState.isPromoting) return;

    const piece = gameState.board[row][col];

    // TRƯỜNG HỢP 1: Đã chọn một quân cờ, bây giờ click để di chuyển
    if (gameState.selectedPiece) {
        const { row: fromRow, col: fromCol } = gameState.selectedPiece;
        const selectedPieceName = gameState.board[fromRow][fromCol];

        // Lấy tất cả các nước đi có thể (chưa xét chiếu)
        const validMoves = getValidMoves(selectedPieceName, fromRow, fromCol, gameState.board);
        
        // Lọc lại để chỉ giữ những nước đi hợp lệ (không tự đưa vua vào thế bị chiếu)
        const legalMoves = validMoves.filter(move => {
            const tempBoard = JSON.parse(JSON.stringify(gameState.board));
            tempBoard[move[0]][move[1]] = selectedPieceName;
            tempBoard[fromRow][fromCol] = null;
            return !isKingInCheck(gameState.currentPlayer, tempBoard);
        });

        const isMoveLegal = legalMoves.some(move => move[0] === row && move[1] === col);

        if (isMoveLegal) {
            movePiece(fromRow, fromCol, row, col);
        } else {
            // Nếu click vào một ô không hợp lệ, hủy lựa chọn
            clearHighlights();
            gameState.selectedPiece = null;
        }

    // TRƯỜNG HỢP 2: Chưa chọn quân cờ nào, bây giờ click để chọn
    } else if (piece && piece.startsWith(gameState.currentPlayer)) {
        selectPiece(row, col);
    }
}

/**
 * Xử lý việc chọn một quân cờ.
 * @param {number} row 
 * @param {number} col 
 */
function selectPiece(row, col) {
    clearHighlights();
    gameState.selectedPiece = { row, col };
    highlightSquare(row, col);

    const piece = gameState.board[row][col];
    const validMoves = getValidMoves(piece, row, col, gameState.board);
    
    // Tương tự, chỉ highlight các nước đi hợp lệ
    const legalMoves = validMoves.filter(move => {
        const tempBoard = JSON.parse(JSON.stringify(gameState.board));
        tempBoard[move[0]][move[1]] = piece;
        tempBoard[row][col] = null;
        return !isKingInCheck(gameState.currentPlayer, tempBoard);
    });

    highlightValidMoves(legalMoves);
}

/**
 * Thực hiện di chuyển quân cờ và kiểm tra các điều kiện tiếp theo.
 * @param {number} fromRow 
 * @param {number} fromCol 
 * @param {number} toRow 
 * @param {number} toCol 
 */
function movePiece(fromRow, fromCol, toRow, toCol) {
    const movedPiece = gameState.board[fromRow][fromCol];
    gameState.board[toRow][toCol] = movedPiece;
    gameState.board[fromRow][fromCol] = null;
    gameState.selectedPiece = null;
    clearHighlights();

    // --- KIỂM TRA ĐIỀU KIỆN THĂNG CẤP ---
    const pieceColor = movedPiece.charAt(0);
    const isPawn = movedPiece.endsWith('_pawn');
    const isFinalRank = (pieceColor === 'w' && toRow === 0) || (pieceColor === 'b' && toRow === 7);

    if (isPawn && isFinalRank) {
        gameState.isPromoting = true;
        showPromotionAnimation(pieceColor, (promotedPieceType) => {
            // Hàm callback này sẽ chạy SAU KHI hiệu ứng kết thúc
            const newPiece = `${pieceColor}_${promotedPieceType}`;
            gameState.board[toRow][toCol] = newPiece;
            gameState.isPromoting = false;
            
            // Tiếp tục luồng game
            continueGameFlow();
        });
    } else {
        // Nếu không phải thăng cấp, tiếp tục như bình thường
        continueGameFlow();
    }
}

/**
 * Chứa các bước tiếp theo của game sau một nước đi (đổi lượt, render, kiểm tra chiếu hết).
 */
function continueGameFlow() {
    switchPlayer();
    renderBoard();

    // Kiểm tra chiếu hết cho người chơi tiếp theo
    if (isCheckmate(gameState.currentPlayer, gameState.board)) {
        gameState.isGameOver = true;
        gameState.winner = gameState.currentPlayer === 'w' ? 'b' : 'w';
        showGameOver(gameState.winner);
    }
    
    updateStatus();
}

/**
 * Đổi lượt chơi.
 */
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'w' ? 'b' : 'w';
}

// Bắt đầu game khi trang web được tải hoàn chỉnh.
document.addEventListener('DOMContentLoaded', initGame);