package com.aivle.bookapp.repository;



import com.aivle.bookapp.entity.Book;

import org.springframework.data.jpa.repository.JpaRepository;



public interface BookRepository extends JpaRepository<Book, Long> {



}

