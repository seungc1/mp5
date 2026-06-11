package com.aivle.bookapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.path}")
    private String uploadPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // "C:/Backend/mp555/uploads" → "file:C:/Backend/mp555/uploads/"
        // 경로 끝에 슬래시가 없으면 자동으로 붙여줌
        String location = uploadPath.endsWith("/") || uploadPath.endsWith("\\")
                ? "file:" + uploadPath
                : "file:" + uploadPath + "/";

        System.out.println("📂 정적 파일 서빙 경로: " + location);

        registry.addResourceHandler("/videos/**")
                .addResourceLocations(location);
    }
}