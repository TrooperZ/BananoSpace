import { useSession } from "next-auth/react";
import { useState } from "react";
import InfinityList from "~/components/InfinityList";
import { NewPostForm } from "~/components/NewPostForm";
import { api } from "~/utils/api";

const TABS = ["Recent", "Following"] as const;

export default function Home() {
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("Recent");
  const session = useSession();
  return (
    <>
      <header className="sticky top-0 z-10  bg-[#2A2A2E] pt-2 ">
        <h1 className="mb-2 px-4 text-lg text-white font-bold pb-2">Home</h1>
        {session.status === "authenticated" && (
          <div className="flex">
            {TABS.map((tab) => {
              return (
                <button
                  key={tab}
                  className={`p-2 text-white flex-grow hover:bg-yellow-400 hover:text-black focus-visible:background-gray-200 ${
                    tab === selectedTab
                      ? "border-b-4 border-b-yellow-400 font-bold"
                      : ""
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </header>
      <div className="">
        <h1 className="text-center py-2 px-2 bg-yellow-200 rounded-lg m-4">Welcome to BananoSpace! This project is still in the works, so expect tons of features to come soon! Bug fixes will come quickly, and if you need help, ping @trooperz in the Banano Discord.</h1>
      <NewPostForm />
      {selectedTab === "Recent" ? <RecentPosts /> : <FollowingPosts />}
      </div>

      
    </>
  );
}

function RecentPosts() {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfinityList
      posts={posts.data?.pages.flatMap((page) => page.posts)}
      isError={posts.isError}
      isLoading={posts.isLoading}
      hasMore={posts.hasNextPage}
      fetchNewPosts={posts.fetchNextPage} 
    />
  );
}

function FollowingPosts() {
  const posts = api.post.infiniteFeed.useInfiniteQuery(
    {onlyFollowing: true},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfinityList
      posts={posts.data?.pages.flatMap((page) => page.posts)}
      isError={posts.isError}
      isLoading={posts.isLoading}
      hasMore={posts.hasNextPage}
      fetchNewPosts={posts.fetchNextPage}
    />
  );
}

