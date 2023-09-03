import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";
import { useState } from "react";
import HeartButton from "./HeartButton";
import { TipButton, TipDialog } from "./TipButton";
import DeleteButton from "./DeleteButton";
import { CommentButton, CommentSection } from "./Commenting";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});
interface Post {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
  totalTips: number;
  imageURL: string | null;
  comments: any;
  commentAmount: any;
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



function PostCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
  totalTips,
  comments,
  commentAmount,
  imageURL,

}: Post) {
  const trpcUtils = api.useContext();

  const session = useSession();

  const [toggleTipView, setToggleTipView] = useState(false);
  const [commentVisibility, setCommentVisibility] = useState(false);

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

  const deletePost = api.post.deletePost.useMutation({
    onSuccess: () => {
      console.log("deleted post");
    },
  });

  function handleToggleLike() {
    toggleLike.mutate({ id });
  }

  return (
    <>
      <li className="m-5 my-8 flex flex-col rounded-lg bg-[#f5f5f5]  px-4 py-4 shadow-lg">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-4">
            <Link href={`/profiles/${user.id}`}>
              <ProfileImage src={user.image} />
            </Link>
            <div className="flex flex-grow flex-col">
              <div className="flex flex-col gap-1 outline-none hover:underline focus-visible:underline md:flex-row">
                <Link href={`/profiles/${user.id}`}>
                  {user.name}{" "}
                  {(user.id === "clm3kxaaz0000f334m1hm9nh4" ||
                    user.id === "clkpsr1lc0000ml08o5pmj7l4") && (
                    <span className="text-black bg-yellow-400 p-1 rounded-lg mr-1">DEV</span>
                  )}
                  {session.status === "authenticated" &&
                    session.data!.user.id === user.id && (
                      <span className="text-black bg-green-500 p-1 rounded-lg">You</span>
                    )}
                </Link>

                <span className="hidden text-gray-500 md:block">-</span>

                <span className="text-gray-500">
                  {dateTimeFormatter.format(createdAt)}
                </span>

                <span className="hidden text-gray-500 md:block"> | </span>

                <span className="text-gray-500">{totalTips.toFixed(2)} BAN tipped</span>
              </div>

              <p className="whitespace-pre-wrap break-all">{content}</p>
              {/* {imageURL && (
                <img
                  alt={content}
                  src={imageURL}
                  className="w-full max-w-[500px]"
                />
              )} */}
              <div className="">
              <div className="flex gap-3">
                <HeartButton
                  onClick={handleToggleLike}
                  isLoading={toggleLike.isLoading}
                  likedByMe={likedByMe}
                  likeCount={likeCount}
                />
                <CommentButton amt={commentAmount} isLoading={toggleLike.isLoading} onClick={() => {setCommentVisibility(!commentVisibility)}}/>
                {session.status == "authenticated" &&
                  session.data!.user.id != user.id && (
                    <>
                      <TipButton
                        onClick={() => {
                          setToggleTipView(!toggleTipView);
                        }}
                      />
                    </>
                  )}
              </div>
              </div>
            </div>
          </div>

          <div className="end-0 flex flex-row">
            {session.status == "authenticated" &&
              (session.data!.user.id === user.id ||
                session.data!.user.id === "clm3kxaaz0000f334m1hm9nh4" ||
                session.data!.user.id === "clkpsr1lc0000ml08o5pmj7l4") && (
                <DeleteButton onClick={() => deletePost.mutate({ id })} />
              )}

            {/*<ReportButton onClick={() => console.log("aaa")} />*/}
          </div>
        </div>
        <div className="">
        {toggleTipView && (
                <TipDialog dialogRefrence={setToggleTipView} user={user} id={id} />
              )}
              {commentVisibility && (
                <CommentSection id={id} user={user} commentsData={comments}  />
              )}
              </div>
      </li>
    </>
  );
}

/* function ReportButton({ onClick }: any) {
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
      className={`group -mt-1 flex flex-row items-center gap-1 self-start transition-colors duration-200`}
    >
      <IconHoverEffect>
        <div className="flex items-center gap-1">
          <FaFlag className="fill-black" />
        </div>
      </IconHoverEffect>
    </button>
  );
}
 */
