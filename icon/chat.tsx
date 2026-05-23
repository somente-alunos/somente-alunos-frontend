

export function ChatIcon(Parameter_informationIcon: {className?: string}) {
    const Const_className = Parameter_informationIcon.className
    return (
        <svg viewBox="0 0 64 64" className={`fill-none stroke-current ${Const_className}`}>
            <path
                d="M42 8H22a20 20 0 0 0 0 40h2v10l12-10h6a20 20 0 1 0 0-40z"
            />
        </svg>
    )
}
