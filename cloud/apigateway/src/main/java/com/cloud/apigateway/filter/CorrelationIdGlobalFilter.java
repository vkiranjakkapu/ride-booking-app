package com.cloud.apigateway.filter;

import java.util.UUID;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class CorrelationIdGlobalFilter implements GlobalFilter, Ordered {

	private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

	@Override
	public Mono<Void> filter(
			ServerWebExchange exchange,
			GatewayFilterChain chain) {

		String correlationId = exchange.getRequest()
				.getHeaders()
				.getFirst(CORRELATION_ID_HEADER);

		if (correlationId == null || correlationId.isBlank()) {
			correlationId = UUID.randomUUID().toString();
		}

		final String id = correlationId;

		ServerWebExchange mutatedExchange = exchange.mutate()
				.request(request -> request.headers(headers -> headers.set(CORRELATION_ID_HEADER, id)))
				.build();

		mutatedExchange.getResponse().getHeaders()
				.set(CORRELATION_ID_HEADER, id);

		return chain.filter(mutatedExchange);
	}

	@Override
	public int getOrder() {
		return Ordered.HIGHEST_PRECEDENCE;
	}
}