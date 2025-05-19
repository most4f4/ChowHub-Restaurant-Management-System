// src/pages/create-restaurant.js

import { useRouter } from "next/router";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

// This page allows a manager to create a new restaurant and their own manager account
const CreateRestaurant = () => {
  const router = useRouter();

  // Holds warning messages to display if something goes wrong (e.g., duplicate email)
  const [warning, setWarning] = useState("");

  // State for form fields (restaurant and manager info)
  const [formData, setFormData] = useState({
    restaurantName: "",
    restaurantUserName: "",
    firstName: "",
    lastName: "",
    email: "",
    emergencyContact: "",
    username: "",
    password: "",
  });

  // Update formData state as the user types in input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("form submitted");
    try {
      // Send POST request to backend to register manager and restaurant
      const response = await apiFetch("/auth/register-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log(response.message); // Log success message
      router.push("/"); // Redirect to homepage or login after success
    } catch (err) {
      // If the API call fails, show the error message
      setWarning(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="restaurantName" placeholder="Restaurant Name" onChange={handleChange} />
        <input
          name="restaurantUserName"
          placeholder="Restaurant User Name"
          onChange={handleChange}
        />
        <input name="firstName" placeholder="First Name" onChange={handleChange} />
        <input name="lastName" placeholder="Last Name" onChange={handleChange} />
        <input name="email" placeholder="Manager Email" type="email" onChange={handleChange} />
        <input name="username" placeholder="Username" onChange={handleChange} />
        <input name="emergencyContact" placeholder="Emergency Contact" onChange={handleChange} />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} />

        {warning && <p style={{ color: "red" }}>{warning}</p>}

        <button type="submit">Create Restaurant</button>
      </form>
    </div>
  );
};

export default CreateRestaurant;
