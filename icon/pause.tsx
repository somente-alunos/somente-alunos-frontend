

export function PauseIcon(Parameter_informationIcon: {className?: string}) {
    const Const_className = Parameter_informationIcon.className
    return (
        <svg viewBox="0 0 64 64" className={`fill-current ${Const_className}`}>
            <path
                d="M32 2a30 30 0 1 0 30 30A30 30 0 0 0 32 2zm-4 42a2 2 0 0 1-4 0V20a2 2 0 0 1 4 0zm12 0a2 2 0 0 1-4 0V20a2 2 0 0 1 4 0z"
            />
        </svg>
    )
}
