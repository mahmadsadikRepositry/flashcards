import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Storage } from './storage';

describe('Storage', () => {
  let service: Storage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(Storage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns an empty default state when nothing has been saved', () => {
    expect(service.loadState()).toEqual({
      version: 1,
      decks: [],
      activeDeckId: null,
    });
  });

  it('loads a valid saved state', () => {
    const state = {
      version: 1,
      decks: [
        {
          id: 'deck',
          title: 'Deck',
          description: '',
          cards: [{ id: 'card', question: 'Front', answer: 'Back' }],
        },
      ],
      activeDeckId: 'deck',
    };
    localStorage.setItem('flashcards.state', JSON.stringify(state));

    expect(service.loadState()).toEqual(state);
  });

  it('preserves invalid data and falls back to the default state', () => {
    const raw = '{invalid json';
    localStorage.setItem('flashcards.state', raw);

    expect(service.loadState()).toEqual({
      version: 1,
      decks: [],
      activeDeckId: null,
    });
    const backupKey = Object.keys(localStorage).find((key) =>
      key.startsWith('flashcards.state.corrupt-'),
    );
    expect(backupKey).toBeTruthy();
    expect(localStorage.getItem(backupKey!)).toBe(raw);
  });

  it('falls back to the default state when saved JSON has the wrong shape', () => {
    localStorage.setItem(
      'flashcards.state',
      JSON.stringify({ version: 1, decks: 'not-an-array', activeDeckId: null }),
    );

    expect(service.loadState()).toEqual({
      version: 1,
      decks: [],
      activeDeckId: null,
    });
  });

  it('rejects invalid nested deck data and unsupported versions', () => {
    expect(
      service.migrate(1, {
        version: 1,
        decks: [{ id: 'deck', title: 'Deck', description: '', cards: [{}] }],
        activeDeckId: null,
      }),
    ).toBeNull();
    expect(service.migrate(2, { version: 2, decks: [], activeDeckId: null })).toBeNull();
  });

  it('shows a message when saving exceeds browser storage quota', () => {
    const snackBar = TestBed.inject(MatSnackBar);
    const open = vi.spyOn(snackBar, 'open');
    vi.spyOn(globalThis.Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    service.saveState({ version: 1, decks: [], activeDeckId: null });

    expect(open).toHaveBeenCalledWith(
      'Could not save your flashcards because browser storage is full.',
      'Dismiss',
      { duration: 5000 },
    );
  });
});
