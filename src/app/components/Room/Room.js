"use client";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Pusher from "pusher-js";
import QRCode from "react-qr-code";

import useWake from "@/utils/useWake";
import usePreventBackSwipe from "@/utils/usePreventBackSwipe";
import usePreventScroll from "@/utils/usePreventScroll";
import genToken from "@/utils/genToken";
import getLocation from "@/utils/getLocation";
import getErrorInformations from "@/utils/getErrorInformations";
import { getRoomFriendList } from "@/utils/getFriendList";
import { saveLastParams } from "@/utils/getLastParams";
import free from "@/utils/queue/free";
import wait from "@/utils/queue/wait";
import cancelBack from "@/utils/cancelBack";
import { gamesRefs, categoriesIcons, categoriesLabels } from "@/assets/globals";

// import dynamic from "next/dynamic";
// const CornerTriangle = dynamic(
//   () => import("../Triangle").then((mod) => mod.CornerTriangle),
//   { ssr: false }
// );

import { CornerTriangle } from "../Triangle";
import { LobbyDeleteGroup } from "@/components/DeleteGroup";
import ChooseAnotherGame from "./ChooseAnotherGame";
import Limits from "./Limits";
import IconFromName from "../IconFromName";
import GameChooser from "./GameChooser";
import NextStep from "../NextStep";
import AnimatedDots from "../AnimatedDots";
import LoadingRoomOctagon from "./LoadingRoomOctagon";
import ThreeSmoke from "./ThreeSmoke";

import {
  CheckIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import { ImExit } from "react-icons/im";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IoIosPeople } from "react-icons/io";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoMdArrowDropright } from "react-icons/io";
import { LiaQrcodeSolid } from "react-icons/lia";
import { FaRegHourglassHalf } from "react-icons/fa6";

import "./room.css";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
  useTLS: true,
});
var pusherPresence;
var presenceChannel;

const UserContext = createContext();

import {
  serverCreate,
  goOneMoreGame,
  inviteFriend,
  publicInviteAll,
  deleteInvitations,
  deletePublicInvitations,
  removeArrival,
  serverJoin,
  triggerGamers,
  triggerMultiguests,
  serverDeleteGamer,
  serverAddMultiGuest,
  serverDeleteMultiGuest,
  getUniqueName,
  getRoomId,
  getRoomRefs,
  changeOptions,
  togglePrivacy,
  saveLocation,
  checkConnection,
  retryGamerConnection,
  retryMultiGuestConnection,
  sendPresenceSign,
  sendOnlineGamers,
  getGroup,
  cancelSearchGame,
} from "./actions";

const subscribePresenceChannel = ({ userId, userName, status, roomToken }) => {
  pusherPresence = new Pusher("61853af9f30abf9d5b3d", {
    cluster: "eu",
    useTLS: true,
    authEndpoint: "/api/pusherAuth/",
    auth: {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        userId,
        userName,
        multiGuest: (status === "multiGuest").toString(),
      },
    },
  });

  presenceChannel = pusherPresence.subscribe(`custom-presence-${roomToken}`);
};

const bindCheckPresence = ({ setOnlineGamers }) => {
  let pingTimeStamps = {};

  presenceChannel.bind("check-presence", (presence) => {
    pingTimeStamps[presence.userName] = presence.time;

    Object.entries(pingTimeStamps).forEach((stamp) => {
      if (Date.now() - stamp[1] > 40000) {
        delete pingTimeStamps[stamp[0]];
        setOnlineGamers((prevOnlines) => {
          const newOnlines = prevOnlines.filter(
            (online) => online.userName !== stamp[0]
          );
          return newOnlines;
        });
      } else {
        const { userId, userName, multiGuest } = presence;
        setOnlineGamers((prevOnlines) => {
          if (prevOnlines.some((online) => online.userName === userName))
            return prevOnlines;
          else return [...prevOnlines, { userId, userName, multiGuest }];
        });
      }
    });
  });
};

const bindAdminOnlines = ({ setOnlineGamers, lastAdminPingRef }) => {
  presenceChannel.bind("send-onlineGamers", (onlines) => {
    lastAdminPingRef.current = Date.now();
    setOnlineGamers(onlines.onlineGamers);
  });
};

