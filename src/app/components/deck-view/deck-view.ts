import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime } from 'rxjs';
import { DeckStore } from '../../services/deck-store';
import { StudySession } from '../../services/study-session';
import { CardDialog, CardDialogData, CardDialogResult } from '../card-dialog/card-dialog';
import { CardList } from '../card-list/card-list';
import { EmptyState } from '../empty-state/empty-state';
import { StudyCard } from '../study-card/study-card';

@Component({
  imports: [
    CardList,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    EmptyState,
    StudyCard,
  ],
  selector: 'app-deck-view',
  styleUrl: './deck-view.scss',
  templateUrl: './deck-view.html',
  host: {
    '(document:keydown)': 'handleKeydown($event)',
  },
})
export class DeckView {
  readonly deckStore = inject(DeckStore);
  readonly studySession = inject(StudySession);
  readonly searchText = signal('');
  readonly query = toSignal(toObservable(this.searchText).pipe(debounceTime(300)), {
    initialValue: '',
  });
  readonly searchTerm = computed(() =>
    this.searchText().trim() ? this.query().trim() : '',
  );
  readonly filteredCards = computed(() => {
    const cards = this.deckStore.activeDeck()?.cards ?? [];
    const query = this.searchTerm().toLowerCase();
    return query
      ? cards.filter(
          (card) =>
            card.question.toLowerCase().includes(query) ||
            card.answer.toLowerCase().includes(query),
        )
      : cards;
  });
  private readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);

  constructor() {
    let previousDeckId: string | null | undefined;
    effect(() => {
      const activeDeck = this.deckStore.activeDeck();
      const activeDeckId = activeDeck?.id ?? null;
      if (activeDeckId !== previousDeckId) {
        previousDeckId = activeDeckId;
        untracked(() => this.searchText.set(''));
      }

      untracked(() => this.studySession.setDeck(activeDeck));
    });
    effect(() => {
      const cards = this.filteredCards();
      untracked(() => this.studySession.setCards(cards));
    });
  }

  handleSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchText.set(event.target.value);
    }
  }

  clearSearch(): void {
    this.searchText.set('');
    setTimeout(() => this.document.getElementById('card-search')?.focus());
  }

  createCard(deckId: string): void {
    const trigger = this.document.activeElement;
    const dialogRef = this.dialog.open<
      CardDialog,
      CardDialogData,
      CardDialogResult | null
    >(CardDialog, {
      data: { mode: 'new', deckId },
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe((card) => {
      if (card) {
        this.deckStore.addCard(deckId, card.question, card.answer);
        setTimeout(() => {
          if (trigger instanceof HTMLElement && trigger.isConnected) {
            trigger.focus();
          } else {
            this.document.getElementById('deck-title')?.focus();
          }
        });
      } else if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus();
      }
    });
  }

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
