import { IconifyIcon } from "iconify-icon";
import { Component, JSX } from "solid-js";
import { Icon } from "@iconify-icon/solid";

export const Button: Component = ({
  children,
  icon,
  iconSize = 18,
  onClick,
}: {
  children?: JSX.Element;
  icon?: IconifyIcon;
  iconSize?: number;
  onClick?: (e: MouseEvent) => void;
}) => {
  return (
    <div
      class="w-fit py-2 px-2.5 min-w-[48px] bg-neutral-200 cursor-pointer rounded flex items-center justify-center"
      onClick={onClick}
    >
      {icon && (
        <Icon
          class="pr-1"
          style={{ "font-size": `${iconSize}px` }}
          icon={icon}
        ></Icon>
      )}
      {children}
    </div>
  );
};
