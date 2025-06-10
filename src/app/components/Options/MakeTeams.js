"use client";

import { useEffect, useState } from "react";

export default function MakeTeams({ isAdmin, options, setOptions, last }) {
  const [minByTeam, setMinByTeam] = useState(2);
  const [teamsNumber, setTeamsNumber] = useState(2);
  const [teamMode, setTeamMode] = useState(last?.teamMode || "teamNumber");

  useEffect(() => {
    if (!last || !isAdmin) return;
    last.minByTeam && setMinByTeam(last.minByTeam);
    last.teamsNumber && setTeamsNumber(last.teamsNumber);
    last.teamMode && setTeamMode(last.teamMode);
  }, [last]);

  useEffect(() => {
    isAdmin && setOptions((options) => ({ ...options, teamMode }));
  }, [teamMode, isAdmin, setOptions]);

  useEffect(() => {
    if (!isAdmin) return;
    if (minByTeam < 2) setMinByTeam(2);
    setOptions((options) => ({ ...options, minByTeam }));
  }, [minByTeam, isAdmin, setOptions]);

  useEffect(() => {
    if (!isAdmin) return;
    if (teamsNumber < 2) setTeamsNumber(2);
    setOptions((options) => ({ ...options, teamsNumber }));
  }, [teamsNumber, isAdmin, setOptions]);

  useEffect(() => {
    if (isAdmin) return;
    setMinByTeam(options.minByTeam);
    setTeamsNumber(options.teamsNumber);
    setTeamMode(options.teamMode);
  }, [isAdmin, options]);

  return (
    <div className="mb-2 flex flex-col items-center">
      <div>Constitution des équipes</div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          className={`${
            teamMode === "teamNumber"
              ? "border border-2 border-sky-700 bg-sky-100 text-sky-700 font-semibold"
              : isAdmin
              ? "border border-amber-700 bg-amber-100 text-amber-700"
              : "border border-sky-700 bg-sky-100 text-sky-700"
          }`}
          onClick={() => {
            isAdmin && setTeamMode("teamNumber");
          }}
        >
          Nombre d&apos;équipes
        </button>
        <button
          type="button"
          className={`${
            teamMode === "minimum"
              ? "border border-2 border-sky-700 bg-sky-100 text-sky-700 font-semibold"
              : isAdmin
              ? "border border-amber-700 bg-amber-100 text-amber-700"
              : "border border-sky-700 bg-sky-100 text-sky-700"
          }`}
          onClick={() => {
            isAdmin && setTeamMode("minimum");
          }}
        >
          Joueurs par équipe
        </button>
      </div>

      {teamMode === "teamNumber" && (
        <div className={`w-[60%] flex mt-1`}>
          <button
            onClick={() => setTeamsNumber((teams) => teams - 1)}
            className={`mr-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center ${
              !isAdmin ? "collapse" : ""
            }`}
          >
            -
          </button>
          <div
            className={`flex items-center w-[60%] border border-sky-700 ${
              isAdmin ? "border-x-0 w-[60%]" : "p-1 w-full border-2"
            } justify-center font-semibold`}
          >
            {teamsNumber} équipes
          </div>
          <button
            onClick={() => setTeamsNumber((teams) => teams + 1)}
            className={`ml-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center ${
              !isAdmin ? "collapse" : ""
            }`}
          >
            +
          </button>
        </div>
      )}

      {teamMode === "minimum" && (
        <div className="w-[60%] flex mt-1">
          <button
            onClick={() => setMinByTeam((teams) => teams - 1)}
            className={`mr-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center ${
              !isAdmin ? "collapse" : ""
            }`}
          >
            -
          </button>
          <div
            className={`flex items-center w-[60%] border border-sky-700 ${
              isAdmin ? "border-x-0 w-[60%]" : "p-1 w-full border-2"
            } justify-center font-semibold`}
          >
            au moins {minByTeam}
          </div>
          <button
            onClick={() => setMinByTeam((teams) => teams + 1)}
            className={`ml-auto border border-amber-700 bg-amber-100 text-amber-700 w-[20%] flex justify-center ${
              !isAdmin ? "collapse" : ""
            }`}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
