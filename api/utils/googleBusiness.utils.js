// utils/googleBusiness.utils.js

const generateGoogleBusinessLinks = (businessName, location = "") => {
  const encoded = encodeURIComponent(
    location ? `${businessName} ${location}` : businessName
  );

  return {
    // Search link — works for any business
    searchLink: `https://www.google.com/search?q=${encoded}`,

    // Maps search link
    mapsLink: `https://www.google.com/maps/search/${encoded}`,

    // Maps embed link (for iframe)
    embedLink: `https://www.google.com/maps?q=${encoded}&output=embed`,
  };
};

module.exports = { generateGoogleBusinessLinks };