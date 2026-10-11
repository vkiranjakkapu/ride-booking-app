import { Client } from "@stomp/stompjs";
import { useRef, useState } from "react";

export default function MsgBrokerSocket() {
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    const [token, setToken] = useState<string | null>(null);

    function conect() {
        if (clientRef.current?.active) return;

        const client = new Client({
            brokerURL: "ws://localhost:9090/bookings/ws",
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 0,
            onConnect() {
                setConnected(true);

                client.subscribe("/topic/message", (frame) => {
                    setMessages((prev) => [...prev, frame.body]);
                });

                client.subscribe("/user/queue/ride-updates", (frame) => {
                    setMessages((prev) => [
                        ...prev,
                        `Private ride update: ${frame.body}`,
                    ]);
                });

                setMessages((prev) => [...prev, "Connected to STOMP broker."]);
            },

            onStompError(frame) {
                console.error(
                    frame.headers["message"] || "STOMP request rejected",
                );
                console.error("STOMP error:", frame.headers, frame.body);
            },

            onWebSocketError(error) {
                console.error("WebSocket error:", error);
            },

            onWebSocketClose() {
                setConnected(false);
            },
        });

        clientRef.current = client;
        client.activate();
    }

    function sendMessage() {
        const client = clientRef.current;

        if (!client || !client.active || !message.trim()) return;

        client.publish({
            destination: "/app/chat",
            body: message,
        });
    }

    function trigger() {
        const client = clientRef.current;

        if (!client || !client.active || !message.trim()) return;

        client.publish({
            destination: "/app/test-ride-update",
            body: "Ride assigned",
        });
    }

    return (
        <>
            <br />
            <input
                type="text"
                placeholder="bearer token"
                onChange={(e) => {
                    setToken(e.target.value);
                }}
            />
            <button onClick={conect}>Connect</button>
            <p>Status: {connected ? "Connected." : "Not Connected."}</p>
            <br />
            <input
                type="text"
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter msg"
            />
            <button onClick={sendMessage}>Send</button>
            <button onClick={trigger}>Trigger</button>
            <ul>
                {messages.map((ms, idx) => (
                    <li key={idx}>{ms}</li>
                ))}
            </ul>
        </>
    );
}
