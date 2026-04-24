import { SVGProps } from "react";

import { THEMES_VALUES } from "@/constants/theme.const";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export type TTheme = (typeof THEMES_VALUES)[number];