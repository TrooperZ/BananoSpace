import {VscRefresh} from 'react-icons/vsc';


interface LoadingSpinnerProps {big?: boolean};



export function LoadingSpinner({big = false}: LoadingSpinnerProps) {
    const sizeClasses = big ? "h-16 w-16" : "h-8 w-8";
    return <div className="flex justify-center p-2">
        <VscRefresh className={`animate-spin ${sizeClasses}`} />
    </div>
}