const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
