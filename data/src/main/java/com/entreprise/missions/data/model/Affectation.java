package com.entreprise.missions.data.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;

@Entity
@Table(name = "affectations")
public class Affectation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employe_id", nullable = false)
    private Utilisateur employe;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Min(1)
    @Max(100)
    @Column(nullable = false)
    private Integer tauxOccupation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AffectationStatus status;

    @Column(length = 800)
    private String commentaire;

    public Utilisateur getEmploye() {
        return employe;
    }

    public void setEmploye(Utilisateur employe) {
        this.employe = employe;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public Integer getTauxOccupation() {
        return tauxOccupation;
    }

    public void setTauxOccupation(Integer tauxOccupation) {
        this.tauxOccupation = tauxOccupation;
    }

    public AffectationStatus getStatus() {
        return status;
    }

    public void setStatus(AffectationStatus status) {
        this.status = status;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
