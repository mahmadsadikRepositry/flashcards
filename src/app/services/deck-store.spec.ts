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

  it('creates a deck and makes it active', () => {
    service.createDeck('  Chemistry  ');

    expect(service.decks()).toHaveLength(3);
    expect(service.activeDeck()?.title).toBe('Chemistry');
    expect(service.activeDeck()?.cards).toEqual([]);
  });

  it('renames a deck without changing its cards', () => {
    const cards = service.decks()[0].cards;

    service.renameDeck('biology-basics', 'Life Science');

    expect(service.decks()[0].title).toBe('Life Science');
    expect(service.decks()[0].cards).toBe(cards);
  });

  it('adds a card with a UUID and updates the deck timestamp', () => {
    service.addCard('biology-basics', '  Front  ', '  Back  ');

    const deck = service.decks()[0];
    expect(deck.cards).toHaveLength(4);
    expect(deck.cards[3]).toMatchObject({
      question: '  Front  ',
      answer: '  Back  ',
    });
    expect(deck.cards[3].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(deck.updatedAt).toBeTruthy();
  });

  it('updates a card and the deck timestamp', () => {
    service.updateCard('biology-basics', 'cell', 'Updated front', 'Updated back');

    expect(service.decks()[0].cards[0]).toEqual({
      id: 'cell',
      question: 'Updated front',
      answer: 'Updated back',
    });
    expect(service.decks()[0].updatedAt).toBeTruthy();
  });

  it('deletes a card and updates the deck timestamp', () => {
    service.deleteCard('biology-basics', 'cell');

    expect(service.decks()[0].cards.some((card) => card.id === 'cell')).toBe(false);
    expect(service.decks()[0].updatedAt).toBeTruthy();
  });

  it('selects the next deck after deleting the active deck, then the previous deck', () => {
    service.deleteDeck('biology-basics');
    expect(service.activeDeckId()).toBe('world-capitals');

    service.deleteDeck('world-capitals');
    expect(service.activeDeckId()).toBeNull();
    expect(service.activeDeck()).toBeNull();
  });

  it('selects the previous deck when the active deck is last', () => {
    service.selectDeck('world-capitals');

    service.deleteDeck('world-capitals');

    expect(service.activeDeckId()).toBe('biology-basics');
  });

  it('does not change the active deck when deleting a different deck', () => {
    service.selectDeck('world-capitals');

    service.deleteDeck('biology-basics');

    expect(service.activeDeckId()).toBe('world-capitals');
  });

  it('ignores selection and deletion of unknown deck ids', () => {
    service.selectDeck('missing');
    service.deleteDeck('missing');

    expect(service.activeDeckId()).toBe('biology-basics');
    expect(service.decks()).toHaveLength(2);
  });
});
