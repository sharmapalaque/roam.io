import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom"; // Import Link for navigation
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
    <div className="container">
      <h2 className="title">User Registration</h2>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>

         {/* Link to navigate back to Login page */}
        <div className="nav-links">
          <p>Already have an account?</p>
          <Link to="/login" className="link">Login Here</Link>
        </div>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" {...register("name")} />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input id="dob" type="date" {...register("dob")} />
          {errors.dob && <p className="error-text">{errors.dob.message}</p>}
        </div>

        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
  );
};

export default Register;
