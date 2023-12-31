import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import type { FormEvent } from "react";
import { api } from "~/utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;

  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

function Form() {
  const session = useSession();
  const [inputValue, setInputValue] = useState("");


  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);
  

  const trpcUtils = api.useContext();

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  const createPost = api.post.create.useMutation({
    onSuccess: (newPost) => {
      {
        /*console.log(newPost);*/
      }
      setInputValue("");

      if (session.status !== "authenticated") return;

      

      trpcUtils.post.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (oldData?.pages[0] == null) return;

        const newCachePost = {
          ...newPost,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.data?.user.id,
            name: session.data?.user.name,
            image: session.data?.user.image,
          },
        };

        return {
          ...oldData,
          page: [
            {
              ...oldData.pages[0],
              posts: [newCachePost, ...oldData.pages[0].posts],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });

    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    createPost.mutate({ content: inputValue, image: "" });
  }

  if (session.status !== "authenticated") return null;

  return (
    <>
    <div className="h-4">

    </div>
    <form
      onSubmit={handleSubmit}
      className="flex bg-[#f5f5f5] pt-6 rounded-xl mx-5 flex-col gap-2 shadow-lg px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage className="hidden md:block" src={session.data.user.image} />
        {/*<div className="flex flex-col gap-4">*/}
        <textarea
          maxLength={175}
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter post text"
          className="flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none"
        />
       {/*  <p>(Optional) Enter image URL: <span className="text-xs">(We currently do not have enough space to host images, so please use something like imagur or some other service, thanks)</span></p>
                <textarea

          ref={inputRef}
          style={{ height: 0 }}
          value={imageInputValue}
          onChange={(e) => setImageInputValue(e.target.value)}
          placeholder="Enter image url"
          className="flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none"
  /> </div>*/}
      </div>
      <Button className="self-end ">Post</Button>
    </form>
    </>
  );
}

export function NewPostForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  return <Form />;
}
