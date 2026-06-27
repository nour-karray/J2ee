import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

interface SearchItem extends MenuItem {
  description: string;
  keywords: string[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell app-shell-light">
      <aside class="sidebar sidebar-light">
        <div class="sidebar-block">
          <div class="sidebar-brand">
            <div class="sidebar-brand-logo" aria-hidden="true">
              <svg class="sidebar-brand-glyph" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="7" width="16" height="11" rx="3"></rect>
                <path d="M9 7V5.5C9 4.67 9.67 4 10.5 4h3C14.33 4 15 4.67 15 5.5V7"></path>
                <path d="M4 12H20"></path>
              </svg>
            </div>
            <div class="sidebar-brand-copy">
              <strong>Plateforme</strong>
              <small>Missions</small>
            </div>
          </div>

          <div class="sidebar-user-card">
            <div class="sidebar-avatar-wrap">
              <div class="sidebar-avatar">{{ initials() }}</div>
              <span class="sidebar-status-dot"></span>
            </div>
            <div class="sidebar-user-copy">
              <strong>{{ auth.utilisateur()?.nomComplet }}</strong>
              <small>{{ roleLabel() }}</small>
            </div>
          </div>

          <nav class="menu-list menu-list-light">
            <a
              *ngFor="let item of menuItems(); trackBy: trackByPath"
              [routerLink]="item.path"
              routerLinkActive="active-link"
              class="menu-link menu-link-light"
            >
              <span class="menu-link-icon">{{ item.icon }}</span>
              <span class="menu-link-label">{{ item.label }}</span>
              <span class="menu-link-bullet"></span>
            </a>
          </nav>
        </div>

      </aside>

      <main class="main-content main-content-light">
        <header class="topbar topbar-light">
          <div class="topbar-search">
            <input
              type="text"
              [value]="searchTerm()"
              (input)="updateSearch($event)"
              (focus)="searchOpen.set(true)"
              (blur)="closeSearchSoon()"
              placeholder="Rechercher une section, mission, client..."
            >

            <div class="topbar-search-panel" *ngIf="searchOpen()">
              <button
                class="topbar-search-item"
                type="button"
                *ngFor="let item of filteredSearchItems(); trackBy: trackByPath"
                (mousedown)="openSearchItem(item)"
              >
                <span class="topbar-search-icon">{{ item.icon }}</span>
                <span class="topbar-search-copy">
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.description }}</small>
                </span>
              </button>

              <div class="topbar-search-empty" *ngIf="!filteredSearchItems().length">
                Aucun resultat pour cette recherche.
              </div>
            </div>
          </div>

          <div class="topbar-actions">
            <div class="topbar-user-summary">
              <div class="topbar-avatar">{{ initials() }}</div>
              <div class="topbar-user-meta">
                <strong>{{ auth.utilisateur()?.nomComplet }}</strong>
                <small>{{ roleLabel() }}</small>
              </div>
            </div>
            <button class="topbar-logout" type="button" (click)="logout()">Deconnexion</button>
          </div>
        </header>

        <div class="content-frame">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly searchTerm = signal('');
  readonly searchOpen = signal(false);

  private readonly adminItems: MenuItem[] = [
    { icon: 'TB', label: 'Tableau de bord', path: '/admin/dashboard' },
    { icon: 'US', label: 'Utilisateurs', path: '/admin/utilisateurs' },
    { icon: 'MI', label: 'Missions', path: '/admin/missions' },
    { icon: 'AF', label: 'Affectations', path: '/admin/affectations' },
    { icon: 'SP', label: 'Specialites', path: '/admin/specialites' }
  ];

  private readonly employeeItems: MenuItem[] = [
    { icon: 'MM', label: 'Mes missions', path: '/employee/missions' },
    { icon: 'PR', label: 'Mon profil', path: '/employee/profile' }
  ];

  readonly menuItems = computed(() => this.auth.role() === 'ADMIN' ? this.adminItems : this.employeeItems);
  readonly searchItems = computed<SearchItem[]>(() => this.auth.role() === 'ADMIN'
    ? [
      { icon: 'TB', label: 'Tableau de bord', path: '/admin/dashboard', description: 'Vue globale et indicateurs', keywords: ['dashboard', 'accueil', 'statistiques', 'alertes'] },
      { icon: 'US', label: 'Utilisateurs', path: '/admin/utilisateurs', description: 'Creer et gerer les comptes', keywords: ['employes', 'admins', 'comptes'] },
      { icon: 'MI', label: 'Missions', path: '/admin/missions', description: 'Creer et suivre les missions', keywords: ['projets', 'missions', 'planning'] },
      { icon: 'AF', label: 'Affectations', path: '/admin/affectations', description: 'Affecter les employes aux missions', keywords: ['equipe', 'employes', 'planning', 'charge'] },
      { icon: 'SP', label: 'Specialites', path: '/admin/specialites', description: 'Gerer les specialites metier', keywords: ['competences', 'metiers', 'specialites'] }
    ]
    : [
      { icon: 'MM', label: 'Mes missions', path: '/employee/missions', description: 'Consulter mes missions', keywords: ['missions', 'travail', 'planning'] },
      { icon: 'PR', label: 'Mon profil', path: '/employee/profile', description: 'Voir mes informations', keywords: ['profil', 'compte', 'infos'] }
    ]);
  readonly filteredSearchItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.searchItems();
    }

    return this.searchItems().filter((item) =>
      [item.label, item.description, ...item.keywords].some((value) => value.toLowerCase().includes(term))
    );
  });
  readonly firstName = computed(() => this.auth.utilisateur()?.nomComplet?.split(' ')[0] ?? 'Equipe');
  readonly initials = computed(() => {
    const fullName = this.auth.utilisateur()?.nomComplet ?? 'Plateforme Missions';
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  });
  readonly roleLabel = computed(() => this.auth.role() === 'ADMIN' ? 'Administrateur' : 'Employe');

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  updateSearch(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.searchTerm.set(value);
    this.searchOpen.set(true);
  }

  closeSearchSoon(): void {
    window.setTimeout(() => this.searchOpen.set(false), 120);
  }

  openSearchItem(item: SearchItem): void {
    this.searchTerm.set(item.label);
    this.searchOpen.set(false);
    this.router.navigateByUrl(item.path);
  }

  trackByPath(_: number, item: MenuItem): string {
    return item.path;
  }
}
