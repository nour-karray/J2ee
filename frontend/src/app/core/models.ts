export type Role = 'ADMIN' | 'EMPLOYE';
export type MissionStatus = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
export type AffectationStatus = 'PLANIFIEE' | 'ACTIVE' | 'TERMINEE';
export type Priorite = 'BASSE' | 'MOYENNE' | 'HAUTE';

export interface SessionUtilisateur {
  id: number;
  nomComplet: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  utilisateur: SessionUtilisateur;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface Specialite {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
  nombreEmployes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Utilisateur {
  id: number;
  matricule: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  email: string;
  telephone: string | null;
  role: Role;
  specialiteId: number | null;
  specialiteNom: string | null;
  actif: boolean;
  tauxOccupationActuel: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: number;
  code: string;
  titre: string;
  description: string;
  clientNom: string;
  localisation: string;
  dateDebut: string;
  dateFin: string;
  status: MissionStatus;
  priorite: Priorite;
  budget: number | null;
  actif: boolean;
  nombreAffectations: number;
  createdAt: string;
  updatedAt: string;
}

export interface Affectation {
  id: number;
  employeId: number;
  employeNom: string;
  employeMatricule: string;
  missionId: number;
  missionTitre: string;
  missionCode: string;
  dateDebut: string;
  dateFin: string;
  tauxOccupation: number;
  status: AffectationStatus;
  commentaire: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MissionTeamMember {
  affectationId: number;
  employeId: number;
  matricule: string;
  nomComplet: string;
  email: string;
  telephone: string | null;
  specialite: string | null;
  dateDebut: string;
  dateFin: string;
  tauxOccupation: number;
  status: AffectationStatus;
}

export interface DashboardAlert {
  affectationId: number;
  employeNom: string;
  missionTitre: string;
  dateFin: string;
  joursRestants: number;
}

export interface DashboardMission {
  id: number;
  code: string;
  titre: string;
  status: MissionStatus;
  priorite: Priorite;
  dateFin: string;
  nombreAffectations: number;
}

export interface Dashboard {
  totalEmployes: number;
  totalSpecialites: number;
  missionsPlanifiees: number;
  missionsActives: number;
  affectationsActives: number;
  alertesFinProche: DashboardAlert[];
  missionsPrioritaires: DashboardMission[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: Record<string, string>;
}
