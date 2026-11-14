import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { Card } from '../../models/card';

export interface CardDialogData {
  mode: 'new' | 'edit';
  deckId: string;
  card?: Card;
}

export interface CardDialogResult {
  question: string;
  answer: string;
}

@Component({
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  selector: 'app-card-dialog',
  styleUrl: './card-dialog.scss',
  templateUrl: './card-dialog.html',
})
export class CardDialog {
  readonly data = inject<CardDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(
    MatDialogRef<CardDialog, CardDialogResult | null>,
  );
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    question: [
      this.data.card?.question ?? '',
      [
        Validators.required,
        Validators.maxLength(500),
        (control: { value: string }) =>
          control.value.trim().length === 0 ? { whitespace: true } : null,
      ],
    ],
    answer: [
      this.data.card?.answer ?? '',
      [
        Validators.required,
        Validators.maxLength(500),
        (control: { value: string }) =>
          control.value.trim().length === 0 ? { whitespace: true } : null,
      ],
    ],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      question: this.form.controls.question.value,
      answer: this.form.controls.answer.value,
    });
  }
}
