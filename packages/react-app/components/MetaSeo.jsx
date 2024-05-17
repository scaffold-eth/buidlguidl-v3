import React from "react";
import Head from "next/head";

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;

const MetaSeo = ({ title, description, image }) => (
  <Head>
    <title>{`${title} | BuidlGuidl`}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={`${title} | BuidlGuidl`} />
    <meta property="og:description" content={description} />

    <meta name="twitter:title" content={`${title} | BuidlGuidl`} />
    <meta name="twitter:description" content={description} />

    {image && (
      <>
        <meta property="og:image" content={`${baseUrl}/${image}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${baseUrl}/${image}`} />
      </>
    )}
  </Head>
);

export default MetaSeo;
