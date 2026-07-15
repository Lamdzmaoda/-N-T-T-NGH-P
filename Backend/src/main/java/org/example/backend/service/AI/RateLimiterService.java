package org.example.backend.service.AI;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class RateLimiterService {
    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<Long>> requestHistory = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 3;
    private static final long ONE_MINUTE_MILLIS = 60000L;

    public boolean isAllowed(String userId) {
        long now = System.currentTimeMillis();
        requestHistory.putIfAbsent(userId, new ConcurrentLinkedQueue<>());
        ConcurrentLinkedQueue<Long> timestamps = requestHistory.get(userId);

        // Remove timestamps older than 1 minute
        while (!timestamps.isEmpty() && now - timestamps.peek() > ONE_MINUTE_MILLIS) {
            timestamps.poll();
        }

        if (timestamps.size() < MAX_REQUESTS_PER_MINUTE) {
            timestamps.add(now);
            return true;
        }
        return false;
    }
}
