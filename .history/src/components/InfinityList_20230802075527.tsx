type Post = {
    id: stringcontent string
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