"use client";

import { useState } from "react";

type Props = {
  inquiryId: string;
  orderLabel: string;
};

export default function DeleteInquiryButton({ inquiryId, orderLabel }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <button
        onClick={() => setConfirmDelete(true)}
        title="Smazat poptávku"
        className="absolute bottom-3 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v7m4-7v7m4-7v7M8 7l1 12h6l1-12"
          />
        </svg>
      </button>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="text-lg font-semibold text-white">
              Opravdu chcete odstranit poptávku?
            </div>

            <div className="mt-3 text-sm text-zinc-400">
              Tato akce je nevratná.
            </div>

            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <span className="font-semibold text-white">{orderLabel}</span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
              >
                Ne
              </button>

              <form action="/api/admin/inquiries/delete" method="post">
                <input type="hidden" name="inquiryId" value={inquiryId} />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Ano
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}