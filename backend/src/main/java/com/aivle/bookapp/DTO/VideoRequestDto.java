package com.aivle.bookapp.DTO;

import lombok.Data;

@Data
public class VideoRequestDto {
    private String title;   // 프론트에서 입력한 책 제목
    private String apiKey;  // 1회용으로 쓰고 버릴 OpenAI 키
}