

'use client'


import { useState } from 'react'


export function Function_shareStateHome() {
  const [isLoadedModal, setLoadedModal] = useState(false)
  
  return { isLoadedModal, setLoadedModal}
}
