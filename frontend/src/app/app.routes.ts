import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { AffectationsPageComponent } from './pages/admin/affectations-page.component';
import { AdminDashboardPageComponent } from './pages/admin/dashboard-page.component';
import { MissionsPageComponent } from './pages/admin/missions-page.component';
import { SpecialitesPageComponent } from './pages/admin/specialites-page.component';
import { UtilisateursPageComponent } from './pages/admin/utilisateurs-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import { MesMissionsPageComponent } from './pages/employee/mes-missions-page.component';
import { ProfilePageComponent } from './pages/employee/profile-page.component';
import { MissionTeamPageComponent } from './pages/shared/mission-team-page.component';
import { NotFoundPageComponent } from './pages/shared/not-found-page.component';
import { RoleRedirectComponent } from './pages/shared/role-redirect.component';
import { ShellComponent } from './shell/shell.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: RoleRedirectComponent },
      { path: 'admin/dashboard', component: AdminDashboardPageComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/specialites', component: SpecialitesPageComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/utilisateurs', component: UtilisateursPageComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/missions', component: MissionsPageComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'admin/affectations', component: AffectationsPageComponent, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'employee/missions', component: MesMissionsPageComponent, canActivate: [roleGuard(['EMPLOYE'])] },
      { path: 'employee/profile', component: ProfilePageComponent, canActivate: [roleGuard(['EMPLOYE'])] },
      { path: 'missions/:id/team', component: MissionTeamPageComponent, canActivate: [roleGuard(['ADMIN', 'EMPLOYE'])] }
    ]
  },
  { path: '**', component: NotFoundPageComponent }
];
