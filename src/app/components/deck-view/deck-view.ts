import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeckStore } from '../../services/deck-store';
import { CardDialog, CardDialogData, CardDialogResult } from '../card-dialog/card-dialog';
import { CardList } from '../card-list/card-list';
import { StudyCard } from '../study-card/study-card';

@Component({
  imports: [
    CardList,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    StudyCard,
  ],
  selector: 'app-deck-view',
  styleUrl: './deck-view.scss',
  templateUrl: './deck-view.html',
})
export class DeckView {
  readonly deckStore = inject(DeckStore);
  private readonly dialog = inject(MatDialog);
  private readonly selectedCardId = signal<string | null>(null);
  readonly currentCard = computed(() => {
    const deck = this.deckStore.activeDeck();
    if (!deck) {
      return undefined;
    }

    return deck.cards.find((card) => card.id === this.selectedCardId()) ?? deck.cards[0];
  });

  createCard(deckId: string): void {
    const dialogRef = this.dialog.open<
      CardDialog,
      CardDialogData,
      CardDialogResult | null
    >(CardDialog, {
      data: { mode: 'new', deckId },
    });

    dialogRef.afterClosed().subscribe((card) => {
      if (card) {
        this.deckStore.addCard(deckId, card.question, card.answer);
        const updatedDeck = this.deckStore.decks().find((item) => item.id === deckId);
        this.selectedCardId.set(updatedDeck?.cards.at(-1)?.id ?? null);
      }
    });
  }

  moveCard(offset: number): void {
    const cards = this.deckStore.activeDeck()?.cards ?? [];
    if (cards.length < 2) {
      return;
    }

    const currentCard = this.currentCard();
    const currentIndex = cards.findIndex((card) => card.id === currentCard?.id);
    const nextIndex = (currentIndex + offset + cards.length) % cards.length;
    this.selectedCardId.set(cards[nextIndex].id);
  }
}
