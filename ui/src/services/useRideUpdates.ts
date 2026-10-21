import { Client, type IMessage } from "@stomp/stompjs";
import { useEffect } from "react";
import type { ErrorResponse } from "../api/api";
import { AppConfig } from "../config/AppConfig";
import type { NoticeTheme } from "../context/toasts/useToastNotifications";
import TokenStorage from "../storage/TokenStorage";

type RideUpdateHandler = (frame: IMessage) => void;
export type ErrorResponseWithTheme = ErrorResponse & { theme?: NoticeTheme };
type RideUpdateErrorHandler = (error: ErrorResponseWithTheme) => void;

export default function useRideUpdates(
    onUpdate: RideUpdateHandler,
    includeRideRequests = false,
    onError?: RideUpdateErrorHandler,
) {
    useEffect(() => {
        const token = TokenStorage.getAccessToken();
        if (!token || !AppConfig.API_BASE_URL) {
            onError?.({
                theme: "error",
                errorMessage: `Unauthenticated access attempt. identified.`,
            } as ErrorResponseWithTheme);
            console.error("WebSocket not started:", {
                hasToken: !!token,
                hasApiBaseUrl: !!AppConfig.API_BASE_URL,
            });
            return;
        }

        const endpoint = new URL(
            AppConfig.BOOKINGS_WS_URL,
            AppConfig.API_BASE_URL,
        )
            .toString()
            .replace(/^http:/, "ws:")
            .replace(/^https:/, "wss:");

        const client = new Client({
            brokerURL: endpoint,
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 10000,
            onConnect: () => {
                console.log("Live updates connection success.");
                client.subscribe("/user/queue/ride-updates", (frame) => {
                    console.log("RIDE UPDATE FRAME RECEIVED:", frame.body);
                    onUpdate(frame);
                });
                if (includeRideRequests) {
                    client.subscribe("/topic/ride-requests", (frame) => {
                        onUpdate(frame);
                    });
                }
            },
            onStompError: (frame) => {
                console.error(
                    "Ride update subscription rejected: ",
                    frame.headers["message"],
                );
                onError?.({
                    theme: "warn",
                    errorMessage:
                        frame.headers["message"] ||
                        `We are facing issues connecting to live updates, please refresh manually.`,
                } as ErrorResponseWithTheme);
            },
            onWebSocketError: (error) => {
                console.error("Ride update WebSocket error:", error);
                onError?.({
                    theme: "error",
                    errorMessage: `We are facing unexpected issues connecting to live updates, please contact support team.`,
                } as ErrorResponseWithTheme);
            },

            onWebSocketClose: (event) => {
                console.warn("WebSocket closed:", event.code, event.reason);
            },
        });
        client.activate();
        return () => {
            void client.deactivate();
        };
    }, [onUpdate, onError, includeRideRequests]);
}
