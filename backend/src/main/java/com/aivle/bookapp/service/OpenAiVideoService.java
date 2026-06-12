package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.Book;
import com.aivle.bookapp.repository.BookRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class OpenAiVideoService {

    private final BookRepository bookRepository;
    private final BookService bookService;
    private final RestTemplate restTemplate;

    @Value("${app.upload.path}")
    private String uploadPath;

    @Value("${app.ffmpeg.path}")
    private String ffmpegPath;

    public OpenAiVideoService(BookRepository bookRepository, BookService bookService) {
        this.bookRepository = bookRepository;
        this.bookService = bookService;
        this.restTemplate = new RestTemplate();
    }

    public String getOrGenerateVideo(String title, String apiKey) {
        String resolvedApiKey = resolveApiKey(apiKey);

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("책 제목이 필요합니다.");
        }

        if (resolvedApiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API Key가 필요합니다. OPENAI_API_KEY를 설정하거나 화면에서 입력해주세요.");
        }

        Book book = bookRepository.findByTitle(title)
                .orElseThrow(() -> new IllegalArgumentException("해당 제목의 책이 DB에 없습니다: " + title));

        // 1. 캐싱: 이미 영상 주소가 존재하면 즉시 반환
        if (book.getVideoUrl() != null && !book.getVideoUrl().isEmpty()) {
            System.out.println("👉 기존 DB에서 영상을 불러옵니다: " + book.getVideoUrl());
            return book.getVideoUrl();
        }

        String ffmpegCommand = resolveFfmpegCommand();

        System.out.println("--- 🎬 [" + title + "] 진짜 영상 제작 파이프라인 가동 ---");
        System.out.println("📂 업로드 경로: " + uploadPath);
        System.out.println("🎞️ FFmpeg 실행 파일: " + ffmpegCommand);

        // [Step 1] GPT 대본 생성
        String script = generateScript(title, resolvedApiKey);
        System.out.println("✅ [1/3] GPT 대본 완성: " + script);

        // [Step 2] OpenAI TTS 음성 생성 및 파일 저장
        String audioFilePath = generateTtsAudio(title, script, resolvedApiKey);
        System.out.println("✅ [2/3] TTS 오디오 파일 생성 완료");

        // [Step 3] 표지 이미지 + TTS 오디오 → MP4 합성
        String videoWebUrl = mergeAudioAndVideoWithCover(book, audioFilePath, ffmpegCommand);
        System.out.println("✅ [3/3] FFmpeg 비디오 합성 최종 완료!");

        // 완성된 웹 경로(/videos/파일명.mp4)를 DB에 저장
        book.setVideoUrl(videoWebUrl);
        bookRepository.save(book);
        bookService.saveBooksToCsv();

        return videoWebUrl;
    }

    private String resolveFfmpegCommand() {
        String configuredPath = ffmpegPath == null ? "" : ffmpegPath.trim();
        String command = configuredPath.isBlank() ? "ffmpeg" : configuredPath;

        boolean looksLikePath = command.contains("/") || command.contains("\\") || command.endsWith(".exe");
        if (looksLikePath && !Files.exists(Paths.get(command))) {
            throw new IllegalStateException(
                    "FFmpeg 실행 파일을 찾을 수 없습니다: " + command
                            + ". application.properties의 app.ffmpeg.path를 실제 ffmpeg.exe 경로로 수정하거나, FFmpeg를 PATH에 등록한 뒤 app.ffmpeg.path=ffmpeg 로 설정해주세요."
            );
        }

        ProcessBuilder versionCheck = new ProcessBuilder(command, "-version");
        versionCheck.redirectErrorStream(true);

        try {
            Process process = versionCheck.start();
            boolean finished = process.waitFor(10, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new IllegalStateException("FFmpeg 실행 확인 시간이 초과되었습니다: " + command);
            }

            if (process.exitValue() != 0) {
                throw new IllegalStateException("FFmpeg 실행 확인에 실패했습니다: " + command);
            }
        } catch (IOException error) {
            throw new IllegalStateException(
                    "FFmpeg를 실행할 수 없습니다: " + command
                            + ". FFmpeg가 설치되어 있고 app.ffmpeg.path가 올바른지 확인해주세요.",
                    error
            );
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("FFmpeg 실행 확인이 중단되었습니다.", error);
        }

        return command;
    }

    private String resolveApiKey(String requestApiKey) {
        if (requestApiKey != null && !requestApiKey.trim().isEmpty()) {
            return requestApiKey.trim();
        }

        String environmentApiKey = System.getenv("OPENAI_API_KEY");
        return environmentApiKey == null ? "" : environmentApiKey.trim();
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
        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(url, entity, Map.class);
        } catch (HttpStatusCodeException error) {
            throw new RuntimeException("대본 생성 실패: " + extractOpenAiError(error.getResponseBodyAsString()), error);
        }

        if (response.getBody() == null || response.getBody().get("choices") == null) {
            throw new RuntimeException("대본 생성 실패: OpenAI 응답에 choices가 없습니다.");
        }

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
        ResponseEntity<byte[]> response;
        try {
            response = restTemplate.exchange(url, HttpMethod.POST, entity, byte[].class);
        } catch (HttpStatusCodeException error) {
            throw new RuntimeException("TTS 음성 생성 실패: " + extractOpenAiError(error.getResponseBodyAsString()), error);
        }

        if (response.getBody() == null || response.getBody().length == 0) {
            throw new RuntimeException("TTS 음성 생성 실패: 응답 오디오가 비어 있습니다.");
        }

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
        } catch (IOException e) {
            throw new RuntimeException("오디오 저장 실패: " + e.getMessage(), e);
        }
    }

    // 표지 이미지 + 오디오 → MP4 합성 (FFmpeg)
    private String mergeAudioAndVideoWithCover(Book book, String audioPath, String ffmpegCommand) {
        System.out.println("⏳ FFmpeg 비디오 인코딩 시작...");

        String cleanTitle = book.getTitle().replaceAll("[^a-zA-Z0-9가-힣]", "_");
        String timestamp = String.valueOf(System.currentTimeMillis());

        // uploadPath 기준으로 파일 경로 구성
        Path dir = Paths.get(uploadPath);
        try {
            Files.createDirectories(dir);
        } catch (IOException error) {
            throw new RuntimeException("업로드 폴더를 만들 수 없습니다: " + dir.toAbsolutePath(), error);
        }

        String imagePath = dir.resolve("temp_cover_" + cleanTitle + "_" + timestamp + ".png").toAbsolutePath().toString();
        String videoFileName = "final_video_" + cleanTitle + "_" + timestamp + ".mp4";
        String videoOutputPath = dir.resolve(videoFileName).toAbsolutePath().toString();
        Path ffmpegLogPath = dir.resolve("ffmpeg_" + cleanTitle + "_" + timestamp + ".log");

        System.out.println("🖼️  임시 이미지 경로: " + imagePath);
        System.out.println("🎬 출력 영상 경로: " + videoOutputPath);

        // 1. 표지 이미지 → 파일 복원
        try {
            byte[] imageBytes = resolveCoverImageBytes(book);
            try (FileOutputStream fos = new FileOutputStream(imagePath)) {
                fos.write(imageBytes);
            }
        } catch (Exception e) {
            throw new RuntimeException("표지 이미지 준비 실패: " + e.getMessage(), e);
        }

        // 2. FFmpeg 실행 (application.properties 의 app.ffmpeg.path 사용)
        ProcessBuilder processBuilder = new ProcessBuilder(
                ffmpegCommand, "-y",
                "-loop", "1", "-i", imagePath,
                "-i", audioPath,
                "-vf", "scale=720:-2",
                "-c:v", "libx264", "-tune", "stillimage",
                "-c:a", "aac", "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                videoOutputPath
        );
        processBuilder.redirectErrorStream(true);
        processBuilder.redirectOutput(ffmpegLogPath.toFile());

        try {
            Process process = processBuilder.start();
            boolean finished = process.waitFor(2, TimeUnit.MINUTES);

            // 임시 파일 정리
            new File(imagePath).delete();
            new File(audioPath).delete();

            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("FFmpeg 인코딩 시간이 초과되었습니다. 로그: " + ffmpegLogPath.toAbsolutePath());
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg 인코딩 실패. 종료 코드: " + exitCode + ". 로그: " + readShortLog(ffmpegLogPath));
            }

            // 실제 저장된 파일 절대경로: uploadPath/videoFileName
            // 프론트에 돌려줄 웹 경로: /videos/파일명.mp4
            // → Vite proxy /videos → Spring /videos/** → file:uploadPath/
            System.out.println("✅ 영상 저장 완료: " + videoOutputPath);
            System.out.println("🌐 프론트 접근 URL: /videos/" + videoFileName);
            return "/videos/" + videoFileName;

        } catch (IOException e) {
            throw new RuntimeException("영상 합성 중 시스템 예외 발생: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("영상 합성 중 시스템 예외 발생: " + e.getMessage(), e);
        }
    }

    private String readShortLog(Path logPath) {
        try {
            if (!Files.exists(logPath)) {
                return logPath.toAbsolutePath().toString();
            }

            String log = Files.readString(logPath);
            if (log.length() <= 1200) {
                return log;
            }

            return log.substring(log.length() - 1200);
        } catch (IOException error) {
            return logPath.toAbsolutePath().toString();
        }
    }

    private byte[] resolveCoverImageBytes(Book book) throws IOException {
        String coverSource = firstNonBlank(book.getCoverUrl(), book.getCoverImageUrl());

        if (coverSource.isBlank()) {
            throw new IllegalArgumentException("책 표지 이미지가 없습니다. 먼저 표지를 등록하거나 AI 표지를 생성해주세요.");
        }

        if (coverSource.startsWith("data:image")) {
            int commaIndex = coverSource.indexOf(',');
            if (commaIndex < 0) {
                throw new IllegalArgumentException("data URL 표지 이미지 형식이 올바르지 않습니다.");
            }

            return Base64.getDecoder().decode(coverSource.substring(commaIndex + 1));
        }

        if (coverSource.startsWith("http://") || coverSource.startsWith("https://")) {
            try {
                ResponseEntity<byte[]> response = restTemplate.getForEntity(URI.create(coverSource), byte[].class);
                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || response.getBody().length == 0) {
                    throw new IllegalArgumentException("표지 이미지 URL에서 이미지를 가져오지 못했습니다.");
                }
                return response.getBody();
            } catch (Exception error) {
                throw new IllegalArgumentException("표지 이미지 URL 다운로드 실패: " + error.getMessage(), error);
            }
        }

        Path coverPath = Paths.get(coverSource);
        if (Files.exists(coverPath)) {
            return Files.readAllBytes(coverPath);
        }

        return Base64.getDecoder().decode(coverSource);
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.trim().isEmpty()) {
            return first.trim();
        }

        return second == null ? "" : second.trim();
    }

    private String extractOpenAiError(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "OpenAI API 오류가 발생했습니다.";
        }

        String marker = "\"message\"";
        int markerIndex = responseBody.indexOf(marker);
        if (markerIndex < 0) {
            return responseBody;
        }

        int colonIndex = responseBody.indexOf(':', markerIndex + marker.length());
        int firstQuoteIndex = responseBody.indexOf('"', colonIndex + 1);
        int secondQuoteIndex = responseBody.indexOf('"', firstQuoteIndex + 1);

        if (colonIndex < 0 || firstQuoteIndex < 0 || secondQuoteIndex < 0) {
            return responseBody;
        }

        return responseBody.substring(firstQuoteIndex + 1, secondQuoteIndex);
    }
}
