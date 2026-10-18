package com.cabride.bookings.enums;

import com.platform.web.exception.ErrorDefinition;

public enum BookingErrors implements ErrorDefinition {
    RIDE_CONFLICT("RIDE_CONFLICT", "BUS-0001", "Conflict in ride update."),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "BUS-0002", "Resource not found");

    private String errorName;
    private String errorCode;
    private String errorMessage;

    BookingErrors(String errorName,
            String errorCode,
            String errorMessage) {
        this.errorName = errorName;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    @Override
    public String getErrorName() {
        return errorName;
    }

    @Override
    public String getErrorCode() {
        return errorCode;
    }

    @Override
    public String getErrorMessage() {
        return errorMessage;
    }

}
