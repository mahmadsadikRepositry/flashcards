import { Component, effect, HostListener, inject, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeckStore } from '../../services/deck-store';
import { StudySession } from '../../services/study-session';
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
  readonly studySession = inject(StudySession);
  private readonly dialog = inject(MatDialog);

  constructor() {
    this.studySession.setDeck(this.deckStore.activeDeck());
    effect(() => {
      const activeDeck = this.deckStore.activeDeck();
      untracked(() => this.studySession.setDeck(activeDeck));
    });
  }

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
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (this.dialog.openDialogs.length > 0 || this.isIgnoredKeyboardTarget(event.target)) {
      return;
    }

    switch (event.key) {
      case ' ':
        if (this.studySession.currentCard()) {
          event.preventDefault();
          this.studySession.toggleFlip();
        }
        break;
      case 'ArrowLeft':
        this.studySession.previous();
        break;
      case 'ArrowRight':
        this.studySession.next();
        break;
    }
  }

  private isIgnoredKeyboardTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
      return false;
    }

    if (target.closest('input, textarea, select, button')) {
      return true;
    }

    let ancestor: Element | null = target;
    while (ancestor) {
      if (ancestor instanceof HTMLElement && ancestor.isContentEditable) {
        return true;
      }

      ancestor = ancestor.parentElement;
    }

    return false;
  }
}
