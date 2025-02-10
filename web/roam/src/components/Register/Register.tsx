import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import "../../styles/common.css";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  dob: yup.string().required("Date of birth is required"),
});

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log("Form Data:", data);
    alert("Registration successful!");
  };

  return (
    <div className="background">
      {/* Left image container */}
      <div className="overlay-image"></div>

      {/* Right container for registration form */}
      <div className="container">
        <div>
          <h2 className="title">Create New Account</h2>
          <form className="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Link to navigate back to Login page */}
            <div className="nav-links">
              <p>Already registered?
              <Link to="/login" className="link"> Login </Link></p>
            </div>

            <div className="form-group">
              <label htmlFor="name">NAME</label>
              <input id="name" {...register("name")} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
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

            <div className="form-group"> 
              <label htmlFor="dob">DATE OF BIRTH</label>
              <input id="dob" type="date" {...register("dob")} />
              {errors.dob && <p className="error-text">{errors.dob.message}</p>}
            </div>

            <button type="submit" className="submit-button">SIGN UP</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
