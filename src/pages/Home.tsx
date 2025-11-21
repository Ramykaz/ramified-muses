const Home: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="notebook-page page-home">
      <div className="content-wrapper">
        <h1 className="page-title">
        </h1>

        <div className="profile-section">
          <div>
            <img
              src="/profi.jpg"
              alt="Ramadan Shemsu Hussen"
              className="profile-image"
            />
          </div>
          <div className="profile-content">
            <div className="section">
              <h2 className="section-title">About Me</h2>
              <div className="content">
                <p>Computer Engineering student at Hacettepe University passionate about AI research, computer vision, and building solutions that create impact.</p>
                <p className="quote">"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle</p>
                <p>Currently working on computer vision systems for renewable energy and exploring the intersections of AI, cinema, and literature.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="date">{currentDate}</div>
    </div>
  )
}

export default Home
