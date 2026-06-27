import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthResponse, Role, SessionUtilisateur } from './models';

interface StoredSession {
  token: string;
  utilisateur: SessionUtilisateur;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';
  private readonly storageKey = 'plateforme-missions-session';

  readonly token = signal<string | null>(null);
  readonly utilisateur = signal<SessionUtilisateur | null>(null);
  readonly isAuthenticated = computed(() => !!this.token());
  readonly role = computed<Role | null>(() => this.utilisateur()?.role ?? null);

  constructor() {
    this.hydrate();
  }

  login(payload: { email: string; motDePasse: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  logout(): void {
    this.token.set(null);
    this.utilisateur.set(null);
    sessionStorage.removeItem(this.storageKey);
  }

  canAccess(roles: Role[]): boolean {
    const currentRole = this.role();
    return !!currentRole && roles.includes(currentRole);
  }

  private hydrate(): void {
    const raw = sessionStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const session = JSON.parse(raw) as StoredSession;
      this.token.set(session.token);
      this.utilisateur.set(session.utilisateur);
    } catch {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  private storeSession(response: AuthResponse): void {
    this.token.set(response.token);
    this.utilisateur.set(response.utilisateur);
    sessionStorage.setItem(this.storageKey, JSON.stringify({
      token: response.token,
      utilisateur: response.utilisateur
    }));
  }
}
