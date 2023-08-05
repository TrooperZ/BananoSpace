import InfinityList from "~/components/InfinityList";
import { NewPostForm } from "~/components/NewPostForm";
import { api } from "~/utils/api";

export default function Home() {


  return <>
    <header className="sticky top-0 z-10 border-b bg-white pt-2">
      <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
    </header>
    <NewPostForm />
    <RecentPosts />
  </>;
}

function RecentPosts() {
  const posts = api.post.infiniteFeed.useInfiniteQuery({}, {getNextPageParam: (lastPage) => lastPage.nextCursor})

  return <InfinityList posts={posts}/>

}