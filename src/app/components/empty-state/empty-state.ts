import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeckStore } from '../../services/deck-store';
import { DeckDialog, DeckDialogData } from '../deck-dialog/deck-dialog';

@Component({
  imports: [MatButtonModule, MatDialogModule],
  selector: 'app-empty-state',
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  private readonly dialog = inject(MatDialog);
  private readonly deckStore = inject(DeckStore);

  createDeck(): void {
    const dialogRef = this.dialog.open<DeckDialog, DeckDialogData, string | null>(DeckDialog, {
      data: { mode: 'new' },
    });

    dialogRef.afterClosed().subscribe((name) => {
      if (name !== undefined && name !== null) {
        this.deckStore.createDeck(name);
      }
    });
  }
}
