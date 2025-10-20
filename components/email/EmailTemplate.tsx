import * as React from "react";

type Props = {
  firstName?: string;
  message?: string;
};

export function EmailTemplate({ firstName = "Friend", message }: Props) {
  return (
    <div
      style={{
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 20 }}>Welcome, {firstName}!</h1>
      {message ? (
        <p style={{ marginTop: 8, lineHeight: 1.5 }}>{message}</p>
      ) : (
        <p style={{ marginTop: 8, lineHeight: 1.5 }}>
          This is a test message from the Fari Makeup site.
        </p>
      )}
      <hr
        style={{
          margin: "16px 0",
          border: 0,
          borderTop: "1px solid #eee",
        }}
      />
      <p style={{ color: "#666", fontSize: 13 }}>Sent via Resend dev environment.</p>
    </div>
  );
}
