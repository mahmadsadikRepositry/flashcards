import { Service, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Deck } from '../models/deck';

export interface FlashcardsState {
  version: 1;
  decks: Deck[];
  activeDeckId: string | null;
}

const STATE_KEY = 'flashcards.state';

@Service()
export class Storage {
  private readonly snackBar = inject(MatSnackBar);

  loadState(): FlashcardsState {
    let raw: string | null;
    try {
      raw = localStorage.getItem(STATE_KEY);
    } catch {
      return this.defaultState();
    }

    if (raw === null) {
      return this.defaultState();
    }

    try {
      const value = JSON.parse(raw) as unknown;
      const version =
        isRecord(value) && typeof value['version'] === 'number' ? value['version'] : NaN;
      const state = this.migrate(version, value);
      if (state) {
        return state;
      }
    } catch {
      this.preserveCorruptData(raw);
      return this.defaultState();
    }

    this.preserveCorruptData(raw);
    return this.defaultState();
  }

  migrate(version: number, value: unknown): FlashcardsState | null {
    if (version !== 1 || !isRecord(value) || !Array.isArray(value['decks'])) {
      return null;
    }

    const activeDeckId = value['activeDeckId'];
    if (
      !(activeDeckId === null || typeof activeDeckId === 'string') ||
      !value['decks'].every(isDeck)
    ) {
      return null;
    }

    return {
      version: 1,
      decks: value['decks'],
      activeDeckId,
    };
  }

  saveState(state: FlashcardsState): void {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
      if (!isQuotaExceededError(error)) {
        throw error;
      }

      this.snackBar.open(
        'Could not save your flashcards because browser storage is full.',
        'Dismiss',
        { duration: 5000 },
      );
    }
  }

  private defaultState(): FlashcardsState {
    return { version: 1, decks: [], activeDeckId: null };
  }

  private preserveCorruptData(raw: string): void {
    try {
      localStorage.setItem(`${STATE_KEY}.corrupt-${Date.now()}`, raw);
    } catch (error) {
      console.error('Could not preserve corrupt flashcard data.', error);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDeck(value: unknown): value is Deck {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['title'] === 'string' &&
    typeof value['description'] === 'string' &&
    (value['updatedAt'] === undefined || typeof value['updatedAt'] === 'string') &&
    Array.isArray(value['cards']) &&
    value['cards'].every(
      (card) =>
        isRecord(card) &&
        typeof card['id'] === 'string' &&
        typeof card['question'] === 'string' &&
        typeof card['answer'] === 'string',
    )
  );
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'QuotaExceededError'
  );
}
