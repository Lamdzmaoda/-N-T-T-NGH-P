package org.example.backend.controller.AI;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;

import org.example.backend.service.AI.GeminiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiController {
    GeminiService geminiService;

    // Test API: GET /ai/chat?prompt=Hello
    @GetMapping("/chat")
    public ApiResponse<String> chat(@RequestParam String prompt) {
        return ApiResponse.<String>builder()
                .result(geminiService.generateText(prompt))
                .build();
    }
    @PostMapping("/assistant")
    public ApiResponse<String> chatAssistant(
            @RequestParam String chatId,
            @RequestParam String message) {
        return ApiResponse.<String>builder()
                .result(geminiService.chatWithAssistant(chatId, message))
                .build();
    }

}
