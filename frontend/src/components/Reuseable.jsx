import { Button } from 'antd';
import { div, text } from 'framer-motion/client';
import { Link, useNavigate } from 'react-router-dom'






export const Divider = () => (
  <hr className="dark:border-[#2a2a38] border-gray-200 max-w-6xl mx-auto px-6 py-6" />
);

export const Btn  = ({ children, to, type = "button" }) => {
  const navigate = useNavigate()
  return (
    <div className='pt-4'>
    <button 
      type={type} 
      className='w-full sm:w-auto bg-primary border-2 border-primary text-secondary px-10 py-3 rounded-xl font-bold text-lg shadow-lg shadow-secondary hover:bg-black hover:border-primary hover:border-2 hover:text-primary transition-all transform'
      onClick={()=>navigate(`${to}`)} 
    >
      {children}
    </button>
    </div>
  );
};
