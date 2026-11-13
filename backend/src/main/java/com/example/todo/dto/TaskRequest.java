package com.example.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload de création ou de mise à jour d'une tâche.
 */
public record TaskRequest(

        @NotBlank(message = "Le titre est obligatoire")
        @Size(max = 150, message = "Le titre ne peut pas dépasser 150 caractères")
        String title,

        @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
        String description,

        Boolean completed
) {
    public boolean completedOrDefault() {
        return Boolean.TRUE.equals(completed);
    }
}
