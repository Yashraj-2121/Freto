import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function LegalPage({ type }) {
  const params = useParams();
  const activeType = type || params.policyType;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeType]);

  const policies = {
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "October 2026",
      content: (
        <div className="space-y-6">
          <p>
            Welcome to FRETO ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when registering on the platform, expressing an interest in obtaining information about us or our products and services, or otherwise contacting us.
            The personal information we collect includes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>Names, phone numbers, and email addresses.</li>
            <li>Company details, including registered business names and addresses.</li>
            <li>Location data (GPS coordinates) exclusively for active Trips/Shipments, required to facilitate real-time tracking.</li>
          </ul>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect or receive to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>Facilitate account creation and authentication.</li>
            <li>Manage user accounts and provide the FRETO marketplace service (matching shippers with transporters).</li>
            <li>Provide real-time tracking for shipments.</li>
            <li>Improve our services through aggregated, anonymized usage data.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process, including enterprise-grade encryption for authentication and Row Level Security for data isolation.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have questions or comments about this policy, you may email us at support@freto.com or by post to:<br/><br/>
            FRETO Logistics Private Limited<br/>
            123 Freight Avenue, Transport Hub<br/>
            Mumbai, Maharashtra 400001, India
          </p>
        </div>
      )
    },
    terms: {
      title: "Terms & Conditions",
      lastUpdated: "October 2026",
      content: (
        <div className="space-y-6">
          <p>
            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and FRETO ("we," "us" or "our"), concerning your access to and use of the FRETO website.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Our Role</h2>
          <p>
            FRETO acts exclusively as a marketplace connecting Shippers, Transporters, and Drivers. We are <strong>not</strong> a transportation or logistics provider. We do not own trucks, nor do we employ drivers. Any contract for the provision of transport services is directly between the Shipper and the Transporter/Driver.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. User Accounts</h2>
          <p>
            You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine it is inappropriate or objectionable.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Bidding and Booking</h2>
          <p>
            Bids placed on loads are legally binding offers. Once a Shipper accepts a Transporter's bid, a binding contract is formed between those two parties. FRETO is not liable for defaults, delays, or damages arising from this contract.
          </p>
        </div>
      )
    },
    cookies: {
      title: "Cookie Policy",
      lastUpdated: "October 2026",
      content: (
        <div className="space-y-6">
          <p>
            This Cookie Policy explains how FRETO uses cookies and similar technologies to recognize you when you visit our website.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. We use primarily essential/strictly necessary cookies.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Types of Local Storage We Use</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li><strong>Authentication Tokens (Local Storage):</strong> We store encrypted JSON Web Tokens (JWT) to keep you logged in between sessions securely.</li>
            <li><strong>Consent State:</strong> We store a small flag to remember if you have dismissed our cookie banner.</li>
          </ul>
          <p>
            We currently do not use third-party tracking, advertising, or invasive analytics cookies.
          </p>
        </div>
      )
    },
    refunds: {
      title: "Refund & Cancellation Policy",
      lastUpdated: "October 2026",
      content: (
        <div className="space-y-6">
          <p>
            As a marketplace platform, FRETO facilitates connections but does not process direct payments for the physical transport of goods. 
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Cancellations</h2>
          <p>
            Shippers may cancel a booking up to 24 hours before the scheduled dispatch time without penalty on the platform. Transporters cancelling accepted loads frequently may be penalized via a temporary account suspension or reputation score deduction.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Refunds</h2>
          <p>
            Any advance payments or deposits made directly between a Shipper and Transporter must be handled off-platform according to their mutual agreement. FRETO does not hold escrow funds and is not responsible for issuing refunds for transport services.
          </p>
        </div>
      )
    }
  };

  const currentPolicy = policies[activeType];

  if (!currentPolicy) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <h1 className="text-2xl font-bold text-white">Policy Not Found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="card p-8 md:p-12 border-slate-800">
        <div className="mb-12 border-b border-slate-800 pb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            {currentPolicy.title}
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: {currentPolicy.lastUpdated}
          </p>
        </div>
        
        <div className="prose prose-invert prose-orange max-w-none text-slate-300 leading-relaxed">
          {currentPolicy.content}
        </div>
      </div>
    </div>
  );
}
