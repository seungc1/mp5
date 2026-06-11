package com.aivle.bookapp;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class BookCsvDataLoader implements CommandLineRunner {

    private static final String CSV_PATH = "data/books.csv";

    private final BookRepository bookRepository;

    public BookCsvDataLoader(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (bookRepository.count() > 0) {
            return;
        }

        ClassPathResource resource = new ClassPathResource(CSV_PATH);

        if (!resource.exists()) {
            return;
        }

        List<List<String>> rows = readCsvRows(resource);

        if (rows.size() < 2) {
            return;
        }

        List<String> headers = rows.get(0);
        List<Book> books = new ArrayList<>();

        for (int index = 1; index < rows.size(); index++) {
            Map<String, String> row = toRowMap(headers, rows.get(index));
            Book book = toBook(row);

            if (book.getTitle() == null || book.getTitle().isBlank()
                    || book.getAuthor() == null || book.getAuthor().isBlank()) {
                continue;
            }

            books.add(book);
        }

        bookRepository.saveAll(books);
    }

    private List<List<String>> readCsvRows(ClassPathResource resource) throws Exception {
        List<List<String>> rows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder currentRow = new StringBuilder();
            boolean inQuotes = false;
            int nextChar;

            while ((nextChar = reader.read()) != -1) {
                char character = (char) nextChar;
                currentRow.append(character);

                if (character == '"') {
                    reader.mark(1);
                    int followingChar = reader.read();

                    if (followingChar == '"') {
                        currentRow.append((char) followingChar);
                    } else {
                        inQuotes = !inQuotes;

                        if (followingChar != -1) {
                            reader.reset();
                        }
                    }
                }

                if (character == '\n' && !inQuotes) {
                    rows.add(parseCsvRow(currentRow.toString()));
                    currentRow.setLength(0);
                }
            }

            if (!currentRow.isEmpty()) {
                rows.add(parseCsvRow(currentRow.toString()));
            }
        }

        return rows;
    }

    private List<String> parseCsvRow(String row) {
        List<String> values = new ArrayList<>();
        StringBuilder value = new StringBuilder();
        boolean inQuotes = false;

        for (int index = 0; index < row.length(); index++) {
            char character = row.charAt(index);

            if (character == '"') {
                if (inQuotes && index + 1 < row.length() && row.charAt(index + 1) == '"') {
                    value.append('"');
                    index++;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (character == ',' && !inQuotes) {
                values.add(value.toString());
                value.setLength(0);
                continue;
            }

            if ((character == '\r' || character == '\n') && !inQuotes) {
                continue;
            }

            value.append(character);
        }

        values.add(value.toString());
        return values;
    }

    private Map<String, String> toRowMap(List<String> headers, List<String> values) {
        Map<String, String> row = new HashMap<>();

        for (int index = 0; index < headers.size(); index++) {
            row.put(headers.get(index), index < values.size() ? values.get(index) : "");
        }

        return row;
    }

    private Book toBook(Map<String, String> row) {
        Book book = new Book();

        book.setTitle(value(row, "title"));
        book.setAuthor(value(row, "author"));
        book.setPublisher(value(row, "publisher"));
        book.setYear(parseInteger(value(row, "year")));
        book.setType(value(row, "type"));
        book.setContent(value(row, "content"));
        book.setDescription(value(row, "description"));
        book.setCoverImageUrl(value(row, "coverImageUrl"));
        book.setCoverUrl(value(row, "coverUrl"));
        book.setIsbn(value(row, "isbn"));
        book.setIsAvailable(parseBoolean(value(row, "isAvailable")));
        book.setPrice(parseInteger(value(row, "price")) == null ? 0 : parseInteger(value(row, "price")));

        return book;
    }

    private String value(Map<String, String> row, String key) {
        String value = row.get(key);
        return value == null ? "" : value.trim();
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException error) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isBlank()) {
            return true;
        }

        return Boolean.parseBoolean(value.trim());
    }
}
