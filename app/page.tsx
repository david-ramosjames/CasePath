export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <p className="firm-name">Ramos James Law</p>
        <p className="product-name">CasePath</p>
      </header>
      <main className="sheet">
        <h1>Open the link in your text message</h1>
        <p>
          CasePath is the page we send with a video about your case. It opens from
          that personal link, which shows where your case stands.
        </p>
        <p>
          If you typed this address yourself, go back to the message from Ramos
          James Law and tap the link.
        </p>
        <a className="contact" href="https://www.ramosjames.com/">
          Visit Ramos James Law
        </a>
      </main>
    </>
  );
}
