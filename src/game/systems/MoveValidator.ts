import { canPlace, canPlaceAnywhere } from '../../domain/puzzleRules';
import type { BoardGrid, PieceShape, Placement } from '../../domain/types';

export class MoveValidator {
  canPlace(board: BoardGrid, placement: Placement): boolean {
    return canPlace(board, placement);
  }

  canPlaceAnywhere(board: BoardGrid, piece: PieceShape): boolean {
    return canPlaceAnywhere(board, piece);
  }
}
