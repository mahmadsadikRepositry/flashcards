import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  let component: EmptyState;
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyState);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('icon', 'style');
    fixture.componentRef.setInput('heading', 'No decks yet');
    fixture.componentRef.setInput('message', 'Create a deck to begin.');
    fixture.componentRef.setInput('actionLabel', 'Create deck');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the supplied content and emits the requested action', () => {
    const action = vi.fn();
    component.action.subscribe(action);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-icon').textContent.trim()).toBe('style');
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('No decks yet');
    expect(fixture.nativeElement.querySelector('p').textContent).toContain(
      'Create a deck to begin.',
    );
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(action).toHaveBeenCalledOnce();
  });
});
