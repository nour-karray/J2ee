package com.entreprise.missions.data.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "specialites",
        uniqueConstraints = @UniqueConstraint(name = "uk_specialite_nom", columnNames = "nom")
)
public class Specialite extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 120)
    private String nom;

    @Column(length = 500)
    private String description;

    @OneToMany(mappedBy = "specialite")
    private List<Utilisateur> utilisateurs = new ArrayList<>();

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Utilisateur> getUtilisateurs() {
        return utilisateurs;
    }

    public void setUtilisateurs(List<Utilisateur> utilisateurs) {
        this.utilisateurs = utilisateurs;
    }
}
