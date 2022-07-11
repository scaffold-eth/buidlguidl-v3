import React from "react";
import Head from "next/head";

const MetaSeo = ({ title, description, image }) => (
  <Head>
    <title>{`${title} | BuidlGuidl`}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={`${title} | BuidlGuidl`} />
    <meta property="og:description" content={description} />

    <meta property="twitter:title" content={`${title} | BuidlGuidl`} />
    <meta property="twitter:description" content={description} />

    {image && (
      <>
        <meta property="og:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={image} />
      </>
    )}
  </Head>
);

export default MetaSeo;
