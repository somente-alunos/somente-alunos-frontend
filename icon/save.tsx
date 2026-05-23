

export function SaveIcon(Parameter_informationIcon: {className?: string}) {
    const Const_className = Parameter_informationIcon.className
    return (
        <svg viewBox="0 0 64 64" className={`fill-none stroke-current ${Const_className}`}>
            <path
                d="M42 48h7a13 13 0 0 0 0-26h-.5a17 17 0 0 0-32.3 4.4A11 11 0 1 0 13 48h9"
            />
            <path 
                d="M32 52V30m8 8l-8-8-8 8">
            </path>
        </svg>
    )
}
