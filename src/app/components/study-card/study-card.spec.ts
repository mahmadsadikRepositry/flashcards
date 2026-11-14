import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudyCard } from './study-card';

describe('StudyCard', () => {
  let component: StudyCard;
  let fixture: ComponentFixture<StudyCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyCard],
    }).compileComponents();

    fixture = TestBed.createComponent(StudyCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('flips between the question and answer with accessible labels', () => {
    fixture.componentRef.setInput('card', {
      id: 'test',
      question: 'Question',
      answer: 'Answer',
    });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const back = button.querySelector('.card__face--back') as HTMLElement;
    expect(button.getAttribute('aria-label')).toBe('Show answer');
    expect(back.getAttribute('aria-hidden')).toBe('true');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Show question');
    expect((button.querySelector('.card__inner') as HTMLElement).classList.contains('is-flipped')).toBe(
      true,
    );
    expect(
      (button.querySelector('.card__face--front') as HTMLElement).getAttribute('aria-hidden'),
    ).toBe('true');

    fixture.componentRef.setInput('card', {
      id: 'next',
      question: 'Next question',
      answer: 'Next answer',
    });
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Show answer');
  });
});
