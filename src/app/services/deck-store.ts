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
  readonly activeDeckId = signal('biology-basics');
  readonly activeDeck = computed(
    () => this.decks().find((deck) => deck.id === this.activeDeckId()) ?? null,
  );

  selectDeck(deckId: string): void {
    if (this.decks().some((deck) => deck.id === deckId)) {
      this.activeDeckId.set(deckId);
    }
  }
}
