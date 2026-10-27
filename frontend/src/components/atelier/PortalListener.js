import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { usePortalCode } from "@/lib/atelier";

// Écoute le code secret (admin) partout dans la Station
export default function PortalListener() {
  const { isAdmin } = useApp();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const inAtelier = pathname.startsWith("/atelier");
  const go = useCallback(() => nav("/atelier"), [nav]);
  usePortalCode(isAdmin && !inAtelier, go);
  return null;
}
