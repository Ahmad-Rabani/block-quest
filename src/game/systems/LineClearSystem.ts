import { clearLines, findCompletedLines } from '../../domain/puzzleRules';
import type { BoardGrid, LineClearResult } from '../../domain/types';

export class LineClearSystem {
  find(board: BoardGrid): LineClearResult {
    return findCompletedLines(board);
  }

  clear(board: BoardGrid): { board: BoardGrid; result: LineClearResult } {
    return clearLines(board);
  }
}
