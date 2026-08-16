import { useEffect } from 'react'

const S = { color: '#595959', fontSize: 15, fontFamily: 'Arial, sans-serif' }
const link = { color: '#3030F1' }

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'HubStudio Terms of Service'
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px', fontFamily: 'Arial, sans-serif', color: '#595959', lineHeight: 1.6 }}>

      <h1 style={{ fontSize: 26, color: '#000', marginBottom: 4 }}>HubStudio Terms of Service</h1>
      <p style={{ color: '#7f7f7f', fontSize: 14, marginBottom: 48 }}>Last updated June 27, 2026</p>

      <h2 style={{ color: '#000', fontSize: 19 }}>AGREEMENT TO OUR LEGAL TERMS</h2>
      <p style={S}>
        We are <strong>Studio Hub</strong>, a company registered in Brazil at Rua Mississipi, 257, Barueri, SP 06437-100.
      </p>
      <p style={S}>
        We operate the website{' '}
        <a href="https://hub-studio-seven.vercel.app/" target="_blank" rel="noopener noreferrer" style={link}>
          https://hub-studio-seven.vercel.app/
        </a>{' '}
        (the <strong>"Site"</strong>), as well as any other related products and services that refer or link to these legal
        terms (the <strong>"Legal Terms"</strong>) (collectively, the <strong>"Services"</strong>).
      </p>
      <p style={S}>
        HubStudio lets businesses publish TikTok videos and track performance metrics from a centralized social media dashboard.
      </p>
      <p style={S}>
        You can contact us by phone at 11978581162, email at{' '}
        <a href="mailto:company.hubstudio@gmail.com" style={link}>company.hubstudio@gmail.com</a>, or by mail to
        Rua Mississipi, 257, Barueri, SP 06437-100, Brazil.
      </p>
      <p style={S}>
        These Legal Terms constitute a legally binding agreement made between you ("you") and Studio Hub, concerning your
        access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed
        to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY
        PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
      </p>
      <p style={S}>
        We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and
        for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms. It is
        your responsibility to periodically review these Legal Terms to stay informed of updates.
      </p>
      <p style={S}>
        The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to
        use or register for the Services.
      </p>
      <p style={S}>We recommend that you print a copy of these Legal Terms for your records.</p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 style={{ color: '#000', fontSize: 19 }}>TABLE OF CONTENTS</h2>
      <ol style={{ color: '#3030F1', fontSize: 15 }}>
        {[
          ['#services', '1. OUR SERVICES'],
          ['#ip', '2. INTELLECTUAL PROPERTY RIGHTS'],
          ['#userreps', '3. USER REPRESENTATIONS'],
          ['#userreg', '4. USER REGISTRATION'],
          ['#purchases', '5. PURCHASES AND PAYMENT'],
          ['#prohibited', '6. PROHIBITED ACTIVITIES'],
          ['#ugc', '7. USER GENERATED CONTRIBUTIONS'],
          ['#license', '8. CONTRIBUTION LICENSE'],
          ['#reviews', '9. GUIDELINES FOR REVIEWS'],
          ['#socialmedia', '10. SOCIAL MEDIA'],
          ['#sitemanage', '11. SERVICES MANAGEMENT'],
          ['#ppyes', '12. PRIVACY POLICY'],
          ['#terms', '13. TERM AND TERMINATION'],
          ['#modifications', '14. MODIFICATIONS AND INTERRUPTIONS'],
          ['#law', '15. GOVERNING LAW'],
          ['#disputes', '16. DISPUTE RESOLUTION'],
          ['#corrections', '17. CORRECTIONS'],
          ['#disclaimer', '18. DISCLAIMER'],
          ['#liability', '19. LIMITATIONS OF LIABILITY'],
          ['#indemnification', '20. INDEMNIFICATION'],
          ['#userdata', '21. USER DATA'],
          ['#electronic', '22. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES'],
          ['#misc', '23. MISCELLANEOUS'],
          ['#contact', '24. CONTACT US'],
        ].map(([href, label]) => (
          <li key={href} style={{ marginBottom: 4 }}>
            <a href={href} style={link}>{label}</a>
          </li>
        ))}
      </ol>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="services" style={{ color: '#000', fontSize: 19 }}>1. OUR SERVICES</h2>
      <p style={S}>
        The information provided when using the Services is not intended for distribution to or use by any person or entity
        in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would
        subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose
        to access the Services from other locations do so on their own initiative and are solely responsible for compliance
        with local laws, if and to the extent local laws are applicable.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="ip" style={{ color: '#000', fontSize: 19 }}>2. INTELLECTUAL PROPERTY RIGHTS</h2>
      <h3 style={{ color: '#000', fontSize: 17 }}>Our intellectual property</h3>
      <p style={S}>
        We are the owner or the licensee of all intellectual property rights in our Services, including all source code,
        databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services
        (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
      </p>
      <p style={S}>
        Our Content and Marks are protected by copyright and trademark laws and treaties around the world. The Content and
        Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business
        purpose only.
      </p>
      <h3 style={{ color: '#000', fontSize: 17 }}>Your use of our Services</h3>
      <p style={S}>
        Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable
        license to access the Services and download or print a copy of any portion of the Content to which you have
        properly gained access, solely for your personal, non-commercial use or internal business purpose.
      </p>
      <p style={S}>
        Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks
        may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated,
        transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without
        our express prior written permission.
      </p>
      <p style={S}>
        If you wish to make any use of the Services, Content, or Marks other than as set out in this section, please
        address your request to:{' '}
        <a href="mailto:company.hubstudio@gmail.com" style={link}>company.hubstudio@gmail.com</a>.
      </p>
      <p style={S}>
        We reserve all rights not expressly granted to you in and to the Services, Content, and Marks. Any breach of
        these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use
        our Services will terminate immediately.
      </p>
      <h3 style={{ color: '#000', fontSize: 17 }}>Your submissions and contributions</h3>
      <p style={S}>
        By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services
        ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we
        shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose,
        commercial or otherwise, without acknowledgment or compensation to you.
      </p>
      <p style={S}>
        <strong>When you post Contributions, you grant us a license (including use of your name, trademarks, and logos):</strong>{' '}
        By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive,
        transferable, royalty-free, fully-paid, worldwide right and license to use, copy, reproduce, distribute, sell,
        publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt, and exploit
        your Contributions for any purpose, commercial, advertising, or otherwise.
      </p>
      <p style={S}>
        <strong>You are responsible for what you post or upload.</strong> You are solely responsible for your Submissions
        and/or Contributions and you expressly agree to reimburse us for any and all losses that we may suffer because
        of your breach of these terms, any third party's intellectual property rights, or applicable law.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="userreps" style={{ color: '#000', fontSize: 19 }}>3. USER REPRESENTATIONS</h2>
      <p style={S}>
        By using the Services, you represent and warrant that: (1) all registration information you submit will be true,
        accurate, current, and complete; (2) you will maintain the accuracy of such information; (3) you have the legal
        capacity and you agree to comply with these Legal Terms; (4) you are not a minor in the jurisdiction in which you
        reside; (5) you will not access the Services through automated or non-human means; (6) you will not use the
        Services for any illegal or unauthorized purpose; and (7) your use of the Services will not violate any applicable
        law or regulation.
      </p>
      <p style={S}>
        If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to
        suspend or terminate your account and refuse any and all current or future use of the Services.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="userreg" style={{ color: '#000', fontSize: 19 }}>4. USER REGISTRATION</h2>
      <p style={S}>
        You may be required to register to use the Services. You agree to keep your password confidential and will be
        responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a
        username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or
        otherwise objectionable.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="purchases" style={{ color: '#000', fontSize: 19 }}>5. PURCHASES AND PAYMENT</h2>
      <p style={S}>
        You agree to provide current, complete, and accurate purchase and account information for all purchases made via
        the Services. You further agree to promptly update account and payment information so that we can complete your
        transactions and contact you as needed. We reserve the right to refuse any order placed through the Services.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="prohibited" style={{ color: '#000', fontSize: 19 }}>6. PROHIBITED ACTIVITIES</h2>
      <p style={S}>
        You may not access or use the Services for any purpose other than that for which we make the Services available.
        As a user of the Services, you agree not to:
      </p>
      <ul style={S}>
        <li>Systematically retrieve data or other content from the Services to create a collection, compilation, database, or directory without written permission from us.</li>
        <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
        <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
        <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
        <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
        <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
        <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
        <li>Engage in unauthorized framing of or linking to the Services.</li>
        <li>Upload or transmit viruses, Trojan horses, or other material that interferes with any party's use and enjoyment of the Services.</li>
        <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using data mining or scraping tools.</li>
        <li>Delete the copyright or other proprietary rights notice from any Content.</li>
        <li>Attempt to impersonate another user or person or use the username of another user.</li>
        <li>Interfere with, disrupt, or create an undue burden on the Services or the networks connected to the Services.</li>
        <li>Harass, annoy, intimidate, or threaten any of our employees or agents.</li>
        <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services.</li>
        <li>Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
        <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising the Services.</li>
        <li>Use the Services as part of any effort to compete with us or otherwise use the Services for any revenue-generating endeavor or commercial enterprise.</li>
      </ul>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="ugc" style={{ color: '#000', fontSize: 19 }}>7. USER GENERATED CONTRIBUTIONS</h2>
      <p style={S}>
        The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and
        other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform,
        publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to
        text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other
        material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through
        third-party websites.
      </p>
      <p style={S}>When you create or make available any Contributions, you thereby represent and warrant that:</p>
      <ul style={S}>
        <li>The creation, distribution, transmission, public display, or performance of your Contributions do not infringe the proprietary rights of any third party.</li>
        <li>You are the creator and owner of or have the necessary licenses, rights, consents, and permissions to use and to authorize us to use your Contributions.</li>
        <li>Your Contributions are not false, inaccurate, or misleading.</li>
        <li>Your Contributions are not unsolicited or unauthorized advertising, promotional materials, spam, mass mailings, or other forms of solicitation.</li>
        <li>Your Contributions are not obscene, lewd, violent, harassing, libelous, slanderous, or otherwise objectionable.</li>
        <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
        <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
        <li>Your Contributions do not include any offensive comments connected to race, national origin, gender, sexual preference, or physical handicap.</li>
      </ul>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="license" style={{ color: '#000', fontSize: 19 }}>8. CONTRIBUTION LICENSE</h2>
      <p style={S}>
        By posting your Contributions to any part of the Services, you automatically grant to us an unrestricted,
        unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right and
        license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store,
        cache, publicly perform, publicly display, reformat, translate, transmit, excerpt, and distribute such
        Contributions for any purpose, commercial, advertising, or otherwise.
      </p>
      <p style={S}>
        We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions
        and any intellectual property rights or other proprietary rights associated with your Contributions. We have the
        right, in our sole and absolute discretion, to edit, redact, re-categorize, pre-screen, or delete any
        Contributions at any time and for any reason, without notice.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="reviews" style={{ color: '#000', fontSize: 19 }}>9. GUIDELINES FOR REVIEWS</h2>
      <p style={S}>
        We may provide you areas on the Services to leave reviews or ratings. When posting a review, you must comply with
        the following criteria: (1) you should have firsthand experience with the person/entity being reviewed; (2) your
        reviews should not contain offensive profanity, or abusive, racist, offensive, or hateful language; (3) your
        reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital
        status, sexual orientation, or disability; (4) your reviews should not contain references to illegal activity; (5)
        you should not make any conclusions as to the legality of conduct; (6) you may not post any false or misleading
        statements; and (7) you may not organize a campaign encouraging others to post reviews, whether positive or
        negative.
      </p>
      <p style={S}>
        We may accept, reject, or remove reviews in our sole discretion. Reviews are not endorsed by us and do not
        necessarily represent our opinions or the views of any of our affiliates or partners.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="socialmedia" style={{ color: '#000', fontSize: 19 }}>10. SOCIAL MEDIA</h2>
      <p style={S}>
        As part of the functionality of the Services, you may link your account with online accounts you have with
        third-party service providers (each such account, a "Third-Party Account") by either providing your Third-Party
        Account login information through the Services, or allowing us to access your Third-Party Account as permitted
        under the applicable terms and conditions that govern your use of each Third-Party Account.
      </p>
      <p style={S}>
        PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY
        ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS. We make no effort to
        review any Social Network Content for any purpose, including but not limited to, for accuracy, legality, or
        non-infringement, and we are not responsible for any Social Network Content.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="sitemanage" style={{ color: '#000', fontSize: 19 }}>11. SERVICES MANAGEMENT</h2>
      <p style={S}>
        We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms;
        (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal
        Terms; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of,
        or disable any of your Contributions or any portion thereof; and (4) otherwise manage the Services in a manner
        designed to protect our rights and property and to facilitate the proper functioning of the Services.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="ppyes" style={{ color: '#000', fontSize: 19 }}>12. PRIVACY POLICY</h2>
      <p style={S}>
        We care about data privacy and security. Please review our Privacy Policy:{' '}
        <a href="/privacy" style={link}><strong>https://hub-studio-seven.vercel.app/privacy</strong></a>. By using the
        Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="terms" style={{ color: '#000', fontSize: 19 }}>13. TERM AND TERMINATION</h2>
      <p style={S}>
        These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER
        PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY,
        DENY ACCESS TO AND USE OF THE SERVICES TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION
        FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW
        OR REGULATION.
      </p>
      <p style={S}>
        If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new
        account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on
        behalf of the third party.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="modifications" style={{ color: '#000', fontSize: 19 }}>14. MODIFICATIONS AND INTERRUPTIONS</h2>
      <p style={S}>
        We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at
        our sole discretion without notice. We cannot guarantee the Services will be available at all times. We reserve
        the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for
        any reason without notice to you.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="law" style={{ color: '#000', fontSize: 19 }}>15. GOVERNING LAW</h2>
      <p style={S}>
        These Legal Terms shall be governed by and defined following the laws of Brazil. Studio Hub and yourself
        irrevocably consent that the courts of Brazil shall have exclusive jurisdiction to resolve any dispute which may
        arise in connection with these Legal Terms.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="disputes" style={{ color: '#000', fontSize: 19 }}>16. DISPUTE RESOLUTION</h2>
      <p style={S}>
        You agree to irrevocably submit all disputes related to these Legal Terms or the legal relationship established
        by these Legal Terms to the jurisdiction of the Brazil courts. Studio Hub shall also maintain the right to bring
        proceedings as to the substance of the matter in the courts of the country where you reside or, if these Legal
        Terms are entered into in the course of your trade or profession, the state of your principal place of business.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="corrections" style={{ color: '#000', fontSize: 19 }}>17. CORRECTIONS</h2>
      <p style={S}>
        There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We
        reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on
        the Services at any time, without prior notice.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="disclaimer" style={{ color: '#000', fontSize: 19 }}>18. DISCLAIMER</h2>
      <p style={S}>
        THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT
        YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN
        CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS
        ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR
        ANY ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, PERSONAL INJURY OR PROPERTY DAMAGE, UNAUTHORIZED
        ACCESS TO OR USE OF OUR SECURE SERVERS, OR ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="liability" style={{ color: '#000', fontSize: 19 }}>19. LIMITATIONS OF LIABILITY</h2>
      <p style={S}>
        IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT,
        INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE,
        LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE
        POSSIBILITY OF SUCH DAMAGES.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="indemnification" style={{ color: '#000', fontSize: 19 }}>20. INDEMNIFICATION</h2>
      <p style={S}>
        You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our
        respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or
        demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1)
        your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your
        representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party,
        including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of
        the Services with whom you connected via the Services.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="userdata" style={{ color: '#000', fontSize: 19 }}>21. USER DATA</h2>
      <p style={S}>
        We will maintain certain data that you transmit to the Services for the purpose of managing the performance of
        the Services, as well as data relating to your use of the Services. Although we perform regular routine backups
        of data, you are solely responsible for all data that you transmit or that relates to any activity you have
        undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any
        such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="electronic" style={{ color: '#000', fontSize: 19 }}>22. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
      <p style={S}>
        Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You
        consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other
        communications we provide to you electronically satisfy any legal requirement that such communication be in writing.
        YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC
        DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="misc" style={{ color: '#000', fontSize: 19 }}>23. MISCELLANEOUS</h2>
      <p style={S}>
        These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement
        and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal
        Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent
        permissible by law. We may assign any or all of our rights and obligations to others at any time. If any provision
        or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision
        is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining
        provisions.
      </p>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />

      <h2 id="contact" style={{ color: '#000', fontSize: 19 }}>24. CONTACT US</h2>
      <p style={S}>
        In order to resolve a complaint regarding the Services or to receive further information regarding use of the
        Services, please contact us at:
      </p>
      <address style={{ fontStyle: 'normal', lineHeight: 1.8, ...S }}>
        <strong>Studio Hub</strong><br />
        Rua Mississipi, 257<br />
        Barueri, SP 06437-100<br />
        Brazil<br />
        Phone: 11978581162<br />
        <a href="mailto:company.hubstudio@gmail.com" style={link}>company.hubstudio@gmail.com</a>
      </address>

      <hr style={{ margin: '40px 0', borderColor: '#e0e0e0' }} />
      <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center' }}>
        This Terms and Conditions was created using Termly's Terms and Conditions Generator.
      </p>
    </div>
  )
}
