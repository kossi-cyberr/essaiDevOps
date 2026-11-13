package com.example.todo.controller;

import com.example.todo.dto.TaskRequest;
import com.example.todo.dto.TaskResponse;
import com.example.todo.security.UserPrincipal;
import com.example.todo.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Routes protégées de gestion des tâches de l'utilisateur connecté.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /** Liste les tâches de l'utilisateur. `filter` = all (défaut) | active | completed. */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> findAll(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "all") String filter
    ) {
        return ResponseEntity.ok(taskService.findAll(principal.getId(), filter));
    }

    /** Crée une tâche. */
    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(principal.getId(), request));
    }

    /** Met à jour une tâche existante. */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request
    ) {
        return ResponseEntity.ok(taskService.update(principal.getId(), id, request));
    }

    /** Bascule l'état terminé / non terminé. */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponse> toggle(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(taskService.toggle(principal.getId(), id));
    }

    /** Supprime une tâche. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        taskService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
