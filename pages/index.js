import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This sends real users to the store
    router.push('/vivaIndus');
  }, [router]);

  return (
    <div>
      <Head>
        <title>SHB Stores | Premium Shopping</title>
        {/* PASTE YOUR GOOGLE VERIFICATION TAG BELOW */}
        <meta name="google-site-verification" content="rJgnMJfb7OV2Y0b2XclACE9iMuEBexBXkSx6uLvt5us" />
      </Head>
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
        <p>Redirecting to Shifa Stores...</p>
      </div>
    </div>
  );
}