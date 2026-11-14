import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import type { Card } from '../../models/card';
import type { Deck } from '../../models/deck';
import { DeckStore } from '../../services/deck-store';
import { CardDialog, CardDialogData, CardDialogResult } from '../card-dialog/card-dialog';
import { ConfirmDialog, ConfirmDialogData } from '../confirm-dialog/confirm-dialog';

@Component({
  imports: [MatButtonModule, MatDialogModule, MatListModule],
  selector: 'app-card-list',
  styleUrl: './card-list.scss',
  templateUrl: './card-list.html',
})
export class CardList {
  readonly deck = input.required<Deck>();
  readonly cards = input.required<Card[]>();
  private readonly deckStore = inject(DeckStore);
  private readonly dialog = inject(MatDialog);

  editCard(cardId: string): void {
    const deck = this.deck();
    const card = deck.cards.find((item) => item.id === cardId);
    if (!card) {
      return;
    }

    const dialogRef = this.dialog.open<
      CardDialog,
      CardDialogData,
      CardDialogResult | null
    >(CardDialog, {
      data: { mode: 'edit', deckId: deck.id, card },
    });

    dialogRef.afterClosed().subscribe((updatedCard) => {
      if (updatedCard) {
        this.deckStore.updateCard(
          deck.id,
          cardId,
          updatedCard.question,
          updatedCard.answer,
        );
      }
    });
  }

  deleteCard(cardId: string, question: string): void {
    const deckId = this.deck().id;
    const dialogRef = this.dialog.open<
      ConfirmDialog,
      ConfirmDialogData,
      boolean
    >(ConfirmDialog, {
      data: {
        title: 'Delete card?',
        message: `Are you sure you want to delete "${question}"? This cannot be undone.`,
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deckStore.deleteCard(deckId, cardId);
      }
    });
  }
}
