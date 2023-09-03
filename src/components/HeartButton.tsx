import { useSession } from "next-auth/react";
import { VscHeartFilled, VscHeart } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";

interface HeartButtonProps {
    onClick: () => void;
    likedByMe: boolean;
    likeCount: number;
    isLoading: boolean;
  }
  
function HeartButton({
    isLoading,
    onClick,
    likedByMe,
    likeCount,
  }: HeartButtonProps) {
    const session = useSession();
    const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;
  
    if (session.status !== "authenticated") {
      return (
        <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
          <HeartIcon />
          <span>{likeCount}</span>
        </div>
      );
    }
  
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`group -ml-2 flex items-center gap-1 self-start transition-colors duration-200 ${
          likedByMe
            ? "text-red-500"
            : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
        }`}
      >
        <IconHoverEffect red>
          <HeartIcon
            className={`transition-colors duration-200 ${
              likedByMe
                ? "fill-red-500"
                : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
            }`}
          />
        </IconHoverEffect>
        <span>{likeCount}</span>
      </button>
    )
}

export default HeartButton;