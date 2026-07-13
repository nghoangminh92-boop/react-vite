import './footer.css';

const Footer = () => {
  return (
    <div className="footer">
      <p>© {new Date().getFullYear()} VN Team — Food Review</p>
    </div>
  );
};

export default Footer;