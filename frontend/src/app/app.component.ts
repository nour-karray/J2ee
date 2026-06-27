import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackOverlayComponent } from './feedback-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FeedbackOverlayComponent],
  template: '<router-outlet /><app-feedback-overlay />'
})
export class AppComponent {}
