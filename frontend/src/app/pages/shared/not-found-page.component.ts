import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-section centered-page">
      <div class="panel">
        <div class="eyebrow">Erreur 404</div>
        <h2>Page introuvable</h2>
        <p>La ressource demandée n'existe pas ou n'est plus accessible.</p>
        <a routerLink="/" class="btn btn-primary">Revenir à l'accueil</a>
      </div>
    </section>
  `
})
export class NotFoundPageComponent {}
