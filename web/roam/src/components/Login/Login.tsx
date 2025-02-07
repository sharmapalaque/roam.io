import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./Login.css";

// Define the form data type
type FormData = {
  email: string;
  password: string;
};

// Define the validation schema using Yup
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required"),
});

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Data:", data);
    alert("Login successful!");
  };

  return (
    <div className="login-container">
      <h2 className="login-title">User Login</h2>
      <form className="login-form" onSubmit={handleSubmit(onSubmit)}>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className="submit-button">
          LOGIN
        </button>
      </form>
    </div>
  );
};

export default Register;
