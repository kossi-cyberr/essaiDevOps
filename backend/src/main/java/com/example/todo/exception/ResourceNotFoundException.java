package com.example.todo.exception;

/**
 * Ressource inexistante ou non accessible à l'utilisateur courant (404).
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
