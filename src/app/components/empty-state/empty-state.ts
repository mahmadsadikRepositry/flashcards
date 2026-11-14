import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'app-empty-state',
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input.required<string>();
  readonly action = output<void>();
}
