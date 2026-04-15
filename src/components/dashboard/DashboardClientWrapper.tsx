"use client";

// By exporting these from a "use client" entrypoint, we force Next.js to treat them as Client Components
// and establish a definitive boundary for the Server Components importing them.
export { DocumentTable } from "./DocumentTable";
export { DashboardSearchBar } from "./DashboardSearchBar";
export { DashboardFilter } from "./DashboardFilter";
