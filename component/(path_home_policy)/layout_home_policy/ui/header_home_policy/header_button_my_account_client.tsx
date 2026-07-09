

'use client'


import { Button, ButtonProps } from "@nextui-org/react"


export function Component_MainButtonMyAccountServer(Parameter_props: ButtonProps): JSX.Element {
    const { ...buttonProps } = Parameter_props

    return (
        <>
            <Button {...buttonProps}>
                {buttonProps.children}
            </Button>
        </>
    )
}
