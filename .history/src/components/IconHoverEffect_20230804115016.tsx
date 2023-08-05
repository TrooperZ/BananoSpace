import { ReactNode } from "react"
type IconHoverProps = {
    children: ReactNode 
    red?: boolean
}    


export function IconHoverEffect( {children, red = false}: IconHoverProps) {
    return <div className="">{children}</div>
}