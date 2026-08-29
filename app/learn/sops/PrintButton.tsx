"use client";

export function PrintButton() {
  return (
    <button className="button button--primary" type="button" onClick={() => window.print()}>
      Print this SOP
    </button>
  );
}
