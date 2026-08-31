export const EXTERNAL_LINK_REQUEST_EVENT = "phira:external-link-request";

export interface LinkOpenRequest {
  href: string;
  label?: string;
  sourceDialog?: HTMLDialogElement | null;
  target?: string;
}

export interface ExternalLinkRequest {
  href: string;
  label: string;
  sourceDialog?: HTMLDialogElement | null;
  target: string;
}

export type LinkOpenResult = "external" | "opened" | "invalid";

const supportedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

/** Open a link directly when local, or request confirmation when it leaves this origin. */
export function openLink(request: LinkOpenRequest): LinkOpenResult {
  let url: URL;
  try {
    url = new URL(request.href, window.location.href);
  } catch {
    return "invalid";
  }

  if (!supportedProtocols.has(url.protocol)) return "invalid";

  const target = request.target || "_self";
  const isExternalHttpLink =
    (url.protocol === "http:" || url.protocol === "https:") &&
    url.origin !== window.location.origin;

  if (isExternalHttpLink) {
    const detail: ExternalLinkRequest = {
      href: url.href,
      label: request.label?.replace(/\u2060/g, "").trim() ?? "",
      sourceDialog: request.sourceDialog,
      target,
    };
    window.dispatchEvent(
      new CustomEvent<ExternalLinkRequest>(EXTERNAL_LINK_REQUEST_EVENT, { detail }),
    );
    return "external";
  }

  if (target === "_self") {
    window.location.assign(url.href);
  } else {
    window.open(url.href, target, "noopener,noreferrer");
  }
  return "opened";
}
