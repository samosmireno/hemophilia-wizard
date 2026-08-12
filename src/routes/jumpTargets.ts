import { BookIcon, DocumentIcon, HelpIcon, HomeIcon, InfoIcon, WizardIcon } from "mlg-components";

/**
 * The sidebar's six jump targets, in rail order. Its own module (not a
 * component export from `AppSidebar`) so `/how-to`'s legend can annotate the
 * same roster without tripping react-refresh's components-only rule.
 */
export const JUMP_TARGETS = [
  { path: "/", label: "Home", Icon: HomeIcon },
  { path: "/wizard", label: "Wizard", Icon: WizardIcon },
  { path: "/how-to", label: "How To", Icon: HelpIcon },
  { path: "/acronyms", label: "Acronyms", Icon: BookIcon },
  { path: "/references", label: "References", Icon: DocumentIcon },
  { path: "/glossary", label: "Glossary", Icon: InfoIcon },
] as const;
