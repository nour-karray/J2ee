package com.entreprise.missions.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.entreprise.missions")
@EntityScan(basePackages = "com.entreprise.missions.data.model")
@EnableJpaRepositories(basePackages = "com.entreprise.missions.data.repository")
public class PlateformeMissionsApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlateformeMissionsApplication.class, args);
    }
}
