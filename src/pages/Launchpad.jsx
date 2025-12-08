import { Link } from "react-router-dom";
import {
  BiMath,
} from "react-icons/bi";
import { GiDna1, GiChemicalDrop, GiGreekTemple } from "react-icons/gi";
import { MdOutlineScience, MdMenuBook } from "react-icons/md";
import "../styles/Launchpad.css";


export default function Home() {
  return (
    <div className="home-container">
      <p className="home-title">WHAT IS UPPPPP {name} 👋</p>
      <p className="home-desc">Welcome to your StudyForge account and launchpad to stress-free and effective study!</p>
    <div className="table-center">
      <div className="subjects-table">
        <div className="row-title-row">
          <span>Available courses</span>
        </div>
        <div className="table-header">
          <span>SUBJECT</span>
          <span>LEVEL</span>
          <span>BOARD</span>
          <span></span>
        </div>

        <Link to="/notes/maths" className="table-row">
          <div className="subject-info">
            <div className="icon-circle maths">
              <BiMath />
            </div>
            <span>Maths</span>
          </div>
          <span className="curriculum">GCSE</span>
          <span className="curriculum">Edexcel</span>
          <span className="arrow">→</span>
        </Link>

        <Link to="/notes/biology" className="table-row">
          <div className="subject-info">
            <div className="icon-circle bio">
              <GiDna1 />
            </div>
            <span>Biology</span>
          </div>
          <span className="curriculum">GCSE</span>
          <span className="curriculum">Edexcel</span>
          <span className="arrow">→</span>
        </Link>

        <Link to="/notes/chemistry" className="table-row">
          <div className="subject-info">
            <div className="icon-circle chem">
              <GiChemicalDrop />
            </div>
            <span>Chemistry</span>
          </div>
          <span className="curriculum">GCSE</span>
          <span className="curriculum">Edexcel</span>
          <span className="arrow">→</span>
        </Link>

        <Link to="/notes/physics" className="table-row">
          <div className="subject-info">
            <div className="icon-circle phys">
              <MdOutlineScience />
            </div>
            <span>Physics</span>
          </div>
          <span className="curriculum">GCSE</span>
          <span className="curriculum">Edexcel</span>
          <span className="arrow">→</span>
        </Link>

        <Link to="/notes/english" className="table-row">
          <div className="subject-info">
            <div className="icon-circle eng">
              <MdMenuBook />
            </div>
            <span>English</span>
          </div>
          <span className="curriculum">GCSE</span>
          <span className="curriculum">Edexcel</span>
          <span className="arrow">→</span>
        </Link>

        <Link to="/notes/history" className="table-row">
          <div className="subject-info">
            <div className="icon-circle hist">
              <GiGreekTemple />
            </div>
            <span>History</span>
          </div>
          <span className="curriculum">GCSE</span>
          <span className="curriculum">Edexcel</span>
          <span className="arrow">→</span>
        </Link>
      </div>
    </div>
    </div>
  );
}
