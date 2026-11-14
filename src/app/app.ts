import { Component } from '@angular/core';
import { DeckList } from './components/deck-list/deck-list';
import { DeckView } from './components/deck-view/deck-view';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

@Component({
  imports: [DeckList, DeckView, Footer, Header],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
