import { Component, input, output } from '@angular/core';
import type { Card } from '../../models/card';

@Component({
  imports: [],
  selector: 'app-study-card',
  styleUrl: './study-card.scss',
  templateUrl: './study-card.html',
})
export class StudyCard {
  readonly card = input<Card>();
  readonly isFlipped = input(false);
  readonly flip = output<void>();

  toggle(): void {
    this.flip.emit();
  }
}
