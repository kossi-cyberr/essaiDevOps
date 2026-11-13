package com.example.todo.service;

import com.example.todo.dto.TaskRequest;
import com.example.todo.dto.TaskResponse;
import com.example.todo.entity.Task;
import com.example.todo.entity.User;
import com.example.todo.exception.BadRequestException;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.repository.TaskRepository;
import com.example.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Logique métier des tâches. Toutes les opérations sont limitées au propriétaire.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> findAll(Long userId, String filter) {
        String normalized = (filter == null ? "all" : filter.trim().toLowerCase());

        List<Task> tasks = switch (normalized) {
            case "all", "" -> taskRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
            case "active" -> taskRepository.findAllByUserIdAndCompletedOrderByCreatedAtDesc(userId, false);
            case "completed" -> taskRepository.findAllByUserIdAndCompletedOrderByCreatedAtDesc(userId, true);
            default -> throw new BadRequestException(
                    "Filtre invalide. Valeurs acceptées : all, active, completed.");
        };

        return tasks.stream().map(TaskResponse::from).toList();
    }

    @Transactional
    public TaskResponse create(Long userId, TaskRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));

        Task task = Task.builder()
                .title(request.title().trim())
                .description(normalizeDescription(request.description()))
                .completed(request.completedOrDefault())
                .user(user)
                .build();

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long userId, Long taskId, TaskRequest request) {
        Task task = getOwnedTask(userId, taskId);

        task.setTitle(request.title().trim());
        task.setDescription(normalizeDescription(request.description()));
        if (request.completed() != null) {
            task.setCompleted(request.completed());
        }

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse toggle(Long userId, Long taskId) {
        Task task = getOwnedTask(userId, taskId);
        task.setCompleted(!task.isCompleted());
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long userId, Long taskId) {
        Task task = getOwnedTask(userId, taskId);
        taskRepository.delete(task);
    }

    /**
     * Récupère une tâche en vérifiant qu'elle appartient bien à l'utilisateur courant.
     * Un id inconnu ou appartenant à un autre utilisateur renvoie 404 (pas de fuite d'information).
     */
    private Task getOwnedTask(Long userId, Long taskId) {
        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable."));
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
