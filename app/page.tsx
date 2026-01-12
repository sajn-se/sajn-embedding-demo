"use client";

import { Suspense, useCallback, useState } from "react";
import { useQueryState, parseAsBoolean, parseAsStringLiteral } from "nuqs";
import * as Dialog from "@radix-ui/react-dialog";
import { EmbedSignDocument, EmbedViewDocument } from "@sajn/embed-react";

const LANGUAGES = ["sv", "en", "no", "da", "fi", "de", "is", "es", "fr", "it"] as const;
type Language = (typeof LANGUAGES)[number];

const MODES = ["sign", "view"] as const;

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  sv: "Svenska",
  no: "Norsk",
  da: "Dansk",
  fi: "Suomi",
  de: "Deutsch",
  is: "Islenska",
  es: "Espanol",
  fr: "Francais",
  it: "Italiano",
};

interface LogEntry {
  timestamp: string;
  event: string;
  data?: Record<string, unknown>;
}

function DemoContent() {
  // All configuration in URL state
  const [documentId, setDocumentId] = useQueryState("documentId", { defaultValue: "" });
  const [token, setToken] = useQueryState("token", { defaultValue: "" });
  const [mode, setMode] = useQueryState("mode", parseAsStringLiteral(MODES).withDefault("sign"));
  const [language, setLanguage] = useQueryState("language", parseAsStringLiteral(LANGUAGES).withDefault("en"));
  const [host, setHost] = useQueryState("host", { defaultValue: "" });
  const [showScrollIndicator, setShowScrollIndicator] = useQueryState("scrollIndicator", parseAsBoolean.withDefault(true));
  const [allowDocumentRejection, setAllowDocumentRejection] = useQueryState("allowRejection", parseAsBoolean.withDefault(false));

  // Theme in URL state
  const [background, setBackground] = useQueryState("bg", { defaultValue: "" });
  const [primary, setPrimary] = useQueryState("primary", { defaultValue: "" });
  const [foreground, setForeground] = useQueryState("fg", { defaultValue: "" });
  const [mutedForeground, setMutedForeground] = useQueryState("muted", { defaultValue: "" });

  // Local state (not needed in URL)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((event: string, data?: Record<string, unknown>) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, event, data }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  // Build cssVars object (only include non-empty values)
  const cssVars = {
    ...(background && { background }),
    ...(primary && { primary }),
    ...(foreground && { foreground }),
    ...(mutedForeground && { mutedForeground }),
  };

  const canPreview = documentId.trim() && token.trim();

  // Key to force re-render when settings change
  const embedKey = `${documentId}-${token}-${mode}-${language}-${host}-${showScrollIndicator}-${allowDocumentRejection}-${background}-${primary}-${foreground}-${mutedForeground}`;

  // Shared embed props
  const embedProps = {
    documentId,
    token,
    language,
    ...(host && { host }),
    showScrollIndicator,
    ...(Object.keys(cssVars).length > 0 && { cssVars }),
    onDocumentReady: () => addLog("onDocumentReady"),
    onDocumentError: (data: { code: string; message: string }) => addLog("onDocumentError", data),
  };

  const renderEmbed = () => {
    if (!canPreview) {
      return (
        <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed border-zinc-200">
          <p className="text-sm text-zinc-400">
            Enter a Document ID and Token to preview
          </p>
        </div>
      );
    }

    if (mode === "sign") {
      return (
        <EmbedSignDocument
          key={embedKey}
          {...embedProps}
          className="h-full w-full"
          allowDocumentRejection={allowDocumentRejection}
          onSignerCompleted={(data) => addLog("onSignerCompleted", data)}
          onSignerRejected={(data) => addLog("onSignerRejected", data)}
        />
      );
    }

    return <EmbedViewDocument key={embedKey} {...embedProps} className="h-full w-full" />;
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              @sajn/embed-react Demo
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Configure and preview the sajn document embedding components
            </p>
          </div>
          <a
            href="https://github.com/sajn-se/sajn-embedding-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Source
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-zinc-900">
                Required
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-600">
                    Document ID
                  </label>
                  <input
                    type="text"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Enter document ID"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-600">
                    Token
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter signer token"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-zinc-900">
                Configuration
              </h2>
              <div className="space-y-4">
                {/* Mode toggle */}
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-600">
                    Mode
                  </label>
                  <div className="flex rounded-md border border-zinc-300">
                    <button
                      onClick={() => setMode("sign")}
                      className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                        mode === "sign"
                          ? "bg-zinc-900 text-white"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                      } rounded-l-md`}
                    >
                      Sign
                    </button>
                    <button
                      onClick={() => setMode("view")}
                      className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                        mode === "view"
                          ? "bg-zinc-900 text-white"
                          : "bg-white text-zinc-600 hover:bg-zinc-50"
                      } rounded-r-md`}
                    >
                      View
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-600">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {LANGUAGE_LABELS[lang]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Host */}
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-600">
                    Host (optional)
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="https://app.sajn.se"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showScrollIndicator}
                      onChange={(e) => setShowScrollIndicator(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                    />
                    <span className="text-sm text-zinc-700">
                      Show scroll indicator
                    </span>
                  </label>
                  {mode === "sign" && (
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allowDocumentRejection}
                        onChange={(e) => setAllowDocumentRejection(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                      />
                      <span className="text-sm text-zinc-700">
                        Allow document rejection
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </section>

            {/* Theme */}
            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-zinc-900">
                Theme (CSS Variables)
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-500">
                    Background
                  </label>
                  <input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="#ffffff"
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-500">
                    Primary
                  </label>
                  <input
                    type="text"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    placeholder="#000000"
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-500">
                    Foreground
                  </label>
                  <input
                    type="text"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    placeholder="#171717"
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-500">
                    Muted
                  </label>
                  <input
                    type="text"
                    value={mutedForeground}
                    onChange={(e) => setMutedForeground(e.target.value)}
                    placeholder="#737373"
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Preview */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
                <h2 className="text-sm font-medium text-zinc-900">
                  Preview
                </h2>
                <div className="flex gap-2">
                  <a
                    href={canPreview ? `/embed?documentId=${encodeURIComponent(documentId)}&token=${encodeURIComponent(token)}&mode=${mode}&language=${language}${host ? `&host=${encodeURIComponent(host)}` : ""}&scrollIndicator=${showScrollIndicator}&allowRejection=${allowDocumentRejection}${background ? `&bg=${encodeURIComponent(background)}` : ""}${primary ? `&primary=${encodeURIComponent(primary)}` : ""}${foreground ? `&fg=${encodeURIComponent(foreground)}` : ""}${mutedForeground ? `&muted=${encodeURIComponent(mutedForeground)}` : ""}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 ${!canPreview ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Open Fullscreen
                  </a>
                  <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                    <Dialog.Trigger asChild>
                      <button
                        disabled={!canPreview}
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Open in Dialog
                      </button>
                    </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white p-0 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
                        <Dialog.Title className="text-sm font-medium text-zinc-900">
                          {mode === "sign" ? "EmbedSignDocument" : "EmbedViewDocument"}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M12 4L4 12M4 4l8 8" />
                            </svg>
                          </button>
                        </Dialog.Close>
                      </div>
                      <div className="h-[500px] p-4">
                        <div className="h-full w-full">{renderEmbed()}</div>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
                </div>
              </div>
              <div className="h-[500px] p-4">
                <div className="h-full w-full">{renderEmbed()}</div>
              </div>
            </section>

            {/* Event Log */}
            <section className="rounded-lg border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
                <h2 className="text-sm font-medium text-zinc-900">
                  Event Log
                </h2>
                {logs.length > 0 && (
                  <button
                    onClick={clearLogs}
                    className="text-xs text-zinc-500 hover:text-zinc-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="h-[160px] overflow-y-auto p-4">
                {logs.length > 0 ? (
                  <div className="space-y-2 font-mono text-xs">
                    {logs.map((log, i) => (
                      <div key={i} className="text-zinc-600">
                        <span className="text-zinc-400">
                          {log.timestamp}
                        </span>{" "}
                        <span className="font-medium text-zinc-800">
                          {log.event}
                        </span>
                        {log.data && (
                          <span className="ml-2 text-zinc-500">
                            {JSON.stringify(log.data)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">
                    Events will appear here...
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <DemoContent />
    </Suspense>
  );
}
