package com.aivle.bookapp.controller;

import com.aivle.bookapp.ConnectObject;
import com.aivle.bookapp.LibraryXmlParser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class LibrarySearchController {

    private final ConnectObject connectObject;
    private final LibraryXmlParser libraryXmlParser;

    public LibrarySearchController(ConnectObject connectObject, LibraryXmlParser libraryXmlParser) {
        this.connectObject = connectObject;
        this.libraryXmlParser = libraryXmlParser;
    }

    @GetMapping("/api/books/search")
    public ResponseEntity<?> searchBooks(@RequestParam String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "keyword is required"));
        }

        String responseXml = connectObject.connect(keyword.trim());

        if (responseXml.startsWith("Request failed:")
                || responseXml.startsWith("Request interrupted:")
                || responseXml.startsWith("Invalid endpoint URI:")) {
            return ResponseEntity.internalServerError().body(Map.of("message", responseXml));
        }

        try {
            return ResponseEntity.ok(Map.of("books", libraryXmlParser.parseBooks(responseXml)));
        } catch (Exception error) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Library API response parsing failed: " + error.getMessage()));
        }
    }
}
