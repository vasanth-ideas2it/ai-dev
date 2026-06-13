package com.crm.job;

import com.crm.service.PurgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PurgeJob {

    private final PurgeService purgeService;

    // Runs daily at 02:00 server time
    @Scheduled(cron = "0 0 2 * * ?")
    public void run() {
        log.info("Starting soft-delete purge job");
        purgeService.purgeOldSoftDeleted();
    }
}
