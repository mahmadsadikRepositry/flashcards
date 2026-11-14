import { TestBed } from '@angular/core/testing';
import { DeckStore } from './deck-store';

describe('DeckStore', () => {
  let service: DeckStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeckStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('provides two placeholder decks with three cards each', () => {
    expect(service.decks()).toHaveLength(2);
    expect(service.decks().map((deck) => deck.cards.length)).toEqual([3, 3]);
  });
});
