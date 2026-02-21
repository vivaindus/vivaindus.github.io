import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* NATIVE INJECTION: Stops Next.js from adding attributes to the script */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                
                document.head.appendChild(script);
              })();
            `
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}