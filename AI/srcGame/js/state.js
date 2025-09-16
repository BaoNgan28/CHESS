// js/state.js
// File này quản lý trạng thái (state) của game một cách tập trung.
// Mọi dữ liệu thay đổi trong quá trình chơi đều được lưu ở đây.

import { INITIAL_BOARD } from './constants.js';

/**
 * Hàm tạo ra trạng thái ban đầu của game.
 * @returns {object} - Đối tượng chứa toàn bộ trạng thái game.
 */
const createInitialState = () => ({
    // Sao chép sâu (deep copy) bàn cờ ban đầu để tránh thay đổi hằng số.
    // JSON.parse(JSON.stringify(...)) là một cách đơn giản để tạo bản sao sâu.
    board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
    currentPlayer: 'w', // 'w' là quân Trắng, 'b' là quân Đen
    selectedPiece: null, // Lưu thông tin quân cờ đang được chọn {row, col}
    isGameOver: false, // Cờ báo hiệu game đã kết thúc hay chưa
    winner: null, // Lưu người chiến thắng ('w' hoặc 'b')
    isPromoting: false // Cờ báo hiệu hiệu ứng thăng cấp đang diễn ra
});

// Biến `gameState` chứa trạng thái hiện tại của ván cờ.
// `export let` cho phép các file khác có thể import và sử dụng nó.
export let gameState = createInitialState();

/**
 * Hàm đặt lại trạng thái game về ban đầu, dùng khi chơi lại.
 */
export function resetGameState() {
    const newState = createInitialState();
    // Gán lại từng thuộc tính của gameState bằng giá trị mới.
    Object.keys(newState).forEach(key => {
        gameState[key] = newState[key];
    });
}