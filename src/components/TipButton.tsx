import { useSession } from "next-auth/react";
import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import type { FormEvent } from "react";
import { FaDollarSign } from "react-icons/fa";
import { api } from "~/utils/api";
import Button from "./Button";
import { IconHoverEffect } from "./IconHoverEffect";

function TipButton({ isLoading, onClick }: any) {
  const session = useSession();

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <span></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`group -mt-1 flex flex-row items-center gap-1 self-start transition-colors duration-200`}
      >
        <IconHoverEffect>
          <div className="flex items-center gap-1">
            <FaDollarSign className="fill-black" />
            <span>Tip BAN</span>
          </div>
        </IconHoverEffect>
      </button>
    </div>
  );
}

function TipDialog({ user, id, dialogRefrence }: any) {
  const [inputValue, setInputValue] = useState("");
  const session = useSession();

  const [errorValue, setErrorValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return;

    textArea.style.height = "0";
    textArea.style.height = `${textArea.scrollHeight}px`;
  }

  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  const handleTip = (event: FormEvent) => {
    event.preventDefault();

    if (session.status !== "authenticated") return;

    if (isNaN(parseFloat(inputValue)) || inputValue.trim().length === 0) {
      setErrorValue("Tip amount must be a number");
      return;
    }

    if (parseFloat(inputValue) < 0.01) {
      setErrorValue("Min tip amount is 0.01");
      return;
    }

    if (parseFloat(inputValue) > fetchBalance.data!) {
      setErrorValue("Insufficient Balance");
      return;
    }

    tipPost.mutate({
      userId: user.id,
      postId: id,
      amt: parseFloat(inputValue),
    });

  };
  const fetchBalance = api.settings.fetchBalance.useQuery({
    id: session.data!.user.id,
  });

  const trpcUtils = api.useContext();

  const tipPost = api.post.tipPost.useMutation({
    onSuccess: (tipAmount: any) => {
      const updateData: Parameters<
        typeof trpcUtils.post.infiniteFeed.setInfiniteData
      >[1] = (oldData: any) => {
        if (oldData == null) return;



        return {
          ...oldData,
          pages: oldData.pages.map((page: { posts: any[]; }) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === id) {
                  return {
                    ...post,
                    totalTips: post.totalTips + tipAmount,
                  };
                }
                return post;
              }),
            };
          }),
        };
      };

      trpcUtils.post.infiniteFeed.setInfiniteData({}, updateData);
      trpcUtils.post.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateData
      );
      trpcUtils.post.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateData
      );
      fetchBalance.refetch();
      dialogRefrence(false);
    },
    
  });
  
//   const tipPost = api.post.tipPost.useMutation({
//     onSuccess: () => {
//         tipValueElement.forceUpdate();
//     },
  

  return (
    <div className="flex flex-col pt-2 ">
      <form
        onSubmit={handleTip}
        className="mx-5 flex flex-col content-center gap-2 rounded-xl"
      >
        <div className="flex flex-row gap-2">
          <div className="flex flex-col gap-4">
            <textarea
              ref={inputRef}
              style={{ height: 0 }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter Amount"
              autoFocus
              className="w-[200px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-2 text-sm outline-none"
            />
          </div>
          <div>
            <Button>Send</Button>{" "}
          </div>
        </div>

        {errorValue && <p className="text-red-500 ">{errorValue}</p>}
      </form>
    </div>
  );
}

export { TipButton, TipDialog };
