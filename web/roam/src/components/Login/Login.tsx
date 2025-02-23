import React from "react";
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

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log("Form Data:", data);
    alert("Login successful!");
  };

  return (
    <div className="background">
      <div className="overlay-image"></div>
      <div className="container">
        <h2 className="title">Login</h2>
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
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
            <input id="password" type="password" {...register("password")} />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" className="submit-button">SIGN IN</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
