
export const dynamic = "force-static"


import { Compoment_MainAboutServer } from "@/component/(path_home)/page_about/ui/main_about_simple_server"


export default function Page_About() {
    return (
        <>
            <div className="flex justify-center py-[4%] px-[4%] md:py-[3%] md:px-[2%]">
                <Compoment_MainAboutServer/>
            </div>
        </>
    )
}
