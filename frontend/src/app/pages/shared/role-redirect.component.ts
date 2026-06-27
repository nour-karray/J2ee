import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  template: '<section class="page-section"><div class="panel">Redirection en cours...</div></section>'
})
export class RoleRedirectComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    const target = this.authService.role() === 'ADMIN' ? '/admin/dashboard' : '/employee/missions';
    void this.router.navigateByUrl(target);
  }
}
