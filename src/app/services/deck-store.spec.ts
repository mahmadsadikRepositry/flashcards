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
});
