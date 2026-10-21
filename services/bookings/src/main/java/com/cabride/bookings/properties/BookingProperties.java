package com.cabride.bookings.properties;

import java.math.BigDecimal;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cabride.fare")
public class BookingProperties {

    private BigDecimal baseFare = BigDecimal.valueOf(30.00);

    private BigDecimal perKm = BigDecimal.valueOf(12.00);

    private BigDecimal minimum = BigDecimal.valueOf(50.00);

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(BigDecimal baseFare) {
        this.baseFare = baseFare;
    }

    public BigDecimal getPerKm() {
        return perKm;
    }

    public void setPerKm(BigDecimal perKm) {
        this.perKm = perKm;
    }

    public BigDecimal getMinimum() {
        return minimum;
    }

    public void setMinimum(BigDecimal minimum) {
        this.minimum = minimum;
    }

}
