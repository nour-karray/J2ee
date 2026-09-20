import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { FeedbackService } from '../../core/feedback.service';
import { Affectation, ApiError, Mission, Utilisateur } from '../../core/models';

@Component({
  selector: 'app-affectations-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-section">
      <div class="page-heading admin-banner admin-banner-compact">
        <div class="admin-section-lead">
          <div class="admin-banner-icon">AF</div>
          <div>
            <div class="eyebrow">Planification</div>
            <h2>Gestion des affectations</h2>
            <p>Repartition des employes sur les missions avec controle de charge.</p>
          </div>
        </div>
        <button class="btn btn-primary" type="button" (click)="openCreateModal()">Ajouter une affectation</button>
      </div>

      <div class="panel panel-soft admin-list-panel">
        <div class="panel-header">
          <div class="admin-section-title">
            <span class="admin-section-icon blue">LI</span>
            <div>
              <h3>Affectations existantes</h3>
            </div>
          </div>
          <button class="btn btn-secondary" type="button" (click)="load()">Actualiser</button>
        </div>

        <form [formGroup]="filterForm" class="admin-inline-filters two">
          <label class="field">
            <span>Recherche</span>
            <input formControlName="search" placeholder="Mission ou employe">
          </label>

          <label class="field">
            <span>Statut</span>
            <select formControlName="status">
              <option value="">Tous</option>
              <option value="PLANIFIEE">PLANIFIEE</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="TERMINEE">TERMINEE</option>
            </select>
          </label>
        </form>

        <div class="panel-actions">
          <button class="btn btn-primary" type="button" (click)="applyFilters()">Appliquer</button>
        </div>

        <div *ngIf="listError()" class="message error">{{ listError() }}</div>

        <div class="table-panel">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Employe</th>
                <th>Mission</th>
                <th>Periode</th>
                <th>Taux</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items(); let index = index; trackBy: trackByAffectation">
                <td>
                  <div class="record-main">
                    <span class="record-avatar" [ngClass]="'tone-' + (index % 6)">
                      {{ item.employeNom.slice(0, 2).toUpperCase() }}
                    </span>
                    <div class="record-copy">
                      <strong>{{ item.employeNom }}</strong>
                      <small>{{ item.employeMatricule }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="table-entity">
                    <strong>{{ item.missionTitre }}</strong>
                    <div class="table-meta-row">
                      <span class="table-chip neutral">{{ item.missionCode }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ item.dateDebut }} -> {{ item.dateFin }}</td>
                <td><span class="table-chip peach">{{ item.tauxOccupation }}%</span></td>
                <td class="actions">
                  <button class="btn btn-ghost" type="button" (click)="edit(item)">Modifier</button>
                  <button class="btn btn-ghost danger" type="button" (click)="remove(item)">Desactiver</button>
                </td>
              </tr>
              <tr *ngIf="!items().length">
                <td colspan="5" class="empty-state">Aucune affectation trouvee.</td>
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
        <div class="admin-modal admin-modal-wide" (click)="$event.stopPropagation()">
          <div class="admin-modal-header">
            <div>
              <div class="eyebrow">Affectation</div>
              <h3>{{ editingId() ? 'Modifier l affectation' : 'Affecter des employes' }}</h3>
              <p class="admin-modal-intro">Selectionnez une mission, un ou plusieurs employes et un taux coherent.</p>
            </div>
            <button class="admin-modal-close" type="button" (click)="closeEditor()">Fermer</button>
          </div>

          <div class="editor-mini-strip">
            <article class="editor-mini-card">
              <span>Affectations visibles</span>
              <strong>{{ totalElements() }}</strong>
            </article>
            <article class="editor-mini-card">
              <span>Charge moyenne</span>
              <strong>{{ averageDisplayedOccupation() }}%</strong>
            </article>
          </div>

          <div *ngIf="success()" class="message success">{{ success() }}</div>
          <div *ngIf="formError()" class="message error">{{ formError() }}</div>

          <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
            <ng-container *ngIf="editingId(); else multiEmployeeSelection">
              <label class="field">
                <span>Employe</span>
                <select formControlName="employeId">
                  <option value="">Selectionner</option>
                  <option *ngFor="let employe of employes(); trackBy: trackByUser" [value]="employe.id">
                    {{ employe.nomComplet }}
                  </option>
                </select>
              </label>
              <div class="field-help error" *ngIf="showEmployeFieldError()">
                Selectionnez un employe.
              </div>
            </ng-container>

            <ng-template #multiEmployeeSelection>
              <div class="field field-full">
                <span>Employes a affecter</span>

                <div class="affectation-selection-toolbar">
                  <input
                    type="text"
                    [value]="employeSearch()"
                    (input)="updateEmployeSearch($event)"
                    placeholder="Rechercher un employe"
                  >

                  <div class="affectation-selection-actions">
                    <button class="btn btn-ghost" type="button" (click)="selectAllFilteredEmployes()" [disabled]="!filteredEmployes().length">
                      Tout selectionner
                    </button>
                    <button class="btn btn-ghost" type="button" (click)="clearSelectedEmployes()" [disabled]="!selectedEmployeIds().length">
                      Vider
                    </button>
                  </div>
                </div>

                <div class="affectation-selected-summary">
                  {{ selectedEmployeIds().length }} employe(s) selectionne(s)
                </div>

                <div class="field-help" *ngIf="!employes().length">
                  Aucun employe actif disponible. Creez d abord des employes dans la page Utilisateurs.
                </div>

                <div class="field-help error" *ngIf="showSelectedEmployesError()">
                  Selectionnez au moins un employe dans la liste avant de creer.
                </div>

                <div class="affectation-employee-picker">
                  <label
                    class="affectation-employee-option"
                    *ngFor="let employe of filteredEmployes(); trackBy: trackByUser"
                    [class.active]="isEmployeSelected(employe.id)"
                  >
                    <input
                      type="checkbox"
                      [checked]="isEmployeSelected(employe.id)"
                      (change)="toggleEmploye(employe.id, $any($event.target).checked)"
                    >
                    <div class="affectation-employee-copy">
                      <strong>{{ employe.nomComplet }}</strong>
                      <small>{{ employe.matricule }} - {{ employe.specialiteNom || 'Sans specialite' }}</small>
                    </div>
                  </label>

                  <div class="admin-compact-empty" *ngIf="employes().length && !filteredEmployes().length">
                    Aucun employe trouve.
                  </div>
                </div>
              </div>
            </ng-template>

            <label class="field">
              <span>Mission</span>
              <select formControlName="missionId">
                <option value="">Selectionner</option>
                <option *ngFor="let mission of missions(); trackBy: trackByMission" [value]="mission.id">
                  {{ mission.titre }}
                </option>
              </select>
            </label>
            <div class="field-help" *ngIf="selectedMissionLabel()">
              {{ selectedMissionLabel() }}
            </div>
            <div class="field-help error" *ngIf="showFieldError('missionId')">
              Selectionnez une mission.
            </div>

            <label class="field">
              <span>Date debut</span>
              <input formControlName="dateDebut" type="date">
            </label>
            <div class="field-help error" *ngIf="showFieldError('dateDebut')">
              La date de debut est obligatoire.
            </div>

            <label class="field">
              <span>Date fin</span>
              <input formControlName="dateFin" type="date">
            </label>
            <div class="field-help error" *ngIf="showFieldError('dateFin')">
              La date de fin est obligatoire.
            </div>

            <label class="field">
              <span>Taux d occupation</span>
              <input formControlName="tauxOccupation" type="number" min="1" max="100">
            </label>
            <div class="field-help error" *ngIf="showTauxError()">
              Le taux doit etre compris entre 1 et 100.
            </div>

            <label class="field">
              <span>Statut</span>
              <select formControlName="status">
                <option value="PLANIFIEE">PLANIFIEE</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="TERMINEE">TERMINEE</option>
              </select>
            </label>

            <label class="field field-full">
              <span>Commentaire</span>
              <textarea formControlName="commentaire" rows="4" maxlength="800"></textarea>
            </label>

            <div class="field-help field-full">
              Conseil: commencez par un taux faible quand plusieurs affectations se chevauchent.
            </div>

            <div class="message error field-full" *ngIf="formError()">
              {{ formError() }}
            </div>

            <div class="panel-actions field-full form-actions-split">
              <button class="btn btn-secondary" type="button" (click)="closeEditor()">Annuler</button>
              <button class="btn btn-primary" type="submit" [disabled]="submitting()">
                {{ submitting() ? 'Enregistrement...' : editingId() ? 'Enregistrer' : 'Creer les affectations' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class AffectationsPageComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly feedback = inject(FeedbackService);

  readonly items = signal<Affectation[]>([]);
  readonly allActiveAffectations = signal<Affectation[]>([]);
  readonly employes = signal<Utilisateur[]>([]);
  readonly missions = signal<Mission[]>([]);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly editorOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly listError = signal('');
  readonly formError = signal('');
  readonly success = signal('');
  readonly submitting = signal(false);
  readonly submitAttempted = signal(false);
  readonly selectedEmployeIds = signal<number[]>([]);
  readonly employeSearch = signal('');
  readonly averageDisplayedOccupation = computed(() => {
    const list = this.items();
    if (!list.length) {
      return 0;
    }
    return Math.round(list.reduce((sum, item) => sum + item.tauxOccupation, 0) / list.length);
  });

  readonly filteredEmployes = computed(() => {
    const term = this.employeSearch().trim().toLowerCase();
    if (!term) {
      return this.employes();
    }

    return this.employes().filter((employe) =>
      [employe.nomComplet, employe.matricule, employe.email, employe.specialiteNom ?? '']
        .some((value) => value.toLowerCase().includes(term))
    );
  });

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['']
  });

  readonly form = this.fb.group({
    employeId: [''],
    missionId: ['', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    tauxOccupation: [50, [Validators.required, Validators.min(1), Validators.max(100)]],
    status: ['PLANIFIEE', Validators.required],
    commentaire: ['', Validators.maxLength(800)]
  });

  constructor() {
    this.loadOptions();
    this.load();
  }

  applyFilters(): void {
    this.page.set(0);
    this.load();
  }

  openCreateModal(): void {
    this.editorOpen.set(true);
    this.resetFormValues(true);
    this.formError.set('');
    this.success.set('');
  }

  load(): void {
    this.listError.set('');
    this.apiService.listAffectations({
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
      error: (error: { error?: ApiError }) => this.listError.set(this.resolveApiError(error, 'Chargement impossible.'))
    });

    this.refreshValidationAffectations();
  }

  edit(item: Affectation): void {
    this.editorOpen.set(true);
    this.editingId.set(item.id);
    this.selectedEmployeIds.set([item.employeId]);
    this.employeSearch.set('');
    this.formError.set('');
    this.success.set('');
    this.submitAttempted.set(false);
    this.form.patchValue({
      employeId: String(item.employeId),
      missionId: String(item.missionId),
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
      tauxOccupation: item.tauxOccupation,
      status: item.status,
      commentaire: item.commentaire ?? ''
    });
  }

  submit(): void {
    this.submitAttempted.set(true);
    this.formError.set('');
    this.success.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const message = this.getFirstFormError();
      this.formError.set(message);
      this.feedback.error(message, 'Creation impossible');
      return;
    }

    const raw = this.form.getRawValue();
    const basePayload = {
      missionId: Number(raw.missionId),
      dateDebut: raw.dateDebut,
      dateFin: raw.dateFin,
      tauxOccupation: Number(raw.tauxOccupation),
      status: raw.status,
      commentaire: raw.commentaire || null
    };

    const businessRuleError = this.validateBusinessRules(basePayload);
    if (businessRuleError) {
      this.formError.set(businessRuleError);
      this.feedback.error(businessRuleError, 'Creation impossible');
      return;
    }

    if (this.editingId()) {
      if (!raw.employeId) {
        const message = 'Selectionnez un employe.';
        this.formError.set(message);
        this.feedback.error(message, 'Modification impossible');
        return;
      }

      this.submitting.set(true);
      this.apiService.updateAffectation(this.editingId()!, {
        ...basePayload,
        employeId: Number(raw.employeId)
      }).subscribe({
        next: () => {
          this.feedback.success('L affectation a ete modifiee avec succes.', 'Modification enregistree');
          this.submitting.set(false);
          this.closeEditor();
          this.load();
        },
        error: (error: { error?: ApiError }) => {
          this.submitting.set(false);
          const message = this.resolveApiError(error, 'Enregistrement impossible.');
          this.formError.set(message);
          this.feedback.error(message, 'Modification impossible');
        }
      });
      return;
    }

    const employeIds = this.selectedEmployeIds();
    if (!employeIds.length) {
      const message = 'Selectionnez au moins un employe dans la liste.';
      this.formError.set(message);
      this.feedback.error(message, 'Creation impossible');
      return;
    }

    this.submitting.set(true);
    this.apiService.createAffectationsBatch({
      ...basePayload,
      employeIds
    }).subscribe({
      next: (created) => {
        const total = created.length;
        this.feedback.success(
          total === 1
            ? 'Une affectation a ete creee avec succes.'
            : `${total} affectations ont ete creees avec succes.`,
          'Ajout enregistre'
        );
        this.submitting.set(false);
        this.closeEditor();
        this.load();
      },
      error: (error: { error?: ApiError }) => {
        this.submitting.set(false);
        const message = this.resolveApiError(error, 'Enregistrement impossible.');
        this.formError.set(message);
        this.feedback.error(message, 'Creation impossible');
      }
    });
  }

  async remove(item: Affectation): Promise<void> {
    const confirmed = await this.feedback.confirm({
      title: 'Desactiver l affectation',
      message: `Voulez-vous vraiment desactiver l affectation de ${item.employeNom} ?`,
      confirmLabel: 'Desactiver',
      cancelLabel: 'Retour',
      tone: 'danger'
    });
    if (!confirmed) {
      return;
    }

    this.formError.set('');
    this.success.set('');
    this.apiService.deleteAffectation(item.id).subscribe({
      next: () => {
        this.feedback.success('L affectation a ete desactivee avec succes.', 'Suppression effectuee');
        this.load();
      },
      error: (error: { error?: ApiError }) => {
        const message = this.resolveApiError(error, 'Suppression impossible.');
        this.formError.set(message);
        this.feedback.error(message, 'Suppression impossible');
      }
    });
  }

  resetForm(): void {
    this.resetFormValues(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.resetFormValues(true);
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

  updateEmployeSearch(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.employeSearch.set(value);
  }

  selectAllFilteredEmployes(): void {
    const merged = new Set([
      ...this.selectedEmployeIds(),
      ...this.filteredEmployes().map((employe) => employe.id)
    ]);
    this.selectedEmployeIds.set([...merged]);
    this.formError.set('');
  }

  clearSelectedEmployes(): void {
    this.selectedEmployeIds.set([]);
  }

  toggleEmploye(employeId: number, checked: boolean): void {
    if (checked) {
      this.selectedEmployeIds.update((ids) => ids.includes(employeId) ? ids : [...ids, employeId]);
      this.formError.set('');
      return;
    }

    this.selectedEmployeIds.update((ids) => ids.filter((id) => id !== employeId));
  }

  isEmployeSelected(employeId: number): boolean {
    return this.selectedEmployeIds().includes(employeId);
  }

  showFieldError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  showTauxError(): boolean {
    const control = this.form.get('tauxOccupation');
    return !!control && control.invalid && (control.touched || this.submitAttempted());
  }

  showEmployeFieldError(): boolean {
    const control = this.form.get('employeId');
    return !!this.editingId() && !!control && !control.value && this.submitAttempted();
  }

  showSelectedEmployesError(): boolean {
    return !this.editingId() && this.submitAttempted() && this.selectedEmployeIds().length === 0;
  }

  trackByAffectation(_: number, item: Affectation): number {
    return item.id;
  }

  trackByUser(_: number, user: Utilisateur): number {
    return user.id;
  }

  trackByMission(_: number, mission: Mission): number {
    return mission.id;
  }

  selectedMissionLabel(): string {
    const missionId = Number(this.form.get('missionId')?.value);
    if (!missionId) {
      return '';
    }

    const mission = this.missions().find((item) => item.id === missionId);
    if (!mission) {
      return '';
    }

    return `Periode de la mission: ${mission.dateDebut} -> ${mission.dateFin}`;
  }

  private loadOptions(): void {
    this.apiService.listUtilisateurs({ page: 0, size: 100, role: 'EMPLOYE', actif: true, sort: 'nom,asc' }).subscribe({
      next: (response) => this.employes.set(response.content),
      error: (error: { error?: ApiError }) => this.formError.set(this.resolveApiError(error, 'Impossible de charger les employes.'))
    });

    this.apiService.listMissions({ page: 0, size: 100, actif: true, sort: 'updatedAt,desc' }).subscribe({
      next: (response) => this.missions.set(response.content),
      error: (error: { error?: ApiError }) => this.formError.set(this.resolveApiError(error, 'Impossible de charger les missions.'))
    });

    this.refreshValidationAffectations();
  }

  private getFirstFormError(): string {
    const missionId = this.form.get('missionId');
    if (missionId?.invalid) {
      return 'Selectionnez une mission.';
    }

    const dateDebut = this.form.get('dateDebut');
    if (dateDebut?.invalid) {
      return 'La date de debut est obligatoire.';
    }

    const dateFin = this.form.get('dateFin');
    if (dateFin?.invalid) {
      return 'La date de fin est obligatoire.';
    }

    const tauxOccupation = this.form.get('tauxOccupation');
    if (tauxOccupation?.invalid) {
      return 'Le taux doit etre compris entre 1 et 100.';
    }

    return 'Formulaire invalide.';
  }

  private validateBusinessRules(raw: {
    missionId: number;
    dateDebut: string;
    dateFin: string;
    tauxOccupation: number;
    status: string;
    commentaire: string | null;
  }): string {
    if (raw.dateDebut > raw.dateFin) {
      return 'La date de fin doit etre posterieure ou egale a la date de debut.';
    }

    const mission = this.missions().find((item) => item.id === raw.missionId);
    if (mission && (raw.dateDebut < mission.dateDebut || raw.dateFin > mission.dateFin)) {
      return `La periode d'affectation doit etre comprise entre ${mission.dateDebut} et ${mission.dateFin} pour la mission selectionnee.`;
    }

    const employeIds = this.editingId()
      ? [Number(this.form.get('employeId')?.value)]
      : this.selectedEmployeIds();

    const overloadedEmployes = employeIds
      .filter((employeId) => this.isOccupationExceeded(employeId, raw.dateDebut, raw.dateFin, raw.tauxOccupation))
      .map((employeId) => this.employes().find((item) => item.id === employeId)?.nomComplet ?? `Employe #${employeId}`);

    if (overloadedEmployes.length > 0) {
      return `Le taux d'occupation cumule depasse 100% pour: ${overloadedEmployes.join(', ')}.`;
    }

    return '';
  }

  private isOccupationExceeded(employeId: number, dateDebut: string, dateFin: string, tauxOccupation: number): boolean {
    const currentId = this.editingId();
    const overlappingOccupation = this.allActiveAffectations()
      .filter((item) => item.employeId === employeId)
      .filter((item) => currentId == null || item.id !== currentId)
      .filter((item) => this.isOverlapping(item.dateDebut, item.dateFin, dateDebut, dateFin))
      .reduce((sum, item) => sum + item.tauxOccupation, 0);

    return overlappingOccupation + tauxOccupation > 100;
  }

  private isOverlapping(existingStart: string, existingEnd: string, newStart: string, newEnd: string): boolean {
    return existingStart <= newEnd && newStart <= existingEnd;
  }

  private refreshValidationAffectations(): void {
    this.apiService.listAffectations({ page: 0, size: 200, actif: true, sort: 'updatedAt,desc' }).subscribe({
      next: (response) => this.allActiveAffectations.set(response.content),
      error: () => this.allActiveAffectations.set([])
    });
  }

  private resolveApiError(error: { error?: ApiError }, fallback: string): string {
    const apiError = error.error;
    if (!apiError) {
      return fallback;
    }

    const detailValues = Object.values(apiError.details ?? {}).filter(Boolean);
    if (detailValues.length > 0) {
      return `${apiError.message} ${detailValues.join(' ')}`.trim();
    }

    return apiError.message || fallback;
  }

  private resetFormValues(clearMessages: boolean): void {
    this.editingId.set(null);
    this.selectedEmployeIds.set([]);
    this.employeSearch.set('');
    this.submitting.set(false);
    this.submitAttempted.set(false);

    if (clearMessages) {
      this.formError.set('');
      this.success.set('');
    }

    this.form.reset({
      employeId: '',
      missionId: '',
      dateDebut: '',
      dateFin: '',
      tauxOccupation: 50,
      status: 'PLANIFIEE',
      commentaire: ''
    });
  }
}
