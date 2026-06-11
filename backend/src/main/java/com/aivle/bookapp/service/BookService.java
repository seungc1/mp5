package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

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
        return bookRepository.save(book);
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
        existingBook.setIsbn(updatedBook.getIsbn());
        existingBook.setIsAvailable(updatedBook.getIsAvailable());
        existingBook.setPrice(updatedBook.getPrice());

        return bookRepository.save(existingBook);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }
}
