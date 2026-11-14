import type { Card } from './card';

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
}
