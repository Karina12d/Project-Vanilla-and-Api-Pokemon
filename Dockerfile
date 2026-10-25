FROM eclipse-temurin:21-jre
ARG JAR_FILE=target/project1-0.0.1.jar
COPY ${JAR_FILE} app_project1.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app_project1.jar"]