import { computed, effect, inject, Service, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import type { Deck } from '../models/deck';
import { Storage } from './storage';

@Service()
export class DeckStore {
  private readonly storage = inject(Storage);
  readonly decks: WritableSignal<Deck[]>;
  readonly activeDeckId: WritableSignal<string | null>;
  readonly activeDeck = computed(
    () => this.decks().find((deck) => deck.id === this.activeDeckId()) ?? null,
  );

  constructor() {
    const state = this.storage.loadState();
    this.decks = signal(state.decks);
    this.activeDeckId = signal(
      state.decks.some((deck) => deck.id === state.activeDeckId)
        ? state.activeDeckId
        : (state.decks[0]?.id ?? null),
    );

    effect(() => {
      this.storage.saveState({
        version: 1,
        decks: this.decks(),
        activeDeckId: this.activeDeckId(),
      });
    });
  }

  createDeck(name: string): void {
    const deck: Deck = {
      id: crypto.randomUUID(),
      title: name.trim(),
      description: '',
      cards: [],
      updatedAt: new Date().toISOString(),
    };

    this.decks.update((decks) => [...decks, deck]);
    this.activeDeckId.set(deck.id);
  }

  renameDeck(id: string, name: string): void {
    this.decks.update((decks) =>
      decks.map((deck) =>
        deck.id === id
          ? { ...deck, title: name.trim(), updatedAt: new Date().toISOString() }
          : deck,
      ),
    );
  }

  addCard(deckId: string, question: string, answer: string): void {
    const card = { id: crypto.randomUUID(), question, answer };
    const updatedAt = new Date().toISOString();

    this.decks.update((decks) =>
      decks.map((deck) =>
        deck.id === deckId
          ? { ...deck, cards: [...deck.cards, card], updatedAt }
          : deck,
      ),
    );
  }

  updateCard(deckId: string, cardId: string, question: string, answer: string): void {
    const updatedAt = new Date().toISOString();

    this.decks.update((decks) =>
      decks.map((deck) =>
        deck.id === deckId && deck.cards.some((card) => card.id === cardId)
          ? {
              ...deck,
              cards: deck.cards.map((card) =>
                card.id === cardId ? { ...card, question, answer } : card,
              ),
              updatedAt,
            }
          : deck,
      ),
    );
  }

  deleteCard(deckId: string, cardId: string): void {
    this.decks.update((decks) =>
      decks.map((deck) =>
        deck.id === deckId && deck.cards.some((card) => card.id === cardId)
          ? {
              ...deck,
              cards: deck.cards.filter((card) => card.id !== cardId),
              updatedAt: new Date().toISOString(),
            }
          : deck,
      ),
    );
  }

  deleteDeck(id: string): void {
    const decks = this.decks();
    const deletedIndex = decks.findIndex((deck) => deck.id === id);
    if (deletedIndex === -1) {
      return;
    }

    const remainingDecks = decks.filter((deck) => deck.id !== id);
    this.decks.set(remainingDecks);

    if (this.activeDeckId() === id) {
      this.activeDeckId.set(
        remainingDecks[Math.min(deletedIndex, remainingDecks.length - 1)]?.id ?? null,
      );
    }
  }

  selectDeck(deckId: string): void {
    if (this.decks().some((deck) => deck.id === deckId)) {
      this.activeDeckId.set(deckId);
    }
  }
}
