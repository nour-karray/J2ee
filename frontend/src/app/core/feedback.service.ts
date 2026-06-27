import { Injectable, signal } from '@angular/core';

type FeedbackTone = 'success' | 'error' | 'info';
type FeedbackDialogTone = 'primary' | 'danger';

export interface FeedbackToast {
  id: number;
  tone: FeedbackTone;
  title: string;
  message: string;
}

interface FeedbackConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: FeedbackDialogTone;
  resolve: (value: boolean) => void;
}

interface FeedbackConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: FeedbackDialogTone;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private toastId = 0;

  readonly toasts = signal<FeedbackToast[]>([]);
  readonly confirmState = signal<FeedbackConfirmState | null>(null);

  success(message: string, title = 'Operation reussie'): void {
    this.pushToast('success', title, message);
  }

  error(message: string, title = 'Operation impossible'): void {
    this.pushToast('error', title, message);
  }

  info(message: string, title = 'Information'): void {
    this.pushToast('info', title, message);
  }

  confirm(options: FeedbackConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirmState.set({
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmer',
        cancelLabel: options.cancelLabel ?? 'Annuler',
        tone: options.tone ?? 'primary',
        resolve
      });
    });
  }

  closeConfirm(result: boolean): void {
    const dialog = this.confirmState();
    if (!dialog) {
      return;
    }

    dialog.resolve(result);
    this.confirmState.set(null);
  }

  dismissToast(id: number): void {
    this.toasts.update((items) => items.filter((item) => item.id !== id));
  }

  private pushToast(tone: FeedbackTone, title: string, message: string): void {
    const id = ++this.toastId;
    this.toasts.update((items) => [...items, { id, tone, title, message }]);
    window.setTimeout(() => this.dismissToast(id), 3600);
  }
}
