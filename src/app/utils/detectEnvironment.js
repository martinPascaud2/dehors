import Bowser from "bowser";

export function getIsIos({ window }) {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function getBrowserName({ window }) {
  const browser = Bowser.getParser(window.navigator.userAgent);
  let browserName = browser.getBrowserName();

  if (window.navigator.brave) {
    browserName = "Brave";
  }
  return browserName;
}

export function getIsPwa({ window }) {
  const isPwa = "standalone" in window.navigator && window.navigator.standalone;
  return isPwa;
}
