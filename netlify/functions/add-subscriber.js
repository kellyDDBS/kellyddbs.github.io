
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { name, email } = JSON.parse(event.body);
  const API_KEY = process.env.MAILERLITE_API_KEY;
  const GROUP_ID = "161641396708574417";

  try {
    const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        fields: { name },
        status: "active",
        groups: [GROUP_ID]
      }),
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Failed to add subscriber." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Subscriber added successfully." }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error.", error: error.message }),
    };
  }
};
