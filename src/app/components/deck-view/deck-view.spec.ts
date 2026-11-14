import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { DeckView } from './deck-view';

const savedState = {
  version: 1,
  decks: [
    {
      id: 'biology-basics',
      title: 'Biology Basics',
      description: 'Core concepts in cells and life science',
      cards: [
        { id: 'cell', question: 'What is the basic unit of life?', answer: 'The cell' },
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
        { id: 'japan', question: 'What is the capital of Japan?', answer: 'Tokyo' },
        { id: 'kenya', question: 'What is the capital of Kenya?', answer: 'Nairobi' },
        { id: 'portugal', question: 'What is the capital of Portugal?', answer: 'Lisbon' },
      ],
    },
  ],
  activeDeckId: 'biology-basics',
};

describe('DeckView', () => {
  let component: DeckView;
  let fixture: ComponentFixture<DeckView>;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('flashcards.state', JSON.stringify(savedState));
    await TestBed.configureTestingModule({
      imports: [DeckView],
    }).compileComponents();

    fixture = TestBed.createComponent(DeckView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows edits immediately and falls back when the current card is deleted', () => {
    const deckId = 'biology-basics';
    const firstCardId = 'cell';
    component.deckStore.updateCard(deckId, firstCardId, 'Updated question', 'Updated answer');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.card-question').textContent).toContain(
      'Updated question',
    );

    component.deckStore.deleteCard(deckId, firstCardId);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.card-question').textContent).toContain(
      'What process lets plants turn sunlight into energy?',
    );
  });

  it('navigates with the keyboard and announces the current card and side', () => {
    const nextCard = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    });
    document.dispatchEvent(nextCard);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.card-question').textContent).toContain(
      'What process lets plants turn sunlight into energy?',
    );
    expect(fixture.nativeElement.querySelector('.card-position').textContent).toContain(
      'Card 2 of 3',
    );

    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(space);
    fixture.detectChanges();

    expect(space.defaultPrevented).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.visually-hidden[aria-live="polite"]').textContent,
    ).toContain('Card 2 of 3, showing answer');

    const previousCard = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
    });
    document.dispatchEvent(previousCard);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.card-question').textContent).toContain(
      'What is the basic unit of life?',
    );
  });

  it('ignores keyboard navigation from interactive elements', () => {
    const input = document.createElement('input');
    const nextCard = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    });
    input.dispatchEvent(nextCard);
    fixture.detectChanges();

    expect(component.studySession.currentCard()?.id).toBe('cell');

    const cardButton = fixture.nativeElement.querySelector('.card') as HTMLButtonElement;
    cardButton.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(component.studySession.isFlipped()).toBe(false);
  });

  it('ignores keyboard navigation while a dialog is open', () => {
    const dialogRef = TestBed.inject(MatDialog).open(ConfirmDialog, {
      data: {
        title: 'Confirm',
        message: 'Continue?',
        confirmLabel: 'Continue',
      },
    });

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
      }),
    );
    expect(component.studySession.currentCard()?.id).toBe('cell');
    dialogRef.close();
  });

  it('shows the empty-deck action and disables study controls', async () => {
    const deck = component.deckStore.activeDeck();
    if (!deck) {
      throw new Error('Expected an active deck');
    }

    for (const card of [...deck.cards]) {
      component.deckStore.deleteCard(deck.id, card.id);
    }
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No cards yet');
    expect(fixture.nativeElement.querySelector('.empty-state button').textContent).toContain(
      'Add card',
    );
    const controls = fixture.nativeElement.querySelectorAll(
      '.study-controls button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(Array.from(controls).every((button) => button.disabled)).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('.toolbar-actions button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('filters cards by either side and resets study position and flip state', async () => {
    component.deckStore.selectDeck('world-capitals');
    await fixture.whenStable();
    fixture.detectChanges();
    const originalCards = component.deckStore.activeDeck()?.cards.map((card) => ({ ...card }));

    expect(
      (fixture.nativeElement.querySelector('.search-field input') as HTMLInputElement).value,
    ).toBe('');

    component.studySession.next();
    component.studySession.toggleFlip();
    const input = fixture.nativeElement.querySelector(
      '.search-field input',
    ) as HTMLInputElement;
    input.value = '  tOkYo  ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1 of 3 cards match');
    expect(component.filteredCards().map((card) => card.id)).toEqual(['japan']);
    expect(component.studySession.currentCard()?.id).toBe('japan');
    expect(component.studySession.currentIndex()).toBe(0);
    expect(component.studySession.isFlipped()).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('app-card-list mat-list-item')).toHaveLength(1);
    expect(component.deckStore.activeDeck()?.cards).toEqual(originalCards);
  });

  it('shows no-match feedback and clears the search with the button or Escape', async () => {
    const input = fixture.nativeElement.querySelector('.search-field input') as HTMLInputElement;
    input.value = 'mars';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 350));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No search results');
    expect(fixture.nativeElement.textContent).toContain('No cards found for "mars".');
    const clearButton = fixture.nativeElement.querySelector(
      '.empty-state button',
    ) as HTMLButtonElement;
    expect(clearButton.textContent).toContain('Clear search');
    clearButton.click();
    fixture.detectChanges();
    expect(component.searchText()).toBe('');

    input.value = 'biology';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(component.searchText()).toBe('');
  });
});
