
export const dynamic = "force-static"


import { Component_MainTitleServer } from "@/component/(path_home)/page_home/ui/main_title_server"
import { Component_MainReasonServer } from "@/component/(path_home)/page_home/ui/main_reason_server"


export default function Page_Home() {
    return (
        <>
            <div className='flex justify-evenly flex-wrap gap-12 py-[6%] px-[7%] md:py-[4%] md:px-[5%] bg-[radial-gradient(circle_at_115%_center,_hsl(198deg_100%_50%_/_90%)_55%,_hsl(210deg_100%_50%_/_75%)_75%)] bg-home-green shadow-home-green-shadow shadow-sm'>
                <div className='w-full md:w-1/2'>
                    <Component_MainTitleServer/>
                </div>
            </div>
            <div className='flex justify-evenly flex-wrap gap-12 pt-[8%] px-[7%] md:py-[4%] md:px-[5%]'>
                <Component_MainReasonServer/>
            </div>
        </>
    )
}
