import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { FeedbackService } from '../../core/feedback.service';
import { ApiError, Mission } from '../../core/models';

@Component({
  selector: 'app-missions-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-section">
      <div class="page-heading page-heading-portfolio admin-banner admin-banner-compact">
        <div class="admin-section-lead">
          <div class="admin-banner-icon">MI</div>
          <div>
            <div class="eyebrow">Portefeuille</div>
            <h2>Gestion des missions</h2>
            <p>Creation, pilotage et suivi des missions d entreprise.</p>
          </div>
        </div>
        <div class="page-heading-actions">
          <button class="btn btn-primary" type="button" (click)="openCreateModal()">Ajouter une mission</button>
        </div>
      </div>

      <div class="panel panel-soft missions-list-panel">
        <div class="panel-header">
          <div class="admin-section-title">
            <span class="admin-section-icon blue">LI</span>
            <div>
              <h3>Missions</h3>
            </div>
          </div>
          <button class="btn btn-secondary" type="button" (click)="load()">Actualiser</button>
        </div>

        <form [formGroup]="filterForm" class="mission-filter-grid">
          <label class="field"><span>Recherche</span><input formControlName="search" placeholder="Code, titre, client"></label>
          <label class="field">
            <span>Statut</span>
            <select formControlName="status">
              <option value="">Tous</option>
              <option value="PLANIFIEE">PLANIFIEE</option>
              <option value="EN_COURS">EN_COURS</option>
              <option value="TERMINEE">TERMINEE</option>
              <option value="ANNULEE">ANNULEE</option>
            </select>
          </label>
        </form>

        <div class="panel-actions">
          <button class="btn btn-primary" type="button" (click)="applyFilters()">Appliquer</button>
        </div>

        <div *ngIf="error()" class="message error">{{ error() }}</div>

        <div class="mission-list">
          <article class="mission-card" *ngFor="let mission of items(); trackBy: trackByMission">
            <div class="mission-card-main">
              <div class="mission-card-icon">MI</div>
              <div class="mission-card-copy">
                <strong>{{ mission.titre }}</strong>
                <p>{{ mission.description || 'Mission sans description detaillee.' }}</p>
                <div class="table-meta-row">
                  <span class="table-chip info">{{ mission.code }}</span>
                  <span class="table-chip" [class.aqua]="mission.status === 'EN_COURS'" [class.peach]="mission.status === 'PLANIFIEE'" [class.purple]="mission.priorite === 'HAUTE'">
                    {{ mission.status }}
                  </span>
                  <span class="table-chip neutral">{{ mission.priorite }}</span>
                </div>
              </div>
            </div>

            <div class="mission-card-meta">
              <div class="mission-meta-block">
                <span>Structure</span>
                <strong>{{ mission.clientNom || 'Interne' }}</strong>
              </div>
              <div class="mission-meta-block">
                <span>Periode</span>
                <strong>{{ mission.dateDebut }} -> {{ mission.dateFin }}</strong>
              </div>
              <div class="mission-meta-block">
                <span>Affectations</span>
                <strong>{{ mission.nombreAffectations }}</strong>
              </div>
            </div>

            <div class="mission-card-actions">
              <button class="btn btn-ghost" type="button" (click)="edit(mission)">Modifier</button>
              <a class="btn btn-ghost" [routerLink]="['/missions', mission.id, 'team']">Equipe</a>
              <button class="btn btn-ghost danger" type="button" (click)="remove(mission)">Desactiver</button>
            </div>
          </article>

          <div *ngIf="!items().length" class="mission-empty">
            <strong>Aucune mission trouvee.</strong>
            <p>Essayez une autre recherche ou utilisez le bouton Ajouter une mission.</p>
          </div>
        </div>

        <div class="pagination">
          <button class="btn btn-secondary" type="button" (click)="prevPage()" [disabled]="page() === 0">Precedent</button>
          <span>Page {{ page() + 1 }} / {{ totalPages() || 1 }} - {{ totalElements() }} elements</span>
          <button class="btn btn-secondary" type="button" (click)="nextPage()" [disabled]="page() + 1 >= totalPages()">Suivant</button>
        </div>
      </div>

      <div class="admin-modal-backdrop" *ngIf="editorOpen()" (click)="closeEditor()">
        <div class="admin-modal admin-modal-wide" (click)="$event.stopPropagation()">
          <div class="admin-modal-header">
            <div>
              <div class="eyebrow">Edition</div>
              <h3>{{ editingId() ? 'Modifier la mission' : 'Nouvelle mission' }}</h3>
              <p class="admin-modal-intro">Creez, corrigez et pilotez une mission sans quitter la liste.</p>
            </div>
            <button class="admin-modal-close" type="button" (click)="closeEditor()">Fermer</button>
          </div>

          <div class="mission-form-note">
            <div class="mission-form-note-card">
              <span>Missions visibles</span>
              <strong>{{ items().length }}</strong>
            </div>
            <div class="mission-form-note-card">
              <span>Affectations</span>
              <strong>{{ totalAffectations() }}</strong>
            </div>
            <div class="mission-form-note-card">
              <span>Urgentes</span>
              <strong>{{ highPriorityCount() }}</strong>
            </div>
          </div>

          <div *ngIf="error()" class="message error">{{ error() }}</div>

          <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
            <label class="field"><span>Titre</span><input formControlName="titre" placeholder="Titre"></label>
            <div class="field-help">
              Le code de mission est genere automatiquement pour eviter une saisie technique inutile.
            </div>
            <label class="field field-full"><span>Description</span><textarea formControlName="description" rows="4" placeholder="Description"></textarea></label>
            <label class="field"><span>Client</span><input formControlName="clientNom" placeholder="Client"></label>
            <label class="field"><span>Localisation</span><input formControlName="localisation" placeholder="Localisation"></label>
            <label class="field"><span>Date debut</span><input formControlName="dateDebut" type="date"></label>
            <label class="field"><span>Date fin</span><input formControlName="dateFin" type="date"></label>
            <label class="field">
              <span>Statut</span>
              <select formControlName="status">
                <option value="PLANIFIEE">PLANIFIEE</option>
                <option value="EN_COURS">EN_COURS</option>
                <option *ngIf="editingId()" value="TERMINEE">TERMINEE</option>
                <option *ngIf="editingId()" value="ANNULEE">ANNULEE</option>
              </select>
            </label>
            <label class="field">
              <span>Priorite</span>
              <select formControlName="priorite">
                <option value="BASSE">BASSE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="HAUTE">HAUTE</option>
              </select>
            </label>
            <label class="field"><span>Budget</span><input formControlName="budget" type="number" min="0" step="0.01"></label>

            <div class="field-help field-full">
              A la creation, une mission commence en general en PLANIFIEE ou EN_COURS. TERMINEE et ANNULEE restent disponibles en modification.
            </div>

            <div class="panel-actions field-full form-actions-split">
              <button class="btn btn-secondary" type="button" (click)="closeEditor()">Annuler</button>
              <button class="btn btn-primary" type="submit">{{ editingId() ? 'Enregistrer la mission' : 'Creer la mission' }}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class MissionsPageComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly feedback = inject(FeedbackService);

  readonly items = signal<Mission[]>([]);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly editorOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly error = signal('');
  readonly totalAffectations = computed(() => this.items().reduce((sum, mission) => sum + mission.nombreAffectations, 0));
  readonly highPriorityCount = computed(() => this.items().filter((mission) => mission.priorite === 'HAUTE').length);

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['']
  });

  readonly form = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    clientNom: ['', Validators.required],
    localisation: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    status: ['PLANIFIEE', Validators.required],
    priorite: ['MOYENNE', Validators.required],
    budget: ['']
  });

  constructor() {
    this.load();
  }

  applyFilters(): void {
    this.page.set(0);
    this.load();
  }

  openCreateModal(): void {
    this.error.set('');
    this.resetForm();
    this.editorOpen.set(true);
  }

  load(): void {
    this.error.set('');
    this.apiService.listMissions({
      page: this.page(),
      size: 6,
      sort: 'updatedAt,desc',
      search: this.filterForm.value.search,
      status: this.filterForm.value.status,
      actif: true
    }).subscribe({
      next: (response) => {
        this.items.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      },
      error: (error: { error?: ApiError }) => this.error.set(error.error?.message ?? 'Chargement impossible.')
    });
  }

  edit(mission: Mission): void {
    this.error.set('');
    this.editorOpen.set(true);
    this.editingId.set(mission.id);
    this.form.patchValue({
      titre: mission.titre,
      description: mission.description,
      clientNom: mission.clientNom,
      localisation: mission.localisation,
      dateDebut: mission.dateDebut,
      dateFin: mission.dateFin,
      status: mission.status,
      priorite: mission.priorite,
      budget: mission.budget ?? ''
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const isEditing = !!this.editingId();
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      budget: raw.budget ? Number(raw.budget) : null
    };

    const request = this.editingId()
      ? this.apiService.updateMission(this.editingId()!, payload)
      : this.apiService.createMission(payload);

    request.subscribe({
      next: () => {
        this.feedback.success(
          isEditing
            ? 'La mission a ete modifiee avec succes.'
            : 'La mission a ete creee avec succes.',
          isEditing ? 'Modification enregistree' : 'Ajout enregistre'
        );
        this.closeEditor();
        this.load();
      },
      error: (error: { error?: ApiError }) => {
        const message = error.error?.message ?? 'Enregistrement impossible.';
        this.error.set(message);
        this.feedback.error(message);
      }
    });
  }

  async remove(mission: Mission): Promise<void> {
    const confirmed = await this.feedback.confirm({
      title: 'Desactiver la mission',
      message: `Voulez-vous vraiment desactiver la mission "${mission.titre}" ?`,
      confirmLabel: 'Desactiver',
      cancelLabel: 'Retour',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.apiService.deleteMission(mission.id).subscribe({
      next: () => {
        this.feedback.success('La mission a ete desactivee avec succes.', 'Suppression effectuee');
        this.load();
      },
      error: (error: { error?: ApiError }) => {
        const message = error.error?.message ?? 'Suppression impossible.';
        this.error.set(message);
        this.feedback.error(message);
      }
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      titre: '',
      description: '',
      clientNom: '',
      localisation: '',
      dateDebut: '',
      dateFin: '',
      status: 'PLANIFIEE',
      priorite: 'MOYENNE',
      budget: ''
    });
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.resetForm();
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update((value) => value - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update((value) => value + 1);
      this.load();
    }
  }

  trackByMission(_: number, mission: Mission): number {
    return mission.id;
  }
}
