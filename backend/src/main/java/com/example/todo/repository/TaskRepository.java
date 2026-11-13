package com.example.todo.repository;

import com.example.todo.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<Task> findAllByUserIdAndCompletedOrderByCreatedAtDesc(Long userId, boolean completed);

    Optional<Task> findByIdAndUserId(Long id, Long userId);
}
