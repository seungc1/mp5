package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;

@Service
public class BookService {

    private static final Path CSV_PATH = Path.of("runtime-data", "books.csv");
    private static final List<String> CSV_HEADERS = List.of(
            "title",
            "author",
            "publisher",
            "year",
            "type",
            "content",
            "description",
            "coverImageUrl",
            "coverUrl",
            "videoUrl",
            "isbn",
            "isAvailable",
            "price"
    );

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    public Book findBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found. ID: " + id));
    }

    public Book createBook(Book book) {
        Book savedBook = bookRepository.save(book);
        saveBooksToCsv();
        return savedBook;
    }

    public Book updateBook(Long id, Book updatedBook) {
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found. ID: " + id));

        existingBook.setTitle(updatedBook.getTitle());
        existingBook.setAuthor(updatedBook.getAuthor());
        existingBook.setPublisher(updatedBook.getPublisher());
        existingBook.setYear(updatedBook.getYear());
        existingBook.setType(updatedBook.getType());
        existingBook.setContent(updatedBook.getContent());
        existingBook.setDescription(updatedBook.getDescription());
        existingBook.setCoverImageUrl(updatedBook.getCoverImageUrl());
        existingBook.setCoverUrl(updatedBook.getCoverUrl());
        existingBook.setVideoUrl(updatedBook.getVideoUrl());
        existingBook.setIsbn(updatedBook.getIsbn());
        existingBook.setIsAvailable(updatedBook.getIsAvailable());
        existingBook.setPrice(updatedBook.getPrice());

        Book savedBook = bookRepository.save(existingBook);
        saveBooksToCsv();
        return savedBook;
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
        saveBooksToCsv();
    }

    public void saveBooksToCsv() {
        try {
            Path parent = CSV_PATH.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }

            List<Book> books = bookRepository.findAll().stream()
                    .sorted(Comparator.comparing(Book::getId, Comparator.nullsLast(Long::compareTo)))
                    .toList();

            try (BufferedWriter writer = Files.newBufferedWriter(CSV_PATH, StandardCharsets.UTF_8)) {
                writer.write(String.join(",", CSV_HEADERS));
                writer.newLine();

                for (Book book : books) {
                    writer.write(toCsvRow(book));
                    writer.newLine();
                }
            }
        } catch (IOException error) {
            throw new IllegalStateException("books.csv 저장에 실패했습니다.", error);
        }
    }

    private String toCsvRow(Book book) {
        return String.join(",",
                csvValue(book.getTitle()),
                csvValue(book.getAuthor()),
                csvValue(book.getPublisher()),
                csvValue(book.getYear()),
                csvValue(book.getType()),
                csvValue(book.getContent()),
                csvValue(book.getDescription()),
                csvValue(book.getCoverImageUrl()),
                csvValue(book.getCoverUrl()),
                csvValue(book.getVideoUrl()),
                csvValue(book.getIsbn()),
                csvValue(book.getIsAvailable()),
                csvValue(book.getPrice())
        );
    }

    private String csvValue(Object value) {
        if (value == null) {
            return "";
        }

        String text = String.valueOf(value);
        if (text.contains("\"") || text.contains(",") || text.contains("\n") || text.contains("\r")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }

        return text;
    }
}
