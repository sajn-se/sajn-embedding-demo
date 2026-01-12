"use client";

import { Suspense } from "react";
import { useQueryState, parseAsBoolean, parseAsStringLiteral } from "nuqs";
import { EmbedSignDocument, EmbedViewDocument } from "@sajn/embed-react";

const LANGUAGES = ["sv", "en", "no", "da", "fi", "de", "is", "es", "fr", "it"] as const;
const MODES = ["sign", "view"] as const;

function EmbedContent() {
  const [documentId] = useQueryState("documentId", { defaultValue: "" });
  const [token] = useQueryState("token", { defaultValue: "" });
  const [mode] = useQueryState("mode", parseAsStringLiteral(MODES).withDefault("sign"));
  const [language] = useQueryState("language", parseAsStringLiteral(LANGUAGES).withDefault("en"));
  const [host] = useQueryState("host", { defaultValue: "" });
  const [showScrollIndicator] = useQueryState("scrollIndicator", parseAsBoolean.withDefault(true));
  const [allowDocumentRejection] = useQueryState("allowRejection", parseAsBoolean.withDefault(false));

  const [background] = useQueryState("bg", { defaultValue: "" });
  const [primary] = useQueryState("primary", { defaultValue: "" });
  const [foreground] = useQueryState("fg", { defaultValue: "" });
  const [mutedForeground] = useQueryState("muted", { defaultValue: "" });

  const cssVars = {
    ...(background && { background }),
    ...(primary && { primary }),
    ...(foreground && { foreground }),
    ...(mutedForeground && { mutedForeground }),
  };

  const canPreview = documentId.trim() && token.trim();

  if (!canPreview) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <p className="text-zinc-400">Missing documentId or token</p>
      </div>
    );
  }

  const embedProps = {
    documentId,
    token,
    language,
    ...(host && { host }),
    showScrollIndicator,
    ...(Object.keys(cssVars).length > 0 && { cssVars }),
  };

  return (
    <div className="h-screen w-screen">
      {mode === "sign" ? (
        <EmbedSignDocument
          {...embedProps}
          className="h-full w-full"
          allowDocumentRejection={allowDocumentRejection}
        />
      ) : (
        <EmbedViewDocument {...embedProps} className="h-full w-full" />
      )}
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-white" />}>
      <EmbedContent />
    </Suspense>
  );
}
