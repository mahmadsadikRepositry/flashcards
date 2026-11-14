import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { DeckView } from './deck-view';

describe('DeckView', () => {
  let component: DeckView;
  let fixture: ComponentFixture<DeckView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckView],
    }).compileComponents();

    fixture = TestBed.createComponent(DeckView);
    component = fixture.componentInstance;
    await fixture.whenStable();
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

    expect(fixture.nativeElement.textContent).toContain('No cards in this deck');
    expect(fixture.nativeElement.querySelector('.no-cards button').textContent).toContain(
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
});
