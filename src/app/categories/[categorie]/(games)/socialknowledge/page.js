import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import SocialKnowledge from "./SocialKnowledge";
import SocialKnowledgeOptions from "./Options";

export default async function SocialKnowledgePage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="socialknowledge"
        Game={SocialKnowledge}
        Options={SocialKnowledgeOptions}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie={params?.categorie}
      gameName="socialknowledge"
      Game={SocialKnowledge}
      Options={SocialKnowledgeOptions}
      launchGame={launchGame}
    />
  );
}
