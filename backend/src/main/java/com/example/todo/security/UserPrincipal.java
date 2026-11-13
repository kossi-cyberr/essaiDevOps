package com.example.todo.security;

import com.example.todo.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Principal Spring Security personnalisé : expose l'utilisateur de l'application.
 *
 * <p>L'identifiant de connexion ({@link #getUsername()}) est l'email, utilisé comme
 * sujet du JWT. Le nom d'utilisateur affiché reste accessible via {@link #getDisplayName()}.</p>
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String displayName;
    private final String email;
    private final String password;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.displayName = user.getUsername();
        this.email = user.getEmail();
        this.password = user.getPassword();
    }

    /** Identifiant de connexion : l'email. */
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Rôle unique pour cette application ; extensible si besoin.
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
