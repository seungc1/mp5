package com.aivle.bookapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.disable())
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/h2-console/**").permitAll()

                        .requestMatchers(
                                "/api/users/signup",
                                "/api/users/login",
                                "/api/users/me"
                        ).permitAll()

                        .requestMatchers(
                                "/books",
                                "/books/**",
                                "/api/books/search",
                                "/api/images/generate",
                                "/api/videos/generate",
                                "/videos/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/users/mypage",
                                "/api/users/logout"
                        ).authenticated()

                        .anyRequest().permitAll()
                );

        return http.build();
    }
}