package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
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

        // [Step 1] GPT 대본 생성 (진짜 통신)
        String script = generateScript(title, apiKey);
        System.out.println("✅ [1/3] GPT 대본 완성: " + script);

        // [Step 2] OpenAI TTS 음성 생성 및 파일 저장 (진짜 통신)
        String audioFilePath = generateTtsAudio(title, script, apiKey);
        System.out.println("✅ [2/3] TTS 오디오 파일 생성 완료");

        // [Step 3] Base64 표지 이미지 + TTS 오디오 합쳐서 진짜 MP4 영상 빌드 (FFmpeg 엔진 가동)
        String videoWebUrl = mergeAudioAndVideoWithCover(book, audioFilePath);
        System.out.println("✅ [3/3] FFmpeg 비디오 합성 최종 완료!");

        // 완성된 웹 주소(/videos/파일명.mp4)를 DB에 보관
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

    // OpenAI TTS 오디오 생성
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
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String cleanTitle = title.replaceAll(" ", "_");
            String fileName = "audio_" + cleanTitle + "_" + System.currentTimeMillis() + ".mp3";
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, response.getBody());

            return filePath.toAbsolutePath().toString();
        } catch (Exception e) {
            throw new RuntimeException("오디오 저장 실패", e);
        }
    }

    // 🔥 핵심: Base64 이미지를 풀어서 오디오와 함께 MP4 비디오로 합성하는 FFmpeg 로직
    private String mergeAudioAndVideoWithCover(Book book, String audioPath) {
        System.out.println("⏳ FFmpeg 비디오 인코딩 시작 (오디오 엔진 믹싱 중)...");

        String cleanTitle = book.getTitle().replaceAll(" ", "_");
        String timestamp = String.valueOf(System.currentTimeMillis());

        String imagePath = "uploads/temp_cover_" + cleanTitle + "_" + timestamp + ".png";
        String videoFileName = "final_video_" + cleanTitle + "_" + timestamp + ".mp4";
        String videoOutputPath = "uploads/" + videoFileName;

        // 1. DB의 Base64 텍스트를 진짜 이미지 파일(.png)로 물리적 복원
        try {
            String base64Data = book.getCoverUrl();
            // "data:image/png;base64," 같은 접두사가 붙어있다면 잘라냅니다.
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            try (FileOutputStream fos = new FileOutputStream(imagePath)) {
                fos.write(imageBytes);
            }
        } catch (Exception e) {
            throw new RuntimeException("DB의 Base64 표지 이미지를 파일로 복원하는데 실패했습니다.", e);
        }

        // 2. 외부 프로세스로 FFmpeg 명령어 실행 (이미지 1장 + mp3 ➔ mp4 비디오 완성)
        // 오디오 길이에 딱 맞춰 영상이 끝나도록 설정(-shortest)
        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg", "-y",
                "-loop", "1", "-i", imagePath,
                "-i", audioPath,
                "-vf", "scale=720:-2", // 👈 [핵심 추가] 어떤 이미지가 와도 가로 720, 세로 짝수로 맞춰주는 마법의 필터
                "-c:v", "libx264", "-tune", "stillimage",
                "-c:a", "aac", "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                videoOutputPath
        );



        // 🔥 [이 줄을 무조건 추가하세요!] 외부 프로세스의 로그 버퍼가 터지는 것을 막아주는 마법의 한 줄
        processBuilder.inheritIO();





        try {
            Process process = processBuilder.start();
            int exitCode = process.waitFor(); // 영상 변환이 완료될 때까지 안전하게 대기

            // 3. 작업에 사용된 임시 표지 이미지 파일 및 원본 mp3 깔끔하게 청소(삭제)
            new File(imagePath).delete();
            new File(audioPath).delete();

            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg 인코딩 에러가 발생했습니다. 에러 코드: " + exitCode);
            }

            // WebConfig에 설정해둔 주소 형식으로 리턴 (/videos/파일명.mp4)
            return "/videos/" + videoFileName;

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("영상 합성 중 시스템 예외 발생", e);
        }
    }
}