"use client"
import "@/styles/globals.css";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { useEffect } from "react";
import { Providers } from "./providers";
import axios from "axios";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import DeviceDetector from "device-detector-js";

export default function RootLayout({ children }) {
  useEffect(() => {
    const deviceDetector = new DeviceDetector();
    const userAgent = navigator.userAgent;
    const device = deviceDetector.parse(userAgent);

    const handleClick = async (event) => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        const timestamp = new Date();

        // Obtener la dirección mediante la API de Google Maps con más detalles
        const apiKey = "AIzaSyDv5rNjL10dfS74oVAKpmjrhjI9MWmMvOQ";
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&result_type=street_address`
        );

        let address = "Dirección no disponible";
        let detailedAddress = {};

        if (response.data.results.length > 0) {
          address = response.data.results[0].formatted_address;
          
          // Extraer componentes detallados de la dirección
          const addressComponents = response.data.results[0].address_components;
          for (let component of addressComponents) {
            if (component.types.includes("street_number")) {
              detailedAddress.streetNumber = component.long_name;
            }
            if (component.types.includes("route")) {
              detailedAddress.street = component.long_name;
            }
            if (component.types.includes("locality")) {
              detailedAddress.city = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
              detailedAddress.state = component.long_name;
            }
            if (component.types.includes("country")) {
              detailedAddress.country = component.long_name;
            }
            if (component.types.includes("postal_code")) {
              detailedAddress.postalCode = component.long_name;
            }
          }
        }

        const browserInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          cookiesEnabled: navigator.cookieEnabled,
        };

        const screenInfo = {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
          pixelRatio: window.devicePixelRatio,
        };

        const networkInfo = {
          onLine: navigator.onLine,
          connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
        };

        const pageInfo = {
          url: window.location.href,
          referrer: document.referrer,
          loadTime: performance.now(),
        };

        const clickInfo = {
          target: {
            tagName: event.target.tagName,
            id: event.target.id,
            className: event.target.className,
          },
          pageX: event.pageX,
          pageY: event.pageY,
          scrollY: window.scrollY,
        };

        await addDoc(collection(db, "clicks"), {
          x: event.clientX,
          y: event.clientY,
          latitude,
          longitude,
          address,
          detailedAddress,
          timestamp: timestamp.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          device,
          browserInfo,
          screenInfo,
          networkInfo,
          pageInfo,
          clickInfo,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

      } catch (error) {
        console.error("Error al guardar el clic: ", error);
        if (error.code === 1) {
          alert("Permiso denegado para obtener la ubicación.");
        } else if (error.code === 2) {
          alert("La información de la ubicación no está disponible.");
        } else if (error.code === 3) {
          alert("El tiempo de espera para obtener la ubicación ha expirado.");
        } else {
          alert("Ocurrió un error al obtener la ubicación.");
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
                title="nextui.org homepage"
              >
                <span className="text-default-600">Powered by</span>
                <p className="text-primary">NextUI</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}