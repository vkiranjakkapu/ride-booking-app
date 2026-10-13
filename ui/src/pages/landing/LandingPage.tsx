import {
    CheckIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    KeyIcon,
    LockClosedIcon,
    UserCircleIcon,
    UserIcon,
    UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useState, type SubmitEvent } from "react";
import type { ErrorResponse } from "../../api/api";
import ActionButton from "../../components/ActionButtonComponent";
import InputComponent from "../../components/formelements/InputComponent";
import DashboardLayout from "../../components/layouts/DashboardLayout";
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
            <DashboardLayout
                handleLoginClick={() => setLoginModal("login")}
                handleRegisterClick={() => setLoginModal("register")}
            >
                <h1>Welcome</h1>
            </DashboardLayout>

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
