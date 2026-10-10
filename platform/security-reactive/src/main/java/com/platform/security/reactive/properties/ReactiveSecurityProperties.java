package com.platform.security.reactive.properties;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the reactive security starter. It intentionally has no
 * servlet dependencies.
 */
@ConfigurationProperties(prefix = "platform.security")
public class ReactiveSecurityProperties {
    private boolean enabled = true;
    private boolean authenticationEnabled = true;
    private boolean authorizationEnabled = true;
    private List<String> publicPaths = new ArrayList<>(
            List.of("/actuator/health", "/swagger-ui/**", "/v3/api-docs/**"));
    private List<String> adminPaths = new ArrayList<>(
            List.of("/actuator/**"));
    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isAuthenticationEnabled() {
        return authenticationEnabled;
    }

    public void setAuthenticationEnabled(boolean value) {
        this.authenticationEnabled = value;
    }

    public boolean isAuthorizationEnabled() {
        return authorizationEnabled;
    }

    public void setAuthorizationEnabled(boolean value) {
        this.authorizationEnabled = value;
    }

    public List<String> getPublicPaths() {
        return publicPaths;
    }

    public void setPublicPaths(List<String> publicPaths) {
        this.publicPaths = publicPaths == null ? new ArrayList<>() : new ArrayList<>(publicPaths);
    }

    public List<String> getAdminPaths() {
        return adminPaths;
    }

    public void setAdminPaths(List<String> adminPaths) {
        this.adminPaths = adminPaths;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public static class Jwt {
        private boolean enabled = true;
        private String secret;
        private String issuer = "cabride";
        private Duration clockSkew = Duration.ofSeconds(30);
        private String authoritiesClaim = "roles";
        private String authorityPrefix = "ROLE_";

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public Duration getClockSkew() {
            return clockSkew;
        }

        public void setClockSkew(Duration clockSkew) {
            this.clockSkew = clockSkew;
        }

        public String getAuthoritiesClaim() {
            return authoritiesClaim;
        }

        public void setAuthoritiesClaim(String value) {
            this.authoritiesClaim = value;
        }

        public String getAuthorityPrefix() {
            return authorityPrefix;
        }

        public void setAuthorityPrefix(String value) {
            this.authorityPrefix = value;
        }
    }

    public static class Cors {
        private boolean enabled = false;
        private List<String> allowedOriginPatterns = new ArrayList<>();
        private List<String> allowedMethods = new ArrayList<>(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        private List<String> allowedHeaders = new ArrayList<>(
                List.of("Authorization", "Content-Type", "X-Correlation-ID"));
        private boolean allowCredentials = false;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public List<String> getAllowedOriginPatterns() {
            return allowedOriginPatterns;
        }

        public void setAllowedOriginPatterns(List<String> values) {
            this.allowedOriginPatterns = values == null ? new ArrayList<>() : new ArrayList<>(values);
        }

        public List<String> getAllowedMethods() {
            return allowedMethods;
        }

        public void setAllowedMethods(List<String> values) {
            this.allowedMethods = values == null ? new ArrayList<>() : new ArrayList<>(values);
        }

        public List<String> getAllowedHeaders() {
            return allowedHeaders;
        }

        public void setAllowedHeaders(List<String> values) {
            this.allowedHeaders = values == null ? new ArrayList<>() : new ArrayList<>(values);
        }

        public boolean isAllowCredentials() {
            return allowCredentials;
        }

        public void setAllowCredentials(boolean value) {
            this.allowCredentials = value;
        }
    }
}
