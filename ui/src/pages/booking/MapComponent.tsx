import L from "leaflet";
import { useEffect, type HTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import type { Coordinates, RouteSummary } from "../../components/map/MapDtos";
import MapRouting from "../../components/map/MapRouting";
import MarkerComponent from "../../components/map/MarkerComponent";

const pickupIcon = new L.DivIcon({
    className: "",
    html: renderToStaticMarkup(<MarkerComponent color="emerald" />),
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const destinationIcon = new L.DivIcon({
    className: "",
    html: renderToStaticMarkup(<MarkerComponent color="rose" weight="400" />),
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const DEFAULT_CENTER: [number, number] = [16.5449, 81.5212];
const DEFAULT_ZOOM = 15;

type MapComponentProps = HTMLAttributes<HTMLDivElement> & {
    pickup: Coordinates;
    destination?: Coordinates;

    onMapClick?: (coordinates: Coordinates) => void;

    showDirectionGuide?: boolean;
    onRouteFound?: (summary: RouteSummary) => void;
};

export default function MapComponent({
    pickup,
    destination,

    onMapClick,

    showDirectionGuide = false,
    onRouteFound,
    ...props
}: MapComponentProps) {
    return (
        <div {...props} className={`h-90 lg:h-150 ${props.className}`}>
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                className="h-full w-full"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapViewport pickup={pickup} destination={destination} />

                {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

                <Marker position={pickup} title="Pickup" icon={pickupIcon} />
                {destination && (
                    <Marker
                        position={destination}
                        title="Destination"
                        icon={destinationIcon}
                    />
                )}

                <MapRouting
                    pickup={pickup}
                    destination={destination}
                    onRouteFound={onRouteFound}
                    showDirectionGuide={showDirectionGuide}
                />
            </MapContainer>
        </div>
    );
}

type MapClickHandlerProps = {
    onMapClick: (coordinates: Coordinates) => void;
};

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
    useMapEvents({
        click(event) {
            onMapClick([event.latlng.lat, event.latlng.lng]);
        },
    });

    return null;
}

type MapViewportProps = {
    pickup: Coordinates;
    destination?: Coordinates;
};

function MapViewport({ pickup, destination }: MapViewportProps) {
    const map = useMap();

    useEffect(() => {
        if (destination) {
            map.fitBounds([pickup, destination], {
                padding: [40, 40],
                maxZoom: 15,
            });
        } else {
            map.setView(pickup, 13);
        }
    }, [map, pickup, destination]);

    return null;
}
