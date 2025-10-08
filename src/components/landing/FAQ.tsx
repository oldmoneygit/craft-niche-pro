import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Como funciona o período de teste gratuito?',
      answer: 'Você tem 14 dias para testar todas as funcionalidades da plataforma sem precisar informar cartão de crédito. Após o período, você escolhe o plano que melhor se adequa ao seu consultório.',
    },
    {
      question: 'A IA realmente cria planos alimentares personalizados?',
      answer: 'Sim! Nossa IA foi treinada com milhares de planos alimentares e considera objetivos, restrições alimentares, preferências e necessidades nutricionais individuais de cada paciente. Você sempre pode revisar e ajustar conforme necessário.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, não há fidelidade. Você pode cancelar sua assinatura quando quiser, e terá acesso até o final do período já pago. Todos os seus dados ficam seguros por 30 dias após o cancelamento.',
    },
    {
      question: 'Os dados dos meus pacientes estão seguros?',
      answer: 'Absolutamente. Utilizamos criptografia de ponta a ponta e estamos 100% em conformidade com a LGPD. Nossos servidores são certificados e fazemos backups diários automáticos.',
    },
    {
      question: 'Como funciona a integração com WhatsApp?',
      answer: 'Você conecta seu número de WhatsApp Business à plataforma (via API oficial) e pode enviar lembretes de consultas, planos alimentares e mensagens personalizadas diretamente para seus pacientes.',
    },
    {
      question: 'Preciso de conhecimento técnico para usar?',
      answer: 'Não! A plataforma foi desenhada para ser intuitiva e fácil de usar. Qualquer nutricionista consegue começar a usar em minutos. Além disso, oferecemos tutoriais e suporte completo.',
    },
    {
      question: 'Quais são as formas de pagamento?',
      answer: 'Aceitamos cartão de crédito (Visa, Mastercard, Elo, Amex), Pix e boleto bancário. Para planos anuais, oferecemos descontos especiais.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tire suas dúvidas sobre a plataforma
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <Plus
                  className={`w-6 h-6 text-emerald-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-45' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ainda tem dúvidas?
          </p>
          <a
            href="/contato"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Entre em contato com nosso time
          </a>
        </div>
      </div>
    </section>
  );
}
