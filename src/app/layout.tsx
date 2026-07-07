import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Providers from "@/components/Providers"

export const metadata: Metadata = {
  title: "TCare R3 — Revenue Recovery Radar | Wira Toyota",
  description:
    "Sistem tracking servis kendaraan Toyota berbasis web untuk Wira Toyota. Pantau revenue, histori servis, dan prioritas follow-up pelanggan secara real-time.",
  keywords: ["Toyota", "Wira Toyota", "TCare", "R3", "servis kendaraan", "tracking"],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="id" className="dark" style={{ height: "100%" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="antialiased"
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Providers>
          {session ? (
            <div
              className="app-shell"
              style={{
                display: "flex",
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Fixed Sidebar */}
              <div
                className="app-sidebar"
                style={{
                  width: "280px",
                  minWidth: "280px",
                  maxWidth: "280px",
                  height: "100vh",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 50,
                }}
              >
                <Sidebar />
              </div>

              {/* Main Content */}
              <main
                className="app-main"
                style={{
                  flex: 1,
                  height: "100vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                  position: "relative",
                  minWidth: 0,
                }}
              >
                {/* Background glow overlay */}
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: "280px",
                    pointerEvents: "none",
                    zIndex: 0,
                    opacity: 0.4,
                    background:
                      "radial-gradient(circle at 78% 0%, rgba(34,211,238,0.15), transparent 32%)",
                  }}
                />
                <div className="app-content" style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
                  {children}
                </div>
              </main>
            </div>
          ) : (
            <main style={{ minHeight: "100vh", width: "100%" }}>
              {children}
            </main>
          )}
        </Providers>
      </body>
    </html>
  )
}
