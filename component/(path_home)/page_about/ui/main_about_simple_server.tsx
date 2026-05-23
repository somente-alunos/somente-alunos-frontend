

'use client'


import Link from 'next/link'
import { Card, CardHeader, CardBody, CardFooter, Divider, Link as LinkNextUi } from "@nextui-org/react"


export function Compoment_MainAboutServer() {
    return (
        <>
            <Card className="flex w-[900px] px-3 pt-2 pb-3">
                <CardHeader>
                    <h1 className="text-2xl font-semibold">
                        Sobre Nós
                    </h1>
                </CardHeader>

                <Divider className="w-[90%] ml-2"/>

                <CardBody className="flex flex-col gap-3 py-5">
                    <p>
                        Bem-vindo ao Somente Alunos, a plataforma dedicada a facilitar o compartilhamento de conhecimento acadêmico entre estudantes universitários. Nossa missão é criar um ambiente colaborativo onde alunos possam trocar materiais de estudo, anotações, resumos e outros recursos que potencializem o aprendizado e promovam o sucesso acadêmico. Acreditamos que o conhecimento deve ser acessível a todos e que a colaboração entre colegas é essencial para superar os desafios da vida acadêmica.
                    </p>

                    <p>
                        Nossa plataforma permite que os alunos compartilhem uma ampla variedade de materiais de estudo, desde anotações de aula até resumos detalhados e guias de estudo. Ao facilitar esse intercâmbio, garantimos que todos tenham acesso aos recursos necessários para alcançar o sucesso. Além disso, incentivamos os alunos a darem feedbacks construtivos sobre os conteúdos disponíveis, promovendo um ambiente de aprendizado contínuo e colaborativo. Essa troca de conhecimentos melhora a qualidade dos materiais e cria um ciclo de melhoria constante.
                    </p>

                    <p>
                        O Somente Alunos está disponível 24 horas por dia, 7 dias por semana, garantindo que você possa acessar e compartilhar materiais sempre que precisar, independentemente do horário. Este acesso contínuo é crucial para suportar as diversas necessidades e horários dos estudantes. Nossa visão é criar uma comunidade acadêmica onde o conhecimento é compartilhado livremente e todos têm a oportunidade de aprender e crescer, melhorando o desempenho acadêmico e formando profissionais mais preparados.
                    </p>

                    <p>
                        Nosso funcionamento é simples: os alunos se cadastram gratuitamente e começam a compartilhar seus materiais de estudo. Cada vez que um material é baixado, o autor recebe um feedback, permitindo que ele entenda melhor como suas anotações estão ajudando seus colegas. Além disso, oferecemos funcionalidades que permitem aos alunos encontrar rapidamente os recursos de que precisam, filtrando por curso, disciplina ou tipo de material.
                    </p>

                    <p>
                        Seja você um aluno procurando por recursos adicionais para seus estudos, ou alguém que deseja ajudar seus colegas compartilhando seus próprios materiais, o  é o lugar perfeito para você. Junte-se à nossa comunidade hoje mesmo e descubra como a colaboração pode transformar sua experiência acadêmica. O  é mais do que uma plataforma de compartilhamento de materiais; é uma comunidade de estudantes dedicados a ajudar uns aos outros a alcançar o sucesso. Acreditamos no poder do conhecimento compartilhado e estamos comprometidos em fornecer as ferramentas e o suporte necessários para que você possa prosperar academicamente. Vamos juntos transformar o aprendizado e construir um futuro mais brilhante!
                    </p>
                </CardBody>

                <Divider className="w-[90%] ml-2"/>

                <CardFooter className="mt-1">
                    <span>
                        Para mais informações entre em contato conosco.&nbsp;
                    </span>
                    <LinkNextUi as={Link} isBlock showAnchorIcon href="/suporte" color="success">
                        Suporte
                    </LinkNextUi>
                </CardFooter>
            </Card>
        </>
    )
}
