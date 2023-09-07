import { useSession } from "next-auth/react";
import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  
} from "react";
import type {FormEvent} from "react";
import { VscComment } from "react-icons/vsc";
import { api } from "~/utils/api";
import Button from "./Button";
import { IconHoverEffect } from "./IconHoverEffect";
import DeleteButton from "./DeleteButton";
import textChecker from "./DiscordEmojiConverter";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
});

function CommentButton({ isLoading, onClick, amt }: any) {
  const session = useSession();

  if (session.status !== "authenticated") {
    return (
      <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
        <VscComment className="fill-gray-500" />
        <span>{amt}</span>
      </div>
    );
  }

  return (
    <div className="w-max">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`group -ml-2 flex items-center gap-1 self-start text-gray-500 transition-colors duration-200`}
      >
        <IconHoverEffect>
          <VscComment
            className={`fill-gray-500 transition-colors duration-200`}
          />
        </IconHoverEffect>
        <span>{amt}</span>
      </button>
    </div>
  );
}

function CommentSection({ id, commentsData }: any) {
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const session = useSession();
  const trpcUtils = api.useContext();
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

  const handleComment = (event: FormEvent) => {
    event.preventDefault();

    if (session.status !== "authenticated") return;

    if (session.data.user.name === null || session.data.user.name === undefined)
      return;

    commentPost.mutate({
      creator: session.data!.user.name,
      postId: id,
      content: inputValue,
    });
  };

  const commentPost = api.post.makeComment.useMutation({
    onSuccess: (comment: any) => {
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
                    comments: [...post.comments, comment],
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
      setInputValue("");

  }});

  const deleteComment = api.post.deleteComment.useMutation({
    onSuccess: () => {
      console.log("deleted post");
    },
  });

  return (
    <div className="rounded-lg bg-gray-300 p-2 flex flex-col">
        <div className="start-0 border-b border-gray-400 border-1 pb-4 w-full">
      <form
        onSubmit={handleComment}
        className="mx-5 flex flex-row items-center gap-2 rounded-xl "
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            style={{ height: 0 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add comment..."
            autoFocus
            className="w-[200px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-2 text-sm outline-none"
          />
        </div>
        <div>
          <Button>Comment</Button>{" "}
        </div>
      </form>
      </div>
      {commentsData.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="border-1 mx-1 border-b flex justify-between border-gray-400  pb-2"
                    >
                        <div>
                      <h1 className="">
                        {comment.creator} -{" "}
                        {dateTimeFormatter.format(Number(comment.createdAt))}
                      </h1>
                      <p>{textChecker(comment.content)}</p>
                      </div>
                      <div className="end-0 pt-1">
 
                      {( (session.status == "authenticated" && (session.data!.user.id === comment.userId || session.data!.user.id === "clm3kxaaz0000f334m1hm9nh4" || session.data!.user.id === "clkpsr1lc0000ml08o5pmj7l4"))  && (<DeleteButton onClick={() => deleteComment.mutate({id: comment.id})} />))}
                      </div>
                    </div>
                  ))}

    </div>
    //   <div>
    //         <>
    //           <div className="mx-auto items-center justify-center">
    //             <h1 className="pb-4 text-center text-2xl font-bold"></h1>
    //             <div className="space-x-4">
    // <form
    //   onSubmit={handleComment}
    //   className="mx-5 flex flex-col items-center gap-2 rounded-xl "
    // >
    //   <div className="flex gap-4">
    //     <textarea
    //       ref={inputRef}
    //       style={{ height: 0 }}
    //       value={inputValue}
    //       onChange={(e) => setInputValue(e.target.value)}
    //       placeholder="Add comment..."
    //       autoFocus
    //       className="w-[200px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none"
    //     />
    //   </div>
    //   <div>
    //     <Button>Comment</Button>{" "}
    //     <button
    //       className="rounded-lg bg-red-500 p-2 px-3 font-bold text-white"
    //       onClick={() => console.log("aaa")}
    //     >
    //       Close
    //     </button>
    //   </div>
    // </form>
    //             </div>
    //           </div>
    //           <div className="pt-2">
    //             <div className="rounded-lg bg-gray-300 p-3">
                //   {commentsData.map((comment: any) => (
                //     <div
                //       key={comment.id}
                //       className="border-1 mx-1 border-b border-gray-700 pb-2"
                //     >
                //       <h1>
                //         {comment.creator} -{" "}
                //         {dateTimeFormatter.format(comment.createdAt)}
                //       </h1>
                //       <p>{comment.content}</p>
                //       {/* {((session.status == "authenticated" && (session.data!.user.id === user.id || session.data!.user.id === "cllejbo010000f3msqyos3r3a" || session.data!.user.id === "clkpsr1lc0000ml08o5pmj7l4")) && (<DeleteButton onClick={() => deleteComment.mutate({id})} />))} */}
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         </>
    // </div>
  );
}

export { CommentButton, CommentSection };



/**/