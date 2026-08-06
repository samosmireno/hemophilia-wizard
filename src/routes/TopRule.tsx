import { Outlet } from "react-router";

export default function TopRule() {
  return (
    <>
      {/* Decorative, so there is no role to query it by — `data-top-rule` is the
          test seam. */}
      <div
        aria-hidden="true"
        data-top-rule=""
        className="fixed inset-x-0 top-0 z-30 h-rule bg-brand-crimson-50"
      />
      <Outlet />
    </>
  );
}
