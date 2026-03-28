import './style.css';
import Header from "../components/Header/Header";
import Settings from "../components/Settings/Settings";

const header = new Header();
const settings = new Settings();
header.setSettings(settings);
