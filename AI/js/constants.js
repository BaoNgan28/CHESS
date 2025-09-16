export const PIECES = {
    'w_king': '♔', 'w_queen': '♕', 'w_rook': '♖', 'w_bishop': '♗', 'w_knight': '♘', 'w_pawn': '♙',
    'b_king': '♚', 'b_queen': '♛', 'b_rook': '♜', 'b_bishop': '♝', 'b_knight': '♞', 'b_pawn': '♟'
};

// Mảng 2 chiều (8x8) biểu diễn trạng thái ban đầu của bàn cờ.
// `null` đại diện cho một ô trống.
export const INITIAL_BOARD = [
    ['b_rook', 'b_knight', 'b_bishop', 'b_queen', 'b_king', 'b_bishop', 'b_knight', 'b_rook'],
    ['b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn', 'b_pawn'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn', 'w_pawn'],
    ['w_rook', 'w_knight', 'w_bishop', 'w_queen', 'w_king', 'w_bishop', 'w_knight', 'w_rook']
];

// Mảng chứa các loại quân cờ mà Tốt có thể thăng cấp thành.
export const PROMOTABLE_PIECES = ['queen', 'rook', 'bishop', 'knight'];