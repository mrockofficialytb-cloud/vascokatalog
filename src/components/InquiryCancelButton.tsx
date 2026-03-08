"use client";

export default function InquiryCancelButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const note = prompt("Zadejte důvod storna objednávky:");

        if (!note) {
          e.preventDefault();
          return;
        }

        const form = e.currentTarget.form;
        if (!form) {
          e.preventDefault();
          return;
        }

        const existing = form.querySelector('input[name="note"]');
        if (existing) existing.remove();

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "note";
        input.value = note;

        form.appendChild(input);
      }}
      className="h-10 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 text-xs font-semibold text-red-100 hover:bg-red-400/15"
    >
      ODMÍTNOUT
    </button>
  );
}