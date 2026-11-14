import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeckStore } from '../../services/deck-store';
import { CardList } from './card-list';

describe('CardList', () => {
  let component: CardList;
  let fixture: ComponentFixture<CardList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardList],
    }).compileComponents();

    fixture = TestBed.createComponent(CardList);
    component = fixture.componentInstance;
    const deck = TestBed.inject(DeckStore).activeDeck() ?? {
      id: 'empty',
      title: 'Empty',
      description: '',
      cards: [],
    };
    fixture.componentRef.setInput('deck', deck);
    fixture.componentRef.setInput('cards', deck.cards);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
