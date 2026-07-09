
export const dynamic = "force-static"


import { Component_MainContactServer } from "@/component/(path_home)/page_contact/ui/main_contact_server"
import { Component_MainSocialMidiaServer } from "@/component/(path_home)/page_contact/ui/main_social_midia_server"
import { Component_MainInformationServer } from "@/component/(path_home)/page_contact/ui/main_information_server"


export default function Page_Contact() {
    return (
        <>
            <div className="py-[7%] px-[7%] md:py-[4%] md:px-[5%]">
                <div className='flex flex-wrap justify-center gap-9'>
                    <Component_MainContactServer/>
                </div>
            </div>
        </>
    )
}
