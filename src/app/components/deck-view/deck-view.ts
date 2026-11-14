import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeckStore } from '../../services/deck-store';
import { StudyCard } from '../study-card/study-card';

@Component({
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, StudyCard],
  selector: 'app-deck-view',
  styleUrl: './deck-view.scss',
  templateUrl: './deck-view.html',
})
export class DeckView {
  readonly deckStore = inject(DeckStore);
}
