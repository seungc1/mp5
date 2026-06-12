package com.aivle.bookapp;

import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class LibraryXmlParser {

    public List<Map<String, String>> parseBooks(String responseXml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            Document document = factory.newDocumentBuilder()
                    .parse(new InputSource(new StringReader(responseXml)));
            document.getDocumentElement().normalize();

            NodeList itemNodes = document.getElementsByTagName("item");

            if (itemNodes.getLength() == 0) {
                itemNodes = document.getElementsByTagName("doc");
            }
            List<Map<String, String>> books = new ArrayList<>();
            Set<String> seenBookKeys = new HashSet<>();

            for (int index = 0; index < itemNodes.getLength(); index++) {
                Node node = itemNodes.item(index);

                if (node.getNodeType() != Node.ELEMENT_NODE) {
                    continue;
                }

                Element item = (Element) node;
                Map<String, String> book = new LinkedHashMap<>();

                String title = firstText(item, "titleInfo", "title_info", "title", "bookname");
                String author = firstText(item, "authorInfo", "author_info", "author", "authors");
                String publisher = firstText(item, "pubInfo", "pub_info", "publisher", "pub");
                String publishedYear = firstText(item, "pubYear", "pub_year", "publicationYear", "pubDate", "pub_date");
                String isbn = firstText(item, "isbn", "isbn13", "eaIsbn", "ea_isbn");
                String cover = firstText(item, "imageUrl", "image_url", "cover", "bookImageURL", "book_image_url");
                String id = firstText(item, "controlNo", "control_no", "bookKey", "book_key");

                if (id.isEmpty()) {
                    id = !isbn.isEmpty() ? isbn : title;
                }

                if (id.isEmpty() && title.isEmpty() && author.isEmpty() && publisher.isEmpty()) {
                    continue;
                }

                String uniqueKey = normalizeBookKey(isbn, id, title, author, publisher, publishedYear);

                if (!seenBookKeys.add(uniqueKey)) {
                    continue;
                }

                book.put("id", id);
                book.put("title", title);
                book.put("author", author);
                book.put("publisher", publisher);
                book.put("publishedYear", publishedYear);
                book.put("isbn", isbn);
                book.put("cover", cover);
                book.put("source", "library");

                books.add(book);
            }

            return books;
        } catch (Exception error) {
            throw new IllegalArgumentException("Library API response parsing failed.", error);
        }
    }

    private String firstText(Element element, String... tagNames) {
        NodeList descendants = element.getElementsByTagName("*");

        for (String tagName : tagNames) {
            String normalizedTagName = normalizeTagName(tagName);

            for (int index = 0; index < descendants.getLength(); index++) {
                Node node = descendants.item(index);

                if (!normalizedTagName.equals(normalizeTagName(node.getNodeName()))) {
                    continue;
                }

                String text = node.getTextContent().trim();

                if (!text.isBlank()) {
                    return text;
                }
            }
        }

        return "";
    }

    private String normalizeTagName(String tagName) {
        return tagName.replaceAll("[^A-Za-z0-9]", "").toLowerCase();
    }

    private String normalizeBookKey(
            String isbn,
            String id,
            String title,
            String author,
            String publisher,
            String publishedYear
    ) {
        String key = !isbn.isBlank() ? isbn : id;

        if (key.isBlank()) {
            key = title + "|" + author + "|" + publisher + "|" + publishedYear;
        }

        return key.replaceAll("\\s+", "").toLowerCase();
    }
}
