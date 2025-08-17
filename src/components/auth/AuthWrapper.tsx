"use client";

import { useAuth } from "@/hooks/useAuth";
import { EmergencyRecovery } from "@/components/auth/EmergencyRecovery";
import { useEffect, useState } from "react";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { loadingAuth } = useAuth();
  const [showEmergency, setShowEmergency] = useState(false);

  // Show emergency recovery if loading takes too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (loadingAuth) {
      timeoutId = setTimeout(() => {
        setShowEmergency(true);
      }, 8000); // Show emergency options after 8 seconds
    } else {
      setShowEmergency(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loadingAuth]);

  return (
    <>
      {children}
      {showEmergency && <EmergencyRecovery />}
    </>
  );
}
