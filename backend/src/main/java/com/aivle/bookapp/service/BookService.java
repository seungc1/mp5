package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private static final Path BOOK_CSV_PATH = Path.of(
            "backend", "src", "main", "resources", "data", "books.csv"
    );
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

    private void saveBooksToCsv() {
        try {
            Files.createDirectories(BOOK_CSV_PATH.getParent());

            try (BufferedWriter writer = Files.newBufferedWriter(BOOK_CSV_PATH, StandardCharsets.UTF_8)) {
                writer.write(String.join(",", CSV_HEADERS));
                writer.newLine();

                for (Book book : bookRepository.findAll()) {
                    writer.write(toCsvLine(List.of(
                            valueOrEmpty(book.getTitle()),
                            valueOrEmpty(book.getAuthor()),
                            valueOrEmpty(book.getPublisher()),
                            valueOrEmpty(book.getYear()),
                            valueOrEmpty(book.getType()),
                            valueOrEmpty(book.getContent()),
                            valueOrEmpty(book.getDescription()),
                            valueOrEmpty(book.getCoverImageUrl()),
                            valueOrEmpty(book.getCoverUrl()),
                            valueOrEmpty(book.getVideoUrl()),
                            valueOrEmpty(book.getIsbn()),
                            valueOrEmpty(book.getIsAvailable()),
                            valueOrEmpty(book.getPrice())
                    )));
                    writer.newLine();
                }
            }
        } catch (IOException error) {
            throw new IllegalStateException("Book CSV save failed.", error);
        }
    }

    private String toCsvLine(List<String> values) {
        return values.stream()
                .map(this::escapeCsvValue)
                .collect(Collectors.joining(","));
    }

    private String escapeCsvValue(String value) {
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private String valueOrEmpty(Object value) {
        return value == null ? "" : value.toString();
    }
}
