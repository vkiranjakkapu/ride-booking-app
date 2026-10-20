package com.cabride.bookings.properties;

import java.math.BigDecimal;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cabride.fare")
public class BookingProperties {

    private final BigDecimal baseFare = BigDecimal.valueOf(30.00);

    private final BigDecimal perKm = BigDecimal.valueOf(12.00);

    private final BigDecimal minimum = BigDecimal.valueOf(50.00);

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public BigDecimal getPerKm() {
        return perKm;
    }

    public BigDecimal getMinimum() {
        return minimum;
    }

}
