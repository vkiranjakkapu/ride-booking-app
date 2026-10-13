import {
    ArrowsUpDownIcon,
    MagnifyingGlassIcon,
    ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import axios, { AxiosError } from "axios";
import "leaflet/dist/leaflet.css";
import { useCallback, useRef, useState } from "react";
import ActionButton from "../../components/ActionButtonComponent";
import DividerComponent from "../../components/DividerComponent";
import InputComponent from "../../components/formelements/InputComponent";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import type {
    Coordinates,
    RouteSummary,
    SearchResult,
} from "../../components/map/MapDtos";
import RideSummaryComponent from "../../components/map/RideSummaryComponent";
import SearchResultsComponent from "../../components/map/SearchResultsComponent";
import Notification from "../../components/notifications/Notification";
import { useNotifications } from "../../components/notifications/useNotifications";
import MapComponent from "./MapComponent";

export default function RideBookingPage() {
    const [pickup, setPickup] = useState<Coordinates>([16.5449, 81.5212]);
    const pickupRef = useRef<HTMLInputElement>(null);

    const [destination, setDestination] = useState<Coordinates | null>(null);
    const destinationRef = useRef<HTMLInputElement>(null);

    const [activeLocation, setActiveLocation] = useState<
        "pickup" | "destination" | null
    >(null);

    const { notifications, setNotifications } = useNotifications(["booking"]);
    const bookingNotifications = notifications["booking"] ?? null;

    /**
     * * =======================================
     * * Selection from Map
     * * =======================================
     */
    const getLocationName = useCallback((coords: Coordinates) => {
        const [lat, lon] = coords;
        return axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                lat,
                lon,
                format: "jsonv2",
            },
        });
    }, []);

    const reverseGeocodeRequestRef = useRef({
        pickup: 0,
        destination: 0,
    });

    const [locUpdateProgress, setLocUpdateProgress] = useState({
        pickup: false,
        destination: false,
    });

    const handleMapSelection = useCallback(
        (coords: Coordinates) => {
            if (!activeLocation) return;

            setRouteSummary(null);

            const location = activeLocation;
            const requestId = ++reverseGeocodeRequestRef.current[location];

            if (location === "pickup") {
                setIsLocating(false);
                setPickup(coords);
            } else {
                setDestination(coords);
            }

            setLocUpdateProgress((prev) => ({
                ...prev,
                [location]: true,
            }));

            getLocationName(coords)
                .then((resp) => {
                    if (
                        requestId !== reverseGeocodeRequestRef.current[location]
                    ) {
                        return;
                    }

                    const address = resp.data.display_name;
                    const inputRef =
                        location === "pickup" ? pickupRef : destinationRef;

                    if (inputRef.current) {
                        inputRef.current.value = address;
                    }
                })
                .catch((e: AxiosError) => {
                    if (
                        requestId !== reverseGeocodeRequestRef.current[location]
                    ) {
                        return;
                    }

                    setNotifications("booking", {
                        type: "error",
                        messages: "Reverse geocoding failed: " + e.message,
                    });
                })
                .finally(() => {
                    if (
                        requestId === reverseGeocodeRequestRef.current[location]
                    ) {
                        setLocUpdateProgress((prev) => ({
                            ...prev,
                            [location]: false,
                        }));
                    }
                });
        },
        [activeLocation, getLocationName, setNotifications],
    );

    /**
     * * =======================================
     * * Location Searching
     * * =======================================
     */
    const [searchingFor, setSearchingFor] = useState<
        "pickup" | "destination" | null
    >(null);
    const [locSearchInProgress, setLocSearchInProgress] =
        useState<boolean>(false);

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const searchLocation = useCallback(
        (loc?: string) => {
            if (!loc) {
                setNotifications("booking", {
                    type: "error",
                    messages: `Please enter the location to search for.`,
                });
                closeSearchResults();
                return;
            }

            const query = loc.trim();

            if (!query) return;
            setLocSearchInProgress(true);

            const params = new URLSearchParams({
                q: query,
                format: "jsonv2",
                limit: "5",
            });

            axios
                .get(`https://nominatim.openstreetmap.org/search?${params}`)
                .then((resp) => {
                    setSearchResults(resp.data);
                })
                .catch((e) => {
                    setNotifications("booking", {
                        type: "error",
                        messages: "Location search failed",
                    });
                    console.log(e);
                })
                .finally(() => {
                    setLocSearchInProgress(false);
                });
        },
        [setNotifications],
    );

    function closeSearchResults() {
        setSearchingFor(null);
        setSearchResults([]);
    }

    /**
     * * =======================================
     * * Using Current Location
     * * =======================================
     */
    const [isLocating, setIsLocating] = useState<boolean>(false);
    function useMyLocation() {
        if (!navigator.geolocation) {
            setNotifications("booking", {
                type: "error",
                messages: "Geolocation is not supported by this browser.",
            });
            return;
        }

        const requestId = ++reverseGeocodeRequestRef.current.pickup;

        setActiveLocation("pickup");
        closeSearchResults();
        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (requestId !== reverseGeocodeRequestRef.current.pickup) {
                    return;
                }

                const { latitude, longitude } = position.coords;
                const coords: Coordinates = [latitude, longitude];

                setRouteSummary(null);
                setPickup(coords);

                getLocationName(coords)
                    .then((resp) => {
                        if (
                            requestId !==
                            reverseGeocodeRequestRef.current.pickup
                        ) {
                            return;
                        }

                        if (pickupRef.current) {
                            pickupRef.current.value = resp.data.display_name;
                        }
                    })
                    .catch(() => {
                        if (
                            requestId !==
                            reverseGeocodeRequestRef.current.pickup
                        ) {
                            return;
                        }

                        setNotifications("booking", {
                            type: "error",
                            messages: "Unable to identify current location.",
                        });
                    })
                    .finally(() => {
                        if (
                            requestId ===
                            reverseGeocodeRequestRef.current.pickup
                        ) {
                            setIsLocating(false);
                        }
                    });
            },
            (error) => {
                if (requestId !== reverseGeocodeRequestRef.current.pickup) {
                    return;
                }

                let message: string;

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "Location permission denied.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location unavailable.";
                        break;
                    case error.TIMEOUT:
                        message = "Request timed out.";
                        break;
                    default:
                        message = "Unable to retrieve location.";
                }

                setNotifications("booking", {
                    type: "error",
                    messages: message,
                });

                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    }

    /**
     * * =======================================
     * * Route Summary
     * * =======================================
     */
    const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
    const handleRouteFound = useCallback((summary: RouteSummary) => {
        setRouteSummary(summary);
    }, []);

    return (
        <SectionLayoutComponent
            title="Booking"
            description="Choose your pickup and destination to proceed with booking."
        >
            {bookingNotifications && (
                <div className="border-none">
                    <Notification {...bookingNotifications} />
                </div>
            )}
            <div className="p-1 flex flex-col lg:flex-row flex-wrap gap-3 *:rounded">
                <div className="flex-1 flex flex-col gap-3 order-2 lg:order-1 *:dark:border-dark-accent/20">
                    {/* Planning */}
                    <div className="p-2 py-3 rounded border bg-primary/40 dark:bg-dark-primary/40">
                        {/* Pickup */}
                        <div className="relative *:mx-1">
                            <DividerComponent text="Pickup" />
                            <InputComponent
                                id="pickup"
                                placeholder="Search By Location"
                                customise="*:m-0"
                                label={{
                                    marker: {
                                        className:
                                            "bg-emerald-600 outline-emerald-600 outline-1! rounded-[2px] mx-0.5 size-2!",
                                    },
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveLocation("pickup");
                                }}
                                ref={pickupRef}
                            >
                                <div className="flex gap-1">
                                    {/* Search Buttons */}
                                    <ActionButton
                                        icon={MagnifyingGlassIcon}
                                        className="primary"
                                        onClick={() => {
                                            setActiveLocation("pickup");
                                            setSearchingFor("pickup");
                                            searchLocation(
                                                pickupRef.current
                                                    ? pickupRef.current.value
                                                    : undefined,
                                            );
                                        }}
                                        spinner={{
                                            isLoading: locUpdateProgress.pickup,
                                        }}
                                        disabled={
                                            locUpdateProgress.pickup ||
                                            isLocating
                                        }
                                    />

                                    {/* Current Location button */}
                                    <ActionButton
                                        text="Locate"
                                        icon={ViewfinderCircleIcon}
                                        spinner={{
                                            isLoading: isLocating,
                                        }}
                                        className="primary text-xs"
                                        onClick={useMyLocation}
                                        disabled={
                                            isLocating || searchingFor != null
                                        }
                                    />
                                </div>
                            </InputComponent>
                            {searchingFor === "pickup" && (
                                <SearchResultsComponent
                                    title="Select Pickup"
                                    results={searchResults}
                                    onSelect={(result) => {
                                        ++reverseGeocodeRequestRef.current
                                            .pickup;
                                        setIsLocating(false);
                                        setRouteSummary(null);
                                        setPickup([
                                            Number(result.lat),
                                            Number(result.lon),
                                        ]);
                                        if (pickupRef.current) {
                                            pickupRef.current.value =
                                                result.display_name;
                                        }
                                        setSearchResults([]);
                                    }}
                                    onClose={() => {
                                        closeSearchResults();
                                    }}
                                    spinner={{
                                        isLoading: locSearchInProgress,
                                    }}
                                />
                            )}
                        </div>

                        {/* Swap & Other options */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mx-1 mt-4">
                            <ActionButton
                                icon={ArrowsUpDownIcon}
                                className="primary"
                                onClick={() => {
                                    setRouteSummary(null);

                                    const tmp = pickup;
                                    setPickup(destination!);
                                    setDestination(tmp);

                                    const tmpPickupName =
                                        pickupRef.current!.value;
                                    pickupRef.current!.value =
                                        destinationRef.current!.value;
                                    destinationRef.current!.value =
                                        tmpPickupName;

                                    setActiveLocation((prev) =>
                                        prev
                                            ? prev === "pickup"
                                                ? "destination"
                                                : "pickup"
                                            : null,
                                    );
                                }}
                                disabled={
                                    destination === null || pickup === null
                                }
                            />
                        </div>

                        {/* Destination */}
                        <div className="relative *:mx-1">
                            <DividerComponent
                                text="Destination"
                                className="mx-1"
                            />
                            <InputComponent
                                id="destination"
                                placeholder="Search By Location"
                                customise="*:m-0"
                                label={{
                                    marker: {
                                        className:
                                            "bg-rose-400 outline-rose-400 outline-1! rounded-[2px] mx-0.5 size-2!",
                                    },
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveLocation("destination");
                                }}
                                ref={destinationRef}
                            >
                                <div className="flex gap-1">
                                    <ActionButton
                                        icon={MagnifyingGlassIcon}
                                        className="primary"
                                        onClick={() => {
                                            setActiveLocation("destination");
                                            setSearchingFor("destination");
                                            searchLocation(
                                                destinationRef.current
                                                    ? destinationRef.current
                                                          .value
                                                    : undefined,
                                            );
                                        }}
                                        spinner={{
                                            isLoading:
                                                locUpdateProgress.destination,
                                        }}
                                        disabled={locUpdateProgress.destination}
                                    />
                                </div>
                            </InputComponent>
                            {searchingFor === "destination" && (
                                <SearchResultsComponent
                                    title="Select Destination"
                                    results={searchResults}
                                    onSelect={(result) => {
                                        ++reverseGeocodeRequestRef.current
                                            .destination;
                                        setRouteSummary(null);
                                        setDestination([
                                            Number(result.lat),
                                            Number(result.lon),
                                        ]);
                                        if (destinationRef.current) {
                                            destinationRef.current.value =
                                                result.display_name;
                                        }
                                        setSearchResults([]);
                                    }}
                                    onClose={() => {
                                        closeSearchResults();
                                    }}
                                    spinner={{
                                        isLoading: locSearchInProgress,
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Fare details */}
                    {routeSummary != null && (
                        <RideSummaryComponent
                            summary={routeSummary}
                            className="*:p-3"
                        />
                    )}
                </div>
                <MapComponent
                    className="border lg:w-4/6 order-1 lg:order-2"
                    pickup={pickup}
                    destination={destination ?? undefined}
                    onMapClick={handleMapSelection}
                    showDirectionGuide={false}
                    onRouteFound={handleRouteFound}
                />
            </div>
        </SectionLayoutComponent>
    );
}
