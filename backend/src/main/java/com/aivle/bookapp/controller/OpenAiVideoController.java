package com.aivle.bookapp.controller;

import com.aivle.bookapp.DTO.VideoRequestDto;
import com.aivle.bookapp.service.OpenAiVideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(originPatterns = "*") // 프론트엔드 에러 방지
public class OpenAiVideoController {

    private final OpenAiVideoService openAiVideoService;

    public OpenAiVideoController(OpenAiVideoService openAiVideoService) {
        this.openAiVideoService = openAiVideoService;
    }

    // 프론트엔드가 요청을 쏘는 목적지
    @PostMapping("/generate")
    public ResponseEntity<String> generateBookVideo(@RequestBody VideoRequestDto request) {

        System.out.println("--- 🎬 프론트로부터 영상 제작 요청 수신! 책 제목: " + request.getTitle() + " ---");

        // 서비스에게 제목과 키를 던져주고 URL을 받아옴
        String resultVideoUrl = openAiVideoService.getOrGenerateVideo(request.getTitle(), request.getApiKey());

        // 상태 코드 200과 함께 영상 URL 리턴
        return ResponseEntity.ok(resultVideoUrl);
    }
}