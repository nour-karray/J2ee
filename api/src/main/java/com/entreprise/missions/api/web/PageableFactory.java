package com.entreprise.missions.api.web;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PageableFactory {

    private PageableFactory() {
    }

    public static Pageable create(int page, int size, String sort, String defaultField) {
        String field = defaultField;
        Sort.Direction direction = Sort.Direction.DESC;

        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            field = parts[0].trim();
            if (parts.length > 1) {
                direction = Sort.Direction.fromOptionalString(parts[1].trim().toUpperCase()).orElse(Sort.Direction.DESC);
            }
        }

        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(direction, field));
    }
}
