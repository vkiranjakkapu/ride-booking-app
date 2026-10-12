import { EnvelopeIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useState, type SubmitEvent } from "react";
import type { ErrorResponse } from "../../api/api";
import ActionButton from "../../components/ActionButtonComponent";
import InputComponent from "../../components/formelements/InputComponent";
import useAuthContext from "../../context/auth/useAuthContext";
import useNotifications from "../../context/notifications/useNotifications";

export default function LandingPage() {
    const { login } = useAuthContext();
    const { addToast } = useNotifications();

    const [email, setEmail] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);

    function handleLogin(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        let proceed = true;
        if (!email || email.trim() === "") {
            addToast({
                type: "error",
                message: "Email is required!",
            });
            proceed = false;
        }
        if (!password || password.trim() === "") {
            addToast({
                type: "error",
                message: "Password is required!",
            });
            proceed = false;
        }

        if (!proceed) {
            return;
        }

        login(email!, password!).catch((e: ErrorResponse) => {
            addToast({
                type: "error",
                message: e,
            });
        });
    }

    return (
        <main className="h-screen flex items-center justify-center p-3 md:p-6">
            <form
                onSubmit={handleLogin}
                className="p-3 bg-white w-full md:w-3/5 lg:w-2/5 rounded bo shadow-lg"
            >
                <InputComponent
                    id="email"
                    label={{
                        icon: EnvelopeIcon,
                    }}
                    type="email"
                    name="email"
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                    placeholder="Email"
                    required
                />
                <InputComponent
                    id="password"
                    label={{
                        icon: KeyIcon,
                    }}
                    type="password"
                    name="password"
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                    placeholder="Password"
                    required
                />
                <ActionButton
                    type="submit"
                    text="SignIn"
                    icon={KeyIcon}
                    className="ml-auto"
                />
            </form>
        </main>
    );
}
