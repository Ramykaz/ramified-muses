import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ReadingList from './pages/ReadingList'
import FilmReviews from './pages/FilmReviews'
import Research from './pages/Research'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import { FilmReviewPost, ResearchPost } from './pages/PostPages.tsx'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/reading-list" element={<ReadingList />} />
          <Route path="/film-reviews" element={<FilmReviews />} />
          <Route path="/film-reviews/:id" element={<FilmReviewPost />} />
          <Route path="/research" element={<Research />} />
          <Route path="/research/:id" element={<ResearchPost />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
