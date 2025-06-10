"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";

import NextStep from "@/components/NextStep";

const initialState = {
  message: null,
  status: 100,
};

import {
  launchDescriptions,
  getNextGamer,
  voteAgainst,
  goddessVote,
  whiteGuess,
} from "./gameActions";

export default function Undercover({
  roomId,
  roomToken,
  user,
  gameData,
  // setShowNext
}) {
  const [deviceGamers, setDeviceGamers] = useState([]);

  const [reveals, setReveals] = useState({});
  const [adminVoter, setAdminVoter] = useState(0);
  const [adminPossibleVotes, setAdminPossibleVotes] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  const [goddess, setGoddess] = useState("");
  const [isGoddess, setIsGoddess] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isWhite, setIsWhite] = useState(false);
  const whiteGuessWithData = whiteGuess.bind(null, gameData, roomId, roomToken);
  const [state, formAction] = useFormState(whiteGuessWithData, initialState); //id

  const [isEnded, setIsEnded] = useState(false);
  const [stats, setStats] = useState({});

  const gamers = useMemo(() => gameData.gamers || [], [gameData.gamers]);

  useEffect(() => {
    const dead = !gamers?.find((gamer) => gamer.name === user.name)?.alive;
    setIsDead(dead);

    if (
      user.name === goddess ||
      deviceGamers.find((gamer) => gamer.name === goddess)
    )
      setIsGoddess(true);

    const white = gamers?.find((gamer) => gamer.role === "white");
    if (
      user.name === white ||
      deviceGamers.find((gamer) => gamer.name === white?.name)
    ) {
      setIsWhite(true);
    }
  }, [gamers, user.name, deviceGamers, goddess]);

  useEffect(() => {
    const deviced = gamers.filter(
      (gamer) =>
        gamer.name === user.name ||
        (user.name === gameData.admin && gamer.guest)
    );
    setDeviceGamers(deviced);
    deviced.map((gamer) =>
      setReveals((prevReveals) => ({ ...prevReveals, [gamer.name]: false }))
    );
  }, [gamers, user.name, gameData.admin]);

  const possibleVotes = gamers?.map((gamer) => {
    if (isDead) return;
    if (gamer.id === user.id || !gamer.alive) return;
    return (
      <button
        key={gamer.name}
        onClick={() => {
          voteAgainst({
            gameData,
            roomId,
            roomToken,
            voterName: user.name,
            gamerName: gamer.name,
          });
          setHasVoted(true);
        }}
        className="border border-blue-300 bg-blue-100"
      >
        {gamer.name}
      </button>
    );
  });

  useEffect(() => {
    if (user.name !== gameData.admin) return;

    const adminAndGuests = [gamers.find((gamer) => gamer.name === user.name)];
    gamers.map((gamer) => {
      if (gamer.guest) {
        adminAndGuests.push(gamer);
      }
    });

    let voterIndex = adminVoter;
    let voter;
    while (voterIndex !== adminAndGuests.length) {
      if (adminAndGuests[voterIndex].alive) {
        voter = adminAndGuests[voterIndex];
        break;
      }
      voterIndex++;
    }

    //check
    if (!voter) {
      setAdminVoter(0);
      setHasVoted(true);
      return;
    }

    const fromWhichToChoose = (
      <>
        <div>C&apos;est au tour de {`${voter.name}`} de voter.</div>
        <div>
          {gamers.map((gamer) => {
            if (gamer.name === voter.name || !gamer.alive) return;
            return (
              <button
                key={gamer.name}
                onClick={() => {
                  setAdminVoter(parseInt(voterIndex + 1));
                  voteAgainst({
                    gameData,
                    roomId,
                    roomToken,
                    voterName: user.name,
                    gamerName: gamer.name,
                  });
                }}
                className="border border-blue-300 bg-blue-100"
              >
                {gamer.name}
              </button>
            );
          })}
        </div>
      </>
    );
    setAdminPossibleVotes(fromWhichToChoose);
  }, [adminVoter, gameData, roomToken, user, gamers]);

  useEffect(() => {
    const goddess = gamers.find((gamer) => gamer.goddess);
    goddess && setGoddess(goddess.name);
  }, [gamers]);

  const goddessPossibleVotes = gameData.deadMen?.map((gamerName) => {
    return (
      <button
        key={gamerName}
        onClick={() => {
          goddessVote({ gameData, roomId, roomToken, gamerName });
        }}
        className="border border-blue-300 bg-blue-100"
      >
        {gamerName}
      </button>
    );
  });

  useEffect(() => {
    if (gameData.phase === "description") setHasVoted(false);
  }, [gameData.phase]);

  const whiteForm = isWhite ? (
    <form
      action={formAction}
      className="flex flex-col justify-center items-center"
    >
      <label htmlFor="guess">Essayez de deviner le mot :</label>
      <input
        type="text"
        name="guess"
        id="guess"
        className="border focus:outline-none focus:border-2"
        autoFocus
      />

      <button type="submit" className="border border-blue-300 bg-blue-100">
        Proposer
      </button>
    </form>
  ) : null;

  useEffect(() => {
    ([
      "whiteWin",
      "civilsWin",
      "undercoversWin",
      "undercoversWinWithWhite",
    ].includes(gameData.phase) ||
      gameData.ended) &&
      setIsEnded(true);

    const calculateStats = () => {
      const winnerPhrase = {
        whiteWin: "Mister White remporte la partie !",
        civilsWin: "Les civils remportent la partie !",
        undercoversWin: "Les undercovers remportent la partie !",
        undercoversWinWithWhite:
          "Les undercovers ainsi que Mister White remportent la partie !",
      }[gameData.phase];
      return { winnerPhrase };
    };
    setStats(calculateStats());
  }, [gameData.phase, gameData.ended]);

  const isAdmin = gameData.admin === user.name;

  useEffect(() => {
    if (!gameData?.voters) return;
    setHasVoted(gameData.voters.some((voter) => voter === user.name));
  }, [gameData.voters, user.name]);

  return (
    <div className="relative animate-[fadeIn_1.5s_ease-in-out]">
      <div className="overflow-y-auto">
        {!isEnded ? (
          <>
            <div>
              {deviceGamers.map((gamer) => (
                <div key={gamer.name} className="m-20">
                  <button
                    onClick={() =>
                      setReveals((prevReveals) => ({
                        ...prevReveals,
                        [gamer.name]: !reveals[gamer.name],
                      }))
                    }
                    className="border border-blue-300 bg-blue-100"
                  >
                    {deviceGamers.length === 1
                      ? "Révéler votre mot"
                      : `Révéler le mot de ${gamer.name}`}
                  </button>
                  {reveals[gamer.name] && <div>Votre mot : {gamer.word}</div>}
                </div>
              ))}
            </div>

            {gameData.phase === "reveal" && (
              <div>
                <div>Phase de découverte des mots</div>

                {user.name === gameData.admin && (
                  <NextStep
                    onClick={() =>
                      launchDescriptions({ gameData, roomId, roomToken })
                    }
                  >
                    <div className="text-sm">Décrire</div>
                  </NextStep>
                )}
              </div>
            )}

            {gameData.phase === "description" && (
              <div>
                {gameData.activePlayer.id === user.id ? (
                  <div>
                    {gamers.some((gamer) => gamer.guest === true) ? (
                      <div>
                        C&apos;est au tour de {`${gameData.activePlayer.name}`}{" "}
                        de décrire le mot.
                      </div>
                    ) : (
                      <>
                        <div>C&apos;est à votre tour !</div>
                        <NextStep
                          onClick={() =>
                            getNextGamer({ gameData, roomId, roomToken })
                          }
                        >
                          <div className="text-sm">Suivant</div>
                        </NextStep>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    C&apos;est au tour de {`${gameData.activePlayer.name}`} de
                    décrire le mot.
                  </div>
                )}
              </div>
            )}

            {gameData.phase === "vote" && (
              <>
                <div>Phase d&apos;élimination</div>
                {!hasVoted ? (
                  <div>
                    {user.name === gameData.admin ? (
                      <div>{adminPossibleVotes}</div>
                    ) : (
                      <div className="flex flex-col">{possibleVotes}</div>
                    )}
                  </div>
                ) : (
                  <div>Vous avez voté ! En attente de la fin du vote.</div>
                )}
              </>
            )}

            {gameData.phase && <div>Déesse de la Justice : {goddess}</div>}
            {gameData.phase === "goddess" && (
              <div>
                <div>La Déesse de la Justice tranche !</div>
                {isGoddess && <div>{goddessPossibleVotes}</div>}
              </div>
            )}

            {gameData.phase === "white" && (
              <>
                <div>Mister White a été tué !</div>
                {whiteForm}
              </>
            )}

            {gameData.phase === "undercoversWinMaybeWhite" && (
              <>
                <div>
                  Les undercovers remportent la partie, Mister White avec eux ?
                </div>
                {whiteForm}
              </>
            )}

            {!!gamers.length && (
              <div>
                Joueurs restants :
                {gamers
                  ?.filter(
                    (gamer) =>
                      gamer.alive ||
                      (gamer.role === "white" &&
                        [
                          "white",
                          "undercoversWinMaybeWhite",
                          "whiteWin",
                          "undercoversWinWithWhite",
                        ].includes(gameData.phase))
                  )
                  .map((alive) => (
                    <div key={alive.name}>{alive.name}</div>
                  ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-center border-b">
              <div>Résultats</div>
              {Object.values(stats).map((stat, i) => (
                <div key={i}>{stat}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
