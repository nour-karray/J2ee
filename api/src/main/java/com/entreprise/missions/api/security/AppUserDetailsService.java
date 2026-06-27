package com.entreprise.missions.api.security;

import com.entreprise.missions.core.exception.BusinessException;
import com.entreprise.missions.core.exception.NotFoundException;
import com.entreprise.missions.data.model.Utilisateur;
import com.entreprise.missions.data.repository.UtilisateurRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    public AppUserDetailsService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(username == null ? null : username.trim())
                .orElseThrow(() -> new NotFoundException("Compte utilisateur introuvable."));
        if (!utilisateur.isActif()) {
            throw new BusinessException("Ce compte est désactivé.");
        }
        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasse(),
                List.of(new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole().name()))
        );
    }
}
