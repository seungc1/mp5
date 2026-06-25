
FROM amazoncorretto:17-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]