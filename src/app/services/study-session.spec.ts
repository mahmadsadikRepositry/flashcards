import { TestBed } from '@angular/core/testing';
import { StudySession } from './study-session';

describe('StudySession', () => {
  let service: StudySession;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudySession);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('navigates without wrapping and resets the flip when changing cards', () => {
    service.setDeck({
      id: 'deck',
      title: 'Deck',
      description: '',
      cards: [
        { id: 'first', question: 'First?', answer: 'First.' },
        { id: 'second', question: 'Second?', answer: 'Second.' },
      ],
    });

    service.previous();
    expect(service.currentCard()?.id).toBe('first');

    service.toggleFlip();
    service.next();
    expect(service.currentCard()?.id).toBe('second');
    expect(service.isFlipped()).toBe(false);

    service.next();
    expect(service.currentCard()?.id).toBe('second');
    service.toggleFlip();
    service.previous();
    expect(service.currentCard()?.id).toBe('first');
    expect(service.isFlipped()).toBe(false);
  });

  it('preserves the current card when the list changes and resets when it is deleted', () => {
    const deck = {
      id: 'deck',
      title: 'Deck',
      description: '',
      cards: [
        { id: 'first', question: 'First?', answer: 'First.' },
        { id: 'second', question: 'Second?', answer: 'Second.' },
        { id: 'third', question: 'Third?', answer: 'Third.' },
      ],
    };
    service.setDeck(deck);
    service.next();
    service.toggleFlip();

    service.setDeck({ ...deck, cards: [deck.cards[1], deck.cards[2]] });
    expect(service.currentCard()?.id).toBe('second');
    expect(service.isFlipped()).toBe(true);

    service.setDeck({ ...deck, cards: [deck.cards[0], deck.cards[2]] });
    expect(service.currentCard()?.id).toBe('third');
    expect(service.currentIndex()).toBe(0);
    expect(service.isFlipped()).toBe(false);
  });

  it('shuffles a copy of the card ID order and starts at the first card', () => {
    const deck = {
      id: 'deck',
      title: 'Deck',
      description: '',
      cards: [
        { id: 'first', question: 'First?', answer: 'First.' },
        { id: 'second', question: 'Second?', answer: 'Second.' },
        { id: 'third', question: 'Third?', answer: 'Third.' },
      ],
    };
    service.setDeck(deck);
    service.next();
    service.toggleFlip();
    service.shuffle();

    expect(service.order().slice().sort()).toEqual(['first', 'second', 'third']);
    expect(deck.cards.map((card) => card.id)).toEqual(['first', 'second', 'third']);
    expect(service.currentIndex()).toBe(0);
    expect(service.isFlipped()).toBe(false);
    expect(service.currentCard()?.id).toBe(service.order()[0]);
  });

  it('resets to the first card and unflips when its card list is replaced', () => {
    service.setDeck({
      id: 'deck',
      title: 'Deck',
      description: '',
      cards: [
        { id: 'first', question: 'First?', answer: 'First.' },
        { id: 'second', question: 'Second?', answer: 'Second.' },
      ],
    });
    service.next();
    service.toggleFlip();

    service.setCards([{ id: 'filtered', question: 'Filtered?', answer: 'Filtered.' }]);

    expect(service.currentCard()?.id).toBe('filtered');
    expect(service.currentIndex()).toBe(0);
    expect(service.isFlipped()).toBe(false);
  });

  it('clamps the index and clears the session when the deck becomes empty', () => {
    service.setDeck({
      id: 'deck',
      title: 'Deck',
      description: '',
      cards: [
        { id: 'first', question: 'First?', answer: 'First.' },
        { id: 'second', question: 'Second?', answer: 'Second.' },
      ],
    });
    service.next();

    service.setDeck({
      id: 'deck',
      title: 'Deck',
      description: '',
      cards: [],
    });
    expect(service.currentIndex()).toBe(0);
    expect(service.currentCard()).toBeUndefined();
    expect(service.order()).toEqual([]);
  });
});
