"use client";
export default async function getLocation() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          resolve({ latitude, longitude });
        },
        () => {
          reject({ message: "Activez votre géolocalisation" });
        }
      );
    } else {
      reject(new Error({ message: "Activez votre géolocalisation" }));
    }
  });
}
