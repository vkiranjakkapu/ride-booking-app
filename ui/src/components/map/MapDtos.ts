import type { DivIcon } from "leaflet";

export type SearchResult = { display_name: string; lat: string; lon: string };

export type MarkerProps = {
    coords: Coordinates;
    divIcon?: DivIcon;
};
export type Coordinates = [number, number];

export type RouteSummary = {
    distance: string;
    distanceInMeters?: number;

    duration: string;
    durationInSeconds?: number;

    instructions: RouteInstruction[];
};

export type RouteInstruction = {
    text: string;
    distance: number;
    time: number;
};
