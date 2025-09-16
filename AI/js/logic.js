
/**
 * Lấy tất cả các nước đi có thể của một quân cờ (chưa kiểm tra chiếu).
 * @param {string} piece - Tên quân cờ, vd: 'w_pawn'.
 * @param {number} row - Tọa độ hàng của quân cờ.
 * @param {number} col - Tọa độ cột của quân cờ.
 * @param {Array<Array<string|null>>} board - Trạng thái bàn cờ hiện tại.
 * @returns {Array<[number, number]>} - Mảng các nước đi hợp lệ [[r1, c1], [r2, c2]].
 */
export function getValidMoves(piece, row, col, board) {
    // ... logic di chuyển cho từng quân cờ ...
    // (Phần này được giữ nguyên, chỉ thêm chú thích nếu cần)
    const moves = [];
    const pieceType = piece.substring(2);
    const color = piece.substring(0, 1);
    
    switch (pieceType) {
        // Logic cho quân Tốt (Pawn)
        case 'pawn':
            const dir = color === 'w' ? -1 : 1;
            const startRow = color === 'w' ? 6 : 1;
            // Đi thẳng 1 ô
            if (row + dir >= 0 && row + dir < 8 && !board[row + dir][col]) moves.push([row + dir, col]);
            // Đi thẳng 2 ô từ vị trí ban đầu
            if (row === startRow && !board[row + dir][col] && !board[row + 2 * dir][col]) moves.push([row + 2 * dir, col]);
            // Ăn chéo
            [-1, 1].forEach(side => {
                if (col + side >= 0 && col + side < 8) {
                    const target = board[row + dir]?.[col + side];
                    if (target && !target.startsWith(color)) moves.push([row + dir, col + side]);
                }
            });
            break;
        // Logic cho các quân cờ khác...
        case 'knight':
             [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
                const newR = row + dr, newC = col + dc;
                if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
                    const target = board[newR][newC];
                    if (!target || !target.startsWith(color)) moves.push([newR, newC]);
                }
            });
            break;
        case 'rook':
        case 'bishop':
        case 'queen':
            const directions = {
                rook: [[0,1],[0,-1],[1,0],[-1,0]],
                bishop: [[1,1],[1,-1],[-1,1],[-1,-1]],
                queen: [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]
            };
            directions[pieceType].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const newR = row + dr * i, newC = col + dc * i;
                    if (newR < 0 || newR >= 8 || newC < 0 || newC >= 8) break;
                    const target = board[newR][newC];
                    if (target) {
                        if (!target.startsWith(color)) moves.push([newR, newC]);
                        break;
                    }
                    moves.push([newR, newC]);
                }
            });
            break;
        case 'king':
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const newR = row + dr, newC = col + dc;
                    if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
                        const target = board[newR][newC];
                        if (!target || !target.startsWith(color)) moves.push([newR, newC]);
                    }
                }
            }
            break;
    }
    return moves;
}

/**
 * Kiểm tra xem vua của một màu có đang bị chiếu hay không.
 * @param {string} kingColor - Màu của vua ('w' hoặc 'b').
 * @param {Array<Array<string|null>>} board - Trạng thái bàn cờ.
 * @returns {boolean} - true nếu vua đang bị chiếu, ngược lại false.
 */
export function isKingInCheck(kingColor, board) {
    const kingPos = findKing(kingColor, board);
    if (!kingPos) return false; // Không tìm thấy vua (trường hợp hiếm)

    const opponentColor = kingColor === 'w' ? 'b' : 'w';
    // Duyệt qua tất cả các quân cờ của đối phương
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.startsWith(opponentColor)) {
                // Lấy các nước đi có thể của quân địch
                const moves = getValidMoves(piece, r, c, board);
                // Nếu một trong các nước đi đó trùng với vị trí của vua -> vua bị chiếu
                if (moves.some(move => move[0] === kingPos.row && move[1] === kingPos.col)) {
                    return true;
                }
            }
        }
    }
    return false; // Không có quân địch nào có thể tấn công vua
}

/**
 * Tìm vị trí vua của một màu trên bàn cờ.
 * @param {string} color - Màu của vua cần tìm.
 * @param {Array<Array<string|null>>} board - Trạng thái bàn cờ.
 * @returns {{row: number, col: number}|null} - Tọa độ của vua hoặc null.
 */
function findKing(color, board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === `${color}_king`) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}

/**
 * Kiểm tra xem một người chơi có bị chiếu hết cờ (checkmate) hay không.
 * @param {string} color - Màu của người chơi cần kiểm tra ('w' hoặc 'b').
 * @param {Array<Array<string|null>>} board - Trạng thái bàn cờ.
 * @returns {boolean} - true nếu bị chiếu hết.
 */
export function isCheckmate(color, board) {
    // 1. Nếu vua không bị chiếu, không thể là chiếu hết
    if (!isKingInCheck(color, board)) return false;

    // 2. Duyệt qua tất cả các quân cờ của người chơi
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.startsWith(color)) {
                const moves = getValidMoves(piece, r, c, board);
                
                // 3. Thử từng nước đi có thể của quân cờ
                for (const move of moves) {
                    const [toRow, toCol] = move;
                    
                    // 4. Tạo một bàn cờ giả định để thử nước đi
                    const tempBoard = JSON.parse(JSON.stringify(board));
                    tempBoard[toRow][toCol] = piece;
                    tempBoard[r][c] = null;

                    // 5. Nếu sau khi đi, vua không còn bị chiếu -> đã tìm thấy một lối thoát
                    if (!isKingInCheck(color, tempBoard)) {
                        return false; // Không phải chiếu hết
                    }
                }
            }
        }
    }

    // 6. Nếu đã duyệt hết mà không tìm thấy nước đi nào thoát chiếu -> chiếu hết
    return true;
}