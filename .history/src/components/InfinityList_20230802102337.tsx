import InfiniteScroll from "react-infinite-scroll-component"

type Post = {
    id: string
    content: string
    createdAt: Date
    likeCount: number
    likedByMe: boolean
    user: {id: string; image: string | null; name: string | null}
}

type InfiniteListProps = {
    isLoading: boolean
    isError: boolean
    hasMore:boolean
    fetchNewPosts: () => Promise<unknown>
    posts?: Post[]
}


export default function InfinityList({posts, isError, isLoading, fetchNewPosts, hasMore}: InfiniteListProps) {
    if (isLoading) return <h1>Loading...</h1>
    if (isError) return <h1>Error...</h1>
    if (posts == null || posts.length == 0) return <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>

    return <ul>
        <InfiniteScroll dataLength={posts.length} next={fetchNewPosts} hasMore={hasMore} loader={"Loading..."}>

        </InfiniteScroll>
    </ul>
}