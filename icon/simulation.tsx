

import React from "react"


export function SimulationIcon(Parameter_informationIcon: {size?: number, height?: number, width?: number, props?: Record<string, any>}) {
    const {size, height, width, ...props} = Parameter_informationIcon
        return (
        <svg
            fill="none"
            height={size || height || 24}
            viewBox="0 0 64 64"
            width={size || width || 24}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
        <path
          d="M47.962 40l-7.439-14.95A5 5 0 0 1 40 22.819V1.994H24V22.82a5 5 0 0 1-.523 2.227L16.04 40"
          stroke="#000000"
        />
        <path
          d="M53.064 50.251L47.962 40H16.04l-5.1 10.254a7.943 7.943 0 0 0-.844 4.98 8.184 8.184 0 0 0 8.17 6.764h27.443a8.2 8.2 0 0 0 8.271-7.44 7.936 7.936 0 0 0-.916-4.307z"
          stroke="#000000"
        />
        <path
          d="M21 1.994h22"
          stroke="#000000"
        />
        </svg>
    )
}
