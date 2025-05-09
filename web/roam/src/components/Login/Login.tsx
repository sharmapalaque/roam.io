import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../../styles/common.css"; 

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<any> = async (data) => {
    // try REST API call 
    try {
      const response = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send form data
        credentials: 'include',
      });

      const result = await response.json() // response is in json format

      // Check if the response is successful or has an error
      if (response.ok) {
        window.location.href = "/accommodation";
      } else {
        alert(`Error: ${result.message}`); // Error alert
      }
    } catch (error) {
      // Handle netowork errors
      alert('There was an error with the request');
      console.log(error)
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="background">
      <div className="overlay-image"></div>
      <div className="container">
        <h2 className="title">Login</h2>
        <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="nav-links">
            <p>Don't have an account? 
            <Link to="/register" className="link"> Register Here</Link></p>
          </div>

          <div className="form-group">
            <label htmlFor="email">EMAIL</label>
            <input id="email" type="email" {...register("email")} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <div className="password-field">
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                {...register("password")} 
              />
              <button 
                type="button"
                className="toggle-password-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`password-icon ${showPassword ? "visible" : "hidden"}`}></i>
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" className="submit-button">SIGN IN</button>
        </form>
      </div>
    </div>
  );
};

export default Login;