import * as HeroIcons from "@heroicons/react/20/solid";
import { FC, ReactNode } from "react";

type icon = keyof typeof HeroIcons;
interface Props {
    children?: ReactNode;
    icon: icon;
    className: string;
}

const DynamicHeroIcon: FC<Props> = ({ icon, ...props }) => {
    const SingleIcon = HeroIcons[icon];
    return <SingleIcon className={props.className} />;
};

export default DynamicHeroIcon;
