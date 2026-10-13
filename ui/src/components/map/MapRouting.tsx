import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Coordinates, RouteInstruction, RouteSummary } from "./MapDtos";

import "leaflet-routing-machine";
import { formatDistance } from "../../utils/DistanceFormatters";
import { formatDurationTaken } from "../../utils/DurationFormatter";

type MapRoutingProps = {
    pickup: Coordinates;
    destination?: Coordinates;
    showDirectionGuide?: boolean;

    onRouteFound?: (summary: RouteSummary) => void;
};

export default function MapRouting({
    pickup,
    destination,
    showDirectionGuide = false,
    onRouteFound,
}: MapRoutingProps) {
    const map = useMap();

    useEffect(() => {
        if (!destination) return;

        const routeControl = L.Routing.control({
            plan: L.Routing.plan([L.latLng(pickup), L.latLng(destination)], {
                draggableWaypoints: false,
                createMarker: () => false,
            }),
            addWaypoints: false,
            fitSelectedRoutes: false,
            show: showDirectionGuide,
            lineOptions: {
                styles: [{ color: "#1b263b", weight: 5, opacity: 0.8 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
        }).addTo(map);

        const routingContainer = routeControl.getContainer();

        if (routingContainer) {
            routingContainer.classList.toggle(
                "routing-guide-hidden",
                !showDirectionGuide,
            );
        }

        routeControl.on("routesfound", (event) => {
            const route = event.routes[0];

            if (!route) return;

            type RoutingInstruction = (typeof route.instructions)[number];
            const instructions: RouteInstruction[] = route.instructions.map(
                (instruction: RoutingInstruction) => ({
                    text: instruction.text,
                    distance: instruction.distance,
                    time: instruction.time,
                }),
            );

            onRouteFound?.({
                distance: formatDistance(route.summary.totalDistance),
                distanceInMeters: route.summary.totalDistance,

                duration: formatDurationTaken(route.summary.totalTime),
                durationInSeconds: route.summary.totalTime,

                instructions,
            });
        });

        return () => {
            map.removeControl(routeControl);
        };
    }, [map, pickup, destination, showDirectionGuide, onRouteFound]);

    return null;
}
