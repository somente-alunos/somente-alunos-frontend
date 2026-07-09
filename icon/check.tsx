

export function CheckIcon(Parameter_informationIcon: {className?: string}) {
    const Const_className = Parameter_informationIcon.className
    return (
        <svg viewBox="0 0 24 24" className={`fill-current ${Const_className}`}>

            <path
                d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"
            />
        </svg>
    )
}
