
export default function TermsPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg mx-auto">
          <h1>Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Nuvi! These Terms of Service ("Terms") govern your use of our website, products, and services (collectively, the "Services"). By using our Services, you agree to these Terms.
          </p>

          <h2>2. Your Account</h2>
          <p>
            To use most of our Services, you must register for an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
          </p>

          <h2>3. Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
          </p>

          <h2>4. Prohibited Uses</h2>
          <p>
            You may use the Service only for lawful purposes. You may not use the Service:
          </p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
          </ul>

          <h2>5. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@nuvi.com.
          </p>
        </div>
      </div>
    </div>
  );
}
