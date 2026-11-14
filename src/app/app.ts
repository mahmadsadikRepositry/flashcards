import { Component, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeckList } from './components/deck-list/deck-list';
import { DeckDialog, DeckDialogData } from './components/deck-dialog/deck-dialog';
import { DeckView } from './components/deck-view/deck-view';
import { EmptyState } from './components/empty-state/empty-state';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { DeckStore } from './services/deck-store';

@Component({
  imports: [DeckList, DeckView, EmptyState, Footer, Header, MatDialogModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly deckStore = inject(DeckStore);
  private readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);

  createDeck(): void {
    const trigger = this.document.activeElement;
    const dialogRef = this.dialog.open<DeckDialog, DeckDialogData, string | null>(DeckDialog, {
      data: { mode: 'new' },
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe((name) => {
      if (name !== undefined && name !== null) {
        this.deckStore.createDeck(name);
        setTimeout(() => this.document.getElementById('deck-title')?.focus());
      } else if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus();
      }
    });
  }
}
