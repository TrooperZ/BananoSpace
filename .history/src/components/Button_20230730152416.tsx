import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";

type ButtonProps = {
  small?: boolean;
  gray?: boolean;
  className?: string;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function Button({
  small = false,
  gray = false,
  className = "",
  ...props
}: ButtonProps) {
    const sizeClasses = small ? "px-2 py-1" : "px-4 py-2 font-bold";
    const colorClasses = gray? "bg-gray-400 hover:bg-gray-300 focus-visible:bg-gray-300" : "bg-[#FBDD11] hover:bg-[#c2ad21] focus-visible:bg-[#FBDD11]";
  return <button className={`rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 text-white ${sizeClasses} ${colorClasses} ${className}`} {...props}>aaa</button>;
}
