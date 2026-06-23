import { createContext, useState } from 'react';

export const AuthContext = createContext({
    "email": "",
    "phone": "",
    "fullName": "",
    "role": "",
    "avatar": "",
    "id": ""
});

const normalizeUser = (user) => {
  if (!user) return user;
  const fullName = user.fullName || user.full_name || user.name || user.username || user.email?.split('@')[0] || "User";
  return {
    email: user.email || "",
    phone: user.phone || "",
    fullName: fullName,
    role: user.role || "",
    avatar: user.avatar || user.avatarUrl || user.avatar_url || "",
    id: user.id || user._id || ""
  };
};

export const AuthWrapper = (props)=>{
    const [user,setUser]=useState({
        "email": "",
        "phone": "",
        "fullName": "",
        "role": "",
        "avatar": "",
        "id": ""
    })

    const [isAppLoading,setIsAppLoading]=useState(true);

    const setUserNormalized = (userData) => {
      const normalized = normalizeUser(userData);
      console.log("Normalized user:", normalized);
      setUser(normalized);
    };

    return (
        <AuthContext.Provider value={{user, setUser: setUserNormalized, isAppLoading, setIsAppLoading}}>
            {props.children}
        </AuthContext.Provider>
    )
}

