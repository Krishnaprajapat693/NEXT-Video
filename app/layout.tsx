import "./globals.css";
import { Providers } from "./components/Providers";
import InstagramNav from "./components/InstagramNav";
import { ProfileProvider } from "./context/ProfileContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", overflow: "hidden", background: "#F0E7D5" }}>
        <Providers>
          <ProfileProvider>
            <InstagramNav />
            <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#F0E7D5" }}>
              {children}
            </main>
          </ProfileProvider>
        </Providers>
      </body>
    </html>
  );
}
