import React, { createContext, useContext, useState } from 'react';

interface InternetIdentityContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    identity: any;
}

const InternetIdentityContext = createContext<InternetIdentityContextType>({
    isAuthenticated: true,
    login: () => { },
    logout: () => { },
    identity: null,
});

export const InternetIdentityProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    return (
        <InternetIdentityContext.Provider value={{ isAuthenticated, login, logout, identity: "mock-identity" }}>
            {children}
        </InternetIdentityContext.Provider>
    );
};

export const useInternetIdentity = () => useContext(InternetIdentityContext);
