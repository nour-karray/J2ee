import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiError } from '../../core/models';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-reference-page">
      <div class="auth-reference-shell">
        <div class="auth-reference-logo">
          <span [innerHTML]="'&#9818;'"></span>
        </div>

        <section class="auth-reference-card">
          <div class="auth-reference-card-head">
            <div class="auth-reference-title">Connexion</div>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="auth-reference-form">
            <label class="auth-reference-field">
              <span class="auth-reference-icon" [innerHTML]="'&#9993;'"></span>
              <input formControlName="email" type="email" placeholder="Entrez votre email ou identifiant">
            </label>

            <label class="auth-reference-field">
              <span class="auth-reference-icon" [innerHTML]="'&#128273;'"></span>
              <input formControlName="motDePasse" type="password" placeholder="Entrez votre mot de passe">
            </label>

            <div class="auth-reference-inline">
              <label class="auth-reference-check">
                <input type="checkbox" formControlName="rememberMe">
                <span>Se souvenir de moi</span>
              </label>
              <button class="auth-reference-link" type="button">Mot de passe oublie ?</button>
            </div>

            <div *ngIf="loginError()" class="message error">{{ loginError() }}</div>

            <div class="auth-reference-actions">
              <button class="btn auth-login-button" type="submit" [disabled]="loginForm.invalid || loginSubmitting()">
                {{ loginSubmitting() ? 'Connexion...' : 'SE CONNECTER' }}
              </button>
            </div>
          </form>
        </section>

        <section class="auth-reference-hero">
          <div class="auth-reference-circle auth-reference-circle-large"></div>
          <div class="auth-reference-circle auth-reference-circle-medium"></div>
          <div class="auth-reference-circle auth-reference-circle-small"></div>
          <div class="auth-reference-wave"></div>

          <div class="auth-reference-hero-copy">
            <div class="auth-reference-eyebrow">BIENVENUE !</div>
            <h1>Accedez a votre espace</h1>
            <p>Les comptes employes sont crees par l'administrateur de la plateforme.</p>

            <button class="btn auth-signup-button" type="button" disabled>
              COMPTE CREE PAR L'ADMIN
            </button>
          </div>
        </section>
      </div>
    </div>
  `
})
export class LoginPageComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginSubmitting = signal(false);
  readonly loginError = signal('');

  readonly loginForm = this.fb.group({
    email: ['admin@missions.local', [Validators.required, Validators.email]],
    motDePasse: ['Admin123!', [Validators.required]],
    rememberMe: [true]
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/');
    }
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = this.loginForm.getRawValue();
    this.loginSubmitting.set(true);
    this.loginError.set('');

    this.authService.login({
      email: payload.email,
      motDePasse: payload.motDePasse
    }).subscribe({
      next: () => {
        this.loginSubmitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (error: { error?: ApiError }) => {
        this.loginSubmitting.set(false);
        this.loginError.set(error.error?.message ?? 'Connexion impossible.');
      }
    });
  }
}
