# Cabride — Real-Time Cab Booking Platform

![Java](https://img.shields.io/badge/Java-25-orange)
![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen)
![Spring%20Cloud](https://img.shields.io/badge/Spring%20Cloud-2025.1.3-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-purple)
![Real-time](https://img.shields.io/badge/Updates-WebSocket%20%2B%20STOMP-informational)

Cabride is a full-stack ride-booking application built with **Java, Spring Boot, Spring Cloud, React, TypeScript, PostgreSQL, and WebSocket/STOMP**. It separates identity and ride-booking responsibilities into backend services and uses a shared platform layer for cross-cutting infrastructure.

The application focuses on the end-to-end ride experience: selecting a pickup and destination on a map, requesting a ride, letting drivers discover and respond to requests, tracking the ride lifecycle, and keeping rider and driver interfaces informed through live updates and a persistent active-ride notification.


## Contents

- [Highlights](#highlights)
- [Application architecture](#application-architecture)
- [Ride lifecycle](#ride-lifecycle)
- [Live updates](#live-updates)
- [Active ride notification across pages](#active-ride-notification-across-pages)
- [UI screens](#ui-screens)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Configuration](#configuration)
- [Run locally](#run-locally)
- [Build and quality checks](#build-and-quality-checks)
- [API overview](#api-overview)
- [Security and observability](#security-and-observability)
- [Author](#author)


## Highlights

- **Role-aware experience:** rider and driver routes are protected according to the authenticated user's role.
- **Map-based booking:** choose pickup and destination locations, search places, use the current location, and view route information.
- **Driver ride requests:** drivers can view available requests and accept or decline them.
- **Ride lifecycle management:** ride state and timestamps are managed by the bookings service.
- **Real-time notifications:** the frontend uses STOMP over WebSocket to receive ride updates and display notifications.
- **Persistent active-ride context:** a shared React context maintains active-ride state and notification UI across route changes.
- **Participant contact details:** the active-ride notification presents relevant participant information and supports the device's `tel:` handler when a phone number is available.
- **JWT security:** protected REST APIs and STOMP connections use bearer-token authentication.
- **Reusable backend platform:** shared logging, security, reactive security, REST-client, and web modules reduce duplication across services.
- **Service discovery and centralized configuration:** Spring Cloud Eureka and Config Server support the microservice environment.


# Application architecture

Cabride is organized as a **Maven multi-module monorepo**. The React frontend communicates with backend APIs through the API Gateway. The gateway routes identity traffic to the Identity Service and booking traffic—including the WebSocket endpoint—to the Bookings Service.

```text
┌───────────────────────────────────────────────────────────────┐
│                         React Web UI                          │
│                                                               │
│  Landing / Dashboard / Booking / Driver Requests / En-route   │
│  History / Profile / Shared Toast & Active Ride Notification  │
└───────────────────────────────┬───────────────────────────────┘
                                │ HTTP + WebSocket/STOMP
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    API Gateway :9090                          │
│               Spring Cloud Gateway (WebFlux)                  │
└──────────────────────┬───────────────────────┬────────────────┘
                       │                       │
             /identity/**              /bookings/**
                       │                       │
                       ▼                       ▼
          ┌─────────────────────┐   ┌──────────────────────────┐
          │  Identity Service   │   │     Bookings Service     │
          │  Authentication     │   │  Ride lifecycle & fares  │
          │  Users / roles      │   │  Ride APIs               │
          │  JWT tokens         │   │  WebSocket/STOMP broker  │
          └──────────┬──────────┘   └─────────────┬────────────┘
                     │                            │
                     ▼                            ▼
          ┌─────────────────────┐   ┌──────────────────────────┐
          │ PostgreSQL          │   │ PostgreSQL               │
          │ cabride_identity    │   │ cabride_bookings         │
          └─────────────────────┘   └──────────────────────────┘

          ┌────────────────────────────────────────────────────┐
          │                Spring Cloud infrastructure         │
          │                                                    │
          │  Config Server :8888       Eureka :8761            │
          └────────────────────────────────────────────────────┘

          ┌──────────────────────────────────────────────────────┐
          │                  Shared Platform                     │
          │ Logging │ Security │ Security Reactive │ REST Client │
          │ Web                                                  │
          └──────────────────────────────────────────────────────┘
```

### Backend service boundaries

| Module / service | Responsibility | Local port / entry point |
|---|---|---|
| API Gateway | Routes HTTP requests and WebSocket traffic to registered services | `9090` |
| Identity Service | User registration, authentication, identity and role-related operations | Routed under `/identity/**` |
| Bookings Service | Ride requests, driver actions, ride status, fare-related operations, and ride notifications | `8081`; routed under `/bookings/**` |
| Config Server | Serves externalized Spring configuration | `8888` |
| Eureka Server | Service registry and discovery | `8761` |
| PostgreSQL | Persists identity and ride-booking data in separate databases | `5432` (typical local configuration; confirm your database setup) |

### Request flow

```text
React UI
   │
   ├── REST request + Bearer token ──► API Gateway
   │                                      ├── /identity/** ──► Identity Service
   │                                      └── /bookings/** ──► Bookings Service
   │
   └── STOMP over WebSocket ─────────► API Gateway ──► Bookings Service
                                                           │
                                                           ├── Persist ride changes
                                                           └── Publish ride events
```

### Shared platform modules

| Module | Responsibility |
|---|---|
| `platform/logging` | Shared request and exception logging, correlation context, and log configuration |
| `platform/security` | Servlet-side security infrastructure, JWT support, authorization, and security configuration |
| `platform/security-reactive` | Reactive security support used by the WebFlux API Gateway |
| `platform/restclient` | Shared downstream HTTP-client infrastructure and request-context / bearer-token propagation |
| `platform/web` | Shared web infrastructure and common error-handling support |

This keeps service-specific code focused on identity and booking behavior while common infrastructure remains reusable.


# Ride lifecycle

The frontend and backend represent ride status with these values:

```text
REQUESTED ──► ACCEPTED ──► IN_PROGRESS ──► COMPLETED
    │                              │
    └──────────────► CANCELLED     └──► PAID (payment-related state)
```

The available status values in the current code are `REQUESTED`, `ACCEPTED`, `IN_PROGRESS`, `PAID`, `COMPLETED`, and `CANCELLED`. Valid transitions are enforced by the bookings service; the diagram is a high-level view of the lifecycle rather than a complete transition specification.

At a high level:

1. A rider selects a pickup and destination and submits a ride request.
2. The Bookings Service persists the request and publishes a ride-request event for driver discovery.
3. A driver reviews available requests and can accept or decline a request.
4. The ride progresses through its active states, with participant and ride details made available to authorized users.
5. Completion, cancellation, or other terminal updates clear the active-ride notification from the shared UI state.


# Live updates

Cabride uses **STOMP over WebSocket** for ride-related updates. REST remains responsible for request/response operations, while WebSocket messages allow the UI to react to ride events without requiring a manual page refresh.

### Backend design

- The Bookings Service enables Spring's STOMP message broker.
- The WebSocket endpoint is registered at `/bookings/api/v1/ws` on the Bookings Service and is routed through the gateway's `/bookings/**` route.
- The application destination prefix is configured as `/app`.
- The simple broker handles `/topic` and `/queue` destinations through externalized configuration.
- User-specific notifications use the `/user` destination prefix and the `/queue/ride-updates` queue.
- `StompAuthenticationInterceptor` validates/authenticates inbound STOMP connection messages using the bearer token.
- Ride events are published after the database transaction commits, avoiding broadcasting a change before its transaction has committed.

### Message destinations used by the application

| Destination | Purpose |
|---|---|
| `/topic/ride-requests` | Broadcasts newly requested rides so eligible drivers can discover them |
| `/user/queue/ride-updates` | Delivers ride updates to an individual authenticated participant |
| `/app/**` | Prefix for application-handled STOMP messages |

The exact allowed subscription and send destinations are controlled by the Bookings Service's STOMP authentication/interceptor configuration.

### Frontend flow

```text
Authenticated application starts
          │
          ├── Fetch current active ride through REST
          │
          └── Establish authenticated STOMP connection
                         │
                         ▼
               Receive ride update event
                         │
                         ▼
             Update shared active-ride state
                         │
                         ▼
            Refresh active notification UI
```

The frontend's `useRideUpdates` hook handles the live connection, while `ToastsContextProvider` processes incoming ride updates. Completed or cancelled rides clear the active notification; other ride updates refresh the shared active-ride state and notification.


# Active ride notification across pages

One of Cabride's key UI behaviors is that the active ride is **not owned by a single page**. The notification and ride state live in shared application context so navigation between pages does not, by itself, discard the user's active-ride information.

### How it works

1. `main.tsx` wraps the app with `AuthenticationContextProvider` and `ToastsContextProvider`.
2. `ToastsContextProvider` maintains toast messages, ride notifications, and the current active ride.
3. When an authenticated session is initialized, the provider requests the current active ride through `RideService.getActiveRide()`.
4. The provider also listens for live ride updates through `useRideUpdates`.
5. `setActiveRideNotification()` replaces the previous persistent active-ride notification instead of stacking duplicate active-ride cards.
6. The shared `NotificationLayout` renders notification UI outside individual page components, allowing it to remain available while users navigate.
7. When the ride reaches `COMPLETED` or `CANCELLED`, the provider clears the active ride and its persistent notification.

```text
┌──────────────────────────── React Application ────────────────────────────┐
│                                                                           │
│  AuthenticationContextProvider                                            │
│      └── ToastsContextProvider                                            │
│            ├── Toast messages                                             │
│            ├── Live ride updates                                          │
│            ├── Active ride state                                          │
│            └── NotificationLayout                                         │
│                    └── ActiveRideNotificationComponent                    │
│                                                                           │
│  Route changes: Dashboard ⇄ Booking ⇄ Driver Requests ⇄ En-route ⇄ History│
│  Shared notification state remains mounted above the route content.       │
└───────────────────────────────────────────────────────────────────────────┘
```

### What the notification can show

- **Searching for a driver:** a waiting state while the ride is `REQUESTED`.
- **Ride/participant information:** participant name and contact details when supplied by the backend.
- **Vehicle information:** vehicle number for the driver, when available.
- **Fare information:** estimated fare and the applicable ride/payment status details.
- **Quick actions:** open the ride page, call the participant through the device's `tel:` handler, and cancel where cancellation is allowed.
- **Live state changes:** refresh the notification from received ride updates and clear it when the ride is completed or cancelled.

This shared notification keeps the current ride accessible while a rider or driver visits another screen, rather than requiring the user to stay on the en-route page.


# UI screens

The React application is a single-page application with role-aware routes. The main screens in the current route configuration are:

| Screen | Route | Purpose |
|---|---|---|
| Landing | `/` | Public entry point |
| Dashboard | `/dashboard` | Main dashboard for the signed-in user |
| Booking | `/booking` | Rider map and ride-request flow; hidden from driver role |
| Driver ride requests | `/rides` | Drivers review available requests and accept or decline them |
| En-route / ride details | `/rides/:rideId` | Ride details and lifecycle actions |
| Rider ride dashboard | `/dashboard/:rideId` | Rider-facing ride details for a specific ride |
| History | `/history` | View ride history |
| Profile | `/profile` | Profile management |

## Screenshots

### 1. Landing and dashboards

![Cabride landing](docs/screenshots/landing.png)
![Cabride admin dashboard](docs/screenshots/dash-admin.png)
![Cabride driver dashboard](docs/screenshots/dash-driver.png)

## Login and Registration
![Cabride Login and Registration](docs/screenshots/login-register.png)

### 2. Map-based ride booking

Pickup and destination search, map markers, route preview, estimated duration, and fare summary.

![Cabride ride location permissions](docs/screenshots/location-access.png)
![Cabride ride current location](docs/screenshots/current-location.png)
![Cabride ride location search](docs/screenshots/location-search.png)
![Cabride ride booking map and directions](docs/screenshots/directions.png)

### 3. Driver ride requests

List of available ride requests and the accept/decline actions.

![Cabride driver ride requests](docs/screenshots/driver-requests.png)
![Cabride rider awaiting accept](docs/screenshots/awaiting-accept.png)

### 4. En-route ride details

Route, current ride state, participant details, and the relevant ride actions.

![Cabride otp validations](docs/screenshots/otp-validations.png)
![Cabride otp validation for driver](docs/screenshots/otp-validations-driver.png)
![Cabride awaiting notification](docs/screenshots/active-ride-waiting.png)
![Cabride live toast notifications](docs/screenshots/live-ride-toasts.png)
![Cabride live toast notifications](docs/screenshots/live-ride-toasts-2.png)

### 5. Active ride notification across pages

Persistent active-ride notification on a page other than the en-route page.

![Active ride notification across Cabride pages](docs/screenshots/active-ride-notification.png)
![Active ride notification across Cabride pages](docs/screenshots/active-ride-notification-2.png)

### 6. Live ride update

Two browser windows showing the rider and driver views changing after a ride event.

![Cabride live ride updates](docs/screenshots/live-ride-updates.png)

# Technology stack

### Backend

- Java 25
- Spring Boot 4.1.1
- Spring Security and JWT
- Spring Data JPA / Hibernate
- Spring Cloud 2025.1.3
- Spring Cloud Config Server
- Spring Cloud Gateway (WebFlux)
- Netflix Eureka
- Spring WebSocket and STOMP
- PostgreSQL
- Springdoc OpenAPI
- Maven multi-module build

### Frontend

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- React Router 7
- Axios
- STOMP.js
- Leaflet and Leaflet Routing Machine
- React Leaflet
- Heroicons

### Infrastructure and integrations

- PostgreSQL
- Docker Compose for local database setup (where configured)
- OpenStreetMap / Nominatim for map search and reverse geocoding
- Spring Cloud Config and Eureka

---

# Repository structure

```text
Cab Booking/
├── platform/
│   ├── logging/
│   ├── security/
│   ├── security-reactive/
│   ├── restclient/
│   └── web/
├── cloud/
│   ├── apigateway/
│   ├── configserver/
│   ├── eurekaserver/
│   └── repo/
├── services/
│   ├── identity/
│   └── bookings/
├── ui/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   ├── public/
│   └── package.json
├── docker/
├── pom.xml
└── README.md
```

- `platform/` contains reusable backend infrastructure.
- `cloud/` contains gateway, service discovery, configuration server, and externalized configuration.
- `services/` contains the identity and bookings business services.
- `ui/` contains the React client and its shared components, contexts, route definitions, and API services.

---

# Configuration

The backend loads shared and service-specific configuration from `cloud/repo/` through the Config Server. Sensitive values should be supplied through environment variables and should not be committed.

The shared configuration expects values including:

```dotenv
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=<database-username>
DATABASE_PASSWORD=<database-password>
PLATFORM_JWT_SECRET=<strong-secret-value>
```

> **Important:** verify the database username/password property mapping in `cloud/repo/application.yml` before starting the services. Use a strong JWT secret for local development and never commit real credentials or secrets.

The configured database names are:

- `cabride_identity`
- `cabride_bookings`

The frontend and security configuration include local development origins such as `http://localhost:5173`. If you use a different frontend port, update the CORS configuration accordingly.

---

# Run locally

## Prerequisites

- JDK 25
- Maven compatible with the project
- Node.js and npm
- PostgreSQL, locally installed or containerized
- Git

## 1. Prepare the databases

Create the `cabride_identity` and `cabride_bookings` PostgreSQL databases and configure the environment variables expected by the backend. If you use the repository's Docker Compose setup, inspect its configuration first and start it from the appropriate directory.

## 2. Start Eureka Server

From the repository root:

```bash
cd cloud/eurekaserver
mvn spring-boot:run
```

Eureka dashboard: `http://localhost:8761`

## 3. Start Config Server

In a separate terminal:

```bash
cd cloud/configserver
mvn spring-boot:run
```

Config Server: `http://localhost:8888`

## 4. Start the API Gateway

In a separate terminal:

```bash
cd cloud/apigateway
mvn spring-boot:run
```

Gateway: `http://localhost:9090`

## 5. Start Identity Service

In a separate terminal:

```bash
cd services/identity
mvn spring-boot:run
```

## 6. Start Bookings Service

In a separate terminal:

```bash
cd services/bookings
mvn spring-boot:run
```

The Bookings Service is configured for port `8081` and depends on the Config Server, database configuration, and Eureka registration.

## 7. Start the frontend

In a separate terminal:

```bash
cd ui
npm install
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

> These commands describe the expected local startup sequence from the repository configuration. A complete startup also requires valid database credentials, a configured JWT secret, and all services to be healthy.

---

# Build and quality checks

Build all backend modules from the repository root:

```bash
mvn clean verify
```

Run backend tests:

```bash
mvn test
```

Build the frontend:

```bash
cd ui
npm run build
```

Run frontend linting:

```bash
npm run lint
```

---

# API overview

The API Gateway routes requests to the following service prefixes:

| Prefix | Service |
|---|---|
| `/identity/**` | Identity Service |
| `/bookings/**` | Bookings Service |

Ride endpoints are rooted at `/bookings/api/v1/rides`. The controller includes operations for available ride requests, active ride lookup, fare lookup, ride creation, ride retrieval, OTP retrieval, acceptance, decline, start, completion, cancellation, and payment-related behavior. Authentication and role requirements vary by endpoint.

The STOMP WebSocket endpoint is `/bookings/api/v1/ws` through the gateway route. Use the bearer token in the STOMP `CONNECT` headers where required.

For exact request and response schemas, consult the controller DTOs and the OpenAPI/Swagger configuration in the services.

---

# Security and observability

- JWT bearer authentication is used for protected APIs.
- Endpoint access is role-aware for riders, drivers, and administrators.
- STOMP connections are authenticated through an inbound channel interceptor.
- Downstream REST calls can propagate request context and bearer tokens through the shared REST-client module.
- Shared logging configuration supports request and exception logging, correlation context, and rolling log files.
- Actuator configuration exposes health and refresh endpoints where enabled.

---

# Author

**Venkata Kiran J**

GitHub: [vkiranjakkapu](https://github.com/vkiranjakkapu)

Project repository: [ride-booking-app](https://github.com/vkiranjakkapu/ride-booking-app)

---

## License

This project is a personal software engineering project.