export default function Room({
  user,
  categorie,
  gameName,
  Game,
  Options,
  launchGame,
}) {
  usePreventScroll();
  const { isSupported, isVisible, released, request, release } = useWake();
  usePreventBackSwipe();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchToken = searchParams.get("token");
  const searchChangeGame = Boolean(searchParams.get("changeGame"));
  const searchIsAdmin = Boolean(searchParams.get("isAdmin"));
  const searchMode = useMemo(() => searchParams.get("mode"), []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [roomId, setRoomId] = useState(0);
  const [inputToken, setInputToken] = useState("");
  const [roomToken, setRoomToken] = useState();
  const [isChosen, setIsChosen] = useState(false); // gamer has joined
  const [uniqueName, setUniqueName] = useState();
  const [isHere, setIsHere] = useState(false); // connection
  const isPresenceIntervalStartedRef = useRef(false);
  const isBoundCheckPresenceRef = useRef(false);
  const onlineGamersRef = useRef([]);
  const lastSentOnlinesRef = useRef([]);
  const adminNameRef = useRef();
  const lastAdminPingRef = useRef();
  const [multiGuestId, setMultiGuestId] = useState();
  const [multiGuestDataId, setMultiGuestDataId] = useState();
  const [inGameUser, setInGameUser] = useState();
  const [joinError, setJoinError] = useState();
  const [isPrivate, setIsPrivate] = useState();
  const [geoLocation, setGeoLocation] = useState(null);
  const [serverMessage, setServerMessage] = useState("");

  const [adminSelectedCategorie, setAdminSelectedCategorie] = useState(null);
  const [adminSearchtCategorie, setAdminSearchtCategorie] = useState(null);
  const [adminSelectedGame, setAdminSelectedGame] = useState(null);
  const [adminSearchtGame, setAdminSearchtGame] = useState(null);
  const [adminSelectedMode, setAdminSelectedMode] = useState(null);
  const [adminChangeSameGameNewMode, setAdminChangeSameGameNewMode] =
    useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [isJoinStarted, setIsJoinStarted] = useState(false);

  const [friendsList, setFriendsList] = useState();
  const [invitedList, setInvitedList] = useState([]);
  const [group, setGroup] = useState();
  const [gamerList, setGamerList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [multiGuestList, setMultiGuestList] = useState([]);
  const [deletedGamer, setDeletedGamer] = useState(null);

  const [options, setOptions] = useState({});
  const [gameData, setGameData] = useState({});
  const [gameBackground, setGameBackground] = useState("smoke");
  const [onlineGamers, setOnlineGamers] = useState([]);

  const [showPlayers, setShowPlayers] = useState(true);
  const [showGamerList, setShowGamerList] = useState(true);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showRoomRefs, setShowRoomRefs] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [hasLoadingOctagonAnimated, setHasLoadingOctagonAnimated] =
    useState(false);
  const userParams = user.params;
  const barsSizes = useMemo(
    () => ({
      bottom: userParams?.bottomBarSize || 8,
      top: userParams?.topBarSize || 8,
    }),
    [userParams?.bottomBarSize, userParams?.topBarSize]
  );
  useEffect(() => {
    if (!barsSizes) return;
    const dynamicHeight = `calc(90vw + ${barsSizes.top / 4}rem + ${
      barsSizes.bottom / 4
    }rem)`;
    document.documentElement.style.setProperty(
      "--dynamic-height",
      dynamicHeight
    );

    const dynamicWidth = "100%";
    document.documentElement.style.setProperty("--dynamic-width", dynamicWidth);
  }, [barsSizes]);

  const localWidth = localStorage
    ? JSON.parse(localStorage.getItem("localWidth"))
    : null;
  const isJoining = (!isChosen && !group) || isPrivate === undefined;

  // admin room_creation
  const createRoom = useCallback(
    async (privacy, storedLocation, storedViceAdmin, storedArrivalsOrder) => {
      if (isChosen) return;
      const newRoomToken = genToken(10);

      localStorage.setItem(
        "reservedName",
        JSON.stringify({ roomToken: newRoomToken, name: user.name })
      );

      const {
        error,
        gamers,
        roomId: room_id,
      } = await serverCreate(
        newRoomToken,
        privacy,
        user,
        gameName,
        storedLocation,
        storedViceAdmin,
        storedArrivalsOrder
      );

      if (error) {
        setServerMessage(error);
      } else {
        const channel = pusher.subscribe(`room-${newRoomToken}`);

        channel.bind("room-event", async function (data) {
          data.clientGamerList &&
            setGamerList((prevGamerList) => [
              ...new Set([...data.clientGamerList, ...prevGamerList]),
            ]);
          data.multiGuestList &&
            data.multiGuestList.length &&
            setMultiGuestList((prevMultiGuestList) => [
              ...new Set([...data.multiGuestList, ...prevMultiGuestList]),
            ]);
          data.gameData && setGameData(data.gameData);
          if (data.deleted) {
            await removeArrival({
              roomId: room_id,
              deletedGamer: data.deleted,
            });

            setDeletedGamer(data.deleted);
            setInvitedList((prevInv) =>
              prevInv.filter((inv) => inv !== data.deleted)
            );
            setGroup((prevGroup) => ({
              ...prevGroup,
              gamers: gamerList.filter((gamer) => gamer !== data.deleted),
              multiGuests: multiGuestList.filter(
                (multiGuest) => multiGuest !== data.deleted
              ),
              arrivalsOrder: prevGroup?.arrivalsOrder?.filter(
                (arrival) => arrival.userName !== data.deleted
              ),
            }));
          }
          data.privacy !== undefined && setIsPrivate(data.privacy);
        });

        // subscribePresenceChannel({
        //   userId: user.id,
        //   userName: user.name,
        //   status: "standard",
        //   setOnlineGamers,
        //   roomToken: newRoomToken,
        // });

        setRoomToken(newRoomToken);
        setUniqueName(user.name);
        setIsAdmin(true);
        setGamerList(gamers);
        setIsChosen(true);
        setServerMessage("");

        router.replace(
          `${pathname}?token=${newRoomToken}${
            searchChangeGame ? "&changeGame=true&isAdmin=true" : ""
          }`
        );
      }
    },
    [user, gameName, gamerList, invitedList, searchChangeGame]
  );
  // ------------------------------

  // admin group_management
  useEffect(() => {
    const storedGroup = JSON.parse(localStorage.getItem("group"));
    const storedGroupPrivacy = storedGroup?.privacy;
    const storedLocation = storedGroup?.lastPosition;
    const storedViceAdmin = storedGroup?.viceAdmin;
    const storedArrivalsOrder = storedGroup?.arrivalsOrder;

    const init = async () => {
      await createRoom(
        storedGroupPrivacy || "private",
        storedLocation,
        storedViceAdmin,
        storedArrivalsOrder
      );
      storedLocation && setGeoLocation(storedLocation);
    };
    !searchToken && init();
  }, []);

  useEffect(() => {
    const storedGroup = JSON.parse(localStorage.getItem("group"));
    if (!roomToken && storedGroup) {
      setGroup(storedGroup);
    }
  }, [roomToken, gameName]);

  useEffect(() => {
    if (
      !gameName ||
      !group?.roomToken ||
      !pathname ||
      !roomToken ||
      roomToken === null ||
      gameData.ended ||
      !roomId
    )
      return;

    const storedGroup = JSON.parse(localStorage.getItem("group"));

    const go = async () => {
      if (!storedGroup) return;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // check
        await goOneMoreGame({
          pathname,
          oldRoomToken: storedGroup.roomToken,
          newRoomToken: roomToken,
          gameName,
          roomId,
          changeGame: searchChangeGame,
        });
        localStorage.removeItem("group");
      } catch (error) {
        console.error("error", error);
      }
    };
    go();
  }, [
    gameName,
    group,
    pathname,
    roomToken,
    gameData.ended,
    roomId,
    searchChangeGame,
  ]);
  // ------------------------------

  //admin privacy_management
  const togglePriv = useCallback(async () => {
    await togglePrivacy({ roomId, roomToken, privacy: isPrivate });
    group &&
      setGroup((prevGroup) => ({
        ...prevGroup,
        privacy: !isPrivate ? "private" : "public",
      }));
  }, [isPrivate, roomId]);
  // ------------------------------

  //admin options_management
  useEffect(() => {
    if (
      !isAdmin ||
      !options ||
      !Object.keys(options).length ||
      !roomId ||
      !roomToken
    )
      return;

    const editOptions = async () => {
      await changeOptions({ roomId, roomToken, options });
    };
    editOptions();
  }, [options, isAdmin, roomId, roomToken]);
  // ------------------------------

  // admin launch_room
  const launchRoom = useCallback(async () => {
    gameName !== "grouping" &&
      Object.keys(options).length &&
      (await saveLastParams({ userId: user.id, options }));
    const { error } = await launchGame({
      roomId,
      roomToken,
      adminId: user.id,
      gamers: gamerList,
      guests: guestList,
      multiGuests: multiGuestList,
      options,
    });

    if (error) {
      setServerMessage(error);
    } else {
      setServerMessage("");
      setIsStarted(true);
    }
  }, [
    gameName,
    options,
    roomId,
    roomToken,
    user.id,
    gamerList,
    guestList,
    multiGuestList,
  ]);
  // ------------------------------

  // join Room
  const joinRoom = useCallback(
    async ({ inputToken }) => {
      const token = inputToken.toUpperCase();
      const room_id = await getRoomId(token);

      const reserved = JSON.parse(localStorage.getItem("reservedName"));
      const reservedToken = reserved?.roomToken;
      const reservedName = reserved?.name;
      const isReserved =
        reservedToken === token ||
        (reservedToken === group?.roomToken && reservedToken && group);
      const wantedName = isReserved ? reservedName : user.name;
      const uniqueUserName = await getUniqueName(
        room_id,
        wantedName,
        isReserved
      );
      localStorage.setItem(
        "reservedName",
        JSON.stringify({ roomToken: token, name: uniqueUserName })
      );

      const { error, joinData } = await serverJoin({
        token,
        user: { ...user, name: uniqueUserName },
      });

      if (error) {
        setJoinError(error);
      } else {
        if (joinData === undefined) return;
        if (joinData.isJoinAgain) {
          setIsStarted(joinData.isStarted);
          setIsJoinStarted(joinData.isStarted);
          setGameData(joinData.gameData);
          setIsAdmin(joinData.admin === uniqueUserName);
          joinData.admin === uniqueUserName &&
            joinData.adminLocation &&
            setGeoLocation(joinData.adminLocation);
          setOptions(joinData.options);
        }
        const { gamers, guests, multiGuests, options } = joinData;
        const isBackedAdmin = joinData.admin === uniqueUserName;

        const channel = pusher.subscribe(`room-${token}`);
        channel.bind("room-event", async function (data) {
          data.clientGamerList &&
            data.clientGamerList.length &&
            gamerList &&
            setGamerList((prevGamerList) => [
              ...new Set([...data.clientGamerList, ...prevGamerList]),
            ]);
          data.multiGuestList &&
            data.multiGuestList.length &&
            multiGuestList &&
            setMultiGuestList((prevMultiGuestList) => [
              ...new Set([...data.multiGuestList, ...prevMultiGuestList]),
            ]);
          data.started && setIsStarted(true);
          data.gameData && setGameData(data.gameData);
          if (data.deleted) {
            isBackedAdmin &&
              (await removeArrival({
                roomId: room_id,
                deletedGamer: data.deleted,
              }));

            setDeletedGamer(data.deleted);
            setInvitedList((prevInv) =>
              prevInv.filter((inv) => inv !== data.deleted)
            );
            if (isBackedAdmin) {
              setGroup((prevGroup) => ({
                ...prevGroup,
                gamers: gamerList.filter((gamer) => gamer !== data.deleted),
                multiGuests: multiGuestList.filter(
                  (multiGuest) => multiGuest !== data.deleted
                ),
                arrivalsOrder: prevGroup?.arrivalsOrder?.filter(
                  (arrival) => arrival.userName !== data.deleted
                ),
              }));
            }
          }
          !isBackedAdmin && data.options && setOptions(data.options);
          data.privacy !== undefined && setIsPrivate(data.privacy);
        });

        !isBackedAdmin &&
          (await triggerGamers({ roomToken: token, gamers }),
          await triggerMultiguests({ roomToken: token, multiGuests }));

        // subscribePresenceChannel({
        //   userId: user.id,
        //   userName: uniqueUserName,
        //   status: "standard",
        //   setOnlineGamers,
        //   roomToken: token,
        // });

        setRoomToken(token);
        setUniqueName(uniqueUserName);
        setGamerList(gamers);
        setGuestList(guests);
        setMultiGuestList(multiGuests);
        setOptions(options);
        setServerMessage("");
      }
    },
    [user]
  );

  const addMultiGuest = useCallback(
    async ({ inputToken }) => {
      if (isChosen) return;

      const token = inputToken.toUpperCase();
      const id = await getRoomId(token);

      const paramsName = searchParams.get("guestName");
      const reserved = JSON.parse(localStorage.getItem("reservedName"));
      const reservedToken = reserved?.roomToken;
      const reservedName = reserved?.name;

      const isReserved =
        reservedToken === token ||
        (reservedToken === group?.roomToken && reservedToken && group);

      const wantedName = isReserved ? reservedName : paramsName;
      const multiGuestName = await getUniqueName(id, wantedName, isReserved);
      localStorage.setItem(
        "reservedName",
        JSON.stringify({ roomToken: token, name: multiGuestName })
      );

      const { error, data } = await serverAddMultiGuest(
        token,
        multiGuestName,
        geoLocation
      );

      if (error) {
        setJoinError(error);
      } else {
        if (data === undefined) return;
        if (data.isJoinAgain) {
          setIsStarted(data.isStarted);
          setIsJoinStarted(data.isStarted);
          setGameData(data.gameData);
          setOptions(data.options);
        }
        const { gamers, guests, multiGuests, options } = data;
        const channel = pusher.subscribe(`room-${token}`);
        channel.bind("room-event", function (data) {
          data.clientGamerList &&
            data.clientGamerList.length &&
            setGamerList((prevGamerList) => [
              ...new Set([...data.clientGamerList, ...prevGamerList]),
            ]);
          data.multiGuestList &&
            data.multiGuestList.length &&
            setMultiGuestList((prevMultiGuestList) => [
              ...new Set([...data.multiGuestList, ...prevMultiGuestList]),
            ]);
          data.started && setIsStarted(true);
          data.gameData && setGameData(data.gameData);
          data.deleted && setDeletedGamer(data.deleted);
          data.options && setOptions(data.options);
        });

        await triggerGamers({ roomToken: token, gamers });
        await triggerMultiguests({ roomToken: token, multiGuests });

        setRoomToken(token);
        setUniqueName(multiGuestName);
        setGamerList(gamers);
        setGuestList(guests);
        setMultiGuestList(multiGuests);
        setOptions(options);
        setServerMessage("");
      }
    },
    [geoLocation, searchParams, inputToken, isChosen]
  );

  useEffect(() => {
    if (searchToken && !isChosen && user && !uniqueName) {
      setIsChosen(true);
      setInputToken(searchToken);
      const join = async () => {
        if (
          !user.multiGuest &&
          !gamerList?.some((gamerName) => gamerName === uniqueName)
        ) {
          await joinRoom({ inputToken: searchToken });
        } else if (
          user.multiGuest &&
          !multiGuestList?.some((multiName) => multiName === uniqueName)
        ) {
          await addMultiGuest({ inputToken: searchToken });
        }
      };
      join();
    }
  }, [
    searchToken,
    isChosen,
    joinRoom,
    addMultiGuest,
    user,
    gamerList,
    multiGuestList,
    uniqueName,
  ]);

  useEffect(() => {
    if (!joinError) return;
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  }, [joinError]);
  // ------------------------------

  // get [roomId + privacy]
  useEffect(() => {
    if (!roomToken) return;
    async function get() {
      const storedGroupPrivacy = JSON.parse(
        localStorage.getItem("group")
      )?.privacy;
      const { id, priv } = await getRoomRefs(roomToken);

      setRoomId(id);

      if (isAdmin && !!storedGroupPrivacy) {
        setIsPrivate(storedGroupPrivacy === "private");
      } else {
        setIsPrivate(priv);
      }
    }
    get();
  }, [roomToken, isAdmin]);
  // ------------------------------

  // default show
  useEffect(() => {
    if (isAdmin) {
      setShowGamerList(false);
      setShowInvitations(true);
    }
  }, [isAdmin]);
  // ------------------------------

  // CP friends
  const getFriends = useCallback(async () => {
    if (!user || user.multiGuest) return;
    const friends = await getRoomFriendList({ userId: user.id });
    setFriendsList(friends);
  }, [user]);
  useEffect(() => {
    const friendsListInterval = setInterval(async () => {
      await getFriends();
      if (adminNameRef.current) clearInterval(friendsListInterval); // tricky: to show if started
    }, 5000);
    return () => clearInterval(friendsListInterval);
  }, [getFriends]);

  useEffect(() => {
    if (user.multiGuest) return;
    setTimeout(async () => await getFriends(), !friendsList ? 0 : 2000);
    getFriends();
  }, [gamerList]);
  // ------------------------------

  // reset invitedList
  useEffect(() => {
    if (!invitedList.length) return;
    const timeout = setTimeout(() => setInvitedList([]), 8000);
    return () => clearTimeout(timeout);
  }, [invitedList]);
  // ------------------------------

  // delete CP_invitations
  const deleteInvs = useCallback(async () => {
    if (user.multiGuest) return;
    await deleteInvitations({
      userId: user.id,
      categorie,
      gameName,
      roomToken,
    });
  }, [user, categorie, gameName, roomToken]);

  const deletePublicInvs = useCallback(async () => {
    await deletePublicInvitations({
      userId: user.id,
      categorie,
      gameName,
      roomToken,
    });
  }, [user.id, categorie, gameName, roomToken]);
  // ------------------------------

  // multiGuest: get Location
  useEffect(() => {
    const getMultiLoc = async () => {
      try {
        const loc = await getLocation();
        setGeoLocation(loc);
      } catch (error) {
        setServerMessage(error.message);
      }
    };
    // user.multiGuest && getMultiLoc();
  }, [user]);
  // ------------------------------

  // init multiGuest: id, dataId, presence
  useEffect(() => {
    const id = gameData?.gamers?.find((gamer) => gamer.name === uniqueName)?.id;
    if (
      id &&
      user.multiGuest &&
      gameData.gamers &&
      uniqueName &&
      roomToken &&
      isStarted &&
      setOnlineGamers
    ) {
      // subscribePresenceChannel({
      //   userId: id,
      //   userName: uniqueName,
      //   status: "multiGuest",
      //   setOnlineGamers,
      //   roomToken,
      // });

      setMultiGuestId(id);
      setMultiGuestDataId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName)?.dataId
      );
    }
  }, [
    isStarted,
    gameData.gamers,
    uniqueName,
    roomToken,
    user,
    setOnlineGamers,
  ]);
  // ------------------------------

  // check connection
  useEffect(() => {
    if (!roomId || isHere || !uniqueName || !roomToken) return;
    let connectInterval = setInterval(() => {
      const check = async () => {
        const isConnected = await checkConnection({
          roomId,
          uniqueName,
          isMultiGuest: user.multiGuest,
        });
        if (isConnected) {
          setIsHere(true);
          clearInterval(connectInterval);
        } else {
          if (!user.multiGuest)
            await retryGamerConnection({
              roomId,
              roomToken,
              uniqueName,
              userId: user.id,
            });
          else
            await retryMultiGuestConnection({ roomId, uniqueName, roomToken });
        }
      };
      check();
    }, 1000);
    return () => {
      clearInterval(connectInterval);
    };
  }, [isHere, roomId, uniqueName, roomToken, user.id, user.multiGuest]);
  // ------------------------------

  // deletions
  const deleteGamer = async (gamer) => {
    const gamers = await serverDeleteGamer({
      token: roomToken,
      gamerName: gamer,
    });
    if (gamer === uniqueName) {
      pusher.unsubscribe(`room-${roomToken}`);
      pusherPresence &&
        pusherPresence.unsubscribe(`custom-presence-${roomToken}`);
    }
    if (!gamers) router.push("/");

    setServerMessage(`Joueur ${gamer} retiré`);
    setGamerList(gamers);
    setTimeout(async () => await getFriends(), 5000);
  };

  const deleteMultiGuest = async (multiGuest) => {
    const multiGuests = await serverDeleteMultiGuest({
      token: roomToken,
      multiGuestName: multiGuest,
    });
    if (!multiGuests) {
      pusher.unsubscribe(`room-${roomToken}`);
      pusherPresence &&
        pusherPresence.unsubscribe(`custom-presence-${roomToken}`);
      router.push("/");
    }

    setServerMessage(`Guest ${multiGuest} retiré`);
    setMultiGuestList(multiGuests);
  };

  useEffect(() => {
    if (!deletedGamer || !uniqueName || !router) return;
    const backToHome = async () => {
      try {
        //tricky: router before
        localStorage.removeItem("reservedName");
        pusher.unsubscribe(`room-${roomToken}`);
        pusherPresence &&
          pusherPresence.unsubscribe(`custom-presence-${roomToken}`);
        router.push("/categories");
        !user.multiGuest && (await cancelBack({ userId: user.id }));
      } catch (error) {
        console.error("Erreur pendant la redirection : ", error);
      }
    };
    if (deletedGamer === uniqueName) backToHome();
  }, [deletedGamer, uniqueName, router]);

  useEffect(() => {
    if (!deletedGamer) return;
    setGamerList((prevGamers) =>
      prevGamers.filter((gamer) => gamer !== deletedGamer)
    );
    setMultiGuestList((prevMultiGuests) =>
      prevMultiGuests.filter((multiGuest) => multiGuest !== deletedGamer)
    );
  }, [deletedGamer]);
  // ------------------------------

  // isSearching: not_admins showed + delete invitations
  useEffect(() => {
    if (isAdmin) return;
    if (gameData.isSearching) {
      setShowPlayers(true);
      setShowGamerList(true);
      setShowInvitations(false);
      setShowConfig(false);
      deleteInvs(); // no await
    }
  }, [isAdmin, gameData]);
  // ------------------------------

  // admin change game
  const changeGame = useCallback(async () => {
    if (!isAdmin) return;

    if (adminSearchtGame.path === gameName) {
      setAdminChangeSameGameNewMode(decodeURIComponent(adminSelectedMode.path));
      setTimeout(() => {
        setAdminChangeSameGameNewMode(null);
        setAdminSelectedCategorie(null);
        setAdminSearchtCategorie(null);
        setAdminSelectedGame(null);
        setAdminSearchtGame(null);
        setAdminSelectedMode(null);
      }, 2000);
      return;
    }

    await deleteInvs();

    if (group) {
      const gamers = group.gamers && [...group.gamers];
      const multiGuests = group.multiGuests && [...group.multiGuests];
      const lastGame = group.lastGame;
      const viceAdmin = group.viceAdmin;
      const arrivalsOrder = group.arrivalsOrder;

      const stored = {
        roomToken,
        gamers,
        multiGuests,
        privacy: group.privacy,
        lastGame,
        lastPosition: geoLocation,
        viceAdmin,
        arrivalsOrder,
      };
      localStorage.setItem("group", JSON.stringify(stored));
    } else {
      const {
        gamers,
        multiGuests,
        privacy,
        lastGame,
        lastPosition,
        viceAdmin,
        arrivalsOrder,
      } = await getGroup({ roomId });

      const stored = {
        roomToken,
        gamers,
        multiGuests,
        privacy,
        lastGame,
        lastPosition,
        viceAdmin,
        arrivalsOrder,
      };
      localStorage.setItem("group", JSON.stringify(stored));
    }

    pusher.unsubscribe(`room-${roomToken}`);
    pusherPresence &&
      pusherPresence.unsubscribe(`custom-presence-${roomToken}`);
    router.push(
      `/categories/${adminSearchtCategorie}/${adminSearchtGame.path}/?mode=${adminSelectedMode.path}&changeGame=true&isAdmin=true`
    );
  }, [
    adminSearchtCategorie,
    adminSearchtGame,
    adminSelectedMode,
    deleteInvs,
    geoLocation,
    group,
    roomId,
    roomToken,
    router,
    isAdmin,
    gameName,
  ]);

  const backChangeGame = useCallback(async () => {
    if (!isAdmin && !searchIsAdmin) return;
    if (!adminSearchtCategorie) {
      await cancelSearchGame({
        roomId,
        roomToken,
        gameData,
      });
      setAdminSelectedCategorie(null);
      setAdminSearchtCategorie(null);
      setAdminSelectedGame(null);
    } else if (!adminSearchtGame) {
      setAdminSearchtCategorie(null);
      setAdminSelectedGame(null);
    } else {
      setAdminSelectedGame(null);
      setAdminSearchtGame(null);
      setAdminSelectedMode(null);
    }
  }, [
    adminSearchtCategorie,
    adminSearchtGame,
    gameData,
    isAdmin,
    roomId,
    roomToken,
    searchIsAdmin,
  ]);
  // ------------------------------

  // not_admins redirections
  useEffect(() => {
    if (
      !gameData ||
      !gameData.nextGame ||
      !gameName ||
      isStarted === undefined ||
      !user
    )
      return;
    if (
      gameData?.nextGame !== "deleted group" &&
      (gameName === "grouping" || !isStarted)
    ) {
      const goNewGame = async () => {
        !user.multiGuest && (await deleteInvs());
        const group = { roomToken };
        localStorage.setItem("group", JSON.stringify(group));
        localStorage.setItem("localWidth", window.innerWidth);

        pusher.unsubscribe(`room-${roomToken}`);
        pusherPresence &&
          pusherPresence.unsubscribe(`custom-presence-${roomToken}`);

        const href = `${gameData.nextGame.path}${
          user.multiGuest ? `&guestName=${user.name}` : ""
        }`;
        router.push(href);
      };
      goNewGame();
    }
  }, [gameData, gameName, isStarted, user]);
  // ------------------------------

  // [admin + gamers] presence
  // useEffect(() => {
  //   if (
  //     !roomToken ||
  //     (!user?.id && !user?.multiGuest) ||
  //     !user?.name ||
  //     isPresenceIntervalStartedRef.current ||
  //     !presenceChannel
  //   )
  //     return;

  //   isPresenceIntervalStartedRef.current = true;

  //   lastAdminPingRef.current = Date.now();
  //   bindAdminOnlines({ setOnlineGamers, lastAdminPingRef });

  //   const { id, name, multiGuest } = user;

  //   const send = async () => {
  //     try {
  //       await sendPresenceSign({
  //         roomToken,
  //         userName: name,
  //         userId: id,
  //         multiGuest: !!multiGuest,
  //       });

  //       if (
  //         lastAdminPingRef.current &&
  //         adminNameRef.current &&
  //         Date.now() - lastAdminPingRef.current > 40000
  //       ) {
  //         setOnlineGamers((prevOnlines) => {
  //           const newOnlines = prevOnlines.filter(
  //             (online) => online.userName !== adminNameRef.current
  //           );
  //           return newOnlines;
  //         });
  //       }
  //     } catch (e) {
  //       console.error("sendPresenceSign error:", e);
  //     }
  //   };

  //   send(); // First sign
  //   const interval = setInterval(send, 30000);

  //   return () => {
  //     clearInterval(interval);
  //     isPresenceIntervalStartedRef.current = false;
  //   };
  // }, [roomToken, user?.id, user?.name, user?.multiGuest, presenceChannel]);

  // useEffect(() => {
  //   if (!isAdmin) return;
  //   onlineGamersRef.current = onlineGamers;
  // }, [onlineGamers, isAdmin]);
  // useEffect(() => {
  //   if (!isAdmin || !roomToken || isBoundCheckPresenceRef.current) return;

  //   isBoundCheckPresenceRef.current = true;
  //   bindCheckPresence({ setOnlineGamers });
  //   presenceChannel.unbind("send-onlineGamers");

  //   sendOnlineGamers({ roomToken, onlineGamers: [] });

  //   const sendOnlinesInterval = setInterval(async () => {
  //     try {
  //       const currentOnlines = onlineGamersRef.current;
  //       await sendOnlineGamers({ roomToken, onlineGamers: currentOnlines });
  //     } catch (e) {
  //       console.error("sendOnlines error:", e);
  //     }
  //   }, 30000);

  //   const checkChangeInterval = setInterval(async () => {
  //     try {
  //       const currentOnlines = onlineGamersRef.current;
  //       const lastSent = lastSentOnlinesRef.current;

  //       const changed =
  //         JSON.stringify(currentOnlines) !== JSON.stringify(lastSent);

  //       if (changed) {
  //         lastSentOnlinesRef.current = currentOnlines;
  //         await sendOnlineGamers({ roomToken, onlineGamers: currentOnlines });
  //       }
  //     } catch (e) {
  //       console.error("checkChangeInterval error:", e);
  //     }
  //   }, 3000);

  //   return () => {
  //     clearInterval(sendOnlinesInterval);
  //     clearInterval(checkChangeInterval);
  //   };
  // }, [isAdmin, roomToken]);

  // useEffect(() => {
  //   if (!gameData?.admin || !user?.name) return;
  //   if (gameData.admin === user.name) {
  //     setIsAdmin(true);
  //   } else {
  //     adminNameRef.current = gameData.admin;
  //   }
  // }, [gameData.admin, user]);
  // ------------------------------

  // inGameUser
  useEffect(() => {
    if (
      !isLaunched ||
      !uniqueName ||
      (user.multiGuest && (!multiGuestId || !multiGuestDataId))
    )
      return;
    setInGameUser({
      ...user,
      name: uniqueName,
      ...(!!multiGuestId ? { id: multiGuestId } : {}),
      ...(!!multiGuestDataId ? { dataId: multiGuestDataId } : {}),
    });
  }, [isLaunched, uniqueName, user, multiGuestId, multiGuestDataId]);
  // ------------------------------

  // deleted_group: return home
  useEffect(() => {
    const leaveLobby = async () => {
      if (gameData && gameData?.nextGame === "deleted group" && user) {
        !user.multiGuest && (await deleteInvs());
        pusher.unsubscribe(`room-${roomToken}`);
        pusherPresence &&
          pusherPresence.unsubscribe(`custom-presence-${roomToken}`);
        router.push("/categories");
      }
    };
    leaveLobby();
  }, [gameData, user]);
  // ------------------------------

  // launching_animation
  useEffect(() => {
    if (isStarted) {
      setIsLaunching(true);
      setTimeout(() => setIsLaunched(true), 3000);
    }
  }, [isStarted, isLaunching, isLaunched]);
  // ------------------------------

  if (joinError) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        {joinError}
      </div>
    );
  }

  if ((!roomId || !gameData || !hasLoadingOctagonAnimated) && !searchChangeGame)
    return (
      <div
        className="h-screen w-full px-2 overflow-x-hidden bg-black"
        style={{
          paddingTop: `${barsSizes.top / 4}rem`,
          paddingBottom: `${barsSizes.bottom / 4}rem`,
        }}
      >
        <LoadingRoomOctagon
          setHasLoadingOctagonAnimated={setHasLoadingOctagonAnimated}
        />
      </div>
    );

  if (isJoinStarted && !isLaunched && !searchChangeGame)
    return (
      <div
        className="h-screen w-full px-2 overflow-x-hidden bg-black"
        style={{
          paddingTop: `${barsSizes.top / 4}rem`,
          paddingBottom: `${barsSizes.bottom / 4}rem`,
        }}
      >
        <LoadingRoomOctagon isJoinStarted />
      </div>
    );

  // check
  if (!isLaunched || (!isAdmin && gameData.isSearching && !gameData.ended)) {
    return (
      <div className="bg-black w-screen h-screen relative">
        <div
          className={`${
            !isLaunching
              ? `h-full w-[95vw] ${
                  !searchChangeGame && "animate-[expandSize_1.5s_ease-in-out]"
                }`
              : "h-[105vw] w-[85vw] animate-[shrinkSize_3s_ease-in-out] opacity-0"
          } absolute overflow-x-hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
        >
          <div className="absolute h-full w-full">
            <div
              className="w-1 bg-transparent z-60 border border-l-[10px] border-y-0 border-r-0 border-black"
              style={{
                position: "absolute",
                left: "100%",
                height: "100%",
                boxShadow: "1px 0 0 0 black",
                zIndex: 10,
              }}
            />
            <div
              className="w-1 bg-black z-60 border border-r-[10px] border-y-0 border-l-0 border-black"
              style={{
                position: "absolute",
                right: "100%",
                height: "100%",
                boxShadow: "-1px 0 0 0 black",
                zIndex: 10,
              }}
            />
            <div
              className="h-1 bg-black z-60 border border-t-[2px] border-x-0 border-b-0 border-black"
              style={{
                position: "absolute",
                top: "100%",
                width: "100%",
                boxShadow: "0 -10px 0 0 black",
                zIndex: 10,
              }}
            />
            <div
              className="h-1 bg-black z-60 border border-b-[2px] border-x-0 border-t-0 border-black"
              style={{
                position: "absolute",
                bottom: "100%",
                width: "100%",
                boxShadow: "0 10px 0 0 black",
                zIndex: 10,
              }}
            />
          </div>

          <UserContext.Provider value={{ userParams }}>
            <div className={`relative h-full w-full overflow-hidden`}>
              <div
                onClick={async () => await backChangeGame()}
                className="absolute top-0 w-full bg-black z-50"
                style={{ height: `${barsSizes.top / 4}rem` }}
              />
              <div
                onClick={async () => await backChangeGame()}
                className="absolute bottom-0 w-full bg-black z-50"
                style={{ height: `${barsSizes.bottom / 4}rem` }}
              />

              <div
                className="absolute left-0 translate-x-[-50%] translate-y-[-1rem] z-30"
                style={{
                  top: `${barsSizes.top / 4}rem`,
                  pointerEvents: "none",
                }}
              >
                <CornerTriangle
                  direction={{ y: "bottom", x: "left" }}
                  localWidth={localWidth}
                  backChangeGame={backChangeGame}
                />
              </div>
              <div
                className="absolute right-0 translate-x-[50%] translate-y-[-1rem] z-30"
                style={{
                  top: `${barsSizes.top / 4}rem`,
                  pointerEvents: "none",
                }}
              >
                <CornerTriangle
                  direction={{ y: "bottom", x: "right" }}
                  localWidth={localWidth}
                  backChangeGame={backChangeGame}
                />
              </div>
              <div
                className="absolute left-0 translate-x-[-50%] translate-y-[1rem] z-30"
                style={{
                  bottom: `${barsSizes.bottom / 4}rem`,
                  pointerEvents: "none",
                }}
              >
                <CornerTriangle
                  direction={{ y: "top", x: "left" }}
                  localWidth={localWidth}
                  backChangeGame={backChangeGame}
                />
              </div>
              <div
                className="absolute right-0 translate-x-[50%] translate-y-[1rem] z-30"
                style={{
                  bottom: `${barsSizes.bottom / 4}rem`,
                  pointerEvents: "none",
                }}
              >
                <CornerTriangle
                  direction={{ y: "top", x: "right" }}
                  localWidth={localWidth}
                  backChangeGame={backChangeGame}
                />
              </div>

              <div className="h-full w-full relative bg-purple-600">
                <div
                  className="absolute left-0 w-full bg-transparent"
                  style={{
                    top: `${barsSizes.top / 4}rem`,
                    height: `calc(100% - ${barsSizes.top / 4}rem - ${
                      barsSizes.bottom / 4
                    }rem)`,
                    boxShadow:
                      "inset -9px 0px 5px -6px #581c87, inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
                  }}
                />
              </div>
            </div>

            {(isAdmin || searchIsAdmin) &&
              ((!gameData.isSearching && gameName !== "grouping") ||
                (adminSelectedCategorie && !adminSearchtCategorie) ||
                (adminSearchtGame && adminSelectedMode)) &&
              (() => {
                let iconName;
                if (!gameData.isSearching) iconName = "startGame";
                else if (adminSelectedCategorie && !adminSearchtCategorie)
                  iconName = "next";
                else iconName = "validate";

                return (
                  <div
                    onClick={async () => await deleteInvs()}
                    className={`${!isLaunching ? "" : "hidden"}`}
                  >
                    <NextStep
                      onClick={async () => {
                        if (!adminSelectedCategorie) {
                          launchRoom();
                        } else if (
                          adminSelectedCategorie &&
                          !adminSearchtCategorie
                        ) {
                          setAdminSearchtCategorie(adminSelectedCategorie);
                        } else if (adminSelectedGame && !adminSearchtGame) {
                          setAdminSearchtGame(adminSelectedGame);
                        } else {
                          localStorage.setItem("localWidth", window.innerWidth);
                          adminSearchtGame.path === gameName &&
                            (await cancelSearchGame({
                              roomId,
                              roomToken,
                              gameData,
                            }));
                          await changeGame();
                        }
                      }}
                      iconName={iconName}
                    >
                      <div>Lancer</div>
                    </NextStep>
                  </div>
                );
              })()}

            <div
              className="h-full w-full absolute top-0 left-0 z-20 px-2"
              style={{
                paddingTop: `${barsSizes.top / 4}rem`,
                paddingBottom: `${barsSizes.bottom / 4}rem`,
              }}
            >
              <div
                className={`${
                  !isLaunching
                    ? !searchChangeGame
                      ? "opacity-100 animate-[fadeIn_1.5s_ease-in-out]"
                      : ""
                    : "opacity-0 animate-[fadeOut_1.5s_ease-in-out]"
                } relative h-full w-full`}
              >
                {/* <div className="absolute top-[2dvh] w-full h-[4.5dvh] flex justify-center items-center">
                  {categorie !== "grouping" &&
                    categoriesIcons &&
                    (!gameData.isSearching || adminSelectedCategorie) && (
                      <Image
                        src={
                          !adminSelectedCategorie
                            ? categoriesIcons[categorie]
                            : categoriesIcons[adminSelectedCategorie]
                        }
                        alt={`${categorie} image`}
                        className="max-h-[4.5dvh] max-w-[4.5dvh] aspect-square"
                        style={{
                          objectFit: "contain",
                          filter:
                            "invert(9%) sepia(73%) saturate(3540%) hue-rotate(267deg) brightness(94%) contrast(110%)", // purple-950
                        }}
                        width={500}
                        height={500}
                        priority
                      />
                    )}
                </div> */}

                <div className="absolute left-1/2 translate-x-[-50%] h-[10dvh] w-full">
                  <div className="absolute top-[5dvh] w-full flex justify-center items-center h-full">
                    {(isAdmin || searchIsAdmin) && !gameData.isSearching ? (
                      <div className="h-[4dvh] w-[4dvh] collapse">
                        <ChooseAnotherGame
                          setShowPlayers={setShowPlayers}
                          setShowConfig={setShowConfig}
                          gameData={gameData}
                          roomId={roomId}
                          roomToken={roomToken}
                          deleteInvs={deleteInvs}
                        />
                      </div>
                    ) : (
                      <div className="h-[4dvh] w-[4dvh]" />
                    )}

                    <div className="w-fit break-words text-wrap text-center text-purple-950 text-3xl font-medium flex justify-center items-center min-w-[50vw] max-w-[60vw] p-2">
                      {!gameData.isSearching ? (
                        gamesRefs[gameName].categorie === "grouping" ? (
                          <span>Lobby</span>
                        ) : (
                          <span>
                            {searchMode ||
                              options?.mode ||
                              (!Options && gamesRefs[gameName].name)}
                          </span>
                        )
                      ) : adminSelectedGame ? (
                        <span>
                          {adminSelectedMode?.label || adminSelectedGame?.name}
                        </span>
                      ) : adminSelectedCategorie ? (
                        <div>{categoriesLabels[adminSelectedCategorie]}</div>
                      ) : (
                        <div>
                          {/* text-amber-500 */}
                          <AnimatedDots color="#f59e0b" text="5xl" />
                        </div>
                      )}
                    </div>

                    <div className="h-[4dvh] w-[4dvh] flex justify-start items-center text-amber-700 collapse">
                      <p
                        className="text-4xl"
                        style={{
                          color: "#fef3c7", // amber-100
                          WebkitTextStroke: "2px #b45309", // amber-700
                          textShadow: "2px 2px 4px rgba(74, 4, 78, 0.4)",
                        }}
                      >
                        ?
                      </p>
                    </div>
                  </div>
                </div>

                {/* {gameName !== "grouping" && (
                  <Limits
                    searchMode={searchMode}
                    categorie={categorie}
                    gameName={gameName}
                    gameData={gameData}
                    options={options}
                    adminSelectedMode={adminSelectedMode}
                  />
                )} */}

                <div
                  className="le_test absolute top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%] w-full flex flex-col items-center gap-2"
                  style={{ height: "calc(100% - 30vh)" }}
                >
                  {gameName !== "grouping" && (
                    <div
                      onClick={() => {
                        if (!showConfig && !gameData.isSearching) {
                          setShowConfig(true);
                          setShowPlayers(false);
                        }
                      }}
                      className={`overflow-hidden relative border w-[80%] transition-[height] duration-1000 ease-in-out ${
                        gameData.isSearching ? "hidden" : ""
                      } ${
                        !showConfig
                          ? `h-12 border border-2 rounded-md border-amber-700 bg-amber-100 text-amber-700 p-2`
                          : `h-full border border-2 rounded-md border-sky-700 bg-sky-100 text-sky-700 p-2`
                      }`}
                    >
                      {!showConfig &&
                        !gameData.isSearching &&
                        options?.mode && (
                          <div className="w-full">
                            <div className="text-xl absolute left-[50%] translate-x-[-50%] w-full text-center flex justify-center items-center gap-4">
                              {options?.mode &&
                                Object.entries(options).map(
                                  ([option, value]) => {
                                    if (option === "mode") return;
                                    if (option === "countDownTime")
                                      return (
                                        <div key={option} className="flex h-6">
                                          <FaRegHourglassHalf className="h-6 w-6" />
                                          <div>{value / 60 / 1000}</div>
                                        </div>
                                      );
                                    return (
                                      <IconFromName
                                        key={option}
                                        mode={options.mode}
                                        value={value}
                                        className="h-6 w-6"
                                      />
                                    );
                                  }
                                )}
                            </div>
                          </div>
                        )}

                      <div
                        className={`${!showConfig && "hidden"} h-full w-full`}
                      >
                        {!isJoining &&
                          Options &&
                          options &&
                          setOptions &&
                          setServerMessage && (
                            <Options
                              userId={user.id}
                              isAdmin={isAdmin}
                              options={options}
                              setOptions={setOptions}
                              searchMode={searchMode}
                              lastMode={group?.lastMode}
                              serverMessage={serverMessage}
                              setServerMessage={setServerMessage}
                              gamersNumber={
                                gamerList.length +
                                guestList.length +
                                multiGuestList.length
                              }
                              adminChangeSameGameNewMode={
                                adminChangeSameGameNewMode
                              }
                            />
                          )}
                      </div>
                    </div>
                  )}

                  {!gameData.isSearching || !isAdmin ? (
                    <div
                      onClick={() => {
                        if (!showPlayers) {
                          setShowPlayers(true);
                          setShowConfig(false);
                        }
                      }}
                      className={`overflow-hidden relative flex flex-col items-center border w-[80%] transition-[height] duration-1000 ease-in-out ${
                        !showPlayers
                          ? "h-12 border border-2 rounded-md border-amber-700 bg-amber-100 text-amber-700 p-2"
                          : "h-full border border-2 rounded-md border-sky-700 bg-sky-100 text-sky-700 p-2"
                      }
                    ${
                      searchChangeGame && isJoining
                        ? " opacity-0"
                        : " opacity-100 animate-[fadeIn_1.5s_ease-in-out]"
                    }
                    `}
                    >
                      <>
                        {!showPlayers && (
                          <div>
                            <div className="flex items-center absolute left-2 top-1">
                              {isPrivate ? (
                                <LockClosedIcon className="h-8 w-8 mb-0.5" />
                              ) : (
                                <LockOpenIcon className="h-8 w-8 mb-0.5" />
                              )}
                            </div>
                            {(() => {
                              if (!gamerList || !multiGuestList) return;
                              const gamersNumber =
                                gamerList.length +
                                guestList.length +
                                multiGuestList.length;
                              const badGamersNumber =
                                gamersNumber <
                                  gamesRefs[gameName].limits?.min ||
                                gamersNumber > gamesRefs[gameName].limits?.max;

                              return (
                                <div className="text-xl absolute top-1.5 left-[50%] translate-x-[-50%]">
                                  <span>Joueurs&nbsp;:&nbsp;</span>
                                  <span
                                    className={`${
                                      badGamersNumber &&
                                      "text-red-800 font-semibold"
                                    }`}
                                  >
                                    {gamersNumber}
                                  </span>
                                  <span>
                                    {gamesRefs[gameName].limits &&
                                      `\u00A0/\u00A0${gamesRefs[gameName].limits.max}`}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        {showPlayers && (
                          <div className="relative h-full w-full">
                            <div className="absolute top-2 left-2 flex flex-col gap-2">
                              <div
                                className={`p-1 ${
                                  isAdmin &&
                                  "border border-amber-700 bg-amber-100 w-fit"
                                }`}
                              >
                                {isPrivate ? (
                                  <LockClosedIcon
                                    onClick={async () => {
                                      if (!isAdmin) return;
                                      await togglePriv();
                                      await publicInviteAll({
                                        userId: user.id,
                                        userName: user.name,
                                        categorie,
                                        gameName,
                                        mode: options?.mode,
                                        roomToken,
                                        roomId,
                                      });
                                      setInvitedList(() => {
                                        const friendsNames = friendsList.map(
                                          (friend) => friend.name
                                        );
                                        return friendsNames;
                                      });
                                    }}
                                    className={`w-8 h-8 ${
                                      isAdmin
                                        ? "text-amber-700"
                                        : "text-sky-700"
                                    }`}
                                  />
                                ) : (
                                  <LockOpenIcon
                                    onClick={async () => {
                                      if (!isAdmin) return;
                                      await togglePriv();
                                      await deletePublicInvs();
                                    }}
                                    className={`w-8 h-8 ${
                                      isAdmin
                                        ? "text-amber-700"
                                        : "text-sky-700"
                                    }`}
                                  />
                                )}
                              </div>
                              {!user.multiGuest && (
                                <>
                                  <div
                                    onClick={() => {
                                      setShowGamerList(true);
                                      setShowInvitations(false);
                                      setShowRoomRefs(false);
                                    }}
                                    className={`${
                                      showGamerList
                                        ? "border border-sky-100 text-sky-700 relative p-1"
                                        : "border border-amber-700 bg-amber-100 text-amber-700 relative p-1"
                                    }`}
                                  >
                                    <IoIosPeople className="w-8 h-8" />
                                    {showGamerList && (
                                      <div className="absolute left-full top-1/2 translate-y-[-50%]">
                                        <IoMdArrowDropright className="h-8 w-8 pr-2" />
                                      </div>
                                    )}
                                  </div>
                                  {!gameData.isSearching && (
                                    <div
                                      onClick={() => {
                                        setShowGamerList(false);
                                        setShowInvitations(true);
                                        setShowRoomRefs(false);
                                      }}
                                      className={`${
                                        showInvitations
                                          ? "border border-sky-100 text-sky-700 relative p-1"
                                          : "border border-amber-700 bg-amber-100 text-amber-700 relative p-1"
                                      }`}
                                    >
                                      <IoPersonAddSharp className="w-8 h-8" />
                                      {showInvitations && (
                                        <div className="absolute left-full top-1/2 translate-y-[-50%]">
                                          <IoMdArrowDropright className="h-8 w-8 pr-2" />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {isAdmin && (
                                    <div
                                      onClick={async () => {
                                        try {
                                          // if (!geoLocation) {
                                          //   const loc = await getLocation();
                                          //   await saveLocation({
                                          //     geoLocation: loc,
                                          //     roomId,
                                          //   });
                                          //   setGeoLocation(loc);
                                          // }
                                          setShowGamerList(false);
                                          setShowInvitations(false);
                                          setShowRoomRefs(true);
                                        } catch (error) {
                                          console.error(error.message);
                                          const errorInformations =
                                            getErrorInformations({
                                              window,
                                              fail: "location_permission",
                                            }).map((info, i) => (
                                              <div
                                                key={i}
                                                className={`${
                                                  i === 0 && "font-bold"
                                                }`}
                                              >
                                                {i !== 0 && "=>"}
                                                {info}
                                              </div>
                                            ));
                                          setServerMessage(errorInformations);
                                        }
                                      }}
                                      className={`${
                                        showRoomRefs
                                          ? "border border-sky-100 text-sky-700 relative p-1"
                                          : "border border-amber-700 bg-amber-100 text-amber-700 relative p-1"
                                      }`}
                                    >
                                      <LiaQrcodeSolid className="w-8 h-8" />
                                      {showRoomRefs && (
                                        <div className="absolute left-full top-1/2 translate-y-[-50%]">
                                          <IoMdArrowDropright className="h-8 w-8 pr-2" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {showGamerList && (
                              <>
                                {(() => {
                                  if (!gamerList || !multiGuestList) return;
                                  const gamersNumber =
                                    gamerList.length +
                                    guestList.length +
                                    multiGuestList.length;
                                  const badGamersNumber =
                                    gamersNumber <
                                      gamesRefs[gameName].limits?.min ||
                                    gamersNumber >
                                      gamesRefs[gameName].limits?.max;

                                  return (
                                    <div className="flex justify-center items-center h-8 w-full items-baseline ml-4">
                                      <div
                                        className={`font-semibold text-xl ${
                                          badGamersNumber
                                            ? "text-red-800"
                                            : "text-green-600"
                                        }`}
                                      >
                                        {gamersNumber}&nbsp;
                                      </div>
                                      {gamesRefs[gameName].limits && (
                                        <div>
                                          {`/\u0020${gamesRefs[gameName].limits.max}`}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                                {group?.gamers &&
                                  group.gamers.map((gamer) => {
                                    const gamerName = gamer.name;
                                    const isHere =
                                      gamerList?.includes(gamerName);
                                    return (
                                      <div
                                        key={gamerName}
                                        className="w-full flex justify-center"
                                      >
                                        <div
                                          className={`${
                                            gamerName === uniqueName
                                              ? "font-semibold"
                                              : ""
                                          } relative`}
                                        >
                                          <span className="text-lg">
                                            {gamerName}
                                          </span>
                                          <div className="absolute right-full top-0">
                                            {gamerName !== user.name ? (
                                              isHere ? (
                                                <CheckIcon className="h-6 w-6 " />
                                              ) : (
                                                " ... "
                                              )
                                            ) : null}
                                          </div>
                                          {isHere &&
                                            gamerName !== user.name && (
                                              <button
                                                onClick={async () => {
                                                  const newGamersGroup = [
                                                    ...group.gamers,
                                                  ].filter(
                                                    (gamer) =>
                                                      gamer.name !== gamerName
                                                  );
                                                  setGroup((prevGroup) => ({
                                                    ...prevGroup,
                                                    gamers: newGamersGroup,
                                                  }));
                                                  await deleteGamer(gamerName);
                                                }}
                                                className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                              >
                                                <XMarkIcon className="w-5 h-5" />
                                              </button>
                                            )}
                                          {isHere &&
                                            gamerName === user.name && (
                                              <div
                                                onClick={async () =>
                                                  await deleteInvs()
                                                }
                                              >
                                                <LobbyDeleteGroup
                                                  roomToken={roomToken}
                                                  roomId={roomId}
                                                />
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                {group?.multiGuests &&
                                  group.multiGuests.map((multi) => {
                                    const multiName = multi.name;
                                    const isHere =
                                      multiGuestList?.includes(multiName);
                                    return (
                                      <div
                                        key={multiName}
                                        className="w-full flex justify-center"
                                      >
                                        <div className="flex justify-center items-center relative">
                                          <span className="text-lg">
                                            {multiName}
                                          </span>{" "}
                                          <span className="italic text-sm">
                                            (invité)
                                          </span>
                                          <div className="absolute right-full top-0">
                                            {isHere ? (
                                              <CheckIcon className="h-6 w-6 " />
                                            ) : (
                                              " ... "
                                            )}
                                          </div>
                                          {isHere && (
                                            <button
                                              onClick={() => {
                                                const newMultiGroup = [
                                                  ...group.multiGuests,
                                                ].filter(
                                                  (multi) =>
                                                    multi.name !== multiName
                                                );
                                                setGroup((prevGroup) => ({
                                                  ...prevGroup,
                                                  multiGuests: newMultiGroup,
                                                }));
                                                deleteMultiGuest(multiName);
                                              }}
                                              className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                            >
                                              <XMarkIcon className="w-5 h-5" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                {gamerList?.map((gamer) => {
                                  const gamerNameList =
                                    group?.gamers?.map((gamer) => gamer.name) ||
                                    [];
                                  const multiNameList =
                                    group?.multiGuests?.map(
                                      (multi) => multi.name
                                    ) || [];
                                  if (
                                    gamerNameList.includes(gamer) ||
                                    multiNameList.includes(gamer)
                                  )
                                    return;
                                  return (
                                    <div
                                      key={gamer}
                                      className="w-full flex justify-center my-0.5"
                                    >
                                      <div
                                        className={`${
                                          gamer === uniqueName
                                            ? "font-semibold"
                                            : ""
                                        } relative
                                  `}
                                      >
                                        <span className="text-lg">{gamer}</span>
                                        {isAdmin && gamer !== user.name && (
                                          <button
                                            onClick={async () =>
                                              await deleteGamer(gamer)
                                            }
                                            className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                          >
                                            <XMarkIcon className="h-5 w-5" />
                                          </button>
                                        )}
                                        {isAdmin && gamer === user.name && (
                                          <>
                                            <div
                                              onClick={async () =>
                                                await deleteInvs()
                                              }
                                            >
                                              <LobbyDeleteGroup
                                                roomToken={roomToken}
                                                roomId={roomId}
                                              />
                                            </div>
                                          </>
                                        )}
                                        {!isAdmin && gamer === user.name && (
                                          <button
                                            onClick={async () =>
                                              await deleteGamer(uniqueName)
                                            }
                                            className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                          >
                                            <ImExit className="ml-1 w-5 h-5 p-0.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {multiGuestList?.map((multiGuest, i) => {
                                  const gamerNameList =
                                    group?.gamers?.map((gamer) => gamer.name) ||
                                    [];
                                  const multiNameList =
                                    group?.multiGuests?.map(
                                      (multi) => multi.name
                                    ) || [];
                                  if (
                                    multiNameList.includes(multiGuest) ||
                                    gamerNameList.includes(multiGuest)
                                  )
                                    return;
                                  return (
                                    <div
                                      key={i}
                                      className="w-full flex justify-center"
                                    >
                                      <div
                                        className={`${
                                          multiGuest === uniqueName
                                            ? "font-semibold"
                                            : ""
                                        } relative
                                  `}
                                      >
                                        <span className="text-lg">
                                          {multiGuest}
                                        </span>
                                        <span className="italic text-sm font-normal">
                                          (invité)
                                        </span>
                                        {isAdmin && (
                                          <button
                                            onClick={() =>
                                              deleteMultiGuest(multiGuest)
                                            }
                                            className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                          >
                                            <XMarkIcon className="h-5 w-5" />
                                          </button>
                                        )}
                                        {multiGuest === user.name && (
                                          <button
                                            onClick={async () =>
                                              await deleteMultiGuest(uniqueName)
                                            }
                                            className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                          >
                                            <ImExit className="ml-1 w-5 h-5 p-0.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}

                            {showInvitations && (
                              <>
                                <div className="flex justify-center items-center h-8 w-full items-baseline ml-4">
                                  Invite tes amis !
                                </div>
                                <div className="flex flex-col gap-1 items-center">
                                  <div>
                                    {friendsList &&
                                      friendsList.map(
                                        ({ friend, customName }) => {
                                          if (
                                            gamerList.some(
                                              (gamer) => gamer === friend.name
                                            )
                                          )
                                            return;
                                          const invited = invitedList.some(
                                            (inv) => inv === friend.name
                                          );
                                          return (
                                            <button
                                              key={friend.id}
                                              onClick={async () => {
                                                await inviteFriend({
                                                  userName: user.name,
                                                  friendMail: friend.email,
                                                  categorie,
                                                  gameName,
                                                  mode: options?.mode,
                                                  roomToken,
                                                });
                                                setInvitedList((prevInv) => [
                                                  ...new Set([
                                                    ...prevInv,
                                                    friend.name,
                                                  ]),
                                                ]);
                                              }}
                                              className={`${
                                                !invited
                                                  ? "border border-amber-700 bg-amber-100 text-amber-700 p-1 m-0.5"
                                                  : "border border-sky-100 text-sky-700 pulse-soft p-1 m-0.5"
                                              }`}
                                            >
                                              {customName}
                                            </button>
                                          );
                                        }
                                      )}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* {showRoomRefs && geoLocation && ( */}
                            {showRoomRefs && (
                              <div className="w-full">
                                <div className="w-full h-8 flex justify-center items-center ml-6">
                                  Qr code de la partie
                                </div>

                                <div className="w-full ml-16 pl-1">
                                  <QRCode
                                    value={`${process.env.NEXT_PUBLIC_DEHORS_URL}/invitation/?categorie=${categorie}&gameName=${gameName}&token=${roomToken}`}
                                    style={{
                                      width: "calc(100% - 5rem)",
                                      aspectRatio: "1 / 1",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    </div>
                  ) : (
                    <GameChooser
                      adminSelectedCategorie={adminSelectedCategorie}
                      setAdminSelectedCategorie={setAdminSelectedCategorie}
                      adminSearchtCategorie={adminSearchtCategorie}
                      setAdminSearchtCategorie={setAdminSearchtCategorie}
                      adminSelectedGame={adminSelectedGame}
                      setAdminSelectedGame={setAdminSelectedGame}
                      adminSearchtGame={adminSearchtGame}
                      setAdminSearchtGame={setAdminSearchtGame}
                      adminSelectedMode={adminSelectedMode}
                      setAdminSelectedMode={setAdminSelectedMode}
                      initialHeight={showConfig ? "3rem" : "100%"}
                    />
                  )}
                </div>
              </div>
            </div>
          </UserContext.Provider>
        </div>
      </div>
    );
  } else if (!inGameUser) {
    return <div className="h-screen w-screen bg-black" />;
  } else {
    return (
      // <div className="absolute h-screen w-full z-50 bg-black">
      <div className="relative h-screen w-full z-50 bg-black">
        {gameBackground === "smoke" && <ThreeSmoke />}
        <UserContext.Provider value={{ userParams, pusher, pusherPresence }}>
          <div
            className={`z-[60] w-full h-full relative`}
            style={{
              paddingTop: `${barsSizes.top / 4}rem`,
              paddingBottom: `${barsSizes.bottom / 4}rem`,
            }}
          >
            <div className="w-full h-full relative">
              <Game
                roomId={roomId}
                roomToken={roomToken}
                user={inGameUser}
                onlineGamers={onlineGamers}
                gameData={gameData}
                storedLocation={geoLocation} //searching game only
                setGameBackground={setGameBackground}
              />
            </div>
          </div>
        </UserContext.Provider>
      </div>
    );
  }
}

export function useUserContext() {
  return useContext(UserContext);
}
