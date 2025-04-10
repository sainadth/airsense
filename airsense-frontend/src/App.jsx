import './App.css';
import SensorData from './components/SensorData';
import Taskbar from './components/Taskbar';

function App() {
  return (
    <div>
      <Taskbar />
      <div>
        <SensorData />
      </div>
    </div>
  );
}

export default App;
