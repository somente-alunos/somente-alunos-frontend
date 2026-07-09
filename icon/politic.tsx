

import React from "react"


export function PoliticIcon(Parameter_informationIcon: {size?: number, height?: number, width?: number, props?: Record<string, any>}) {
    const {size, height, width, ...props} = Parameter_informationIcon
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height={size || height || 24}
            role="presentation"
            width={size || width || 24}
            fill="none"
            viewBox="0 0 64 64"
            {...props}
        >
            <g fill="currentColor">
                <path
                    d="M58 4h-1.6l-.5.3h-.2l-.5.4h-.1A4 4 0 0 0 54 8v2h8V8a4 4 0 0 0-4-4zM30 50H2v2a8 8 0 0 0 8 8h23.1a12 12 0 0 1-3.1-8z"
                />
                <path
                    d="M16 8v38h18v6a8 8 0 0 0 8 8 8 8 0 0 0 8-8V5.7l.2-.5.2-.6.3-.5H20A4 4 0 0 0 16 8zm9.1 2h16a2 2 0 0 1 0 4h-16a2 2 0 0 1 0-4zm0 8h12a2 2 0 0 1 0 4h-12a2 2 0 0 1 0-4zm0 8h16a2 2 0 0 1 0 4h-16a2 2 0 0 1 0-4zm0 8h12a2 2 0 0 1 0 4h-12a2 2 0 0 1 0-4z"
                />
            </g>
        </svg>
    )
}
