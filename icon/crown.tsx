

import React from "react"


export function CrownIcon(Parameter_informationIcon: {size?: number, height?: number, width?: number, props?: Record<string, any>}) {
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
                    d="M6 28l1.4-.3-.6.3L10 44h44l3.2-16.1h.8a4.1 4.1 0 1 0-1.9-.5H56c-9.3 15.8-18.8 7.5-22.9-7.6a5 5 0 1 0-2.1 0c-4 15.1-12.5 23.5-22.9 7.6h-.2A4 4 0 1 0 6 28z"
                />
                <path
                    d="M10.8 48l1.2 6h40l1.2-6H10.8z"
                />
            </g>
        </svg>
    )
}
