package com.cabride.bookings.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.cabride.bookings.interceptors.StompAuthenticationInterceptor;
import com.platform.security.properties.SecurityProperties;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketMsgBrokerConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthenticationInterceptor authenticationInterceptor;
    private final StompErrorHandler errorHandler;
    private final SecurityProperties properties;

    public WebSocketMsgBrokerConfig(
            StompAuthenticationInterceptor authenticationInterceptor, StompErrorHandler errorHandler,
            SecurityProperties properties) {
        this.authenticationInterceptor = authenticationInterceptor;
        this.errorHandler = errorHandler;
        this.properties = properties;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
        registry.enableSimpleBroker("/topic", "/queue");
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
