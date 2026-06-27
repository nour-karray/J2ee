import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ApiError, Dashboard } from '../../core/models';

interface OverviewCard {
  icon: string;
  label: string;
  value: string;
  tone: string;
  trend: string;
}

interface DashboardLegendItem {
  label: string;
  value: number;
  tone: string;
}

interface UpcomingItem {
  day: string;
  month: string;
  title: string;
  subtitle: string;
  time: string;
  tone: string;
}

interface RecentAlertItem {
  icon: string;
  title: string;
  subtitle: string;
  age: string;
  tone: string;
}

interface QuickAction {
  icon: string;
  label: string;
  path: string;
  tone: string;
}

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-section admin-dashboard" *ngIf="dashboard() as data; else loading">
      <section class="dashboard-welcome-card">
        <div>
          <h2>Bonjour, {{ firstName() }} !</h2>
          <p>Voici un apercu clair des missions, alertes et charges.</p>
        </div>
        <div class="dashboard-date-chip">{{ todayLabel() }}</div>
      </section>

      <section class="dashboard-metrics-grid">
        <article class="dashboard-metric-card" *ngFor="let card of overviewCards(); trackBy: trackByLabel">
          <span class="dashboard-metric-icon" [class]="card.tone">{{ card.icon }}</span>
          <div class="dashboard-metric-copy">
            <small>{{ card.label }}</small>
            <strong>{{ card.value }}</strong>
            <span class="dashboard-metric-trend" [class]="card.tone">{{ card.trend }}</span>
          </div>
        </article>
      </section>

      <div class="dashboard-main-grid">
        <section class="panel dashboard-overview-panel">
          <div class="panel-header">
            <h3>Apercu des missions</h3>
            <button class="btn btn-secondary" type="button">Ce mois</button>
          </div>

          <div class="dashboard-overview-content">
            <div class="dashboard-donut-wrap">
              <div class="admin-donut-ring" [style.background]="donutStyle()">
                <div class="admin-donut-center">
                  <strong>{{ totalTracked() }}</strong>
                  <span>Total suivis</span>
                </div>
              </div>
            </div>

            <div class="dashboard-legend">
              <article class="dashboard-legend-item" *ngFor="let item of legendItems(); trackBy: trackByLabel">
                <span class="dashboard-legend-dot" [class]="item.tone"></span>
                <strong>{{ item.value }}</strong>
                <small>{{ item.label }}</small>
              </article>
            </div>
          </div>
        </section>

        <section class="panel dashboard-events-panel">
          <div class="panel-header">
            <h3>Evenements a venir</h3>
            <a class="btn btn-secondary" routerLink="/admin/missions">Voir tout</a>
          </div>

          <div class="dashboard-event-list">
            <article class="dashboard-event-item" *ngFor="let item of upcomingItems(); trackBy: trackByTitle">
              <div class="dashboard-event-date">
                <strong>{{ item.day }}</strong>
                <small>{{ item.month }}</small>
              </div>
              <div class="dashboard-event-copy">
                <strong>{{ item.title }}</strong>
                <small>{{ item.subtitle }}</small>
              </div>
              <div class="dashboard-event-meta">
                <span>{{ item.time }}</span>
                <span class="dashboard-event-dot" [class]="item.tone"></span>
              </div>
            </article>
            <div class="dashboard-empty" *ngIf="!upcomingItems().length">Aucun evenement a venir.</div>
          </div>
        </section>

        <section class="panel dashboard-alerts-panel">
          <div class="panel-header">
            <h3>Alertes recentes</h3>
            <a class="btn btn-secondary" routerLink="/admin/affectations">Voir toutes</a>
          </div>

          <div class="dashboard-alert-list">
            <article class="dashboard-alert-item" *ngFor="let item of recentAlerts(); trackBy: trackByTitle">
              <span class="dashboard-alert-icon" [class]="item.tone">{{ item.icon }}</span>
              <div class="dashboard-alert-copy">
                <strong>{{ item.title }}</strong>
                <small>{{ item.subtitle }}</small>
              </div>
              <span class="dashboard-alert-age">{{ item.age }}</span>
            </article>
            <div class="dashboard-empty" *ngIf="!recentAlerts().length">Aucune alerte recente.</div>
          </div>
        </section>

        <section class="panel dashboard-actions-panel">
          <div class="panel-header">
            <h3>Actions rapides</h3>
          </div>

          <div class="dashboard-actions-grid">
            <a
              *ngFor="let action of quickActions; trackBy: trackByLabel"
              class="dashboard-quick-action"
              [class]="action.tone"
              [routerLink]="action.path"
            >
              <span class="dashboard-quick-icon">{{ action.icon }}</span>
              <strong>{{ action.label }}</strong>
            </a>
          </div>
        </section>
      </div>
    </section>

    <ng-template #loading>
      <section class="page-section">
        <div *ngIf="error()" class="message error">{{ error() }}</div>
      </section>
    </ng-template>
  `
})
export class AdminDashboardPageComponent {
  private readonly apiService = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly dashboard = signal<Dashboard | null>(null);
  readonly error = signal('');
  readonly firstName = computed(() => this.auth.utilisateur()?.nomComplet?.split(' ')[0] ?? 'Admin');
  readonly todayLabel = computed(() =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date())
  );
  readonly urgentAlertsCount = computed(() => this.dashboard()?.alertesFinProche.length ?? 0);
  readonly progressRate = computed(() => {
    const data = this.dashboard();
    if (!data || !data.totalEmployes) {
      return 0;
    }
    return Math.min(100, Math.round((data.affectationsActives / data.totalEmployes) * 100));
  });

  readonly overviewCards = computed<OverviewCard[]>(() => {
    const data = this.dashboard();
    if (!data) {
      return [];
    }

    return [
      { icon: 'MI', label: 'Missions actives', value: String(data.missionsActives), tone: 'blue', trend: `+${Math.max(8, data.missionsActives * 2)}%` },
      { icon: 'AL', label: 'Alertes', value: String(this.urgentAlertsCount()), tone: 'orange', trend: `+${Math.max(3, this.urgentAlertsCount() * 4)}%` },
      { icon: 'EM', label: 'Employes actifs', value: String(data.totalEmployes), tone: 'purple', trend: `+${Math.max(5, Math.round(data.totalEmployes / 3))}%` },
      { icon: 'TX', label: 'Taux d avancement', value: `${this.progressRate()}%`, tone: 'green', trend: `+${Math.max(6, Math.round(this.progressRate() / 4))}%` }
    ];
  });

  readonly legendItems = computed<DashboardLegendItem[]>(() => {
    const data = this.dashboard();
    if (!data) {
      return [];
    }

    return [
      { label: 'Planifiees', value: data.missionsPlanifiees, tone: 'blue' },
      { label: 'Actives', value: data.missionsActives, tone: 'purple' },
      { label: 'Affectations', value: data.affectationsActives, tone: 'green' },
      { label: 'Alertes', value: this.urgentAlertsCount(), tone: 'orange' }
    ];
  });

  readonly totalTracked = computed(() => this.legendItems().reduce((sum, item) => sum + item.value, 0));
  readonly donutStyle = computed(() => {
    const items = this.legendItems();
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (!total) {
      return 'conic-gradient(#dbeafe 0deg 360deg)';
    }

    const palette: Record<string, string> = {
      blue: '#4f8cff',
      purple: '#8b5cf6',
      green: '#34c38f',
      orange: '#ff8a4c'
    };

    let cursor = 0;
    const parts = items.map((item) => {
      const angle = (item.value / total) * 360;
      const start = cursor;
      cursor += angle;
      return `${palette[item.tone]} ${start}deg ${cursor}deg`;
    });

    return `conic-gradient(${parts.join(', ')})`;
  });

  readonly upcomingItems = computed<UpcomingItem[]>(() => {
    const data = this.dashboard();
    if (!data) {
      return [];
    }

    const fromMissions = data.missionsPrioritaires.slice(0, 2).map((mission, index) => ({
      day: this.extractDay(mission.dateFin),
      month: this.extractMonth(mission.dateFin),
      title: mission.titre,
      subtitle: mission.code,
      time: index === 0 ? '09:00 -> 16:00' : '14:00 -> 16:00',
      tone: index % 2 === 0 ? 'blue' : 'purple'
    }));

    const fromAlerts = data.alertesFinProche.slice(0, 2).map((alert, index) => ({
      day: this.extractDay(alert.dateFin),
      month: this.extractMonth(alert.dateFin),
      title: alert.missionTitre,
      subtitle: alert.employeNom,
      time: index === 0 ? '10:00 -> 12:00' : '15:00 -> 16:00',
      tone: index % 2 === 0 ? 'green' : 'orange'
    }));

    return [...fromMissions, ...fromAlerts].slice(0, 4);
  });

  readonly recentAlerts = computed<RecentAlertItem[]>(() => {
    const data = this.dashboard();
    if (!data) {
      return [];
    }

    const urgent = data.alertesFinProche.slice(0, 2).map((alert, index) => ({
      icon: index === 0 ? '!' : 'AL',
      title: `${alert.missionTitre} en surveillance`,
      subtitle: `${alert.employeNom} - echeance dans ${alert.joursRestants} jour(s)`,
      age: index === 0 ? 'Il y a 2 h' : 'Il y a 5 h',
      tone: index === 0 ? 'orange' : 'red'
    }));

    const priority = data.missionsPrioritaires.slice(0, 2).map((mission, index) => ({
      icon: index === 0 ? 'MI' : 'OK',
      title: `${mission.titre} prioritaire`,
      subtitle: `${mission.code} - ${mission.priorite}`,
      age: index === 0 ? 'Il y a 1 j' : 'Il y a 2 j',
      tone: index === 0 ? 'blue' : 'green'
    }));

    return [...urgent, ...priority].slice(0, 4);
  });

  readonly quickActions: QuickAction[] = [
    { icon: '+', label: 'Nouvelle mission', path: '/admin/missions', tone: 'blue' },
    { icon: 'AF', label: 'Affecter un employe', path: '/admin/affectations', tone: 'purple' },
    { icon: 'US', label: 'Gerer les equipes', path: '/admin/utilisateurs', tone: 'green' },
    { icon: 'SP', label: 'Voir les specialites', path: '/admin/specialites', tone: 'orange' }
  ];

  constructor() {
    this.apiService.getDashboard().subscribe({
      next: (dashboard) => this.dashboard.set(dashboard),
      error: (error: { error?: ApiError }) => this.error.set(error.error?.message ?? 'Impossible de charger le tableau de bord.')
    });
  }

  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }

  trackByTitle(_: number, item: { title: string }): string {
    return item.title;
  }

  private extractDay(value: string): string {
    const date = new Date(value);
    return String(date.getDate()).padStart(2, '0');
  }

  private extractMonth(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', { month: 'short' })
      .format(new Date(value))
      .replace('.', '')
      .toUpperCase();
  }
}
