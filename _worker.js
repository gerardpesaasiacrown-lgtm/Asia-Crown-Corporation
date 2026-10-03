export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle inquiry form
    if (url.pathname === "/send-inquiry" && request.method === "POST") {
      try {
        const formData = await request.formData();

        const name = formData.get("name") || "";
        const email = formData.get("email") || "";
        const phone = formData.get("phone") || "";
        const message = formData.get("message") || "";
        const project = formData.get("project") || "";
        const property = formData.get("property") || "";

        if (!name || !email || !message) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Please complete the required fields."
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        const emailResponse = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Asia Crown Website <onboarding@resend.dev>",
              to: ["info@asiacrowncorporation.com"],
              reply_to: email,
              subject: `New Website Inquiry - ${name}`,
              html: `
                <h2>New Website Inquiry</h2>

                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Project:</strong> ${project}</p>
                <p><strong>Property:</strong> ${property}</p>

                <h3>Message</h3>
                <p>${message}</p>
              `
            })
          }
        );

        const result = await emailResponse.json();

        if (!emailResponse.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Email could not be sent.",
              error: result
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Inquiry sent successfully."
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Server error.",
            error: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    // Serve the website
    return env.ASSETS.fetch(request);
  }
};
