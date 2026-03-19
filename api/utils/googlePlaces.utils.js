// utils/googlePlaces.utils.js
const axios = require("axios");

const getGoogleBusinessLink = async (businessName, address = "") => {
  const query = encodeURIComponent(`${businessName} ${address}`.trim());

  // Step 1: Search for the place
  const searchRes = await axios.get(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
    {
      params: {
        input:          query,
        inputtype:      "textquery",
        fields:         "place_id,name,formatted_address,url",
        key:            process.env.GOOGLE_PLACES_API_KEY,
      },
    }
  );

  const candidate = searchRes.data.candidates?.[0];
  if (!candidate) return null;

  // Step 2: Get full details using place_id
  const detailRes = await axios.get(
    `https://maps.googleapis.com/maps/api/place/details/json`,
    {
      params: {
        place_id: candidate.place_id,
        fields:   "name,url,website,formatted_address",
        key:      process.env.GOOGLE_PLACES_API_KEY,
      },
    }
  );

  const place = detailRes.data.result;

  return {
    placeId:          candidate.place_id,
    googleMapsLink:   place.url,              // ← official Google Maps URL
    website:          place.website || null,
    formattedAddress: place.formatted_address,
  };
};

module.exports = { getGoogleBusinessLink };