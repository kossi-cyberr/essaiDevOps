package com.example.todo.exception;

/**
 * Requête invalide côté métier (400).
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
