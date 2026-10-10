package com.platform.security.reactive.config;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import com.platform.security.reactive.properties.ReactiveSecurityProperties;

import reactor.core.publisher.Mono;

@AutoConfiguration
@ConditionalOnClass({ ServerHttpSecurity.class, SecurityWebFilterChain.class })
@ConditionalOnProperty(prefix = "platform.security", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(ReactiveSecurityProperties.class)
@EnableReactiveMethodSecurity
public class ReactiveSecurityAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(ReactiveJwtDecoder.class)
    @ConditionalOnProperty(prefix = "platform.security.jwt", name = "enabled", havingValue = "true", matchIfMissing = true)
    ReactiveJwtDecoder reactiveJwtDecoder(ReactiveSecurityProperties properties) {
        String secret = properties.getJwt().getSecret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("platform.security.jwt.secret must contain at least 32 bytes for HS256");
        }
        SecretKey key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        NimbusReactiveJwtDecoder decoder = NimbusReactiveJwtDecoder.withSecretKey(key).build();
        List<OAuth2TokenValidator<Jwt>> validators = new ArrayList<>();
        validators.add(new JwtTimestampValidator(properties.getJwt().getClockSkew()));
        if (properties.getJwt().getIssuer() != null && !properties.getJwt().getIssuer().isBlank()) {
            validators.add(JwtValidators.createDefaultWithIssuer(properties.getJwt().getIssuer()));
        }
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(validators));
        return decoder;
    }

    @Bean
    @ConditionalOnMissingBean
    Converter<Jwt, ? extends Mono<? extends AbstractAuthenticationToken>> reactiveJwtAuthenticationConverter(
            ReactiveSecurityProperties properties) {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName(properties.getJwt().getAuthoritiesClaim());
        authorities.setAuthorityPrefix(properties.getJwt().getAuthorityPrefix());
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    @Bean
    @ConditionalOnMissingBean
    SecurityWebFilterChain nalandaReactiveSecurityFilterChain(
            ServerHttpSecurity http,
            ReactiveSecurityProperties properties,
            ReactiveJwtDecoder decoder,
            Converter<Jwt, ? extends Mono<? extends AbstractAuthenticationToken>> converter,
            CorsConfigurationSource corsConfigurationSource) {
        ServerHttpSecurity configured = http.csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .logout(ServerHttpSecurity.LogoutSpec::disable);

        if (properties.getCors().isEnabled())
            configured = configured.cors(cors -> cors.configurationSource(corsConfigurationSource));
        if (!properties.isAuthenticationEnabled()) {
            configured = configured.authorizeExchange(exchanges -> exchanges.anyExchange().permitAll());
        } else {
            configured = configured.authorizeExchange(exchanges -> {
                exchanges.pathMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                if (properties.getPublicPaths() != null && !properties.getPublicPaths().isEmpty()) {
                    exchanges.pathMatchers(properties.getPublicPaths().toArray(String[]::new)).permitAll();
                }
                if (properties.getAdminPaths() != null && !properties.getAdminPaths().isEmpty()) {
                    exchanges.pathMatchers(properties.getAdminPaths().toArray(String[]::new)).hasRole("ADMIN");
                }
                if (properties.isAuthorizationEnabled())
                    exchanges.anyExchange().authenticated();
                else
                    exchanges.anyExchange().permitAll();
            }).oauth2ResourceServer(
                    oauth2 -> oauth2.jwt(jwt -> jwt.jwtDecoder(decoder).jwtAuthenticationConverter(converter)));
        }
        return configured.build();
    }

    @Bean
    @ConditionalOnMissingBean(CorsConfigurationSource.class)
    CorsConfigurationSource reactiveCorsConfigurationSource(ReactiveSecurityProperties properties) {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOriginPatterns(properties.getCors().getAllowedOriginPatterns());
        cors.setAllowedMethods(properties.getCors().getAllowedMethods());
        cors.setAllowedHeaders(properties.getCors().getAllowedHeaders());
        cors.setAllowCredentials(properties.getCors().isAllowCredentials());
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
