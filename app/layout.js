import "./globals.css";

export const metadata = {
  title: "To-Do App",
  description: "Interactive To-Do App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}