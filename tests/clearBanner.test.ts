import { describe, expect, it } from 'vitest';
import { clearBannerMessage } from '../src/game/ui/clearBannerCopy';

describe('clear banner copy', () => {
  it('returns null when nothing cleared', () => {
    expect(clearBannerMessage(0, 0)).toBeNull();
  });

  it('labels multi-line clears', () => {
    expect(clearBannerMessage(1, 1)).toBe('Nice clear!');
    expect(clearBannerMessage(2, 1)).toBe('Double clear!');
    expect(clearBannerMessage(3, 1)).toBe('Triple clear!');
    expect(clearBannerMessage(4, 1)).toBe('Mega clear!');
  });

  it('appends combo when streak is 2+', () => {
    expect(clearBannerMessage(2, 3)).toBe('Double clear!  Combo x3');
  });
});
