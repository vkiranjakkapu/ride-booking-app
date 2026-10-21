package com.cabride.bookings.interceptors;

import org.springframework.core.convert.converter.Converter;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.cabride.bookings.properties.WebSocketProperties;

@Component
public class StompAuthenticationInterceptor
        implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    private final Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter;

    private final WebSocketProperties properties;

    public StompAuthenticationInterceptor(
            JwtDecoder jwtDecoder,
            Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter, WebSocketProperties properties) {
        this.jwtDecoder = jwtDecoder;
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
        this.properties = properties;
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel) {

        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message, StompHeaderAccessor.class);

        if (accessor == null) {
            throw new AccessDeniedException(
                    "Missing STOMP message headers");
        }

        StompCommand command = accessor.getCommand();

        if (command == StompCommand.CONNECT) {
            authenticate(accessor);
            return message;
        }

        if (command == StompCommand.DISCONNECT) {
            return message;
        }

        // Every other permitted command requires authentication.
        if (accessor.getUser() == null) {
            throw new AccessDeniedException(
                    "Authentication required");
        }

        String destination = accessor.getDestination();

        if (command == StompCommand.SEND) {
            if (destination != null
                    && (destination.equals("/".concat(properties.getAppPrefix()))
                            || destination.startsWith("/".concat(properties.getAppPrefix()).concat("/")))) {
                return message;
            }

            throw new AccessDeniedException(
                    "Sending to this destination is not allowed");
        }

        if (command == StompCommand.SUBSCRIBE) {
            if (destination == null) {
                throw new AccessDeniedException("Subscription destination cannot be null");
            }

            String targetDestination = destination;
            String userPrefixToken = "/".concat(properties.getUserPrefix()).concat("/");
            if (targetDestination.startsWith(userPrefixToken)) {
                targetDestination = targetDestination.substring(userPrefixToken.length() - 1);
            }

            final String evaluatedDestination = targetDestination;
            if (properties.getSubscriptionUrls().stream()
                    .anyMatch(url -> url.equals(evaluatedDestination)
                            || evaluatedDestination.startsWith(url.concat("/")))) {
                return message;
            }

            throw new AccessDeniedException(
                    "Subscription to " + destination + " is not allowed");
        }

        throw new AccessDeniedException(
                "STOMP command is not allowed");
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");

        if (!StringUtils.hasText(authorization)
                || !authorization.startsWith("Bearer ")) {
            throw new AccessDeniedException(
                    "Missing bearer token");
        }

        String token = authorization.substring(7).trim();

        if (!StringUtils.hasText(token)) {
            throw new AccessDeniedException("Empty bearer token");
        }

        Jwt jwt = jwtDecoder.decode(token);

        AbstractAuthenticationToken authentication = jwtAuthenticationConverter.convert(jwt);

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new AccessDeniedException(
                    "WebSocket authentication failed");
        }

        accessor.setUser(authentication);
    }

}