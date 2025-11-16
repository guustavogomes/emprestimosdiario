"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loading } from "@/components/ui/loading";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mostra loading quando a rota muda
    setLoading(true);

    // Esconde loading após um pequeno delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {loading && <Loading fullScreen text="Carregando..." />}
      {children}
    </>
  );
}
