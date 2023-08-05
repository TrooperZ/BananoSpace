import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { useState } from "react";

export function NewPostForm() {
    const session = useSession();
    const [inputValue, setInputValue] = useState("")

    if (session.status !== "authenticated") return

    return <form className="flex flex-col gap-2 border-b px-4 py-2">
        <div className="flex gap-4">
            <ProfileImage src={session.data.user.image} />
            <textarea style={{height:0}} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter post text" className="flex-grow resize-none 
            overflow-hidden p-4 pb-12 text-lg outline-none border-1 "/>
        
        </div>
        <Button className="self-end ">Post</Button>
    </form>;
}