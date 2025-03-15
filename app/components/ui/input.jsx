import React from "react";

const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#37404A] focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
        disabled ? "bg-gray-100 cursor-not-allowed opacity-75" : ""
      } ${className}`}
      {...props}
    />
  );
};

export default Input;
