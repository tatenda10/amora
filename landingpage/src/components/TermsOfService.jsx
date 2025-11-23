import React from 'react'
import Header from './Header'
import Footer from './Footer'

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              TERMS OF SERVICE
            </h1>
            <p className="text-gray-600">
              Last updated November 08, 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-6">
              These Terms of Service ("Terms") govern your access to and use of the Amora AI Companion mobile application and related services (collectively, the "Service") provided by Protadcom Inc ("we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Please read these Terms carefully before using our Service. If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          {/* Table of Contents */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">TABLE OF CONTENTS</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li><a href="#section1" className="text-pink-600 hover:text-pink-700">ACCEPTANCE OF TERMS</a></li>
              <li><a href="#section2" className="text-pink-600 hover:text-pink-700">ELIGIBILITY AND AGE REQUIREMENTS</a></li>
              <li><a href="#section3" className="text-pink-600 hover:text-pink-700">ACCOUNT REGISTRATION AND SECURITY</a></li>
              <li><a href="#section4" className="text-pink-600 hover:text-pink-700">USE OF SERVICE</a></li>
              <li><a href="#section5" className="text-pink-600 hover:text-pink-700">PROHIBITED ACTIVITIES</a></li>
              <li><a href="#section6" className="text-pink-600 hover:text-pink-700">SUBSCRIPTION AND PAYMENT TERMS</a></li>
              <li><a href="#section7" className="text-pink-600 hover:text-pink-700">INTELLECTUAL PROPERTY RIGHTS</a></li>
              <li><a href="#section8" className="text-pink-600 hover:text-pink-700">USER CONTENT</a></li>
              <li><a href="#section9" className="text-pink-600 hover:text-pink-700">AI-GENERATED CONTENT</a></li>
              <li><a href="#section10" className="text-pink-600 hover:text-pink-700">PRIVACY AND DATA PROTECTION</a></li>
              <li><a href="#section11" className="text-pink-600 hover:text-pink-700">TERMINATION</a></li>
              <li><a href="#section12" className="text-pink-600 hover:text-pink-700">DISCLAIMERS</a></li>
              <li><a href="#section13" className="text-pink-600 hover:text-pink-700">LIMITATION OF LIABILITY</a></li>
              <li><a href="#section14" className="text-pink-600 hover:text-pink-700">INDEMNIFICATION</a></li>
              <li><a href="#section15" className="text-pink-600 hover:text-pink-700">GOVERNING LAW AND DISPUTE RESOLUTION</a></li>
              <li><a href="#section16" className="text-pink-600 hover:text-pink-700">CHANGES TO TERMS</a></li>
              <li><a href="#section17" className="text-pink-600 hover:text-pink-700">CONTACT INFORMATION</a></li>
            </ol>
          </section>

          {/* Section 1 */}
          <section id="section1" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">1. ACCEPTANCE OF TERMS</h2>
            <p className="text-gray-700 mb-4">
              By downloading, installing, accessing, or using the Amora AI Companion application, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use the Service.
            </p>
            <p className="text-gray-700">
              These Terms constitute a legally binding agreement between you and Protadcom Inc. We may modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Service after any modification constitutes your acceptance of the modified Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section id="section2" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2. ELIGIBILITY AND AGE REQUIREMENTS</h2>
            <p className="text-gray-700 mb-4">
              <strong>Age Requirement:</strong> You must be at least 18 years of age, or the age of majority in your jurisdiction, whichever is higher, to use the Service. By using the Service, you represent and warrant that you meet this age requirement.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Legal Capacity:</strong> You represent and warrant that you have the legal capacity and authority to enter into these Terms and to use the Service in accordance with all applicable laws and regulations.
            </p>
            <p className="text-gray-700">
              <strong>Prohibited Jurisdictions:</strong> We reserve the right to restrict access to the Service in certain jurisdictions. If you are located in a jurisdiction where the Service is prohibited, you may not use the Service.
            </p>
          </section>

          {/* Section 3 */}
          <section id="section3" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. ACCOUNT REGISTRATION AND SECURITY</h2>
            <p className="text-gray-700 mb-4">
              <strong>Account Creation:</strong> To use certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to share your account credentials with any third party.
            </p>
            <p className="text-gray-700">
              <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account at any time, with or without notice, for any violation of these Terms or for any other reason we deem necessary.
            </p>
          </section>

          {/* Section 4 */}
          <section id="section4" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">4. USE OF SERVICE</h2>
            <p className="text-gray-700 mb-4">
              <strong>License to Use:</strong> Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Permitted Uses:</strong> You may use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Engage in conversations with AI companions</li>
              <li>Create and customize your AI companion experience</li>
              <li>Access features and content available through your subscription tier</li>
              <li>Share content within the Service in accordance with these Terms</li>
            </ul>
            <p className="text-gray-700">
              <strong>Restrictions:</strong> You may not copy, modify, distribute, sell, lease, or create derivative works based on the Service or any part thereof, except as expressly permitted by these Terms.
            </p>
          </section>

          {/* Section 5 */}
          <section id="section5" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. PROHIBITED ACTIVITIES</h2>
            <p className="text-gray-700 mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violating any applicable local, state, national, or international law or regulation</li>
                <li>Transmitting any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                <li>Engaging in any form of child sexual abuse or exploitation, or sharing related content</li>
                <li>Impersonating any person or entity, or falsely stating or misrepresenting your affiliation with any person or entity</li>
                <li>Attempting to gain unauthorized access to the Service, other accounts, computer systems, or networks</li>
                <li>Interfering with or disrupting the Service or servers or networks connected to the Service</li>
                <li>Using the Service to transmit any viruses, worms, defects, Trojan horses, or other items of a destructive nature</li>
                <li>Reverse engineering, decompiling, or disassembling any part of the Service</li>
                <li>Using automated systems (bots, scrapers, etc.) to access the Service without our express written permission</li>
                <li>Collecting or harvesting any information from the Service</li>
                <li>Using the Service for any commercial purpose without our prior written consent</li>
                <li>Circumventing or attempting to circumvent any security measures or access controls</li>
              </ul>
            </div>
            <p className="text-gray-700">
              Violation of any of these prohibitions may result in immediate termination of your account and may subject you to legal action.
            </p>
          </section>

          {/* Section 6 */}
          <section id="section6" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">6. SUBSCRIPTION AND PAYMENT TERMS</h2>
            <p className="text-gray-700 mb-4">
              <strong>Subscription Plans:</strong> The Service offers various subscription plans with different features and pricing. Current subscription plans and pricing are available within the application.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Payment:</strong> By purchasing a subscription, you agree to pay the applicable fees as displayed at the time of purchase. All fees are charged in advance on a recurring basis (monthly or annually, as selected).
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date. You authorize us to charge your payment method for the renewal period.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings or by contacting us. Cancellation will take effect at the end of your current billing period.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Refunds:</strong> Refund policies are governed by the platform through which you purchased the subscription (Apple App Store, Google Play Store, etc.). We do not provide direct refunds.
            </p>
            <p className="text-gray-700">
              <strong>Price Changes:</strong> We reserve the right to modify subscription prices at any time. Price changes will not affect your current subscription period but will apply to subsequent renewal periods.
            </p>
          </section>

          {/* Section 7 */}
          <section id="section7" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">7. INTELLECTUAL PROPERTY RIGHTS</h2>
            <p className="text-gray-700 mb-4">
              <strong>Service Ownership:</strong> The Service, including all content, features, functionality, and technology, is owned by Protadcom Inc and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Our Rights:</strong> We retain all rights, title, and interest in and to the Service, including all intellectual property rights. Nothing in these Terms grants you any right, title, or interest in the Service except the limited license granted above.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Trademarks:</strong> "Amora," "Amora AI Companion," and related logos and marks are trademarks of Protadcom Inc. You may not use our trademarks without our prior written consent.
            </p>
            <p className="text-gray-700">
              <strong>Third-Party Rights:</strong> The Service may contain content, features, or functionality provided by third parties. Such content is subject to the respective third party's terms and conditions.
            </p>
          </section>

          {/* Section 8 */}
          <section id="section8" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8. USER CONTENT</h2>
            <p className="text-gray-700 mb-4">
              <strong>Your Content:</strong> You retain ownership of any content you create, upload, or share through the Service ("User Content"). However, by using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and distribute your User Content solely for the purpose of providing and improving the Service.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Content Standards:</strong> You are solely responsible for your User Content. You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>You own or have the necessary rights to your User Content</li>
              <li>Your User Content does not violate any third-party rights</li>
              <li>Your User Content complies with all applicable laws and these Terms</li>
              <li>Your User Content does not contain any prohibited content as described in Section 5</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Content Moderation:</strong> We reserve the right to review, modify, or remove any User Content that violates these Terms or that we determine, in our sole discretion, is inappropriate, harmful, or objectionable.
            </p>
            <p className="text-gray-700">
              <strong>No Endorsement:</strong> We do not endorse any User Content and are not responsible for the accuracy, completeness, or reliability of any User Content.
            </p>
          </section>

          {/* Section 9 */}
          <section id="section9" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">9. AI-GENERATED CONTENT</h2>
            <p className="text-gray-700 mb-4">
              <strong>AI Technology:</strong> The Service uses artificial intelligence and machine learning technologies to generate responses and content. AI-generated content is created by third-party AI service providers, including OpenAI.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>No Guarantees:</strong> We do not guarantee the accuracy, completeness, or reliability of AI-generated content. AI-generated content is provided "as is" and may contain errors, inaccuracies, or inappropriate content.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Your Use:</strong> You acknowledge that AI-generated content is not created by humans and may not always be appropriate, accurate, or suitable for your intended use. You are responsible for evaluating and using AI-generated content at your own risk.
            </p>
            <p className="text-gray-700">
              <strong>Prohibited Uses:</strong> You may not use AI-generated content for any illegal purpose, to generate harmful content, or to violate any third-party rights. You are solely responsible for how you use AI-generated content.
            </p>
          </section>

          {/* Section 10 */}
          <section id="section10" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">10. PRIVACY AND DATA PROTECTION</h2>
            <p className="text-gray-700 mb-4">
              <strong>Privacy Policy:</strong> Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Data Processing:</strong> We process your personal data in accordance with applicable data protection laws, including GDPR, CCPA, and other relevant regulations.
            </p>
            <p className="text-gray-700">
              <strong>Third-Party Services:</strong> The Service may integrate with third-party services (such as AI providers, payment processors, etc.) that may collect and process your data. Your use of such services is subject to their respective privacy policies.
            </p>
          </section>

          {/* Section 11 */}
          <section id="section11" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">11. TERMINATION</h2>
            <p className="text-gray-700 mb-4">
              <strong>Termination by You:</strong> You may terminate your account at any time by deleting your account through the Service or by contacting us.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Termination by Us:</strong> We may suspend or terminate your account and access to the Service immediately, without prior notice, if you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Violate these Terms or any applicable law</li>
              <li>Engage in fraudulent, abusive, or illegal activity</li>
              <li>Fail to pay any fees when due</li>
              <li>Use the Service in a manner that harms us or other users</li>
              <li>For any other reason we deem necessary to protect the Service or other users</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Effect of Termination:</strong> Upon termination, your right to use the Service will immediately cease. We may delete your account and all associated data, subject to our data retention policies and applicable law.
            </p>
            <p className="text-gray-700">
              <strong>Survival:</strong> Sections of these Terms that by their nature should survive termination will survive, including but not limited to Sections 7 (Intellectual Property), 12 (Disclaimers), 13 (Limitation of Liability), and 14 (Indemnification).
            </p>
          </section>

          {/* Section 12 */}
          <section id="section12" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">12. DISCLAIMERS</h2>
            <p className="text-gray-700 mb-4">
              <strong>Service "As Is":</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>No Guarantees:</strong> We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>The Service will be available, uninterrupted, or error-free</li>
              <li>The Service will meet your requirements or expectations</li>
              <li>Any errors or defects will be corrected</li>
              <li>The Service is free from viruses or other harmful components</li>
              <li>AI-generated content will be accurate, appropriate, or suitable for your use</li>
            </ul>
            <p className="text-gray-700">
              <strong>Third-Party Content:</strong> We are not responsible for any third-party content, services, or websites that may be linked to or accessible through the Service.
            </p>
          </section>

          {/* Section 13 */}
          <section id="section13" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">13. LIMITATION OF LIABILITY</h2>
            <p className="text-gray-700 mb-4">
              <strong>Limitation:</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PROTADCOM INC, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Maximum Liability:</strong> OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE USE OF OR INABILITY TO USE THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
            <p className="text-gray-700">
              <strong>Exceptions:</strong> Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you. In such cases, our liability will be limited to the maximum extent permitted by law.
            </p>
          </section>

          {/* Section 14 */}
          <section id="section14" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">14. INDEMNIFICATION</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify, defend, and hold harmless Protadcom Inc, its affiliates, and their respective officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your use of or access to the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party right, including without limitation any intellectual property right, privacy right, or other right</li>
              <li>Your User Content</li>
              <li>Your use of AI-generated content</li>
            </ul>
          </section>

          {/* Section 15 */}
          <section id="section15" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">15. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
            <p className="text-gray-700 mb-4">
              <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of Zimbabwe, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Dispute Resolution:</strong> Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the Zimbabwe Arbitration Centre, except where prohibited by law.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Class Action Waiver:</strong> You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
            </p>
            <p className="text-gray-700">
              <strong>Jurisdiction:</strong> If arbitration is not available or is prohibited by law, you agree that any legal action or proceeding arising out of or relating to these Terms shall be brought exclusively in the courts of Harare, Zimbabwe.
            </p>
          </section>

          {/* Section 16 */}
          <section id="section16" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">16. CHANGES TO TERMS</h2>
            <p className="text-gray-700 mb-4">
              <strong>Modifications:</strong> We reserve the right to modify these Terms at any time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Posting the updated Terms on our website</li>
              <li>Sending a notification through the Service</li>
              <li>Updating the "Last updated" date at the top of these Terms</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Your Acceptance:</strong> Your continued use of the Service after any modification constitutes your acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Service and may terminate your account.
            </p>
            <p className="text-gray-700">
              <strong>Review:</strong> We encourage you to review these Terms periodically to stay informed of any updates.
            </p>
          </section>

          {/* Section 17 */}
          <section id="section17" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">17. CONTACT INFORMATION</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or complaints about these Terms or the Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Protadcom Inc</strong>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@amoracompanion.site" className="text-pink-600 hover:text-pink-700">support@amoracompanion.site</a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Address:</strong><br />
                6334 southview<br />
                4048 Dzivarasekwa Harare<br />
                Harare, Harare Province 0000<br />
                Zimbabwe
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-12 bg-blue-50 rounded-lg p-6">
            <p className="text-gray-700 font-semibold mb-2">
              By using the Amora AI Companion Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-gray-700">
              If you do not agree to these Terms, please do not use the Service.
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

export default TermsOfService

