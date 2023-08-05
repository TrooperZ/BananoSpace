import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import ProfileImage from "./ProfileImage";
import { useSession } from "next-auth/react";
import {VscHeart, VscHeartFilled} from "react-icons/vsc"

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  user: { id: string; image: string | null; name: string | null };
};

type InfiniteListProps = {
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNewPosts: () => Promise<unknown>;
  posts?: Post[];
};

export default function InfinityList({
  posts,
  isError,
  isLoading,
  fetchNewPosts,
  hasMore,
}: InfiniteListProps) {
  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error...</h1>;
  if (posts == null || posts.length == 0)
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>
    );

  return (
    <ul>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNewPosts}
        hasMore={hasMore}
        loader={"Loading..."}
      >
        {posts.map((post) => {
          return <PostCard key={post.id} {...post} />;
        })}
      </InfiniteScroll>
    </ul>
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "short"});

function PostCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
}: Post) {
  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1 hover:underline focus-visible:underline outline-none">
          <Link href={`/profiles/${user.id}`}>{user.name}</Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartButton likedByMe={likedByMe} likeCount={likeCount}/>
      </div>
    </li>
  );
}

type HeartButtonProps = {
  likedByMe: boolean
  likeCount: number
}

function HeartButton({likedByMe, likeCount}: HeartButtonProps) {
  const session = useSession();
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart;

  
  if(session.status !== "authenticated"){
    return <div className="mb-1 mt-1 flex items-center gap-3 self-start text-gray-500">
      <HeartIcon />
      <span>{likeCount}</span>
    </div>
  }
  return <h1>Heart</h1>
}
