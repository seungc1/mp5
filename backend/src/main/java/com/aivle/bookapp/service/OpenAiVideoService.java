package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiVideoService {

    private final BookRepository bookRepository;
    private final RestTemplate restTemplate;

    @Value("${app.upload.path}")
    private String uploadPath;

    @Value("${app.ffmpeg.path}")
    private String ffmpegPath;

    public OpenAiVideoService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
        this.restTemplate = new RestTemplate();
    }

    public String getOrGenerateVideo(String title, String apiKey) {
        Book book = bookRepository.findByTitle(title)
                .orElseThrow(() -> new IllegalArgumentException("해당 제목의 책이 DB에 없습니다: " + title));

        // 1. 캐싱: 이미 영상 주소가 존재하면 즉시 반환
        if (book.getVideoUrl() != null && !book.getVideoUrl().isEmpty()) {
            System.out.println("👉 기존 DB에서 영상을 불러옵니다: " + book.getVideoUrl());
            return book.getVideoUrl();
        }

        System.out.println("--- 🎬 [" + title + "] 진짜 영상 제작 파이프라인 가동 ---");
        System.out.println("📂 업로드 경로: " + uploadPath);

        // [Step 1] GPT 대본 생성
        String script = generateScript(title, apiKey);
        System.out.println("✅ [1/3] GPT 대본 완성: " + script);

        // [Step 2] OpenAI TTS 음성 생성 및 파일 저장
        String audioFilePath = generateTtsAudio(title, script, apiKey);
        System.out.println("✅ [2/3] TTS 오디오 파일 생성 완료");

        // [Step 3] 표지 이미지 + TTS 오디오 → MP4 합성
        String videoWebUrl = mergeAudioAndVideoWithCover(book, audioFilePath);
        System.out.println("✅ [3/3] FFmpeg 비디오 합성 최종 완료!");

        // 완성된 웹 경로(/videos/파일명.mp4)를 DB에 저장
        book.setVideoUrl(videoWebUrl);
        bookRepository.save(book);

        return videoWebUrl;
    }

    // OpenAI GPT 대본 요청
    private String generateScript(String title, String apiKey) {
        String url = "https://api.openai.com/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", "책 '" + title + "'을 소개하는 15초짜리 유튜브 쇼츠용 대본을 작성해줘. 화면 지시문 없이 오직 나레이션 대사만 딱 2문장으로 짧게 한국어로 적어줘.");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> messageResponse = (Map<String, Object>) choices.get(0).get("message");
        return (String) messageResponse.get("content");
    }

    // OpenAI TTS 오디오 생성 및 저장
    private String generateTtsAudio(String title, String script, String apiKey) {
        String url = "https://api.openai.com/v1/audio/speech";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "tts-1");
        requestBody.put("input", script);
        requestBody.put("voice", "nova");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, entity, byte[].class);

        try {
            // application.properties 의 uploadPath 사용
            Path dir = Paths.get(uploadPath);
            if (!Files.exists(dir)) Files.createDirectories(dir);

            String cleanTitle = title.replaceAll("[^a-zA-Z0-9가-힣]", "_");
            String fileName = "audio_" + cleanTitle + "_" + System.currentTimeMillis() + ".mp3";
            Path filePath = dir.resolve(fileName);
            Files.write(filePath, response.getBody());

            System.out.println("🎵 오디오 저장 경로: " + filePath.toAbsolutePath());
            return filePath.toAbsolutePath().toString();
        } catch (Exception e) {
            throw new RuntimeException("오디오 저장 실패: " + e.getMessage(), e);
        }
    }

    // 표지 이미지 + 오디오 → MP4 합성 (FFmpeg)
    private String mergeAudioAndVideoWithCover(Book book, String audioPath) {
        System.out.println("⏳ FFmpeg 비디오 인코딩 시작...");

        String cleanTitle = book.getTitle().replaceAll("[^a-zA-Z0-9가-힣]", "_");
        String timestamp = String.valueOf(System.currentTimeMillis());

        // uploadPath 기준으로 파일 경로 구성
        Path dir = Paths.get(uploadPath);
        String imagePath = dir.resolve("temp_cover_" + cleanTitle + "_" + timestamp + ".png").toAbsolutePath().toString();
        String videoFileName = "final_video_" + cleanTitle + "_" + timestamp + ".mp4";
        String videoOutputPath = dir.resolve(videoFileName).toAbsolutePath().toString();

        System.out.println("🖼️  임시 이미지 경로: " + imagePath);
        System.out.println("🎬 출력 영상 경로: " + videoOutputPath);

        // 1. Base64 표지 이미지 → 파일 복원
        try {
            String base64Data = book.getCoverUrl();
            if (base64Data != null && base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            try (FileOutputStream fos = new FileOutputStream(imagePath)) {
                fos.write(imageBytes);
            }
        } catch (Exception e) {
            throw new RuntimeException("Base64 표지 이미지 복원 실패: " + e.getMessage(), e);
        }

        // 2. FFmpeg 실행 (application.properties 의 app.ffmpeg.path 사용)
        ProcessBuilder processBuilder = new ProcessBuilder(
                ffmpegPath, "-y",
                "-loop", "1", "-i", imagePath,
                "-i", audioPath,
                "-vf", "scale=720:-2",
                "-c:v", "libx264", "-tune", "stillimage",
                "-c:a", "aac", "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                videoOutputPath
        );
        processBuilder.inheritIO();

        try {
            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            // 임시 파일 정리
            new File(imagePath).delete();
            new File(audioPath).delete();

            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg 인코딩 실패. 종료 코드: " + exitCode);
            }

            // 실제 저장된 파일 절대경로: uploadPath/videoFileName
            // 프론트에 돌려줄 웹 경로: /videos/파일명.mp4
            // → Vite proxy /videos → Spring /videos/** → file:uploadPath/
            System.out.println("✅ 영상 저장 완료: " + videoOutputPath);
            System.out.println("🌐 프론트 접근 URL: /videos/" + videoFileName);
            return "/videos/" + videoFileName;

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("영상 합성 중 시스템 예외 발생: " + e.getMessage(), e);
        }
    }
}