
export default function PrivacyPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg mx-auto">
          <h1>Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Introduction</h2>
          <p>
            Nuvi ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We may collect personal information from you in a variety of ways, including, but not limited to, when you visit our site, register on the site, place an order, and in connection with other activities, services, features or resources we make available.
          </p>
          <p>
            Information we may collect includes:
          </p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, mailing address, phone number, and credit card information.</li>
            <li><strong>Derivative Data:</strong> IP address, browser type, operating system, access times, and pages viewed directly before and after accessing the site.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use the information we collect in order to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process your transactions and send you related information, including purchase confirmations and invoices.</li>
            <li>Improve our website and services.</li>
            <li>Communicate with you about products, services, offers, promotions, and events.</li>
          </ul>

          <h2>4. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>
          <ul>
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, and customer service.</li>
          </ul>

          <h2>5. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@nuvi.com.
          </p>
        </div>
      </div>
    </div>
  );
}
