const Contact: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="notebook-page page-contact">
      <div className="content-wrapper">
        <h1 className="page-title"></h1>

        <div className="section">
          <h2 className="section-title">Get In Touch</h2>
          <div className="content">
            <p>Interested in collaboration or research discussions? Feel free to reach out.</p>
            <p className="quote">"The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed." - Carl Jung</p>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Connect</h2>
          <div className="content">
            <ul className="content-list">
              <li><strong>Email:</strong> Ramadanshemsu341@gmail.com</li>
              <li><strong>Phone:</strong> +9053 4614 6330</li>
              <li><strong>Location:</strong> Çankaya, Ankara, Turkey</li>
            </ul>

            <div className="contact-links">
              <a href="https://linkedin.com/in/ramadan-shemsu-hussen-0b995a191" className="contact-link" target="_blank" rel="noopener noreferrer">
                <span>LinkedIn</span>
              </a>
              <a href="https://github.com/Ramykaz" className="contact-link" target="_blank" rel="noopener noreferrer">
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Contact
