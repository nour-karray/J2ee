import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FeedbackService } from './core/feedback.service';

@Component({
  selector: 'app-feedback-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="feedback-toast-stack" *ngIf="feedback.toasts().length">
      <article
        class="feedback-toast"
        *ngFor="let toast of feedback.toasts(); trackBy: trackByToast"
        [class.success]="toast.tone === 'success'"
        [class.error]="toast.tone === 'error'"
        [class.info]="toast.tone === 'info'"
      >
        <div class="feedback-toast-copy">
          <strong>{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>

        <button class="feedback-toast-close" type="button" (click)="feedback.dismissToast(toast.id)">
          x
        </button>
      </article>
    </section>

    <div class="feedback-dialog-backdrop" *ngIf="feedback.confirmState() as dialog">
      <section class="feedback-dialog" [class.danger]="dialog.tone === 'danger'">
        <div class="feedback-dialog-copy">
          <div class="eyebrow">Confirmation</div>
          <h3>{{ dialog.title }}</h3>
          <p>{{ dialog.message }}</p>
        </div>

        <div class="feedback-dialog-actions">
          <button class="btn btn-secondary" type="button" (click)="feedback.closeConfirm(false)">
            {{ dialog.cancelLabel }}
          </button>
          <button
            class="btn"
            type="button"
            [class.btn-primary]="dialog.tone === 'primary'"
            [class.btn-danger]="dialog.tone === 'danger'"
            (click)="feedback.closeConfirm(true)"
          >
            {{ dialog.confirmLabel }}
          </button>
        </div>
      </section>
    </div>
  `
})
export class FeedbackOverlayComponent {
  readonly feedback = inject(FeedbackService);

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.feedback.confirmState()) {
      this.feedback.closeConfirm(false);
    }
  }

  trackByToast(_: number, toast: { id: number }): number {
    return toast.id;
  }
}
