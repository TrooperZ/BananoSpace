import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { FaDollarSign } from "react-icons/fa";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type {FormEvent} from "react";
import Button from "./Button";

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
  totalTips: number;
}

interface InfiniteListProps {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
}

export default function InfinityList({
  posts,
  isError,
  isLoading,
  fetchNewPosts,
  hasMore = false,
}: InfiniteListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>Error...</h1>;
  if (posts == null || posts.length == 0)
    return <h2 className="my-4 text-center text-2xl text-black">No Posts</h2>;

  return (
    <ul>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {posts.map((post) => {
          return <PostCard key={post.id} {...post} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});


function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;

  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

function PostCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
  totalTips,
}: Post) {
  const trpcUtils = api.useContext();
  const [tipDialog, setTipDialog] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errorValue, setErrorValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const session = useSession();
  const fetchBalance = api.settings.fetchBalance.useQuery({
    id: session.data!.user.id,
  });


  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);
  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);
  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const updateData: Parameters<
        typeof trpcUtils.post.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const countModifier = addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === id) {
                  return {
                    ...post,
                    likeCount: post.likeCount + countModifier,
                    likedByMe: addedLike,
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
    },
  });

  const tipPost = api.post.tipPost.useMutation({
    onSuccess: () => {
      setTipDialog(false);
    },
  })

  const handleTip = (event: FormEvent) => {
    event.preventDefault();
    
    if (session.status !== "authenticated") return;

    if (inputValue.trim().length === 0) {
      setErrorValue("Tip amount cannot be empty");
      return;
    }

    if (isNaN(parseFloat(inputValue))) {
      setErrorValue("Tip amount must be a number");
      return;
    }

    if (parseFloat(inputValue) <= 0) {
      setErrorValue("Tip amount must be greater than 0");
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
    })
  }

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  interface TipDialogProps {
    className?: string;
  }

  function TipDialog({ className }: TipDialogProps) {
    return (
      <div className={`${className}`}>
        <h1 className="pb-4 text-2xl font-bold">Tip BAN</h1>
        <div className="space-x-4">
        <form
        onSubmit={handleTip}
        className="mx-5 flex flex-col items-center gap-2 rounded-xl "
      >
        <div className="flex gap-4">
          <textarea
            ref={inputRef}
            style={{ height: 0 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter"
            className="w-[200px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none"
          />
        </div>
        <div><Button>Send</Button>          <button
            className="rounded-lg bg-red-500 p-2 px-3 font-bold text-white"
            onClick={() => setTipDialog(false)}
          >
            Close
          </button></div>
        
        {errorValue && <p className="text-red-500">{errorValue}</p>}
      </form>
          

        </div>
      </div>
    );
  }

  return (
    <>
      <li className="m-5 my-8 flex flex-col rounded-lg bg-[#f5f5f5]  px-4 py-4 shadow-lg">
        <div className="flex flex-row gap-4">
          <Link href={`/profiles/${user.id}`}>
            <ProfileImage src={user.image} />
          </Link>
          <div className="flex flex-grow flex-col">
            <div className="flex flex-col gap-1 outline-none hover:underline focus-visible:underline md:flex-row">
              <Link href={`/profiles/${user.id}`}>{user.name}</Link>

              <span className="hidden text-gray-500 md:block">-</span>

              <span className="text-gray-500">
                {dateTimeFormatter.format(createdAt)}
              </span>

              <span className="hidden text-gray-500 md:block"> | </span>

              <span className="text-gray-500">{totalTips} BAN tipped</span>
            </div>

            <p className="whitespace-pre-wrap break-all">{content}</p>
            <div className="flex gap-3">
              <HeartButton
                onClick={handleToggleLike}
                isLoading={toggleLike.isLoading}
                likedByMe={likedByMe}
                likeCount={likeCount}
              />
              {session.data!.user.id !== user.id && (
                              <TipButton
                              onClick={() => setTipDialog(!tipDialog)}
                              isLoading={false}
                              likeCount={totalTips}
                              likedByMe={false}
                            />
              )}

            </div>
          </div>
        </div>
        {tipDialog && (
          <TipDialog className="flex w-full flex-col items-center justify-center" />
        )}
      </li>
    </>
  );
}

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
  );
}

function TipButton({ isLoading, onClick }: HeartButtonProps) {
  const session = useSession();

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <span></span>
      </div>
    );
  }

  return (
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
  );
}
