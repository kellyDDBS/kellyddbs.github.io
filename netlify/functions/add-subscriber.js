const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    // If no body or wrong method
    if (event.httpMethod !== "POST" || !event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request" }),
      };
    }

    let data;
    try {
      data = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Bad JSON format" }),
      };
    }

    const { name, email } = data;

    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Name and email are required" }),
      };
    }

    const API_KEY = process.env.MAILERLITE_API_KEY;
    const GROUP_ID = "161641396708574417";

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
        groups: [GROUP_ID],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorText }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Subscriber added successfully" }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
