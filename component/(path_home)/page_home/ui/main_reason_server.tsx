

import { PeopleIcon } from "@/icon/people"
import { TicketIcon } from "@/icon/ticket"
import { DuobleChatIcon } from "@/icon/duoble_chat"
import { Operation247Icon } from "@/icon/operation_24_7"


export function Component_MainReasonServer() {
    return (
        <>
            <div className='flex flex-col text-center items-center'>
                <h1 className='text-3xl md:text-4xl font-bold w-[100%] md:w-[60%]'>Potencialize Seus Estudos com a Ajuda dos Colegas</h1>
                <h2 className='text-lg md:text-xl mt-4'>Compartilhe e acesse materiais que fazem a diferença no seu desempenho</h2>
                <div className='flex flex-col md:flex-row gap-9 mt-10 flex-wrap md:flex-nowrap justify-center'>
                    <div className='flex flex-col items-center w-[100%] md:w-[25%]'>
                        <PeopleIcon className='size w-[74px] h-[52px]'/>
                        <h3 className='text-xl font-semibold mt-4 mb-2'>
                            IMPULSIONE O ESTUDO
                        </h3>
                        <p className='text-base text-gray-600'>
                            Troque conhecimento e veja seu aprendizado crescer. Contribuições dinâmicas entre estudantes.
                        </p>
                    </div>
                    <div className='flex flex-col items-center w-[100%] md:w-[25%]'>
                        <TicketIcon className='size w-[74px] h-[52px]'/>
                        <h3 className='text-xl font-semibold mt-4 mb-2'>
                            CONTEÚDO ACESSÍVEL
                        </h3>
                        <p className='text-base text-gray-600'>
                            Tenha todos os recursos de estudo de que precisa ao alcance. Colaboração que facilita a vida acadêmica.
                        </p>
                    </div>
                    <div className='flex flex-col items-center w-[100%] md:w-[25%]'>
                        <DuobleChatIcon className='size w-[74px] h-[52px]'/>
                        <h3 className='text-xl font-semibold mt-4 mb-2'>
                            ESTUDANTES PARA ESTUDANTES
                        </h3>
                        <p className='text-base text-gray-600'>
                            Aperfeiçoe seus estudos com material compartilhado dos colegas. Crescimento colaborativo.
                        </p>
                    </div>
                    <div className='flex flex-col items-center w-[100%] md:w-[25%]'>
                        <Operation247Icon className='size w-[74px] h-[52px]'/>
                        <h3 className='text-xl font-semibold mt-4 mb-2'>
                            SUPORTE 24/7
                        </h3>
                        <p className='text-base text-gray-600'>
                            Acesse e compartilhe materiais a qualquer momento do dia. Suporte constante e confiável.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}