package com.cabride.bookings.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cabride.bookings.dto.ApiResponseDto;
import com.cabride.bookings.dto.RideResponse;
import com.cabride.bookings.services.BookingsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bookings/api/v1")
@RequiredArgsConstructor
public class BookingsController {

    private final BookingsService bookingsService;

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('RIDER','DRIVER')")
    public ResponseEntity<ApiResponseDto<List<RideResponse>>> myRides() {
        return ResponseEntity.ok(ApiResponseDto.<List<RideResponse>>builder()
                .data(bookingsService.myRides()).build());
    }

}
