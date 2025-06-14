import { FaBullseye } from "react-icons/fa6";
import { FaHandPointUp } from "react-icons/fa";
import {
  GiCrossedSwords,
  GiAutomaticSas,
  GiAngelOutfit,
  GiDeathSkull,
} from "react-icons/gi";

const iconsList = {
  Hunted: {
    FFA: FaBullseye,
    VS: GiCrossedSwords,
    automatic: GiAutomaticSas,
    manual: FaHandPointUp,
    resurrection: GiAngelOutfit,
    death: GiDeathSkull,
  },
};

export default function IconFromName({ mode, value, ...props }) {
  if (typeof value !== "string") return null;

  if (!iconsList[mode]) return null;

  const IconComponent = iconsList[mode][value];

  if (!IconComponent) return null;

  return <IconComponent {...props} />;
}
