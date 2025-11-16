export default function Page() {
  return (
    <main>
      <section className="hero">
        <div className="container center">
          <div className="kicker">Emprestimo Diario</div>
          <h1 className="h1">Crédito simples, rápido e seguro</h1>
          <p className="p">Baixe o app para se cadastrar, enviar documentos e acompanhar toda sua gestão. Landing page substitui o WordPress com informações essenciais.</p>
          <div className="btns center" style={{justifyContent:'center'}}>
            <a className="btn primary" href="#baixar">Baixar App</a>
            <a className="btn secondary" href="#como-funciona">Saiba mais</a>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section">
        <div className="container">
          <h2 className="h1" style={{fontSize:28}}>Como funciona</h2>
          <div className="row cols-4" style={{display:'grid',gap:16,gridTemplateColumns:'repeat(4,minmax(0,1fr))'}}>
            <div className="card"><h3>1. Cadastro</h3><p>Crie sua conta com CPF e telefone.</p></div>
            <div className="card"><h3>2. Documentos</h3><p>Envie RG/CPF, comprovantes e selfie.</p></div>
            <div className="card"><h3>3. Solicitação</h3><p>Simule e envie a proposta no app.</p></div>
            <div className="card"><h3>4. Acompanhamento</h3><p>Receba status, pague parcelas e renove.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="h1" style={{fontSize:28}}>Benefícios</h2>
          <div className="row cols-3">
            <div className="card"><h3>Rápido</h3><p>Fluxo digital do cadastro à aprovação.</p></div>
            <div className="card"><h3>Transparente</h3><p>Acompanhe solicitações, contratos e parcelas.</p></div>
            <div className="card"><h3>Seguro</h3><p>Verificação facial e proteção de dados.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="h1" style={{fontSize:28}}>Segurança</h2>
          <div className="row cols-2">
            <div className="card"><h3>Criptografia</h3><p>Conexões seguras e armazenamento protegido.</p></div>
            <div className="card"><h3>Conformidade</h3><p>Políticas de privacidade e controles de acesso.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="h1" style={{fontSize:28}}>Perguntas frequentes</h2>
          <div className="row cols-2">
            <div className="card"><h3>Preciso do app?</h3><p>Sim, todo cadastro e gestão serão feitos pelo aplicativo.</p></div>
            <div className="card"><h3>Como pago parcelas?</h3><p>Pelo app, via PIX com status em tempo real.</p></div>
          </div>
        </div>
      </section>

      <section id="baixar" className="section">
        <div className="container center">
          <h2 className="h1" style={{fontSize:28}}>Baixe o aplicativo</h2>
          <p className="p">Disponível para Android e iOS em breve. Fique atento aos nossos canais.</p>
          <div className="btns center" style={{justifyContent:'center'}}>
            <a className="btn primary" href="#">Google Play</a>
            <a className="btn secondary" href="#">App Store</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container center small"> Empréstimo Diário. Todos os direitos reservados.</div>
      </footer>
    </main>
  )
}