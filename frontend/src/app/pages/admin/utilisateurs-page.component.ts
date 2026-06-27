import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { FeedbackService } from '../../core/feedback.service';
import { ApiError, Specialite, Utilisateur } from '../../core/models';

@Component({
  selector: 'app-utilisateurs-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-section">
      <div class="page-heading admin-banner admin-banner-compact">
        <div class="admin-section-lead">
          <div class="admin-banner-icon">US</div>
          <div>
            <div class="eyebrow">Comptes</div>
            <h2>Gestion des utilisateurs</h2>
            <p>Creer et gerer les comptes des administrateurs et employes.</p>
          </div>
        </div>
        <button class="btn btn-primary" type="button" (click)="openCreateModal()">Nouvel utilisateur</button>
      </div>

      <div class="panel panel-soft admin-list-panel">
        <div class="panel-header">
          <div class="admin-section-title">
            <span class="admin-section-icon purple">US</span>
            <div>
              <h3>Liste des utilisateurs</h3>
            </div>
          </div>
          <button class="btn btn-secondary" type="button" (click)="load()">Actualiser</button>
        </div>

        <form [formGroup]="filterForm" class="admin-inline-filters triple">
          <label class="field">
            <span>Recherche</span>
            <input formControlName="search" placeholder="Nom, email, matricule">
          </label>
          <label class="field">
            <span>Role</span>
            <select formControlName="role">
              <option value="">Tous</option>
              <option value="ADMIN">ADMIN</option>
              <option value="EMPLOYE">EMPLOYE</option>
            </select>
          </label>
          <label class="field">
            <span>Specialite</span>
            <select formControlName="specialiteId">
              <option value="">Toutes</option>
              <option *ngFor="let specialite of specialites(); trackBy: trackBySpecialite" [value]="specialite.id">
                {{ specialite.nom }}
              </option>
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
                <th>Utilisateur</th>
                <th>Role</th>
                <th>Specialite</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of items(); let index = index; trackBy: trackByUser">
                <td>
                  <div class="record-main">
                    <span class="record-avatar" [ngClass]="'tone-' + (index % 6)">
                      {{ user.prenom.slice(0, 1).toUpperCase() }}{{ user.nom.slice(0, 1).toUpperCase() }}
                    </span>
                    <div class="record-copy">
                      <strong>{{ user.nomComplet }}</strong>
                      <small>{{ user.email }} - {{ user.matricule }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="table-chip" [class.aqua]="user.role === 'EMPLOYE'" [class.purple]="user.role === 'ADMIN'">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ user.specialiteNom || 'Aucune' }}</td>
                <td>
                  <span class="status-pill" [class.success]="user.actif" [class.danger]="!user.actif">
                    {{ user.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="btn btn-ghost" type="button" (click)="edit(user)">Modifier</button>
                  <button class="btn btn-ghost danger" type="button" (click)="remove(user)">Desactiver</button>
                </td>
              </tr>
              <tr *ngIf="!items().length">
                <td colspan="5" class="empty-state">Aucun utilisateur trouve.</td>
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
              <div class="eyebrow">Edition</div>
              <h3>{{ editingId() ? 'Modifier le compte' : 'Ajouter un utilisateur' }}</h3>
              <p class="admin-modal-intro">Ajoutez ou ajustez un compte depuis une popup claire et legere.</p>
            </div>
            <button class="admin-modal-close" type="button" (click)="closeEditor()">Fermer</button>
          </div>

          <div class="editor-mini-strip">
            <article class="editor-mini-card">
              <span>Employes visibles</span>
              <strong>{{ employeeCount() }}</strong>
            </article>
            <article class="editor-mini-card">
              <span>Admins visibles</span>
              <strong>{{ adminCount() }}</strong>
            </article>
          </div>

          <div *ngIf="formError()" class="message error">{{ formError() }}</div>

          <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
            <div class="form-subsection field-full">Informations personnelles</div>

            <label class="field">
              <span>Prenom</span>
              <input formControlName="prenom">
              <small class="field-error" *ngIf="isFieldInvalid('prenom')">{{ fieldError('prenom') }}</small>
            </label>
            <label class="field">
              <span>Nom</span>
              <input formControlName="nom">
              <small class="field-error" *ngIf="isFieldInvalid('nom')">{{ fieldError('nom') }}</small>
            </label>
            <label class="field">
              <span>Email</span>
              <input formControlName="email" type="email">
              <small class="field-error" *ngIf="isFieldInvalid('email')">{{ fieldError('email') }}</small>
            </label>
            <label class="field"><span>Telephone</span><input formControlName="telephone"></label>
            <label class="field">
              <span>Role</span>
              <select formControlName="role">
                <option value="ADMIN">ADMIN</option>
                <option value="EMPLOYE">EMPLOYE</option>
              </select>
              <small class="field-error" *ngIf="isFieldInvalid('role')">{{ fieldError('role') }}</small>
            </label>

            <div class="form-subsection field-full">Acces et specialite</div>

            <div class="field-help field-full">
              Le matricule est maintenant genere automatiquement par le systeme.
            </div>

            <label class="field field-full">
              <span>Specialite</span>
              <select formControlName="specialiteId">
                <option value="">Aucune</option>
                <option *ngFor="let specialite of specialites(); trackBy: trackBySpecialite" [value]="specialite.id">
                  {{ specialite.nom }}
                </option>
              </select>
              <small class="field-error" *ngIf="form.get('role')?.value === 'EMPLOYE' && !form.get('specialiteId')?.value && form.touched">
                Une specialite est obligatoire pour un employe.
              </small>
            </label>

            <div class="form-subsection field-full">Mot de passe</div>

            <label class="field">
              <span>Mot de passe {{ editingId() ? '(laisser vide pour conserver)' : '' }}</span>
              <input formControlName="motDePasse" type="password">
              <small class="field-error" *ngIf="form.get('motDePasse')?.value && form.get('motDePasse')?.value.length < 8">
                Le mot de passe doit contenir au moins 8 caracteres.
              </small>
            </label>
            <label class="field">
              <span>Confirmer le mot de passe</span>
              <input formControlName="confirmationMotDePasse" type="password">
              <small class="field-error" *ngIf="form.get('confirmationMotDePasse')?.value && form.get('motDePasse')?.value !== form.get('confirmationMotDePasse')?.value">
                La confirmation du mot de passe ne correspond pas.
              </small>
            </label>

            <div class="field-help field-full">
              Astuce: pour un employe, choisissez toujours une specialite afin d avoir une interface plus claire dans les affectations.
            </div>

            <div class="panel-actions field-full form-actions-split">
              <button class="btn btn-secondary" type="button" (click)="closeEditor()">Annuler</button>
              <button class="btn btn-primary" type="submit">Enregistrer l utilisateur</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class UtilisateursPageComponent {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly feedback = inject(FeedbackService);

  readonly items = signal<Utilisateur[]>([]);
  readonly specialites = signal<Specialite[]>([]);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly editorOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly listError = signal('');
  readonly formError = signal('');
  readonly employeeCount = computed(() => this.items().filter((item) => item.role === 'EMPLOYE').length);
  readonly adminCount = computed(() => this.items().filter((item) => item.role === 'ADMIN').length);

  readonly filterForm = this.fb.group({
    search: [''],
    role: [''],
    specialiteId: ['']
  });

  readonly form = this.fb.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    role: ['EMPLOYE', Validators.required],
    specialiteId: [''],
    motDePasse: [''],
    confirmationMotDePasse: ['']
  });

  constructor() {
    this.loadSpecialites();
    this.load();
    this.form.valueChanges.subscribe(() => this.formError.set(''));
  }

  applyFilters(): void {
    this.page.set(0);
    this.load();
  }

  openCreateModal(): void {
    this.formError.set('');
    this.resetForm();
    this.editorOpen.set(true);
  }

  load(): void {
    this.listError.set('');
    this.apiService.listUtilisateurs({
      page: this.page(),
      size: 7,
      sort: 'updatedAt,desc',
      search: this.filterForm.value.search,
      role: this.filterForm.value.role,
      specialiteId: this.filterForm.value.specialiteId,
      actif: true
    }).subscribe({
      next: (response) => {
        this.items.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      },
      error: (error: { error?: ApiError }) => {
        const message = this.extractApiErrorMessage(error.error, 'Chargement impossible.');
        this.listError.set(message);
        this.feedback.error(message, 'Chargement impossible');
      }
    });
  }

  edit(user: Utilisateur): void {
    this.formError.set('');
    this.editorOpen.set(true);
    this.editingId.set(user.id);
    this.form.patchValue({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone ?? '',
      role: user.role,
      specialiteId: user.specialiteId ? String(user.specialiteId) : '',
      motDePasse: '',
      confirmationMotDePasse: ''
    });
  }

  submit(): void {
    this.formError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const message = this.buildClientValidationMessage();
      this.formError.set(message);
      this.feedback.error(message, 'Formulaire invalide');
      return;
    }

    const isEditing = !!this.editingId();
    const raw = this.form.getRawValue();

    if (!isEditing && !raw.motDePasse) {
      const message = 'Le mot de passe est obligatoire pour creer un utilisateur.';
      this.formError.set(message);
      this.feedback.error(message);
      return;
    }

    if (raw.motDePasse && raw.motDePasse.length < 8) {
      const message = 'Le mot de passe doit contenir au moins 8 caracteres.';
      this.formError.set(message);
      this.feedback.error(message, 'Formulaire invalide');
      return;
    }

    if ((raw.motDePasse || raw.confirmationMotDePasse) && raw.motDePasse !== raw.confirmationMotDePasse) {
      const message = 'La confirmation du mot de passe ne correspond pas.';
      this.formError.set(message);
      this.feedback.error(message);
      return;
    }

    if (raw.role === 'EMPLOYE' && !raw.specialiteId) {
      const message = 'Une specialite est obligatoire pour creer un employe.';
      this.formError.set(message);
      this.feedback.error(message);
      return;
    }

    const payload: Record<string, unknown> = {
      ...raw,
      specialiteId: raw.role === 'ADMIN' || !raw.specialiteId ? null : Number(raw.specialiteId),
      motDePasse: raw.motDePasse || null
    };
    delete payload['confirmationMotDePasse'];

    const request = this.editingId()
      ? this.apiService.updateUtilisateur(this.editingId()!, payload)
      : this.apiService.createUtilisateur(payload);

    request.subscribe({
      next: () => {
        this.feedback.success(
          isEditing
            ? 'Le compte utilisateur a ete modifie avec succes.'
            : 'Le compte utilisateur a ete cree avec succes.',
          isEditing ? 'Modification enregistree' : 'Ajout enregistre'
        );
        this.closeEditor();
        this.load();
      },
      error: (error: { error?: ApiError }) => {
        const message = this.extractApiErrorMessage(error.error, 'Enregistrement impossible.');
        this.formError.set(message);
        this.feedback.error(message, isEditing ? 'Modification impossible' : 'Ajout impossible');
      }
    });
  }

  async remove(user: Utilisateur): Promise<void> {
    const confirmed = await this.feedback.confirm({
      title: 'Desactiver le compte',
      message: `Voulez-vous vraiment desactiver le compte ${user.nomComplet} ?`,
      confirmLabel: 'Desactiver',
      cancelLabel: 'Retour',
      tone: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.apiService.deleteUtilisateur(user.id).subscribe({
      next: () => {
        this.feedback.success('Le compte a ete desactive avec succes.', 'Suppression effectuee');
        this.load();
      },
      error: (error: { error?: ApiError }) => {
        const message = this.extractApiErrorMessage(error.error, 'Suppression impossible.');
        this.listError.set(message);
        this.feedback.error(message);
      }
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      role: 'EMPLOYE',
      specialiteId: '',
      motDePasse: '',
      confirmationMotDePasse: ''
    });
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.formError.set('');
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

  trackByUser(_: number, user: Utilisateur): number {
    return user.id;
  }

  trackBySpecialite(_: number, specialite: Specialite): number {
    return specialite.id;
  }

  private loadSpecialites(): void {
    this.apiService.listSpecialites({ page: 0, size: 100, actif: true, sort: 'nom,asc' }).subscribe({
      next: (response) => this.specialites.set(response.content)
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  fieldError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      switch (controlName) {
        case 'prenom':
          return 'Le prenom est obligatoire.';
        case 'nom':
          return 'Le nom est obligatoire.';
        case 'email':
          return 'L email est obligatoire.';
        case 'role':
          return 'Le role est obligatoire.';
        default:
          return 'Ce champ est obligatoire.';
      }
    }

    if (control.errors['email']) {
      return 'Adresse email invalide.';
    }

    return 'Valeur invalide.';
  }

  private buildClientValidationMessage(): string {
    if (this.form.get('prenom')?.hasError('required')) {
      return 'Le prenom est obligatoire.';
    }
    if (this.form.get('nom')?.hasError('required')) {
      return 'Le nom est obligatoire.';
    }
    if (this.form.get('email')?.hasError('required')) {
      return 'L email est obligatoire.';
    }
    if (this.form.get('email')?.hasError('email')) {
      return 'Adresse email invalide.';
    }
    if (this.form.get('role')?.hasError('required')) {
      return 'Le role est obligatoire.';
    }
    return 'Veuillez verifier les champs obligatoires avant d enregistrer.';
  }

  private extractApiErrorMessage(error: ApiError | undefined, fallback: string): string {
    if (!error) {
      return fallback;
    }

    const details = Object.values(error.details ?? {}).filter((value) => !!value?.trim());
    if (details.length) {
      return details.join(' ');
    }

    return error.message || fallback;
  }
}
