import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Affectation,
  Dashboard,
  Mission,
  MissionTeamMember,
  PagedResponse,
  Specialite,
  Utilisateur
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/admin/dashboard`);
  }

  listSpecialites(filters: Record<string, unknown>): Observable<PagedResponse<Specialite>> {
    return this.http.get<PagedResponse<Specialite>>(`${this.apiUrl}/specialites`, { params: this.toParams(filters) });
  }

  createSpecialite(payload: Record<string, unknown>): Observable<Specialite> {
    return this.http.post<Specialite>(`${this.apiUrl}/specialites`, payload);
  }

  updateSpecialite(id: number, payload: Record<string, unknown>): Observable<Specialite> {
    return this.http.put<Specialite>(`${this.apiUrl}/specialites/${id}`, payload);
  }

  deleteSpecialite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/specialites/${id}`);
  }

  listUtilisateurs(filters: Record<string, unknown>): Observable<PagedResponse<Utilisateur>> {
    return this.http.get<PagedResponse<Utilisateur>>(`${this.apiUrl}/utilisateurs`, { params: this.toParams(filters) });
  }

  createUtilisateur(payload: Record<string, unknown>): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/utilisateurs`, payload);
  }

  updateUtilisateur(id: number, payload: Record<string, unknown>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/utilisateurs/${id}`, payload);
  }

  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/utilisateurs/${id}`);
  }

  listMissions(filters: Record<string, unknown>): Observable<PagedResponse<Mission>> {
    return this.http.get<PagedResponse<Mission>>(`${this.apiUrl}/missions`, { params: this.toParams(filters) });
  }

  createMission(payload: Record<string, unknown>): Observable<Mission> {
    return this.http.post<Mission>(`${this.apiUrl}/missions`, payload);
  }

  updateMission(id: number, payload: Record<string, unknown>): Observable<Mission> {
    return this.http.put<Mission>(`${this.apiUrl}/missions/${id}`, payload);
  }

  deleteMission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/missions/${id}`);
  }

  getMissionTeam(id: number): Observable<MissionTeamMember[]> {
    return this.http.get<MissionTeamMember[]>(`${this.apiUrl}/missions/${id}/team`);
  }

  listAffectations(filters: Record<string, unknown>): Observable<PagedResponse<Affectation>> {
    return this.http.get<PagedResponse<Affectation>>(`${this.apiUrl}/affectations`, { params: this.toParams(filters) });
  }

  createAffectation(payload: Record<string, unknown>): Observable<Affectation> {
    return this.http.post<Affectation>(`${this.apiUrl}/affectations`, payload);
  }

  updateAffectation(id: number, payload: Record<string, unknown>): Observable<Affectation> {
    return this.http.put<Affectation>(`${this.apiUrl}/affectations/${id}`, payload);
  }

  deleteAffectation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/affectations/${id}`);
  }

  getEmployeeMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.apiUrl}/employee/missions`);
  }

  getEmployeeProfile(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/employee/profile`);
  }

  private toParams(filters: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
