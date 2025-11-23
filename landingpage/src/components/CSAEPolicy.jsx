import React from 'react'
import Header from './Header'
import Footer from './Footer'

const CSAEPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Standards Against Child Sexual Abuse and Exploitation
            </h1>
            <p className="text-gray-600">
              Last updated November 08, 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-6">
              At Protadcom Inc, operating the Amora AI Companion application, we are committed to protecting children and preventing child sexual abuse and exploitation (CSAE) in all forms. We have zero tolerance for any content, behavior, or activity that exploits, harms, or endangers children.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This document outlines our comprehensive standards, policies, and procedures designed to prevent, detect, and respond to child sexual abuse and exploitation on our platform.
            </p>
          </section>

          {/* Our Commitment */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-gray-700 mb-4">
              We are dedicated to creating a safe environment for all users, with special emphasis on protecting minors. Our commitment includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Zero tolerance for any form of child sexual abuse material (CSAM) or exploitation</li>
              <li>Proactive detection and removal of harmful content</li>
              <li>Immediate reporting to law enforcement and relevant authorities</li>
              <li>Regular training and education for our team</li>
              <li>Transparent policies and procedures</li>
              <li>Cooperation with law enforcement and child protection organizations</li>
            </ul>
          </section>

          {/* Age Verification and Restrictions */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Age Verification and Restrictions</h2>
            <p className="text-gray-700 mb-4">
              <strong>Minimum Age Requirement:</strong> Amora AI Companion is strictly limited to users who are 18 years of age or older, or the age of majority in their jurisdiction, whichever is higher.
            </p>
            <p className="text-gray-700 mb-4">
              We implement the following measures to enforce age restrictions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Age verification during account registration</li>
              <li>Terms of Service requiring users to confirm they are of legal age</li>
              <li>Regular monitoring and review of user accounts</li>
              <li>Immediate account suspension or termination for users found to be underage</li>
            </ul>
          </section>

          {/* Prohibited Content and Behavior */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Prohibited Content and Behavior</h2>
            <p className="text-gray-700 mb-4">
              The following content and behaviors are strictly prohibited on our platform:
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Any content depicting, describing, or promoting child sexual abuse or exploitation</li>
                <li>Child sexual abuse material (CSAM) in any form</li>
                <li>Grooming behaviors or attempts to exploit minors</li>
                <li>Sharing, soliciting, or distributing content that sexualizes minors</li>
                <li>Any communication or interaction designed to exploit or harm children</li>
                <li>Impersonation of minors for exploitative purposes</li>
                <li>Any attempt to circumvent age verification or restrictions</li>
              </ul>
            </div>
            <p className="text-gray-700">
              Violation of these prohibitions will result in immediate account termination, reporting to law enforcement, and cooperation with criminal investigations.
            </p>
          </section>

          {/* Detection and Monitoring */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Detection and Monitoring</h2>
            <p className="text-gray-700 mb-4">
              We employ multiple layers of detection and monitoring to identify and prevent CSAE:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Automated Content Scanning:</strong> Advanced AI and machine learning systems scan all user-generated content for potential CSAE indicators</li>
              <li><strong>Human Review:</strong> Trained content moderation teams review flagged content and user reports</li>
              <li><strong>User Reporting:</strong> Easy-to-use reporting mechanisms for users to report suspicious activity</li>
              <li><strong>Keyword and Pattern Detection:</strong> Monitoring for known indicators of grooming or exploitation</li>
              <li><strong>Behavioral Analysis:</strong> Identifying patterns of behavior that may indicate harmful intent</li>
              <li><strong>Regular Audits:</strong> Periodic reviews of our systems and policies to ensure effectiveness</li>
            </ul>
          </section>

          {/* Reporting Procedures */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Reporting Procedures</h2>
            <p className="text-gray-700 mb-4">
              If you encounter any content or behavior that may constitute child sexual abuse or exploitation, please report it immediately:
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">How to Report:</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li><strong>In-App Reporting:</strong> Use the report feature within the Amora application</li>
                <li><strong>Email:</strong> Send a detailed report to <a href="mailto:csae@amoracompanion.site" className="text-pink-600 hover:text-pink-700">csae@amoracompanion.site</a></li>
                <li><strong>Emergency Situations:</strong> Contact local law enforcement immediately if you believe a child is in immediate danger</li>
              </ol>
            </div>
            <p className="text-gray-700 mb-4">
              All reports are taken seriously and investigated promptly. We maintain strict confidentiality while ensuring appropriate action is taken.
            </p>
          </section>

          {/* Law Enforcement Cooperation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Law Enforcement Cooperation</h2>
            <p className="text-gray-700 mb-4">
              We are committed to full cooperation with law enforcement agencies and child protection organizations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Immediate reporting of suspected CSAE to relevant authorities, including the National Center for Missing & Exploited Children (NCMEC) and local law enforcement</li>
              <li>Preservation of evidence and user data as required by law</li>
              <li>Providing information and assistance to support criminal investigations</li>
              <li>Compliance with all legal requirements and court orders</li>
              <li>Participation in industry-wide efforts to combat CSAE</li>
            </ul>
            <div className="bg-gray-50 rounded-lg p-6 mt-4">
              <p className="text-gray-700">
                <strong>Law Enforcement Contact:</strong> For official law enforcement inquiries, please contact us at{' '}
                <a href="mailto:lawenforcement@amoracompanion.site" className="text-pink-600 hover:text-pink-700">lawenforcement@amoracompanion.site</a>
              </p>
            </div>
          </section>

          {/* Technology and Tools */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Technology and Tools</h2>
            <p className="text-gray-700 mb-4">
              We utilize industry-leading technology and tools to combat CSAE:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>PhotoDNA and similar hash-matching technologies to identify known CSAM</li>
              <li>AI-powered content moderation systems</li>
              <li>Natural language processing to detect grooming language and patterns</li>
              <li>Integration with NCMEC's reporting systems</li>
              <li>Regular updates to our detection systems as new threats emerge</li>
            </ul>
          </section>

          {/* Training and Education */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Training and Education</h2>
            <p className="text-gray-700 mb-4">
              All team members involved in content moderation, user support, or platform management receive comprehensive training on:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Recognizing signs of child sexual abuse and exploitation</li>
              <li>Proper reporting procedures and legal requirements</li>
              <li>Trauma-informed approaches to handling sensitive content</li>
              <li>Latest trends and tactics used by offenders</li>
              <li>Regular updates on policy changes and best practices</li>
            </ul>
          </section>

          {/* User Education */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">User Education</h2>
            <p className="text-gray-700 mb-4">
              We provide educational resources to help users understand:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>How to recognize and report suspicious behavior</li>
              <li>The importance of protecting children online</li>
              <li>Our zero-tolerance policy for CSAE</li>
              <li>Resources for parents and guardians</li>
              <li>Support resources for survivors</li>
            </ul>
          </section>

          {/* Compliance and Audits */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compliance and Audits</h2>
            <p className="text-gray-700 mb-4">
              We maintain compliance with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>All applicable local, national, and international laws regarding child protection</li>
              <li>Industry standards and best practices</li>
              <li>Platform-specific requirements (Google Play, Apple App Store, etc.)</li>
              <li>Regular third-party audits of our CSAE prevention measures</li>
            </ul>
          </section>

          {/* Support Resources */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Support Resources</h2>
            <p className="text-gray-700 mb-4">
              If you or someone you know has been affected by child sexual abuse or exploitation, please seek help:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div>
                <strong className="text-gray-900">National Center for Missing & Exploited Children (NCMEC):</strong>
                <p className="text-gray-700">1-800-THE-LOST (1-800-843-5678)</p>
                <p className="text-gray-700"><a href="https://www.missingkids.org" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">www.missingkids.org</a></p>
              </div>
              <div>
                <strong className="text-gray-900">Childhelp National Child Abuse Hotline:</strong>
                <p className="text-gray-700">1-800-4-A-CHILD (1-800-422-4453)</p>
                <p className="text-gray-700"><a href="https://www.childhelp.org" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">www.childhelp.org</a></p>
              </div>
              <div>
                <strong className="text-gray-900">RAINN (Rape, Abuse & Incest National Network):</strong>
                <p className="text-gray-700">1-800-656-HOPE (1-800-656-4673)</p>
                <p className="text-gray-700"><a href="https://www.rainn.org" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">www.rainn.org</a></p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions, concerns, or to report potential CSAE, please contact:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Protadcom Inc</strong><br />
                CSAE Prevention Team
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:csae@amoracompanion.site" className="text-pink-600 hover:text-pink-700">csae@amoracompanion.site</a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Law Enforcement:</strong>{' '}
                <a href="mailto:lawenforcement@amoracompanion.site" className="text-pink-600 hover:text-pink-700">lawenforcement@amoracompanion.site</a>
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong><br />
                6334 southview<br />
                4048 Dzivarasekwa Harare<br />
                Harare, Harare Province 0000<br />
                Zimbabwe
              </p>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-700">
              This policy is reviewed and updated regularly to ensure it remains effective and compliant with evolving laws and best practices. We will notify users of any material changes to this policy.
            </p>
          </section>

          {/* Back to top */}
          <div className="text-center mt-12">
            <a href="#" className="text-pink-600 hover:text-pink-700 font-semibold">
              Back to Top ↑
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default CSAEPolicy

