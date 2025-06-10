import Pusher from "pusher";

const pusherSingleton = () => {
  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
};

global.pusher = global.pusher ?? pusherSingleton();

export default global.pusher;
