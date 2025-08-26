//import logo from './logo.svg';
//import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import './index.css';
import { Home } from './pages/Home';
import { News } from './pages/News';
import { Scores } from './pages/Scores';
import { Schedule } from './pages/Schedule';
import { Standings } from './pages/Standings';
import { Database } from './pages/Database';
import { Props } from './pages/Props';
import { Blog } from './pages/Blog';
import { StandingsView } from './views/StandingsView';
import { GameBoxMain } from './scores/GameBoxMain';
import { getTodayDate } from './util/dateHelper';
import { ArchivePage } from './components/blog/ArchivePage';
import { FullArticleView } from './components/blog/FullArticlePage';
import { NewsArchivePage } from './components/news/NewsArchivePage';
import { NewsFullPage } from './components/news/NewsFullPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/News" element={<News />}/>
        <Route path="/News/Archive" element={<NewsArchivePage />}/>
        <Route path="/news/article/:id" element={<NewsFullPage />} />
        <Route path="/Scores" element={<Navigate to={`/scores/${getTodayDate()}`} />}/>
        <Route path="/scores/:date" element={<Scores />} />
        <Route path="/Schedule" element={<Navigate to={`/schedule/${getTodayDate()}`} />}/>
        <Route path="/schedule/:date" element={<Schedule />} />
        <Route path="/Standings" element={<Navigate to="/standings/standings/division" />} />
        <Route path="/standings/:tab/:subtab?" element={<Standings />}>
          <Route path="" element={<StandingsView />} />
        </Route>
        <Route path="/Database" element={<Database />}/>
        <Route path="/Props" element={<Props />}/>
        <Route path="/Blog" element={<Blog />}/>
        <Route path="/Blog/Archive" element={<ArchivePage />} />
        <Route path="/blog/article/:id" element={<FullArticleView />} />
        <Route path="/Scores/:date/:gameId" element={<GameBoxMain />} />
      </Routes>
    </Router>
  );
}

export default App;
