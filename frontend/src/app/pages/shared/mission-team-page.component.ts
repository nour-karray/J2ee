import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, MissionTeamMember } from '../../core/models';

@Component({
  selector: 'app-mission-team-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-section">
      <div class="page-heading">
        <div>
          <div class="eyebrow">Equipe mission</div>
          <h2>Equipe de la mission #{{ missionId() }}</h2>
          <p>Vue transversale des collaborateurs affectés.</p>
        </div>
        <a class="btn btn-secondary" [routerLink]="backLink()">Retour</a>
      </div>

      <div *ngIf="error()" class="message error">{{ error() }}</div>

      <div class="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Employé</th>
              <th>Spécialité</th>
              <th>Période</th>
              <th>Occupation</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let member of members(); trackBy: trackById">
              <td>
                <strong>{{ member.nomComplet }}</strong>
                <div class="muted">{{ member.matricule }} • {{ member.email }}</div>
              </td>
              <td>{{ member.specialite || 'Non renseignée' }}</td>
              <td>{{ member.dateDebut }} → {{ member.dateFin }}</td>
              <td>{{ member.tauxOccupation }}%</td>
              <td><span class="status-pill">{{ member.status }}</span></td>
            </tr>
            <tr *ngIf="!members().length">
              <td colspan="5" class="empty-state">Aucun membre trouvé pour cette mission.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class MissionTeamPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  readonly members = signal<MissionTeamMember[]>([]);
  readonly missionId = signal<number>(Number(this.route.snapshot.paramMap.get('id')));
  readonly error = signal('');

  constructor() {
    this.load();
  }

  backLink(): string {
    return this.authService.role() === 'ADMIN' ? '/admin/missions' : '/employee/missions';
  }

  trackById(_: number, member: MissionTeamMember): number {
    return member.affectationId;
  }

  private load(): void {
    this.apiService.getMissionTeam(this.missionId()).subscribe({
      next: (members) => this.members.set(members),
      error: (error: { error?: ApiError }) => this.error.set(error.error?.message ?? 'Impossible de charger l’équipe.')
    });
  }
}
