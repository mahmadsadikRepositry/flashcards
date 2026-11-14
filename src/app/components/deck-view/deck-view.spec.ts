import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});
