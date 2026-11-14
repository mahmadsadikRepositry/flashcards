import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeckStore } from '../../services/deck-store';

export interface DeckDialogData {
  mode: 'new' | 'rename';
  deckId?: string;
  name?: string;
}

@Component({
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  selector: 'app-deck-dialog',
  styleUrl: './deck-dialog.scss',
  templateUrl: './deck-dialog.html',
})
export class DeckDialog {
  readonly data = inject<DeckDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DeckDialog, string | null>);
  private readonly deckStore = inject(DeckStore);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    name: [
      this.data.name ?? '',
      [
        Validators.required,
        Validators.maxLength(60),
        (control: { value: string }) =>
          control.value.trim().length === 0 ? { whitespace: true } : null,
        (control: { value: string }) => {
          const normalizedName = control.value.trim().toLowerCase();
          const isDuplicate = this.deckStore
            .decks()
            .some(
              (deck) =>
                deck.id !== this.data.deckId && deck.title.trim().toLowerCase() === normalizedName,
            );
          return isDuplicate ? { duplicate: true } : null;
        },
      ],
    ],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.controls.name.value.trim());
  }
}
