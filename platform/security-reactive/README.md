# Reactive Security

A separate Spring Security integration for **reactive WebFlux applications**, especially Spring Cloud Gateway. The existing `security` module remains the Servlet/MVC integration for Identity, Bookings, and other MVC services.

## Why a separate starter?

Servlet security uses `HttpSecurity`, `SecurityFilterChain`, servlet filters, and servlet CORS. Reactive security uses `ServerHttpSecurity`, `SecurityWebFilterChain`, reactive JWT decoding, and reactive CORS. They are not interchangeable. This starter deliberately does not depend on the existing servlet `security` artifact, avoiding `spring-boot-starter-web` being pulled into a WebFlux gateway.

## Maven

```xml
<dependency>
  <groupId>com.platform</groupId>
  <artifactId>security-reactive</artifactId>
  <version>${platform.version}</version>
</dependency>
```

## Configuration

```yaml
platform:
  security:
    enabled: true
    authentication-enabled: true
    authorization-enabled: true
    public-paths:
      - /actuator/health
      - /swagger-ui/**
      - /v3/api-docs/**
    jwt:
      enabled: true
      # Use the same signing secret and issuer as the token issuer / other services.
      secret: ${PLATFORM_JWT_SECRET}
      issuer: cabride
      clock-skew: 30s
      authorities-claim: roles
      authority-prefix: ROLE_
    cors:
      enabled: true
      allowed-origin-patterns:
        - http://localhost:5173
        - http://localhost:5174
      allowed-methods: [GET, POST, PUT, PATCH, DELETE, OPTIONS]
      allowed-headers: [Authorization, Content-Type, X-Correlation-ID]
      allow-credentials: false
```

The HS256 secret must be at least 32 UTF-8 bytes. For production, prefer asymmetric signing (for example, RSA/JWK) when the issuer and resource servers should not share a signing secret; this starter currently configures HS256 only.

## Important boundaries

- This starter secures HTTP requests handled by WebFlux. It does **not** authenticate STOMP `CONNECT`, authorize STOMP `SEND`/`SUBSCRIBE`, or configure WebSocket origin rules; those are separate message-broker concerns.
- Gateway route matching and WebSocket load balancing must still be configured in the Gateway application.
- Existing `com.platform:security` remains the servlet starter. Do not include both `security` and `security-reactive` in the same application.
- `authentication-enabled: false` is an explicit development escape hatch and should not be used in production.
