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
    fetchNewPost: () => Promise<unknown>
    posts?: Post[]
}


export default function InfinityList({posts, isError, isLoading}: InfiniteListProps) {
    return <h1>AAA</h1>
}