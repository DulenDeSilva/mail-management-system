import {
    useEffect,
    useState
} from "react";
import type { ReactNode } from "react";
import { getMeRequest, loginRequest } from "../api/authApi";
import type { User } from "../types/auth";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    const setSession = (nextToken: string, nextUser: User) => {
        localStorage.setItem("token", nextToken);
        setToken(nextToken);
        setUser(nextUser);
    };

    const login = async (email: string, password: string) => {
        const data = await loginRequest(email, password);

        setSession(data.token, data.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedToken = localStorage.getItem("token");

                if (!savedToken) {
                    setLoading(false);
                    return;
                }

                const userData = await getMeRequest();
                setUser(userData);
            } catch {
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const value = {
        user,
        token,
        loading,
        login,
        setSession,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
