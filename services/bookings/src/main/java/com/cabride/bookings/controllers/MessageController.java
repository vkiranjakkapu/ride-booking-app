package com.cabride.bookings.controllers;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/active-ride-requests")
    public void broadcastRideRequests(Principal principal, String message) {
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/ride-requests",
                message);
    }

    @MessageMapping("/test-ride-update")
    public void sendRideUpdate(Principal principal, String message) {
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/ride-updates",
                message);
    }

    @MessageMapping("/chat")
    @SendTo("/topic/message")
    public String recieveMessage(String msg) {
        return "Server Received: " + msg;
    }

}
