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
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class OpenAiImageController {

    private static final String OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
    private static final String IMAGE_MODEL = "gpt-image-2";

    private final HttpClient client = HttpClient.newHttpClient();

    @PostMapping("/api/images/generate")
    public ResponseEntity<Map<String, String>> generateImage(@RequestBody ImageGenerateRequest request) {
        String apiKey = resolveApiKey(request.apiKey());

        if (apiKey.isBlank()) {
            return jsonResponse(400,
                    "OpenAI API key is required. Set OPENAI_API_KEY or enter a key.");
        }

        if (request.title() == null || request.title().trim().isEmpty()) {
            return jsonResponse(400, "Book title is required.");
        }

        try {
            System.out.println("Creating image started: title=" + valueOrEmpty(request.title()));
            String requestBody = """
                    {
                      "model": "%s",
                      "prompt": "%s",
                      "size": "1024x1024"
                    }
                    """.formatted(IMAGE_MODEL, jsonEscape(buildPrompt(request)));

            HttpRequest openAiRequest = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_IMAGE_URL))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(openAiRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String message = extractErrorMessage(response.body());
                return jsonResponse(response.statusCode(),
                        message.isBlank() ? "Image generation failed." : message);
            }

            String base64Image = extractJsonString(response.body(), "b64_json");
            String imageUrl = extractJsonString(response.body(), "url");

            if (!base64Image.isBlank()) {
                imageUrl = "data:image/png;base64," + base64Image;
            }

            if (imageUrl.isBlank()) {
                return jsonResponse(500, "OpenAI response did not include an image.");
            }

            System.out.println("Creating image completed.");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("imageUrl", imageUrl));
        } catch (IOException error) {
            return jsonResponse(500, "Image generation request failed: " + error.getMessage());
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            return jsonResponse(500, "Image generation request interrupted.");
        }
    }

    private String extractErrorMessage(String json) {
        String errorBlock = extractJsonObject(json, "error");
        String message = extractJsonString(errorBlock, "message");
        return message.isBlank() ? extractJsonString(json, "message") : message;
    }

    private String extractJsonObject(String json, String key) {
        if (json == null) {
            return "";
        }

        int keyStart = findJsonKey(json, key);
        if (keyStart < 0) {
            return "";
        }

        int start = findNextNonWhitespace(json, keyStart + key.length() + 2);
        if (start < 0 || json.charAt(start) != ':') {
            return "";
        }

        start = findNextNonWhitespace(json, start + 1);
        if (start < 0 || json.charAt(start) != '{') {
            return "";
        }

        int depth = 0;
        boolean inString = false;
        boolean escaped = false;

        for (int index = start; index < json.length(); index++) {
            char current = json.charAt(index);

            if (escaped) {
                escaped = false;
                continue;
            }

            if (current == '\\') {
                escaped = true;
                continue;
            }

            if (current == '"') {
                inString = !inString;
                continue;
            }

            if (inString) {
                continue;
            }

            if (current == '{') {
                depth++;
            } else if (current == '}') {
                depth--;

                if (depth == 0) {
                    return json.substring(start, index + 1);
                }
            }
        }

        return "";
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
                Create a professional modern book cover illustration using only the book information below.

                Title: %s
                Book description: %s

                Do not include readable text in the image.
                Use the title and description to infer the mood, subject, genre, and visual symbols.
                """.formatted(
                valueOrEmpty(request.title()),
                valueOrEmpty(request.bookDescription())
        );
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private ResponseEntity<Map<String, String>> jsonResponse(int status, String message) {
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("message", message));
    }

    private String extractJsonString(String json, String key) {
        if (json == null || json.isBlank()) {
            return "";
        }

        int keyStart = findJsonKey(json, key);
        if (keyStart < 0) {
            return "";
        }

        int valueStart = findNextNonWhitespace(json, keyStart + key.length() + 2);
        if (valueStart < 0 || json.charAt(valueStart) != ':') {
            return "";
        }

        valueStart = findNextNonWhitespace(json, valueStart + 1);
        if (valueStart < 0 || json.charAt(valueStart) != '"') {
            return "";
        }

        StringBuilder value = new StringBuilder();
        boolean escaped = false;

        for (int index = valueStart + 1; index < json.length(); index++) {
            char current = json.charAt(index);

            if (escaped) {
                value.append('\\').append(current);
                escaped = false;
                continue;
            }

            if (current == '\\') {
                escaped = true;
                continue;
            }

            if (current == '"') {
                return jsonUnescape(value.toString());
            }

            value.append(current);
        }

        return "";
    }

    private int findJsonKey(String json, String key) {
        String quotedKey = "\"" + key + "\"";
        boolean inString = false;
        boolean escaped = false;

        for (int index = 0; index <= json.length() - quotedKey.length(); index++) {
            char current = json.charAt(index);

            if (escaped) {
                escaped = false;
                continue;
            }

            if (current == '\\') {
                escaped = true;
                continue;
            }

            if (current == '"') {
                if (!inString && json.startsWith(quotedKey, index)) {
                    return index;
                }

                inString = !inString;
            }
        }

        return -1;
    }

    private int findNextNonWhitespace(String text, int start) {
        for (int index = start; index < text.length(); index++) {
            if (!Character.isWhitespace(text.charAt(index))) {
                return index;
            }
        }

        return -1;
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
            String content,
            String apiKey
    ) {
        public String bookDescription() {
            if (description != null && !description.trim().isEmpty()) {
                return description;
            }

            return content;
        }
    }
}
