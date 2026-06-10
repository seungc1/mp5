package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import org.springframework.stereotype.Service;

import com.aivle.bookapp.reposiitory.BookRepository;

import java.util.List;

@Service // 스프링에게 "이건 비즈니스 로직을 처리하는 서비스 클래스야"라고 명시합니다.
public class BookService {

    private final BookRepository bookRepository;

    // 생성자 주입: DB와 통신할 Repository를 가져옵니다.
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // [R] 전체 도서 목록 조회
    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    // [R] 특정 도서 단건 조회
    public Book findBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 책을 찾을 수 없습니다. ID: " + id));
    }

    // [C] 신규 도서 등록 (DB에 저장)
    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    // [U] 기존 도서 수정
    public Book updateBook(Long id, Book updatedBook) {
        // 1. 기존 책이 DB에 있는지 먼저 확인하고 꺼내옵니다.
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("수정할 책이 없습니다. ID: " + id));

        // 2. 새로 넘어온 정보로 기존 책의 내용을 덮어씌웁니다. (엔티티에 만들어둔 @Setter 활용)
        existingBook.setTitle(updatedBook.getTitle());
        existingBook.setAuthor(updatedBook.getAuthor());
        existingBook.setPrice(updatedBook.getPrice());
        // 필요하다면 기존 구조에 맞춰 다른 필드들도 수정할 수 있게 여기에 추가합니다.

        // 3. 수정된 책을 다시 DB에 덮어쓰기(저장) 합니다.
        return bookRepository.save(existingBook);
    }

    // [D] 도서 삭제
    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }
}