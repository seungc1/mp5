package com.aivle.bookapp.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class OpenAiImageController {

    private static final String OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";

    private final HttpClient client = HttpClient.newHttpClient();

    @PostMapping("/api/images/generate")
    public ResponseEntity<String> generateImage(@RequestBody String requestBodyJson) {
        ImageGenerateRequest request = parseRequest(requestBodyJson);
        String apiKey = resolveApiKey(request.apiKey());

        if (apiKey.isBlank()) {
            return jsonResponse(400, "message",
                    "OpenAI API key is required. Set OPENAI_API_KEY or enter a key.");
        }

        if (request.title() == null || request.title().trim().isEmpty()) {
            return jsonResponse(400, "message", "Book title is required.");
        }

        try {
            String prompt = buildPrompt(request);
            String requestBody = """
                    {
                      "model": "gpt-image-2",
                      "prompt": "%s",
                      "size": "1024x1024"
                    }
                    """.formatted(jsonEscape(prompt));

            HttpRequest openAiRequest = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_IMAGE_URL))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(openAiRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String message = extractJsonString(response.body(), "message");
                return jsonResponse(response.statusCode(), "message",
                        message.isBlank() ? "Image generation failed." : message);
            }

            String base64Image = extractJsonString(response.body(), "b64_json");
            String imageUrl = extractJsonString(response.body(), "url");

            if (!base64Image.isBlank()) {
                imageUrl = "data:image/png;base64," + base64Image;
            }

            if (imageUrl.isBlank()) {
                return jsonResponse(500, "message", "OpenAI response did not include an image.");
            }

            return jsonResponse(200, "imageUrl", imageUrl);
        } catch (IOException error) {
            return jsonResponse(500, "message", "Image generation request failed: " + error.getMessage());
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            return jsonResponse(500, "message", "Image generation request interrupted.");
        }
    }

    private ImageGenerateRequest parseRequest(String requestBodyJson) {
        return new ImageGenerateRequest(
                extractJsonString(requestBodyJson, "title"),
                extractJsonString(requestBodyJson, "author"),
                extractJsonString(requestBodyJson, "publisher"),
                extractJsonString(requestBodyJson, "description"),
                extractJsonString(requestBodyJson, "apiKey")
        );
    }

    private String resolveApiKey(String requestApiKey) {
        if (requestApiKey != null && !requestApiKey.trim().isEmpty()) {
            return requestApiKey.trim();
        }

        String environmentApiKey = System.getenv("OPENAI_API_KEY");
        return environmentApiKey == null ? "" : environmentApiKey.trim();
    }

    private String buildPrompt(ImageGenerateRequest request) {
        return """
                Book title: %s
                Author: %s
                Publisher: %s
                Book description: %s

                Create a polished book cover image based on this information.
                Do not include readable text in the image.
                Make it look like a professional modern book cover illustration.
                """.formatted(
                valueOrEmpty(request.title()),
                valueOrEmpty(request.author()),
                valueOrEmpty(request.publisher()),
                valueOrEmpty(request.description())
        );
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private ResponseEntity<String> jsonResponse(int status, String key, String value) {
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"" + jsonEscape(key) + "\":\"" + jsonEscape(value) + "\"}");
    }

    private String extractJsonString(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"((?:\\\\.|[^\"])*)\"");
        Matcher matcher = pattern.matcher(json);

        if (!matcher.find()) {
            return "";
        }

        return jsonUnescape(matcher.group(1));
    }

    private String jsonEscape(String value) {
        return value == null ? "" : value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String jsonUnescape(String value) {
        StringBuilder result = new StringBuilder();

        for (int index = 0; index < value.length(); index++) {
            char current = value.charAt(index);

            if (current != '\\' || index + 1 >= value.length()) {
                result.append(current);
                continue;
            }

            char escaped = value.charAt(++index);
            switch (escaped) {
                case 'n' -> result.append('\n');
                case 'r' -> result.append('\r');
                case 't' -> result.append('\t');
                case '"' -> result.append('"');
                case '\\' -> result.append('\\');
                default -> result.append(escaped);
            }
        }

        return result.toString();
    }

    public record ImageGenerateRequest(
            String title,
            String author,
            String publisher,
            String description,
            String apiKey
    ) {
    }
}
