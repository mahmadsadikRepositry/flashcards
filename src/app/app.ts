import { Component, inject } from '@angular/core';
import { DeckList } from './components/deck-list/deck-list';
import { DeckView } from './components/deck-view/deck-view';
import { EmptyState } from './components/empty-state/empty-state';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { DeckStore } from './services/deck-store';

@Component({
  imports: [DeckList, DeckView, EmptyState, Footer, Header],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly deckStore = inject(DeckStore);
}
