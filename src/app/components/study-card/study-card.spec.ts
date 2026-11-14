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
});
