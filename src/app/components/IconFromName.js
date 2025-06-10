import { IoPeople } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { GiPodium, GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { AiOutlineAim } from "react-icons/ai";

import Infinity from "@/components/icons/Infinity";

const iconsList = {
  Podium: {
    players: IoPeople,
    others: BsThreeDots,
    3: GiPodium,
    infinite: (props) => <Infinity size={props?.size || 32} />,
  },
  Triaction: {
    random: GiPerspectiveDiceSixFacesRandom,
    peek: AiOutlineAim,
  },
};

export default function IconFromName({ mode, value, ...props }) {
  if (typeof value !== "string") return null;

  if (!iconsList[mode]) return null;

  const IconComponent = iconsList[mode][value];

  if (!IconComponent) return null;

  return <IconComponent {...props} />;
}
