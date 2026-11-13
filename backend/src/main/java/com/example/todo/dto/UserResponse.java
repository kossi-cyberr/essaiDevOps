package com.example.todo.dto;

import com.example.todo.entity.User;

import java.time.LocalDateTime;

/**
 * Représentation publique d'un utilisateur (sans mot de passe).
 */
public record UserResponse(
        Long id,
        String username,
        String email,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getCreatedAt());
    }
}
