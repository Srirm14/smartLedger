import PropTypes from 'prop-types';

const HeaderComponent = ({ title, subtitle }) => (
  <div className=" rounded-md flex flex-col items-start">
    <div className="font-poppins font-medium text-md flex-grow">{title}</div>
    <div className="font-poppins font-small text-xs text-slate-600  pt-1">{subtitle}</div>
  </div>
);

HeaderComponent.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default HeaderComponent;