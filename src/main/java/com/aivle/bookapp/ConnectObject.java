package com.aivle.bookapp;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Component
public class ConnectObject {

    private final APIKEY api = APIKEY.getInstance();
    private final HttpClient client = HttpClient.newHttpClient();

    public String connect(String keyword) {
        String endpoint = api.getURL();
        String apiKey = api.getApiKey();

        String url = endpoint
                + "?key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
                + "&kwd=" + URLEncoder.encode(keyword, StandardCharsets.UTF_8)
                + "&pageNum=1"
                + "&pageSize=10";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .header("Accept", "application/xml")
                .build();

        try {
            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();

        } catch (IOException e) {
            return "Request failed: " + e.getMessage();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Request interrupted: " + e.getMessage();

        } catch (IllegalArgumentException e) {
            return "Invalid endpoint URI: " + e.getMessage();
        }
    }
}