import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
}

@Component({
  imports: [A11yModule, MatButtonModule, MatDialogModule],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
