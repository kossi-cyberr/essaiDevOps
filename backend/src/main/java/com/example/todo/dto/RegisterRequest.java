package com.example.todo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Payload d'inscription.
 */
public record RegisterRequest(

        @NotBlank(message = "Le nom d'utilisateur est obligatoire")
        @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
        @Pattern(
                regexp = "^[a-zA-Z0-9._-]+$",
                message = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores"
        )
        String username,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "L'email n'est pas valide")
        @Size(max = 120, message = "L'email ne peut pas dépasser 120 caractères")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 6, max = 72, message = "Le mot de passe doit contenir entre 6 et 72 caractères")
        String password
) {
}
