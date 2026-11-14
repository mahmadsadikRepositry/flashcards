import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DeckStore } from '../../services/deck-store';
import { DeckDialog, DeckDialogData } from '../deck-dialog/deck-dialog';

@Component({
  imports: [MatButtonModule, MatDialogModule, MatToolbarModule],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
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
