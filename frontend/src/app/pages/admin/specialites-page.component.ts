import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { FeedbackService } from '../../core/feedback.service';
import { ApiError, Specialite } from '../../core/models';

@Component({
  selector: 'app-specialites-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-section">
      <div class="page-heading admin-banner admin-banner-compact">
        <div class="admin-section-lead">
          <div class="admin-banner-icon">SP</div>
          <div>
            <div class="eyebrow">Referentiel</div>
            <h2>Gestion des specialites</h2>
            <p>Administration des categories metier utilisees pour les employes.</p>
          </div>
        </div>
        <div class="page-heading-actions">
          <button class="btn btn-primary" type="button" (click)="openCreateModal()">Ajouter une specialite</button>
        </div>
      </div>

      <div class="panel panel-soft admin-list-panel">
        <div class="panel-header">
          <div class="admin-section-title">
            <span class="admin-section-icon blue">LI</span>
            <div>
              <h3>Liste des specialites</h3>
            </div>
          </div>
          <button class="btn btn-secondary" type="button" (click)="load()">Actualiser</button>
        </div>

        <div class="admin-inline-actions">
          <form [formGroup]="filterForm" class="admin-inline-filters two">
            <label class="field">
              <span>Recherche</span>
              <input formControlName="search" placeholder="Nom ou description">
            </label>
            <label class="field">
              <span>Statut</span>
              <select formControlName="actif">
                <option value="">Tous</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </select>
            </label>
          </form>

          <div class="admin-inline-buttons">
            <button class="btn btn-primary" type="button" (click)="applyFilters()">Appliquer</button>
          </div>
        </div>

        <div *ngIf="error()" class="message error">{{ error() }}</div>

        <div class="table-panel">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Specialite</th>
                <th>Description</th>
                <th>Employes</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items(); let index = index; trackBy: trackById">
                <td>
                  <div class="record-main">
                    <span class="record-avatar" [ngClass]="'tone-' + (index % 5)">{{ item.nom.slice(0, 2).toUpperCase() }}</span>
                    <div class="record-copy">
                      <strong>{{ item.nom }}</strong>
                      <small>{{ item.updatedAt | date:'dd/MM/yyyy' }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ item.description || 'Aucune description' }}</td>
                <td>{{ item.nombreEmployes }}</td>
                <td>
                  <span class="status-pill" [class.success]="item.actif" [class.danger]="!item.actif">
                    {{ item.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="btn btn-ghost" type="button" (click)="edit(item)">Modifier</button>
                  <button class="btn btn-ghost danger" type="button" (click)="remove(item)">Desactiver</button>
                </td>
              </tr>
              <tr *ngIf="!items().length">
                <td colspan="5" class="empty-state">Aucune specialite trouvee.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="btn btn-secondary" type="button" (click)="prevPage()" [disabled]="page() === 0">Precedent</button>
          <span>Page {{ page() + 1 }} / {{ totalPages() || 1 }} - {{ totalElements() }} elements</span>
          <button class="btn btn-secondary" type="button" (click)="nextPage()" [disabled]="page() + 1 >= totalPages()">Suivant</button>
        </div>
      </div>

      <div class="admin-modal-backdrop" *ngIf="editorOpen()" (click)="closeEditor()">
        <div class="admin-modal" (click)="$event.stopPropagation()">
          <div class="admin-modal-header">
            <div>
              <div class="eyebrow">Edition</div>
              <h3>{{ editingId() ? 'Modifier la specialite' : 'Nouvelle specialite' }}</h3>
              <p class="admin-modal-intro">Ajoutez ou modifiez une specialite sans quitter la liste.</p>
            </div>
            <button class="admin-modal-close" type="button" (click)="closeEditor()">Fermer</button>
          </div>

          <div class="editor-mini-strip">
            <article class="editor-mini-card">
              <span>Specialites visibles</span>
              <strong>{{ items().length }}</strong>
            </article>
            <article class="editor-mini-card">
              <span>Employes relies</span>
              <strong>{{ totalEmployesLies() }}</strong>
            </article>
          </div>

          <div *ngIf="error()" class="message error">{{ error() }}</div>

          <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
            <label class="field">
              <span>Nom</span>
              <input formControlName="nom" placeholder="Ex: Ingenierie Logicielle">
            </label>
            <label class="field field-full">
              <span>Description</span>
              <textarea formControlName="description" rows="5" placeholder="Decrire la specialite"></textarea>
            </label>

            <div class="field-help field-full">
              Conseil: utilisez une formulation courte et claire pour que la liste reste elegante.
            </div>

            <div class="panel-actions field-full form-actions-split">
              <button class="btn btn-secondary" type="button" (click)="closeEditor()">Annuler</button>
              <button class="btn btn-primary" type="submit">Enregistrer la specialite</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class SpecialitesPageComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly feedback = inject(FeedbackService);

  readonly items = signal<Specialite[]>([]);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly editorOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly error = signal('');
  readonly totalEmployesLies = computed(() => this.items().reduce((sum, item) => sum + item.nombreEmployes, 0));

  readonly filterForm = this.fb.group({
    search: [''],
    actif: ['true']
  });

  readonly form = this.fb.group({
    nom: ['', Validators.required],
    description: ['']
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
    this.apiService.listSpecialites({
      page: this.page(),
      size: 6,
      sort: 'updatedAt,desc',
      search: this.filterForm.value.search,
      actif: this.filterForm.value.actif
    }).subscribe({
      next: (response) => {
        this.items.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      },
      error: (error: { error?: ApiError }) => this.error.set(error.error?.message ?? 'Chargement impossible.')
    });
  }

  edit(item: Specialite): void {
    this.error.set('');
    this.editorOpen.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({
      nom: item.nom,
      description: item.description ?? ''
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const isEditing = !!this.editingId();
    const payload = this.form.getRawValue();
    const request = this.editingId()
      ? this.apiService.updateSpecialite(this.editingId()!, payload)
      : this.apiService.createSpecialite(payload);

    request.subscribe({
      next: () => {
        this.feedback.success(
          isEditing
            ? 'La specialite a ete modifiee avec succes.'
            : 'La specialite a ete creee avec succes.',
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

  async remove(item: Specialite): Promise<void> {
    const confirmed = await this.feedback.confirm({
      title: 'Desactiver la specialite',
      message: `Voulez-vous vraiment desactiver la specialite "${item.nom}" ?`,
      confirmLabel: 'Desactiver',
      cancelLabel: 'Retour',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.apiService.deleteSpecialite(item.id).subscribe({
      next: () => {
        this.feedback.success('La specialite a ete desactivee avec succes.', 'Suppression effectuee');
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
    this.form.reset({ nom: '', description: '' });
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

  trackById(_: number, item: Specialite): number {
    return item.id;
  }
}
