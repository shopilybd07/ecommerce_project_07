"use client";

export default function MessengerButton() {
  const pageUsername = "109668547124030"; // e.g. "YourPageName" for m.me/YourPageName
  const messengerUrl = `https://m.me/${pageUsername}`;

  const handleClick = () => {
    window.open(messengerUrl, "_blank");
  }

  return (
    <button onClick={handleClick}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "10px 20px",
              backgroundColor: "#0084ff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}>
      Message us on Messenger
    </button>
  );
}