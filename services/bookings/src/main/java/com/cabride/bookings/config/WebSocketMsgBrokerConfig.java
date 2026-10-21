package com.cabride.bookings.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.cabride.bookings.interceptors.StompAuthenticationInterceptor;
import com.cabride.bookings.properties.WebSocketProperties;
import com.platform.security.properties.SecurityProperties;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketMsgBrokerConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthenticationInterceptor authenticationInterceptor;
    private final StompErrorHandler errorHandler;
    private final SecurityProperties properties;
    private final WebSocketProperties webSocketProperties;

    public WebSocketMsgBrokerConfig(
            StompAuthenticationInterceptor authenticationInterceptor, StompErrorHandler errorHandler,
            SecurityProperties properties,
            WebSocketProperties webSocketProperties) {
        this.authenticationInterceptor = authenticationInterceptor;
        this.errorHandler = errorHandler;
        this.properties = properties;
        this.webSocketProperties = webSocketProperties;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/".concat(webSocketProperties.getAppPrefix()));
        registry.setUserDestinationPrefix("/".concat(webSocketProperties.getUserPrefix()));
        registry.enableSimpleBroker(StringUtils.toStringArray(webSocketProperties.getSubscriptionUrls()));
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.setErrorHandler(errorHandler);
        registry.addEndpoint("/bookings/api/v1/ws")
                .setAllowedOrigins(StringUtils.toStringArray(properties.getCors().getAllowedOriginPatterns()));
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration) {
        registration.interceptors(authenticationInterceptor);
    }

}
