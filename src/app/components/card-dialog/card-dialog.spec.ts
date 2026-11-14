import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CardDialog } from './card-dialog';

describe('CardDialog', () => {
  let component: CardDialog;
  let fixture: ComponentFixture<CardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode: 'new', deckId: 'biology-basics' },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects whitespace-only text and values longer than 500 characters', () => {
    const { question, answer } = component.form.controls;

    question.setValue('   ');
    expect(question.hasError('whitespace')).toBe(true);

    answer.setValue('a'.repeat(501));
    expect(answer.hasError('maxlength')).toBe(true);
  });

  it('disables submission while either field is invalid', () => {
    fixture.detectChanges();
    const submit = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    component.form.setValue({ question: 'Question', answer: 'Answer' });
    fixture.detectChanges();

    expect(submit.disabled).toBe(false);
  });

  it('submits the front and back text when both fields are valid', () => {
    const dialogRef = TestBed.inject(MatDialogRef);
    const close = vi.spyOn(dialogRef, 'close');
    component.form.setValue({ question: 'Question', answer: 'Answer' });

    component.submit();

    expect(close).toHaveBeenCalledWith({ question: 'Question', answer: 'Answer' });
  });
});
