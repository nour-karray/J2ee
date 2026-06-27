import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError, Mission } from '../../core/models';

@Component({
  selector: 'app-mes-missions-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-section">
      <div class="page-heading">
        <div>
          <div class="eyebrow">Espace employé</div>
          <h2>Mes missions</h2>
          <p>Vue personnelle des missions sur lesquelles vous êtes affecté.</p>
        </div>
      </div>

      <div *ngIf="error()" class="message error">{{ error() }}</div>

      <div class="card-grid">
        <article class="panel mission-card" *ngFor="let mission of missions(); trackBy: trackByMission">
          <div class="panel-header">
            <div>
              <div class="eyebrow">{{ mission.code }}</div>
              <h3>{{ mission.titre }}</h3>
            </div>
            <span class="status-pill">{{ mission.status }}</span>
          </div>
          <p>{{ mission.description }}</p>
          <div class="detail-list">
            <div><strong>Client</strong><span>{{ mission.clientNom }}</span></div>
            <div><strong>Lieu</strong><span>{{ mission.localisation }}</span></div>
            <div><strong>Période</strong><span>{{ mission.dateDebut }} → {{ mission.dateFin }}</span></div>
            <div><strong>Priorité</strong><span>{{ mission.priorite }}</span></div>
          </div>
          <a class="btn btn-primary" [routerLink]="['/missions', mission.id, 'team']">Voir l'équipe</a>
        </article>
      </div>

      <div class="panel empty-panel" *ngIf="!missions().length">
        Aucune mission n'est encore affectée à votre compte.
      </div>
    </section>
  `
})
export class MesMissionsPageComponent {
  private readonly apiService = inject(ApiService);

  readonly missions = signal<Mission[]>([]);
  readonly error = signal('');

  constructor() {
    this.apiService.getEmployeeMissions().subscribe({
      next: (missions) => this.missions.set(missions),
      error: (error: { error?: ApiError }) => this.error.set(error.error?.message ?? 'Impossible de charger vos missions.')
    });
  }

  trackByMission(_: number, mission: Mission): number {
    return mission.id;
  }
}
