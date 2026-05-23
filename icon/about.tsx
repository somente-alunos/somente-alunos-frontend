

import React from "react"


export function AboutIcon(Parameter_informationIcon: {size?: number, height?: number, width?: number, props?: Record<string, any>}) {
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
                    d="M32 0a32 32 0 1 0 32 32A32.037 32.037 0 0 0 32 0zm-2.977 15.037a3.62 3.62 0 0 1 4.96 0 3.509 3.509 0 0 1 1.02 2.469 3.5 3.5 0 1 1-7 0 3.512 3.512 0 0 1 1.02-2.469zm6.98 34.97h-8v-4H30V28.024h-1.996v-4H34v21.985h2.004z"
                />
            </g>
        </svg>
    )
}
