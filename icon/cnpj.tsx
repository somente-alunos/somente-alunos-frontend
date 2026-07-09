

export function CnpjIcon(Parameter_informationIcon: {className?: string}) {
    const Const_className = Parameter_informationIcon.className
    return (
        <svg viewBox="0 0 64 64" className={`fill-current ${Const_className}`}>
            <path
                d="M37 18V2H11v60h42V18H37z"
                fill="#ebf5ff"
            />
            <path
                d="M53 18L37 2v16h16z"
                fill="#fff"
            />
            <path
                d="M32.1 2v23H53v-7H37V2h-4.9z"
                fill="#000064"
                opacity=".15"
            />
            <path
                d="M11 2v60h42V18L37 2H11z"
                fill="none"
                stroke="#2e4369"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth={2}
            />
            <path
                d="M37 2v16h16m-32 4h8m-8 10h22M21 42h22M21 52h18"
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
