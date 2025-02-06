import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./Register.css";

// Define the form data type
type FormData = {
  name: string;
  dob: Date;
  email: string;
  password: string;
};

// Define the validation schema using Yup
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  dob: yup
    .date()
    .required("Date of Birth is required")
    .typeError("Invalid date"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
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
    alert("Registration successful!");
  };

  return (
    <div className="registration-container">
      <h2 className="registration-title">User Registration</h2>
      <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
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
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input id="dob" type="date" {...register("dob")} />
          {errors.dob && <p className="error-text">{errors.dob.message}</p>}
        </div>

        <button type="submit" className="submit-button">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
