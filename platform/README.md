# Platform

Reusable Spring Boot platform modules for building consistent, production-ready services.

## Vision

The Platform provides business-oriented abstractions built on top of proven Spring infrastructure, hiding framework complexity behind stable, reusable APIs for services.

The goal is to offer production-ready platform capabilities through Spring Boot starters, allowing business services to focus on domain logic instead of common infrastructure.

> **Current Status**
>
> The Platform is under active development. Only the modules listed below are currently implemented. Additional platform capabilities will be added incrementally.

## Current Modules

### `request-context`

Provides:

- Standard request context keys
- Standard HTTP header definitions
- Configurable header-to-context mappings
- Request context abstraction
- Default request context implementation

---

### `logging`

Provides:

- Correlation ID generation
- Request and response logging
- Exception logging
- Exception logging aspect
- Standard logging configuration templates (`docs/templates`)

---

### `restclient`

Provides:

- RestClient auto-configuration
- RestClient customization
- Automatic request context propagation for outbound HTTP calls
- Optional bearer token propagation

---

### `security`

Provides:

- JWT Resource Server
- Authentication abstraction
- Authorization support
- AuthenticationContext
- AuthenticatedUser abstraction
- Request Context enrichment
- Configurable JWT claim mapping
- Method Security
- Authentication & Authorization support

---

### `security-reactive`

Provides reactive security integration for applications built with Spring WebFlux.

- Reactive Spring Security auto-configuration
- JWT Resource Server support
- Reactive authentication and authorization
- Configurable security settings for reactive applications
- Integration with Spring WebFlux security infrastructure

This module complements the existing `security` module, which provides Servlet-based security. Applications should use the integration appropriate to their runtime: `security` for conventional Spring MVC applications and `security-reactive` for reactive WebFlux applications.

---

### `web`

Provides:

- Standardized HTTP error responses
- Framework exception handling
- Bean Validation error mapping
- Standard error definitions
- Extensible error definition contract
- Spring Boot auto-configuration

### Cross-Module Architecture Diagram

```text
      Controller
            │
            ▼
      Business Exception
            │
            ▼
      @RestControllerAdvice
            │
            ├──────────────► Logging Aspect
            │                     │
            ▼                     ▼
      ErrorResponse         ExceptionLogger
```

## Module Dependencies

```text
              ┌───────────────────────┐
              │    request-context    │
              └───────────────────────┘
                 ▲        ▲         ▲
                 │        │         │
       ┌───────────┐────────────┐────────────┐
       │   logging │ restclient │ security   │
       └───────────┘────────────┘────────────┘

       ┌──────────────────┐
       │ security-reactive│
       └──────────────────┘

       ┌─────┐
       │ web │
       └─────┘
```

> **NOTE**
>
> The Web starter standardizes framework HTTP exception translation, while the Logging starter transparently logs exceptions translated through centralized `@RestControllerAdvice` implementations. The two modules remain independent and collaborate through Spring AOP.
>
> The `security` and `security-reactive` modules provide security integrations for different application runtimes: Servlet-based Spring MVC and reactive Spring WebFlux, respectively.

## Current Platform Architecture

```text
                        Applications
                            │
                         Platform
                            │
      ┌───────────────────────────────────────────────┐
      │               request-context                 │
      └───────────────────────────────────────────────┘
               ▲               ▲               ▲
               │               │               │
        ┌──────┘          ┌────┘          ┌────┘
        │                 │               │
 ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
 │ logging      │  │ restclient   │  │ security     │
 ├──────────────┤  ├──────────────┤  ├──────────────┤
 │ Correlation  │  │ RestClient   │  │ JWT          │
 │ Request Log  │  │ Context Prop │  │ AuthN/AuthZ  │
 │ Exception    │  │ Bearer Prop  │  │ AuthContext  │
 │ Aspect       │  │ Interceptors │  └──────────────┘
 └──────┬───────┘  └──────────────┘
        ▲
        │
 ┌───────────────┐
 │ security-     │
 │ reactive      │
 ├───────────────┤
 │ Reactive JWT  │
 │ AuthN/AuthZ   │
 └───────────────┘

 ┌──────────────┐
 │ web          │
 ├──────────────┤
 │ Error Model  │
 │ MVC Errors   │
 │ Validation   │
 │ ErrorDefs    │
 └──────────────┘
```

## Design Principles

- Single Responsibility
- Constructor Injection
- Immutable where possible
- Thread-safe by default
- Interface-first design
- Centralized request context management
- Spring Boot native auto-configuration
- Extensive unit testing
- Build on existing Spring infrastructure instead of replacing it
- Public abstractions with replaceable implementations
- Clear separation of business and infrastructure abstractions
- Standardized HTTP error handling
- Extensible platform contracts
- Separation of exception translation and operational logging
- Separation of Servlet and reactive security integrations

## Technology

- Java 25
- Spring Boot 4
- Spring Security 7
- Spring MVC and Spring WebFlux
- Maven
- JUnit 5
- Mockito
- AssertJ

## Version

Current version: **v1.0.0 (Under Active Development)**