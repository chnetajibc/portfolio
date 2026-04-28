import React from "react";
import HireForm from "./HireForm";

// Chat now renders text replies only — except for the hire flow which gets a form.
export function ChatCards({ reply }) {
  if (!reply) return null;
  if (reply.kind === "hire-form") return <HireForm />;
  return null;
}
