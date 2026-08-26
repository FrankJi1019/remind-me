import type { FC } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
import { icons } from "./registry"
import type { IconName } from "./registry"

export type { IconName } from "./registry"

interface IconProps extends Omit<FontAwesomeIconProps, "icon"> {
  name: IconName
}

const Icon: FC<IconProps> = ({ name, ...props }) => {
  return <FontAwesomeIcon icon={icons[name]} {...props} />
}

export default Icon
