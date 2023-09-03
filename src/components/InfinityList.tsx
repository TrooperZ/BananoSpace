import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscComment } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Button from "./Button";
import HeartButton from "./HeartButton";
import { TipButton, TipDialog } from "./TipButton";
import DeleteButton from "./DeleteButton";

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
  imageURL,
  comments,
}: Post) {
  const trpcUtils = api.useContext();

  const session = useSession();

  const [toggleTipView, setToggleTipView] = useState(false);

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
                {session.status == "authenticated" &&
                  session.data!.user.id != user.id && (
                    <>
                      {/* <CommentButton
                  commentsData={comments}
                    isLoading={false}
id={id}
user={user}
amt={0}/> */}
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
              </div>
      </li>
    </>
  );
}

// function CommentButton({ isLoading, id, user, amt, commentsData }: any) {
//   const [comments, setComments] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const textAreaRef = useRef<HTMLTextAreaElement>();
//   const session = useSession();

//   const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
//     updateTextAreaSize(textArea);
//     textAreaRef.current = textArea;
//   }, []);

//   useLayoutEffect(() => {
//     updateTextAreaSize(textAreaRef.current);
//   }, [inputValue]);

//   const handleComment = (event: FormEvent) => {
//     event.preventDefault();

//     if (session.status !== "authenticated") return;

//     if (session.data.user.name === null || session.data.user.name === undefined)
//       return;

//     commentPost.mutate({
//       creator: session.data!.user.name,
//       postId: id,
//       content: inputValue,
//     });
//   };

//   const commentPost = api.post.makeComment.useMutation({
//     onSuccess: () => {},
//   });

//   if (session.status !== "authenticated") {
//     return (
//       <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
//         <VscComment className="fill-gray-500" />
//         <span>{amt}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="w-max">
//       <button
//         onClick={() => {
//           setComments(!comments);
//         }}
//         disabled={isLoading}
//         className={`group -ml-2 flex items-center gap-1 self-start text-gray-500 transition-colors duration-200`}
//       >
//         <IconHoverEffect>
//           <VscComment
//             className={`fill-gray-500 transition-colors duration-200`}
//           />
//         </IconHoverEffect>
//         <span>{amt}</span>
//       </button>
//       {comments && (
//         <>
//           <div className="mx-auto items-center justify-center">
//             <h1 className="pb-4 text-center text-2xl font-bold"></h1>
//             <div className="space-x-4">
//               <form
//                 onSubmit={handleComment}
//                 className="mx-5 flex flex-col items-center gap-2 rounded-xl "
//               >
//                 <div className="flex gap-4">
//                   <textarea
//                     ref={inputRef}
//                     style={{ height: 0 }}
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     placeholder="Add comment..."
//                     autoFocus
//                     className="w-[200px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none"
//                   />
//                 </div>
//                 <div>
//                   <Button>Comment</Button>{" "}
//                   <button
//                     className="rounded-lg bg-red-500 p-2 px-3 font-bold text-white"
//                     onClick={() => setComments(false)}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//           <div className="pt-2">
//             <div className="rounded-lg bg-gray-300 p-3">
//               {commentsData.map((comment: any) => (
//                 <div
//                   key={comment.id}
//                   className="border-1 mx-1 border-b border-gray-700 pb-2"
//                 >
//                   <h1>
//                     {comment.creator} -{" "}
//                     {dateTimeFormatter.format(comment.createdAt)}
//                   </h1>
//                   <p>{comment.content}</p>
//                   {/* {((session.status == "authenticated" && (session.data!.user.id === user.id || session.data!.user.id === "cllejbo010000f3msqyos3r3a" || session.data!.user.id === "clkpsr1lc0000ml08o5pmj7l4")) && (<DeleteButton onClick={() => deleteComment.mutate({id})} />))} */}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

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
