import "../styles/Footer.css";

export default function Footer() {
  return (
    <div>
      <footer className="footer">
            <div className="footer-content">
              
              <div className="footer-col">
                <h4>Resources</h4>
                <a href="#">Learning Hub</a>
                <a href="#">Ambassadors</a>
                <a href="#">Scholarship</a>
                <a href="#">Join</a>
                <a href="#">Past Papers</a>
                <a href="#">Solution Banks</a>
                <a href="#">Sitemap</a>
              </div>

              <div className="footer-col">
                <h4>Members</h4>
                <a href="/launchpad">Launchpad</a>
                <a href="#">Account</a>
                <a href="#">Log out</a>
              </div>

              <div className="footer-col">
                <h4>Company</h4>
                <a href="#">About us</a>
                <a href="#">Exam Specificity</a>
                <a href="#">Content Quality</a>
                <a href="#">Promotions</a>
                <a href="#">Jobs</a>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Cookie Policy</a>
                <a href="#">Help and Support</a>
              </div>

              <div className="footer-col">
                <h4>Subjects</h4>
                <a href="#">Biology</a>
                <a href="#">Chemistry</a>
                <a href="#">Physics</a>
                <a href="#">Maths</a>
                <a href="#">Geography</a>
                <a href="#">English Literature</a>
                <a href="#">Psychology</a>
                <a href="#">All Subjects</a>
              </div>

            </div>

            <div className="footer-bottom">
              <p>© 2025 Revision Hub. All rights reserved.</p>
              <div className="socials">
              <a href="#"><i className="fa-brands fa-tiktok"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-facebook"></i></a>
              <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
            </div>

            </div>
          </footer>
        </div>
  );
}