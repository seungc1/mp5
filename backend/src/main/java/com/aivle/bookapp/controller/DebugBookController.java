package com.aivle.bookapp.controller;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugBookController {

    private final BookRepository bookRepository;

    public DebugBookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping(value = "/debug/books", produces = MediaType.TEXT_HTML_VALUE)
    public String booksTable() {
        StringBuilder html = new StringBuilder();

        html.append("""
                <!doctype html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>Book DB Contents</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #222; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
                    th { background: #f3f4f6; }
                    td { max-width: 260px; overflow-wrap: anywhere; }
                  </style>
                </head>
                <body>
                <h1>Book DB Contents</h1>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Publisher</th>
                      <th>Year</th>
                      <th>Type</th>
                      <th>ISBN</th>
                      <th>Price</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                """);

        for (Book book : bookRepository.findAll()) {
            html.append("<tr>")
                    .append("<td>").append(escape(book.getId())).append("</td>")
                    .append("<td>").append(escape(book.getTitle())).append("</td>")
                    .append("<td>").append(escape(book.getAuthor())).append("</td>")
                    .append("<td>").append(escape(book.getPublisher())).append("</td>")
                    .append("<td>").append(escape(book.getYear())).append("</td>")
                    .append("<td>").append(escape(book.getType())).append("</td>")
                    .append("<td>").append(escape(book.getIsbn())).append("</td>")
                    .append("<td>").append(escape(book.getPrice())).append("</td>")
                    .append("<td>").append(escape(book.getIsAvailable())).append("</td>")
                    .append("</tr>");
        }

        html.append("""
                  </tbody>
                </table>
                </body>
                </html>
                """);

        return html.toString();
    }

    private String escape(Object value) {
        if (value == null) {
            return "";
        }

        return value.toString()
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
