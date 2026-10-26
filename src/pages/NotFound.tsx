import { LinkButton } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Página não encontrada');
  return (
    <main id="conteudo" className="container-x relative z-10 flex min-h-[100svh] flex-col justify-center pb-24 pt-28">
      <p className="eyebrow">Erro 404</p>
      <h1 className="display mt-4 text-[clamp(3rem,14vw,7rem)]">
        Essa cadeira <em className="brass-text">não existe.</em>
      </h1>
      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton to="/" variant="ghost" icon="arrowLeft">Voltar ao início</LinkButton>
        <LinkButton to="/agendar" iconRight="arrowRight">Agendar horário</LinkButton>
      </div>
    </main>
  );
}
