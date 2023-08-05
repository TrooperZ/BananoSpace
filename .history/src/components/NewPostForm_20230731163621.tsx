import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
    if (textArea == null) return
    textArea.style.height = "0"
    textArea.style.height = `${textArea.scrollHeight}px`   
}    

export function NewPostForm() {
    const session = useSession();
    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    useCallbacl((textArea) => {})

    useLayoutEffect(() => {updateTextAreaSize(textAreaRef.current)}, [inputValue]);

    if (session.status !== "authenticated") return

    return <form className="flex flex-col gap-2 border-b px-4 py-2">
        <div className="flex gap-4">
            <ProfileImage src={session.data.user.image} />
            <textarea ref={textAreaRef} style={{height:0}} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter post text" className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none border rounded-xl"/>
        
        </div>
        <Button className="self-end ">Post</Button>
    </form>;
}