import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeckDialog } from './deck-dialog';

describe('DeckDialog', () => {
  let component: DeckDialog;
  let fixture: ComponentFixture<DeckDialog>;

  beforeEach(async () => {
    localStorage.setItem(
      'flashcards.state',
      JSON.stringify({
        version: 1,
        decks: [
          {
            id: 'biology-basics',
            title: 'Biology Basics',
            description: '',
            cards: [],
          },
        ],
        activeDeckId: 'biology-basics',
      }),
    );
    await TestBed.configureTestingModule({
      imports: [DeckDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'new' } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeckDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('validates empty and whitespace-only names', () => {
    const name = component.form.controls.name;

    name.setValue('');
    expect(name.hasError('required')).toBe(true);

    name.setValue('   ');
    expect(name.hasError('whitespace')).toBe(true);
  });

  it('validates the maximum length and case-insensitive duplicates', () => {
    const name = component.form.controls.name;

    name.setValue('a'.repeat(61));
    expect(name.hasError('maxlength')).toBe(true);

    name.setValue('biology basics');
    expect(name.hasError('duplicate')).toBe(true);
  });

  it('disables submission while the deck name is invalid', () => {
    fixture.detectChanges();
    const submit = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    component.form.controls.name.setValue('New deck');
    fixture.detectChanges();

    expect(submit.disabled).toBe(false);
  });

  it('returns null when the user cancels', () => {
    const dialogRef = TestBed.inject(MatDialogRef);
    const close = vi.spyOn(dialogRef, 'close');
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('mat-dialog-actions button') as HTMLButtonElement).click();

    expect(close).toHaveBeenCalledWith(null);
  });

  it('allows the current deck name while renaming that deck', () => {
    component.data.mode = 'rename';
    component.data.deckId = 'biology-basics';
    component.form.controls.name.setValue('Biology Basics');

    expect(component.form.controls.name.hasError('duplicate')).toBe(false);
  });
});
