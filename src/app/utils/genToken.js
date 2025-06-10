export default function genToken(length) {
  let roomToken = "";
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let count = 0;
  while (count < length) {
    roomToken += chars.charAt(Math.floor(Math.random() * chars.length));
    count++;
  }
  return roomToken;
}
