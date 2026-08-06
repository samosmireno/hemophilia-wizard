import { Outlet } from "react-router";

import { WizardAnswersProvider } from "../state/WizardAnswersProvider";
import AppSidebar from "./AppSidebar";

export default function AppShell() {
  return (
    <WizardAnswersProvider>
      <div
        aria-hidden="true"
        data-page-backdrop="default"
        className="fixed inset-0 -z-10 bg-page"
      />
      <main className="flex min-h-dvh flex-col px-6 pt-below-rule pb-bar sm:px-12 lg:px-gutter lg:pt-below-rule-lg lg:pr-gutter-rail lg:pb-0">
        <div className="mx-auto flex w-full max-w-content flex-1 flex-col">
          <Outlet />
        </div>
      </main>
      <AppSidebar />
    </WizardAnswersProvider>
  );
}
