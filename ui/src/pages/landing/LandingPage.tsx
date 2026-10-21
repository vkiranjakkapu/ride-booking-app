import {
    CheckIcon,
    ClockIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    KeyIcon,
    LockClosedIcon,
    MapPinIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    UserIcon,
    UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useState, type SubmitEvent } from "react";
import type { ErrorResponse } from "../../api/api";
import ActionButton from "../../components/ActionButtonComponent";
import InputComponent from "../../components/formelements/InputComponent";
import SectionLayoutComponent from "../../components/layouts/SectionLayoutComponent";
import LoadingPortalComponent from "../../components/LoadingPortalComponent";
import ModalComponent from "../../components/ModalComponent";
import Notification from "../../components/notifications/Notification";
import { useNotifications } from "../../components/notifications/useNotifications";
import useAuthContext, {
    AuthStatus,
    RoleType,
    type UserProfile,
} from "../../context/auth/useAuthContext";
import useToastNotifications from "../../context/toasts/useToastNotifications";
import UserService from "../../services/UserService";

export default function LandingPage() {
    const { status, login } = useAuthContext();

    const { addToast } = useToastNotifications();
    const { notifications, setNotifications } = useNotifications(["login"]);
    const modalNotifications = notifications["login"] ?? null;

    const [loginModal, setLoginModal] = useState<"login" | "register" | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function authenticateUser(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        login(String(formData.get("email")), String(formData.get("password")))
            .catch((e: ErrorResponse) => {
                if (e.errorCode === "500") {
                    addToast({
                        type: "error",
                        message: e,
                        useBold: true,
                    });
                    return;
                }
                setNotifications("login", {
                    type: "error",
                    messages:
                        e.validationErrors.length > 0
                            ? e.validationErrors.map(
                                  (ve) => `${ve.field} ${ve.message}`,
                              )
                            : [e.errorMessage],
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const [roleType, setRoleType] = useState<RoleType | null>(null);
    function registerUser(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (!roleType) {
            addToast({
                type: "warn",
                message: "RoleType Is required",
                useBold: true,
            });
            return;
        }

        if (!window.confirm(`Confirm registration as a '${roleType}'`)) {
            return;
        }

        setIsLoading(true);
        formData.append("type", roleType);

        UserService.register<UserProfile>(formData)
            .then(() => {
                setLoginModal(null);
                login(
                    String(formData.get("email")),
                    String(formData.get("password")),
                );
            })
            .catch((e: ErrorResponse) => {
                if (e.errorCode === "500") {
                    addToast({
                        type: "error",
                        message: e,
                        useBold: true,
                    });
                    return;
                }
                setNotifications("login", {
                    type: "error",
                    messages: e,
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <>
            <SectionLayoutComponent
                title="Your journey, made simpler"
                description="Reliable rides. Easy booking. A smoother way to get there."
                className="overflow-hidden h-screen sm:p-6! lg:p-12! *:first:*:space-y-3 *:first:*:pb-3"
            >
                <div className="space-y-3">
                    <div className="grid items-center gap-8 py-6 md:grid-cols-2 md:py-10">
                        <div className="space-y-5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-current/15 px-3 py-1 text-sm text-style-secondary">
                                <GlobeAltIcon className="size-4" />
                                Your ride, your way
                            </span>
                            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                Get there with{" "}
                                <span className="text-style-primary">
                                    Cab Ride.
                                </span>
                            </h2>
                            <p className="max-w-xl text-base leading-7 text-style-secondary sm:text-lg">
                                Book a ride in a few simple steps, follow your
                                ride status, and keep your trip details together
                                in one place.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <ActionButton
                                    text="Get started"
                                    icon={UserPlusIcon}
                                    className="primary rounded-full justify-center"
                                    onClick={() => setLoginModal("register")}
                                />
                                <ActionButton
                                    text="Sign in"
                                    icon={LockClosedIcon}
                                    className="rounded-full justify-center"
                                    onClick={() => setLoginModal("login")}
                                />
                            </div>
                            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm text-style-secondary">
                                <span className="inline-flex items-center gap-2">
                                    <CheckIcon className="size-4" /> Simple
                                    booking
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckIcon className="size-4" /> Ride status
                                    updates
                                </span>
                            </div>
                        </div>
                        <div className="relative mx-auto w-full max-w-md">
                            <div className="absolute inset-8 rounded-full bg-current opacity-[0.04] blur-2xl" />
                            <div className="relative rounded-3xl border border-current/10 bg-theme p-5 shadow-xl sm:p-7">
                                <div className="mb-6 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-style-secondary">
                                            Your next trip
                                        </p>
                                        <h3 className="text-xl font-semibold">
                                            A smoother ride starts here
                                        </h3>
                                    </div>
                                    <div className="rounded-2xl border border-current/10 p-3">
                                        <MapPinIcon className="size-7" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-3 rounded-xl border border-current/10 p-4">
                                        <span className="mt-1 size-3 shrink-0 rounded-full border-2 border-current" />
                                        <div>
                                            <p className="text-xs text-style-secondary">
                                                PICKUP
                                            </p>
                                            <p className="font-medium">
                                                Choose your pickup location
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-5 h-5 border-l border-dashed border-current/30" />
                                    <div className="flex gap-3 rounded-xl border border-current/10 p-4">
                                        <MapPinIcon className="mt-1 size-4 shrink-0" />
                                        <div>
                                            <p className="text-xs text-style-secondary">
                                                DESTINATION
                                            </p>
                                            <p className="font-medium">
                                                Where would you like to go?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 flex items-center gap-2 rounded-xl bg-current/5 p-3 text-sm text-style-secondary">
                                    <ClockIcon className="size-5 shrink-0" />
                                    <span>
                                        Plan your trip in just a few steps.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
                        <article className="rounded-2xl border border-current/10 p-5">
                            <div className="mb-4 inline-flex rounded-xl border border-current/10 p-3">
                                <MapPinIcon className="size-6" />
                            </div>
                            <h3 className="mb-2 font-semibold">
                                Easy ride booking
                            </h3>
                            <p className="text-sm leading-6 text-style-secondary">
                                Choose your pickup and destination, review your
                                trip, and request a ride with ease.
                            </p>
                        </article>
                        <article className="rounded-2xl border border-current/10 p-5">
                            <div className="mb-4 inline-flex rounded-xl border border-current/10 p-3">
                                <ClockIcon className="size-6" />
                            </div>
                            <h3 className="mb-2 font-semibold">
                                Stay up to date
                            </h3>
                            <p className="text-sm leading-6 text-style-secondary">
                                Keep track of ride progress and see trip
                                information as your journey moves forward.
                            </p>
                        </article>
                        <article className="rounded-2xl border border-current/10 p-5 sm:col-span-2 lg:col-span-1">
                            <div className="mb-4 inline-flex rounded-xl border border-current/10 p-3">
                                <ShieldCheckIcon className="size-6" />
                            </div>
                            <h3 className="mb-2 font-semibold">
                                One place for your trips
                            </h3>
                            <p className="text-sm leading-6 text-style-secondary">
                                Access your ride history and account details
                                whenever you need them.
                            </p>
                        </article>
                    </div>

                    <p className="py-2 text-center text-xs text-style-secondary">
                        Cab Ride · A simpler way to get where you need to go.
                    </p>
                </div>
            </SectionLayoutComponent>

            <ModalComponent
                title={loginModal + ""}
                isOpen={loginModal != null}
                onClose={() => setLoginModal(null)}
                icon={loginModal === "login" ? LockClosedIcon : UserPlusIcon}
            >
                <form
                    onSubmit={(e) => {
                        if (loginModal === "login") authenticateUser(e);
                        else registerUser(e);
                    }}
                    className="space-y-3 p-1"
                >
                    {modalNotifications && (
                        <Notification {...modalNotifications} />
                    )}
                    {loginModal === "register" ? (
                        <>
                            <div className="flex flex-wrap items-center gap-3 *:flex-1">
                                {!roleType && (
                                    <div className="w-full! flex-auto! text-sm flex items-center gap-1">
                                        <InformationCircleIcon className="size-4" />
                                        <span>
                                            How do you want to register?
                                        </span>
                                    </div>
                                )}
                                <ActionButton
                                    className={`w-full justify-center ${roleType === RoleType.DRIVER ? `primary` : ``}`}
                                    text={RoleType.DRIVER}
                                    icon={GlobeAltIcon}
                                    onClick={() => setRoleType(RoleType.DRIVER)}
                                />
                                <ActionButton
                                    className={`w-full justify-center ${roleType === RoleType.RIDER ? `primary` : ``}`}
                                    text={RoleType.RIDER}
                                    icon={UserCircleIcon}
                                    onClick={() => setRoleType(RoleType.RIDER)}
                                />
                            </div>
                            <hr className="border-t mx-1" />
                            <InputComponent
                                type="email"
                                label={{ icon: EnvelopeIcon }}
                                placeholder="Email"
                                name="email"
                                id="email"
                                required
                            />
                            <InputComponent
                                placeholder="First Name"
                                label={{ icon: UserIcon }}
                                name="firstName"
                                id="firstName"
                                required
                            />
                            <InputComponent
                                placeholder="Last Name"
                                label={{ icon: UserIcon }}
                                name="lastName"
                                id="lastName"
                                required
                            />
                            <hr className="border-t mx-1" />
                            <InputComponent
                                type="password"
                                label={{ icon: KeyIcon }}
                                placeholder="Create Password"
                                name="password"
                                id="password"
                                required
                            />
                            <InputComponent
                                type="password"
                                label={{ icon: CheckIcon }}
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                id="confirmPassword"
                                required
                            />
                        </>
                    ) : (
                        <>
                            <InputComponent
                                type="email"
                                placeholder="Email"
                                name="email"
                                id="email"
                                required
                            />
                            <InputComponent
                                type="password"
                                placeholder="Password"
                                name="password"
                                id="password"
                                required
                            />
                        </>
                    )}
                    <ActionButton
                        type="submit"
                        className="capitalize primary rounded-full w-full justify-center"
                        text={loginModal + ""}
                        spinner={{ isLoading }}
                        icon={loginModal === "login" ? KeyIcon : UserPlusIcon}
                        disabled={isLoading}
                    />
                    <p className="text-style-secondary text-center text-xs my-3">
                        OR
                    </p>
                    <ActionButton
                        type="button"
                        className="capitalize rounded-full w-full justify-center"
                        icon={
                            loginModal === "login"
                                ? UserPlusIcon
                                : LockClosedIcon
                        }
                        text={loginModal === "login" ? "Register" : "Login"}
                        onClick={() => {
                            setLoginModal(
                                loginModal === "login" ? "register" : "login",
                            );
                        }}
                    />
                </form>
            </ModalComponent>
            <LoadingPortalComponent
                isLoading={status === AuthStatus.INITIALIZING}
                message="Preparing your session."
            />
        </>
    );
}
