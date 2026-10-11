package com.cabride.bookings.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

@Component
public class StompErrorHandler extends StompSubProtocolErrorHandler {

	@Override
	public Message<byte[]> handleClientMessageProcessingError(
			Message<byte[]> clientMessage,
			Throwable ex) {

		Throwable cause = ex;
		while (cause.getCause() != null) {
			cause = cause.getCause();
		}

		String reason = cause.getMessage();

		StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
		accessor.setMessage(reason != null
				? reason
				: "STOMP authentication or message processing failed.");

		return MessageBuilder.createMessage(
				new byte[0],
				accessor.getMessageHeaders());
	}
}