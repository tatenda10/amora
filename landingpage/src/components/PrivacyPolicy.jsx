import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            PRIVACY POLICY
          </h1>
          <p className="text-gray-600">
            Last updated November 08, 2025
          </p>
        </div>

        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 leading-relaxed">
            This Privacy Notice for Protadcom Inc ('we', 'us', or 'our'), describes how and why we might access, collect, store, use, and/or share ('process') your personal information when you use our services ('Services'), including when you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Download and use our mobile application (Amora - AI Companion), or any other application of ours that links to this Privacy Notice</li>
            <li>Use Amora - AI Companion. AI Companion & Chat - Personalized AI friends with memory and emotional intelligence</li>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at{' '}
            <a href="mailto:tatendamuzenda740@gmail.com" className="text-pink-600 hover:text-pink-700">
              tatendamuzenda740@gmail.com
            </a>.
          </p>
        </div>

        {/* Summary */}
        <section className="mb-12 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            SUMMARY OF KEY POINTS
          </h2>
          <p className="text-gray-700 mb-6">
            This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What personal information do we process?</h3>
              <p className="text-gray-700">
                When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about personal information you disclose to us.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do we process any sensitive personal information?</h3>
              <p className="text-gray-700">
                Some of the information may be considered 'special' or 'sensitive' in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do we collect any information from third parties?</h3>
              <p className="text-gray-700">
                We do not collect any information from third parties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do we process your information?</h3>
              <p className="text-gray-700">
                We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about how we process your information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">In what situations and with which parties do we share personal information?</h3>
              <p className="text-gray-700">
                We may share information in specific situations and with specific third parties. Learn more about when and with whom we share your personal information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do we keep your information safe?</h3>
              <p className="text-gray-700">
                We have adequate organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about how we keep your information safe.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are your rights?</h3>
              <p className="text-gray-700">
                Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about your privacy rights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do you exercise your rights?</h3>
              <p className="text-gray-700">
                The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
              </p>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">TABLE OF CONTENTS</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
            <li><a href="#section1" className="text-pink-600 hover:text-pink-700">WHAT INFORMATION DO WE COLLECT?</a></li>
            <li><a href="#section2" className="text-pink-600 hover:text-pink-700">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
            <li><a href="#section3" className="text-pink-600 hover:text-pink-700">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#section4" className="text-pink-600 hover:text-pink-700">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#section5" className="text-pink-600 hover:text-pink-700">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
            <li><a href="#section6" className="text-pink-600 hover:text-pink-700">DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</a></li>
            <li><a href="#section7" className="text-pink-600 hover:text-pink-700">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
            <li><a href="#section8" className="text-pink-600 hover:text-pink-700">HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
            <li><a href="#section9" className="text-pink-600 hover:text-pink-700">DO WE COLLECT INFORMATION FROM MINORS?</a></li>
            <li><a href="#section10" className="text-pink-600 hover:text-pink-700">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
            <li><a href="#section11" className="text-pink-600 hover:text-pink-700">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
            <li><a href="#section12" className="text-pink-600 hover:text-pink-700">DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
            <li><a href="#section13" className="text-pink-600 hover:text-pink-700">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
            <li><a href="#section14" className="text-pink-600 hover:text-pink-700">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
            <li><a href="#section15" className="text-pink-600 hover:text-pink-700">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
          </ol>
        </section>

        {/* Section 1 */}
        <section id="section1" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Personal information you disclose to us</h3>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We collect personal information that you provide to us.</p>
          <p className="text-gray-700 mb-4">
            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>names</li>
            <li>email addresses</li>
            <li>usernames</li>
            <li>passwords</li>
            <li>debit/credit card numbers</li>
            <li>billing addresses</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>Sensitive Information.</strong> We do not process sensitive information.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Application Data.</strong> If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li><strong>Geolocation Information.</strong> We may request access or permission to track location-based information from your mobile device, either continuously or while you are using our mobile application(s), to provide certain location-based services. If you wish to change our access or permissions, you may do so in your device's settings.</li>
            <li><strong>Mobile Device Data.</strong> We automatically collect device information (such as your mobile device ID, model, and manufacturer), operating system, version information and system configuration information, device and application identification numbers, browser type and version, hardware model Internet service provider and/or mobile carrier, and Internet Protocol (IP) address (or proxy server). If you are using our application(s), we may also collect information about the phone network associated with your mobile device, your mobile device's operating system or platform, the type of mobile device you use, your mobile device's unique device ID, and information about the features of our application(s) you accessed.</li>
            <li><strong>Push Notifications.</strong> We may request to send you push notifications regarding your account or certain features of the application(s). If you wish to opt out from receiving these types of communications, you may turn them off in your device's settings.</li>
          </ul>
          <p className="text-gray-700 mb-4">
            This information is primarily needed to maintain the security and operation of our application(s), for troubleshooting, and for our internal analytics and reporting purposes.
          </p>
          <p className="text-gray-700 mb-4">
            All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Information automatically collected</h3>
          <p className="text-gray-700 mb-4 font-semibold">In Short: Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</p>
          <p className="text-gray-700 mb-4">
            We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.
          </p>
          <p className="text-gray-700 mb-4">The information we collect includes:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li><strong>Log and Usage Data.</strong> Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type, and settings and information about your activity in the Services (such as the date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called 'crash dumps'), and hardware settings).</li>
            <li><strong>Device Data.</strong> We collect device data such as information about your computer, phone, tablet, or other device you use to access the Services. Depending on the device used, this device data may include information such as your IP address (or proxy server), device and application identification numbers, location, browser type, hardware model, Internet service provider and/or mobile carrier, operating system, and system configuration information.</li>
            <li><strong>Location Data.</strong> We collect location data such as information about your device's location, which can be either precise or imprecise. How much information we collect depends on the type and settings of the device you use to access the Services. For example, we may use GPS and other technologies to collect geolocation data that tells us your current location (based on your IP address). You can opt out of allowing us to collect this information either by refusing access to the information or by disabling your Location setting on your device. However, if you choose to opt out, you may not be able to use certain aspects of the Services.</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>Google API</strong>
          </p>
          <p className="text-gray-700">
            Our use of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements.
          </p>
        </section>

        {/* Section 2 */}
        <section id="section2" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We process the personal information for the following purposes listed below. We may also process your information for other purposes only with your prior explicit consent.</p>
          <p className="text-gray-700 mb-4">
            We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>To facilitate account creation and authentication and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.</li>
            <li>To deliver and facilitate delivery of services to the user. We may process your information to provide you with the requested service.</li>
            <li>To save or protect an individual's vital interest. We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="section3" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e. legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfil our contractual obligations, to protect your rights, or to fulfil our legitimate business interests.</p>
          <p className="text-gray-700 mb-4">
            If you are located in the EU or UK, this section applies to you.
          </p>
          <p className="text-gray-700 mb-4">
            The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li><strong>Consent.</strong> We may process your information if you have given us permission (i.e. consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about withdrawing your consent.</li>
            <li><strong>Performance of a Contract.</strong> We may process your personal information when we believe it is necessary to fulfil our contractual obligations to you, including providing our Services or at your request prior to entering into a contract with you.</li>
            <li><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.</li>
            <li><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</li>
          </ul>
          <p className="text-gray-700 mb-4">
            If you are located in Canada, this section applies to you.
          </p>
          <p className="text-gray-700">
            We may process your information if you have given us specific permission (i.e. express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e. implied consent). You can withdraw your consent at any time.
          </p>
        </section>

        {/* Section 4 */}
        <section id="section4" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We may share information in specific situations described in this section and/or with the following third parties.</p>
          <p className="text-gray-700 mb-4">We may need to share your personal information in the following situations:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            <li><strong>Offer Wall.</strong> Our application(s) may display a third-party hosted 'offer wall'. Such an offer wall allows third-party advertisers to offer virtual currency, gifts, or other items to users in return for the acceptance and completion of an advertisement offer. Such an offer wall may appear in our application(s) and be displayed to you based on certain data, such as your geographic area or demographic information. When you click on an offer wall, you will be brought to an external website belonging to other persons and will leave our application(s). A unique identifier, such as your user ID, will be shared with the offer wall provider in order to prevent fraud and properly credit your account with the relevant reward.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="section5" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We may use cookies and other tracking technologies to collect and store your information.</p>
          <p className="text-gray-700 mb-4">
            We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
          </p>
          <p className="text-gray-700 mb-4">
            We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.
          </p>
          <p className="text-gray-700 mb-4">
            To the extent these online tracking technologies are deemed to be a 'sale'/'sharing' (which includes targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described below under section 'DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?'
          </p>
          <p className="text-gray-700 mb-4">
            Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Google Analytics</strong>
          </p>
          <p className="text-gray-700">
            We may share your information with Google Analytics to track and analyse the use of the Services. The Google Analytics Advertising Features that we may use include: Google Analytics Demographics and Interests Reporting. To opt out of being tracked by Google Analytics across the Services, visit{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
              https://tools.google.com/dlpage/gaoptout
            </a>. You can opt out of Google Analytics Advertising Features through Ads Settings and Ad Settings for mobile apps. Other opt out means include{' '}
            <a href="http://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
              http://optout.networkadvertising.org/
            </a> and{' '}
            <a href="http://www.networkadvertising.org/mobile-choice" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
              http://www.networkadvertising.org/mobile-choice
            </a>. For more information on the privacy practices of Google, please visit the{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
              Google Privacy & Terms page
            </a>.
          </p>
        </section>

        {/* Section 6 */}
        <section id="section6" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</p>
          <p className="text-gray-700 mb-4">
            As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, 'AI Products'). These tools are designed to enhance your experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of the AI Products within our Services.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Use of AI Technologies</strong>
          </p>
          <p className="text-gray-700 mb-4">
            We provide the AI Products through third-party service providers ('AI Service Providers'), including OpenAI. As outlined in this Privacy Notice, your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products for purposes outlined in 'WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?' You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Our AI Products</strong>
          </p>
          <p className="text-gray-700 mb-4">Our AI Products are designed for the following functions:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>Text analysis</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>How We Process Your Data Using AI</strong>
          </p>
          <p className="text-gray-700">
            All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties. This ensures high security and safeguards your personal information throughout the process, giving you peace of mind about your data's safety.
          </p>
        </section>

        {/* Section 7 */}
        <section id="section7" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We keep your information for as long as necessary to fulfil the purposes outlined in this Privacy Notice unless otherwise required by law.</p>
          <p className="text-gray-700 mb-4">
            We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.
          </p>
          <p className="text-gray-700">
            When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
          </p>
        </section>

        {/* Section 8 */}
        <section id="section8" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We aim to protect your personal information through a system of organisational and technical security measures.</p>
          <p className="text-gray-700 mb-4">
            We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
          </p>
        </section>

        {/* Section 9 */}
        <section id="section9" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">9. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: We do not knowingly collect data from or market to children under 18 years of age or the equivalent age as specified by law in your jurisdiction.</p>
          <p className="text-gray-700 mb-4">
            We do not knowingly collect, solicit data from, or market to children under 18 years of age or the equivalent age as specified by law in your jurisdiction, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or the equivalent age as specified by law in your jurisdiction or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age or the equivalent age as specified by law in your jurisdiction has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18 or the equivalent age as specified by law in your jurisdiction, please contact us at{' '}
            <a href="mailto:tatendamuzenda740@gmail.com" className="text-pink-600 hover:text-pink-700">
              tatendamuzenda740@gmail.com
            </a>.
          </p>
        </section>

        {/* Section 10 */}
        <section id="section10" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">10. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</p>
          <p className="text-gray-700 mb-4">
            In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. If a decision that produces legal or similarly significant effects is made solely by automated means, we will inform you, explain the main factors, and offer a simple way to request human review. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section 'HOW CAN YOU CONTACT US ABOUT THIS NOTICE?' below.
          </p>
          <p className="text-gray-700 mb-4">
            We will consider and act upon any request in accordance with applicable data protection laws.
          </p>
          <p className="text-gray-700 mb-4">
            If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your Member State data protection authority or UK data protection authority.
          </p>
          <p className="text-gray-700 mb-4">
            If you are located in Switzerland, you may contact the Federal Data Protection and Information Commissioner.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section 'HOW CAN YOU CONTACT US ABOUT THIS NOTICE?' below or updating your preferences.
          </p>
          <p className="text-gray-700 mb-4">
            However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Account Information</strong>
          </p>
          <p className="text-gray-700 mb-4">If you would at any time like to review or change the information in your account or terminate your account, you can:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>Log in to your account settings and update your user account.</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
          </p>
          <p className="text-gray-700">
            If you have questions or comments about your privacy rights, you may email us at{' '}
            <a href="mailto:tatendamuzenda740@gmail.com" className="text-pink-600 hover:text-pink-700">
              tatendamuzenda740@gmail.com
            </a>.
          </p>
        </section>

        {/* Section 11 */}
        <section id="section11" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">11. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          <p className="text-gray-700 mb-4">
            Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ('DNT') feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognising and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.
          </p>
          <p className="text-gray-700">
            California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognising or honouring DNT signals, we do not respond to them at this time.
          </p>
        </section>

        {/* Section 12 */}
        <section id="section12" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">12. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.</p>
          <p className="text-gray-700 mb-4">
            <strong>Categories of Personal Information We Collect</strong>
          </p>
          <p className="text-gray-700 mb-4">
            The table below shows the categories of personal information we have collected in the past twelve (12) months. The table includes illustrative examples of each category and does not reflect the personal information we collect from you. For a comprehensive inventory of all personal information we process, please refer to the section 'WHAT INFORMATION DO WE COLLECT?'
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Examples</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Collected</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">A. Identifiers</td>
                  <td className="border border-gray-300 px-4 py-2">Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</td>
                  <td className="border border-gray-300 px-4 py-2">YES</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">B. Personal information as defined in the California Customer Records statute</td>
                  <td className="border border-gray-300 px-4 py-2">Name, contact information, education, employment, employment history, and financial information</td>
                  <td className="border border-gray-300 px-4 py-2">NO</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">C. Protected classification characteristics under state or federal law</td>
                  <td className="border border-gray-300 px-4 py-2">Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</td>
                  <td className="border border-gray-300 px-4 py-2">YES</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">L. Sensitive personal Information</td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                  <td className="border border-gray-300 px-4 py-2">NO</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mb-4">
            We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>Receiving help through our customer support channels;</li>
            <li>Participation in customer surveys or contests; and</li>
            <li>Facilitation in the delivery of our Services and to respond to your inquiries.</li>
          </ul>
          <p className="text-gray-700 mb-4">
            We will use and retain the collected personal information as needed to provide the Services or for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>Category A - As long as the user has an account with us</li>
            <li>Category C - As long as the user has an account with us</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>Your Rights</strong>
          </p>
          <p className="text-gray-700 mb-4">You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>Right to know whether or not we are processing your personal data</li>
            <li>Right to access your personal data</li>
            <li>Right to correct inaccuracies in your personal data</li>
            <li>Right to request the deletion of your personal data</li>
            <li>Right to obtain a copy of the personal data you previously shared with us</li>
            <li>Right to non-discrimination for exercising your rights</li>
            <li>Right to opt out of the processing of your personal data if it is used for targeted advertising (or sharing as defined under California's privacy law), the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects ('profiling')</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>How to Exercise Your Rights</strong>
          </p>
          <p className="text-gray-700">
            To exercise these rights, you can contact us by submitting a data subject access request, by emailing us at{' '}
            <a href="mailto:tatendamuzenda740@gmail.com" className="text-pink-600 hover:text-pink-700">
              tatendamuzenda740@gmail.com
            </a>, or by referring to the contact details at the bottom of this document.
          </p>
        </section>

        {/* Section 13 */}
        <section id="section13" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">13. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
          <p className="text-gray-700 mb-4 font-semibold">In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.</p>
          <p className="text-gray-700">
            We may update this Privacy Notice from time to time. The updated version will be indicated by an updated 'Revised' date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.
          </p>
        </section>

        {/* Section 14 */}
        <section id="section14" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          <p className="text-gray-700 mb-4">
            If you have questions or comments about this notice, you may contact our Data Protection Officer (DPO) by email at{' '}
            <a href="mailto:tatendamuzenda740@gmail.com" className="text-pink-600 hover:text-pink-700">
              tatendamuzenda740@gmail.com
            </a>, by phone at +263771472707, or contact us by post at:
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700">
              <strong>Protadcom Inc</strong><br />
              Data Protection Officer<br />
              6334 southview<br />
              4048 Dzivarasekwa Harare<br />
              Harare, Harare Province 0000<br />
              Zimbabwe
            </p>
          </div>
        </section>

        {/* Section 15 */}
        <section id="section15" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
          <p className="text-gray-700">
            You have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a data subject access request.
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

export default PrivacyPolicy

