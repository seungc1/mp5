//controller
package com.aivle.bookapp.controller;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.service.BookService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@CrossOrigin(originPatterns = "*")
public class BookController {

    private final BookService bookService;

    // 생성자 주입
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // [R] GET /books (전체 조회)
    @GetMapping
    public List<Book> getBooks() {
        return bookService.findAllBooks();
    }

    // [R] GET /books/{id} (단건 조회)
    @GetMapping("/{id}")
    public Book getBook(@PathVariable Long id) {
        return bookService.findBookById(id);
    }

    // [C] POST /books (신규 등록)
    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookService.createBook(book);
    }

    // [U] PATCH /books/{id} (정보 수정)
    @PatchMapping("/{id}")
    public Book updateBook(@PathVariable Long id, @RequestBody Book book) {
        return bookService.updateBook(id, book);
    }

    // [D] DELETE /books/{id} (도서 삭제)
    @DeleteMapping("/{id}")
    public void deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
    }
}