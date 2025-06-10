import shuffleArray from "./shuffleArray";

export function makeMinimalTeams({ gamersList, minByTeam }) {
  if (minByTeam > gamersList.length)
    return { error: "Il y a plus de joueurs par équipe que de joueurs" };
  if (minByTeam > gamersList.length / 2)
    return { error: "Il n'y aurait qu'une seule équipe." };

  const gamers = [...gamersList];
  const shuffled = shuffleArray(gamers);

  const teams = {};
  let index = 0;
  while (shuffled.length >= minByTeam) {
    const team = shuffled.splice(0, minByTeam);
    teams[index] = team;
    index++;
  }

  index = 0;
  while (index < shuffled.length) {
    const team = teams[index];
    const newTeam = [...team, shuffled[index]];
    teams[index] = newTeam;
    index++;
  }

  return { teams };
}

export function makeTeams({ gamersList, teamsNumber }) {
  if (teamsNumber > gamersList.length)
    return { error: "Il y a plus d'équipes que de joueurs" };
  if (gamersList.length / teamsNumber < 2)
    return { error: "Nombre d'équipes trop élevé" };

  const gamers = [...gamersList];
  const shuffled = shuffleArray(gamers);
  const numberByTeam = Math.floor(shuffled.length / teamsNumber);

  const teams = {};
  let index = 0;
  while (shuffled.length >= numberByTeam) {
    const newTeam = shuffled.splice(0, numberByTeam);
    teams[index] = newTeam;
    index++;
  }

  index = 0;
  while (index < shuffled.length) {
    const team = teams[index];
    const newTeam = [...team, shuffled[index]];
    teams[index] = newTeam;
    index++;
  }

  return { teams };
}
