

import React from "react"


export function RobotIcon(Parameter_informationIcon: {size?: number, height?: number, width?: number, props?: Record<string, any>}) {
    const {size, height, width, ...props} = Parameter_informationIcon
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            height={size || height || 24}
            role="presentation"
            width={size || width || 24}
            fill="none"
            viewBox="0 0 348 331"
            {...props}
        >
            <g transform="translate(0.000000,331.000000) scale(0.100000,-0.100000)" fill="currentColor">
                <path d="M1035 2464 c-374 -322 -697 -601 -718 -620 -42 -40 -48 -73 -17 -104
                48 -48 35 -57 722 531 354 303 655 562 669 575 l26 25 662 -591 c365 -325 671
                -595 681 -600 35 -19 90 17 90 59 0 14 -6 33 -13 41 -7 9 -92 87 -189 174
                l-178 158 0 261 c0 191 -4 269 -13 287 l-13 25 -178 3 c-123 2 -183 -1 -192
                -9 -10 -8 -14 -37 -14 -100 0 -49 -3 -89 -7 -89 -5 0 -149 126 -322 280 -173
                154 -314 280 -315 279 -1 0 -307 -264 -681 -585z"/>
                <path d="M1192 2233 l-521 -448 0 -741 c-1 -563 2 -743 11 -752 17 -17 639
                -17 656 0 9 9 12 124 12 456 0 286 4 450 10 463 10 18 25 19 353 19 254 0 346
                -3 355 -12 9 -9 12 -124 12 -456 0 -286 4 -450 10 -463 10 -18 25 -19 336 -19
                l324 0 10 26 c6 15 10 296 10 732 l-1 707 -520 465 c-286 256 -524 466 -528
                468 -4 1 -242 -199 -529 -445z"/>
            </g>
        </svg>
    )
}
