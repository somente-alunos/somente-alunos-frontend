

export function CircleIcon(Parameter_informationIcon: {className?: string}) {
    const Const_className = Parameter_informationIcon.className
    return (
        <svg viewBox="0 0 100 100" className={`fill-current ${Const_className}`}>
            <circle cx="50" cy="50" r="50"/>
        </svg>
    )
}
