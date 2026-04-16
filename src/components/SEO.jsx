import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, canonical, name, type }) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <link rel='canonical' href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type || 'website'} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={canonical} />
      {/* <meta property='og:image' content={image} /> */}
      {/* We can add image support later if needed, for now keeping it simple or using a default if passed */}

      {/* Twitter */}
      <meta name='twitter:creator' content={name || 'Utsavlokam'} />
      <meta name='twitter:card' content={type === 'article' ? 'summary_large_image' : 'summary'} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      {/* <meta name='twitter:image' content={image} /> */}
    </Helmet>
  );
};

export default SEO;
