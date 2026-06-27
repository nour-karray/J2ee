import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ApiError, Utilisateur } from '../../core/models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-section">
      <div class="page-heading">
        <div>
          <div class="eyebrow">Profil</div>
          <h2>Mon profil</h2>
          <p>Informations personnelles et rattachement métier.</p>
        </div>
      </div>

      <div *ngIf="error()" class="message error">{{ error() }}</div>

      <div class="panel profile-card" *ngIf="profile() as item">
        <div class="profile-avatar">{{ initials(item.nomComplet) }}</div>
        <div>
          <h3>{{ item.nomComplet }}</h3>
          <p class="muted">{{ item.email }}</p>
        </div>
        <div class="detail-list">
          <div><strong>Matricule</strong><span>{{ item.matricule }}</span></div>
          <div><strong>Rôle</strong><span>{{ item.role }}</span></div>
          <div><strong>Spécialité</strong><span>{{ item.specialiteNom || 'Non définie' }}</span></div>
          <div><strong>Téléphone</strong><span>{{ item.telephone || 'Non renseigné' }}</span></div>
          <div><strong>Occupation actuelle</strong><span>{{ item.tauxOccupationActuel || 0 }}%</span></div>
        </div>
      </div>
    </section>
  `
})
export class ProfilePageComponent {
  private readonly apiService = inject(ApiService);

  readonly profile = signal<Utilisateur | null>(null);
  readonly error = signal('');

  constructor() {
    this.apiService.getEmployeeProfile().subscribe({
      next: (profile) => this.profile.set(profile),
      error: (error: { error?: ApiError }) => this.error.set(error.error?.message ?? 'Impossible de charger le profil.')
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}
