/** Pure label helper — unit-testable without Phaser. */
export function clearBannerMessage(linesCleared: number, combo: number): string | null {
  if (linesCleared <= 0) {
    return null;
  }
  let message = 'Nice clear!';
  if (linesCleared === 2) {
    message = 'Double clear!';
  } else if (linesCleared === 3) {
    message = 'Triple clear!';
  } else if (linesCleared >= 4) {
    message = 'Mega clear!';
  }
  if (combo >= 2) {
    message = `${message}  Combo x${combo}`;
  }
  return message;
}
