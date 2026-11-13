package com.example.todo.dto;

/**
 * Réponse renvoyée après une inscription ou une connexion réussie.
 *
 * @param token     token JWT à envoyer dans l'en-tête Authorization
 * @param tokenType toujours "Bearer"
 * @param expiresIn durée de validité du token en millisecondes
 * @param user      informations de l'utilisateur connecté
 */
public record AuthResponse(
        String token,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
