function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ==========================================
    // CONTACT / INQUIRY FORM
    // ==========================================
    if (url.pathname === "/send-inquiry" && request.method === "POST") {
      try {
        const formData = await request.formData();

        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const model = String(formData.get("model") || "").trim();
        const message = String(formData.get("message") || "").trim();

        // Required fields
        if (!name || !email) {
          return jsonResponse(
            {
              success: false,
              message: "Please enter your name and email address."
            },
            400
          );
        }

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
          return jsonResponse(
            {
              success: false,
              message: "Please enter a valid email address."
            },
            400
          );
        }

        // Make sure the API key exists
        if (!env.RESEND_API_KEY) {
          return jsonResponse(
            {
              success: false,
              message: "Email service is not configured."
            },
            500
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
              from: "Asia Crown Corporation <website@asiacrowncorporation.com>",
              to: ["info@asiacrowncorporation.com"],
              reply_to: email,
              subject: `New Website Inquiry - ${name}`,

              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>New Website Inquiry</h2>

                  <p>
                    <strong>Name:</strong><br>
                    ${escapeHtml(name)}
                  </p>

                  <p>
                    <strong>Email:</strong><br>
                    ${escapeHtml(email)}
                  </p>

                  <p>
                    <strong>Phone:</strong><br>
                    ${escapeHtml(phone || "Not provided")}
                  </p>

                  <p>
                    <strong>Property / Model:</strong><br>
                    ${escapeHtml(model || "Not specified")}
                  </p>

                  <hr>

                  <p>
                    <strong>Message:</strong>
                  </p>

                  <p>
                    ${escapeHtml(message || "No message provided").replace(/\n/g, "<br>")}
                  </p>

                  <hr>

                  <p style="font-size: 12px; color: #777;">
                    This inquiry was submitted through the
                    Asia Crown Corporation website.
                  </p>
                </div>
              `,

              text: `
New Website Inquiry

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Property / Model: ${model || "Not specified"}

Message:
${message || "No message provided"}
              `
            })
          }
        );

        const result = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error("Resend error:", result);

          return jsonResponse(
            {
              success: false,
              message: "We could not send your inquiry. Please try again later."
            },
            500
          );
        }

        return jsonResponse({
          success: true,
          message: "Inquiry sent successfully."
        });
      } catch (error) {
        console.error("Inquiry error:", error);

        return jsonResponse(
          {
            success: false,
            message: "There was a problem sending your inquiry."
          },
          500
        );
      }
    }

    // ==========================================
    // SERVE THE WEBSITE
    // ==========================================
    return env.ASSETS.fetch(request);
  }
};
