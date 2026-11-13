# --- Étape 1 : compilation ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copier d'abord le POM pour mettre en cache les dépendances
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copier les sources puis construire le jar
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# --- Étape 2 : exécution ---
FROM eclipse-temurin:17-jre
WORKDIR /app

# Exécuter l'application sans privilèges root
RUN groupadd --system app && useradd --system --gid app app

COPY --from=build /app/target/todo-api-1.0.0.jar app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
