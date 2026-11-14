import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { DeckStore } from '../../services/deck-store';

@Component({
  imports: [MatListModule],
  selector: 'app-deck-list',
  styleUrl: './deck-list.scss',
  templateUrl: './deck-list.html',
})
export class DeckList {
  readonly deckStore = inject(DeckStore);
}
