export default function GuidelinesPage() {
    return (
      <div className="container mx-auto py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Content Guidelines</h1>
  
        <div className="prose prose-emerald max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">General Guidelines</h2>
            <p>
              Our real estate platform aims to provide a trustworthy marketplace for property listings. To maintain the
              quality and integrity of our platform, all content must adhere to these guidelines. Failure to comply may
              result in content removal, account suspension, or termination.
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptable Content</h2>
            <p>All property listings and content on our platform should:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Be accurate and truthful representations of the property</li>
              <li>Include clear, high-quality images of the actual property</li>
              <li>Provide complete and accurate property details (size, rooms, amenities, etc.)</li>
              <li>List a fair and transparent price</li>
              <li>Clearly state whether the listing is for sale, rent, or lease</li>
              <li>Include accurate location information</li>
              <li>Specify any known issues or defects with the property</li>
              <li>Comply with all applicable real estate laws and regulations</li>
            </ul>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Prohibited Content</h2>
            <p>The following types of content are strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Fraudulent or scam listings</li>
              <li>Misleading or deceptive information about properties</li>
              <li>Stock photos or images that don't represent the actual property</li>
              <li>Discriminatory language or content that violates fair housing laws</li>
              <li>Offensive, obscene, or inappropriate content</li>
              <li>Personal information about previous owners or tenants</li>
              <li>Content that promotes illegal activities</li>
              <li>Duplicate listings for the same property</li>
              <li>Listings for properties that don't exist or aren't available</li>
              <li>Content that infringes on intellectual property rights</li>
            </ul>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Image Guidelines</h2>
            <p>All images uploaded to our platform should:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Be clear, well-lit, and high-quality</li>
              <li>Show the actual property being listed</li>
              <li>Not be digitally altered to misrepresent the property</li>
              <li>Not contain watermarks from other real estate platforms</li>
              <li>Not include people in the photos unless they've given consent</li>
              <li>Not display personal items that could compromise privacy or security</li>
              <li>Include both interior and exterior views when possible</li>
            </ul>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description Guidelines</h2>
            <p>Property descriptions should:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Be clear, concise, and accurate</li>
              <li>Highlight key features and amenities</li>
              <li>Avoid exaggerated claims (e.g., "best property ever")</li>
              <li>Not include discriminatory language or preferences</li>
              <li>Not include excessive use of capital letters or special characters</li>
              <li>Not include contact information (use the platform's messaging system instead)</li>
              <li>Not include external links to other websites</li>
            </ul>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Moderation Process</h2>
            <p>
              All content submitted to our platform undergoes a moderation process to ensure compliance with these
              guidelines:
            </p>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>Initial automated screening for prohibited content</li>
              <li>Manual review by our moderation team</li>
              <li>Approval, rejection, or request for changes</li>
              <li>Ongoing monitoring for reported content</li>
            </ol>
            <p>
              If your content is rejected, you'll receive a notification explaining the reason. You can edit and resubmit
              your content or appeal the decision if you believe it was made in error.
            </p>
          </section>
  
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Appeals Process</h2>
            <p>If your content is rejected and you believe it complies with our guidelines, you can submit an appeal:</p>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>Navigate to your rejected property in your dashboard</li>
              <li>Click the "Appeal" button</li>
              <li>Provide a detailed explanation of why you believe the content should be approved</li>
              <li>Submit your appeal for review</li>
            </ol>
            <p>Appeals are typically reviewed within 48 hours. The decision on an appeal is final.</p>
          </section>
  
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have questions about these guidelines or need assistance with content moderation, please contact our
              support team at support@realestate-platform.com.
            </p>
          </section>
        </div>
      </div>
    )
  }
  