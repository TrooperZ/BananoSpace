import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";

export function NewPostForm() {
    const session = useSession();

    if (session.status !== "authenticated") return

    return <form className="flex flex-col gap-2 border-b px-4 py-2">
        <div className="flex gap-4">
            <ProfileImage src="#url" />
            <textarea placeholder="Enter post text" className="flex-grow resize-none 
            overflow-hidden p-4 text-lg outline-none"/>
        
        </div>
        <Button className="self-end ">Post</Button>
    </form>;
}