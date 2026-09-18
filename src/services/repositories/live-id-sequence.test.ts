import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createLiveIdSequence } from './live-id-sequence';

beforeEach(() => {
  localStorage.clear();
});

describe('createLiveIdSequence', () => {
  it('increments on every call, starting at 1', () => {
    const nextId = createLiveIdSequence('test.seq.a');
    expect(nextId()).toBe(1);
    expect(nextId()).toBe(2);
    expect(nextId()).toBe(3);
  });

  it('keeps independent sequences per storage key', () => {
    const nextA = createLiveIdSequence('test.seq.independent-a');
    const nextB = createLiveIdSequence('test.seq.independent-b');
    expect(nextA()).toBe(1);
    expect(nextA()).toBe(2);
    expect(nextB()).toBe(1);
  });

  it('resumes from the stored value rather than restarting at zero - the property the reload/tab fix depends on', () => {
    const key = 'test.seq.resume';
    const tab1 = createLiveIdSequence(key);
    expect(tab1()).toBe(1);
    expect(tab1()).toBe(2);

    // A fresh closure standing in for a second tab or a reload - a private in-memory counter
    // would restart this at 0, but the sequence lives in localStorage, not this closure.
    const tab2 = createLiveIdSequence(key);
    expect(tab2()).toBe(3);
  });

  it('falls back to a locally-unique counter when localStorage throws, rather than repeating a value', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    try {
      const nextId = createLiveIdSequence('test.seq.fallback');
      expect(nextId()).toBe(1);
      expect(nextId()).toBe(2);
    } finally {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
    }
  });
});
