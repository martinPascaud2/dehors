export default function getDistance({ first, second }) {
  const { latitude: firstLat, longitude: firstLon } = first;
  const { latitude: secondLat, longitude: secondLon } = second;

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const earthRadius = 6371;
  const dLat = deg2rad(secondLat - firstLat);
  const dLon = deg2rad(secondLon - firstLon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(firstLat)) *
      Math.cos(deg2rad(secondLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c * 1000;
  return distance;
}
