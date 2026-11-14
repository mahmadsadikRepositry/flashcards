import { computed, Service, signal } from '@angular/core';
import type { Deck } from '../models/deck';

@Service()
export class DeckStore {
  readonly decks = signal<Deck[]>([
    {
      id: 'biology-basics',
      title: 'Biology Basics',
      description: 'Core concepts in cells and life science',
      cards: [
        {
          id: 'cell',
          question: 'What is the basic unit of life?',
          answer: 'The cell',
        },
        {
          id: 'photosynthesis',
          question: 'What process lets plants turn sunlight into energy?',
          answer: 'Photosynthesis',
        },
        {
          id: 'mitochondria',
          question: 'Which organelle is often called the powerhouse of the cell?',
          answer: 'The mitochondrion',
        },
      ],
    },
    {
      id: 'world-capitals',
      title: 'World Capitals',
      description: 'A quick tour of capital cities',
      cards: [
        {
          id: 'japan',
          question: 'What is the capital of Japan?',
          answer: 'Tokyo',
        },
        {
          id: 'kenya',
          question: 'What is the capital of Kenya?',
          answer: 'Nairobi',
        },
        {
          id: 'portugal',
          question: 'What is the capital of Portugal?',
          answer: 'Lisbon',
        },
      ],
    },
  ]);
  readonly activeDeckId = signal<string | null>('biology-basics');
  readonly activeDeck = computed(
    () => this.decks().find((deck) => deck.id === this.activeDeckId()) ?? null,
  );

  createDeck(name: string): void {
    const deck: Deck = {
      id: crypto.randomUUID(),
      title: name.trim(),
      description: '',
      cards: [],
    };

    this.decks.update((decks) => [...decks, deck]);
    this.activeDeckId.set(deck.id);
  }

  renameDeck(id: string, name: string): void {
    this.decks.update((decks) =>
      decks.map((deck) => (deck.id === id ? { ...deck, title: name.trim() } : deck)),
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
