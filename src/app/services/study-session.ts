import { computed, Service, signal } from '@angular/core';
import type { Card } from '../models/card';
import type { Deck } from '../models/deck';

@Service()
export class StudySession {
  private readonly cards = signal<Card[]>([]);
  private readonly _order = signal<string[]>([]);
  private readonly _currentIndex = signal(0);
  private readonly _isFlipped = signal(false);
  private deckId: string | null = null;

  readonly order = this._order.asReadonly();
  readonly currentIndex = this._currentIndex.asReadonly();
  readonly isFlipped = this._isFlipped.asReadonly();
  readonly currentCard = computed(() => {
    const cardId = this.order()[this.currentIndex()];
    return this.cards().find((card) => card.id === cardId);
  });

  setDeck(deck: Deck | null): void {
    const nextDeckId = deck?.id ?? null;
    const nextCards = deck?.cards ?? [];

    if (nextDeckId !== this.deckId) {
      this.deckId = nextDeckId;
      this.cards.set(nextCards);
      this._order.set(nextCards.map((card) => card.id));
      this._currentIndex.set(0);
      this.reset();
      return;
    }

    const currentCardId = this.currentCard()?.id;
    const previousIndex = this.currentIndex();
    const nextCardIds = new Set(nextCards.map((card) => card.id));
    const existingOrder = this.order();
    const nextOrder = [
      ...existingOrder.filter((cardId) => nextCardIds.has(cardId)),
      ...nextCards
        .map((card) => card.id)
        .filter((cardId) => !existingOrder.includes(cardId)),
    ];

    this.cards.set(nextCards);
    this._order.set(nextOrder);

    if (currentCardId && nextCardIds.has(currentCardId)) {
      this._currentIndex.set(nextOrder.indexOf(currentCardId));
      return;
    }

    this._currentIndex.set(Math.min(previousIndex, Math.max(0, nextOrder.length - 1)));
    if (currentCardId) {
      this.reset();
    }
  }

  previous(): void {
    if (this.currentIndex() === 0 || !this.currentCard()) {
      return;
    }

    this._currentIndex.update((index) => index - 1);
    this.reset();
  }

  next(): void {
    if (this.currentIndex() >= this.order().length - 1 || !this.currentCard()) {
      return;
    }

    this._currentIndex.update((index) => index + 1);
    this.reset();
  }

  shuffle(): void {
    const shuffledOrder = [...this.order()];
    for (let index = shuffledOrder.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledOrder[index], shuffledOrder[swapIndex]] = [
        shuffledOrder[swapIndex],
        shuffledOrder[index],
      ];
    }

    this._order.set(shuffledOrder);
    this._currentIndex.set(0);
    this.reset();
  }

  toggleFlip(): void {
    this._isFlipped.update((isFlipped) => !isFlipped);
  }

  private reset(): void {
    this._isFlipped.set(false);
  }
}
