import Button from "./Button";
import ProfileImage from "./ProfileImage";

export function NewPostForm() {
    return <form className="flex flex-col gap-2 border-b px-4 py-2">
        <div className="flex gap-4">
            <ProfileImage src="#url" />
            <textarea placeholder="Enter post text" className="flex-grow resize-none 
            overflow-hidden p-4 text-lg outline-none"/>
        
        </div>
        <Button>Post</Button>
    </form>;
}