type Post = {
    id: string
    content: string
    createdAt: Date
    likeCount: number
    likedByMe: boolean
    
}

type InfiniteListProps = {
    isLoading: boolean
    isError: boolean
    hasMore:boolean
    fetchNewPost: () => Promise<unknown>
    posts?: Post[]
}


export default function InfinityList({posts: InfiniteListProps) {
    return <h1>AAA</h1>
}