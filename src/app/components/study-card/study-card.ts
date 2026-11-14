import { Component, input, linkedSignal } from '@angular/core';
import type { Card } from '../../models/card';

@Component({
  imports: [],
  selector: 'app-study-card',
  styleUrl: './study-card.scss',
  templateUrl: './study-card.html',
})
export class StudyCard {
  readonly card = input<Card>();
  readonly isFlipped = linkedSignal({
    source: this.card,
    computation: () => false,
  });

  toggle(): void {
    this.isFlipped.update((flipped) => !flipped);
  }
}
