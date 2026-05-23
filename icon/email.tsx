

export function EmailIcon(Parameter_informationIcon: {className?: string}) {
    const Const_className = Parameter_informationIcon.className
    return (
        <svg viewBox="0 0 64 64" className={`fill-current ${Const_className}`}>
            <path
            d="M2 12h60v40H2z"
            data-name="layer1"
            fill="#fff4e3"
        />
        <path
            d="M2 12l30 27.4L62 12 29 47 5 18v34H2V12z"
            data-name="opacity"
            fill="#000064"
            opacity=".14"
        />
        <path
            d="M2 12l30 27.4L62 12"
            data-name="stroke"
            fill="none"
            stroke="#2e4369"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth={2}
        />
        <path
            d="M2 12h60v40H2z"
            data-name="stroke"
            fill="none"
            stroke="#2e4369"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth={2}
        />
        </svg>
    )
}
