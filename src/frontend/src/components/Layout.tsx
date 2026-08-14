import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useIsCallerAdmin } from "../hooks/useQueries";
import AdminBar from "./AdminBar";
import Footer from "./Footer";
import Header from "./Header";

/**
 * SSB Sas Kanggooroo — shared Layout shell.
 *
 * The page background is the blue field (--background). White card surfaces
 * (header nav boxes, page cards, footer brand) float on top of it. The
 * AdminBar sits above the header for logged-in admins, the Header carries
 * the white box-style menu, and the Footer anchors the deep navy zone.
 */
export default function Layout({ children }: { children?: ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin = false, isLoading } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  // Only show the admin bar once the admin check has resolved to true.
  // While loading or for non-admin signed-in users, keep the public shell.
  const showAdminBar = isAuthenticated && !isLoading && isAdmin;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showAdminBar && <AdminBar />}
      <Header />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}
