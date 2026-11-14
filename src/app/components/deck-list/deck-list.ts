import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeckStore } from '../../services/deck-store';
import { ConfirmDialog, ConfirmDialogData } from '../confirm-dialog/confirm-dialog';
import { DeckDialog, DeckDialogData } from '../deck-dialog/deck-dialog';

@Component({
  imports: [MatButtonModule, MatDialogModule],
  selector: 'app-deck-list',
  styleUrl: './deck-list.scss',
  templateUrl: './deck-list.html',
})
export class DeckList {
  readonly deckStore = inject(DeckStore);
  private readonly dialog = inject(MatDialog);

  renameDeck(deckId: string, name: string): void {
    const dialogRef = this.dialog.open<DeckDialog, DeckDialogData, string | null>(DeckDialog, {
      data: { mode: 'rename', deckId, name },
    });

    dialogRef.afterClosed().subscribe((updatedName) => {
      if (updatedName !== undefined && updatedName !== null) {
        this.deckStore.renameDeck(deckId, updatedName);
      }
    });
  }

  deleteDeck(deckId: string, name: string): void {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete deck?',
        message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deckStore.deleteDeck(deckId);
      }
    });
  }
}
