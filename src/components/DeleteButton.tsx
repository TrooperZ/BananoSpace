import { useSession } from "next-auth/react";
import { IconHoverEffect } from "./IconHoverEffect";
import { FaTrash } from "react-icons/fa";

function DeleteButton({ onClick }: any) {
  const session = useSession();

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <FaTrash className="fill-red-500" />
        <span></span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`group -mt-1 flex flex-row items-center gap-1 self-start transition-colors duration-200`}
    >
      <IconHoverEffect>
        <div className="flex items-center gap-1">
          <FaTrash className="fill-red-500" />
        </div>
      </IconHoverEffect>
    </button>
  );
}

export default DeleteButton;
