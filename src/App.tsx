import './App.css'
import PluralityScene from './components/plurality/PluralityScene'

function App() {
  return (
    <div className="plurality-container">
      <PluralityScene />
      <div className="microcopy">
        <div className="microcopy-item fade-in">This is not a platform. This is the memory of the moment before thought.</div>
        <div className="microcopy-item fade-in delay-1">You are not here. Your idea is.</div>
        <div className="microcopy-item fade-in delay-2">Merge. Resist. Fractalize. Fade. Become.</div>
        <div className="microcopy-item fade-in delay-3">Let your Cogniton drift.</div>
      </div>
    </div>
  )
}

export default App
