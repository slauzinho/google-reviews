import axios from 'axios';

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  try {
    const dataId = req.query.data_id;

    if (!dataId) {
      res.status(404).json({ message: 'No data id provided' });
      return;
    }

    res.setHeader('Cache-Control', 's-maxage=' + 24 * 60 * 60); // 24hours

    const firstPageResult = await axios.get(
      `https://serpapi.com/search.json?api_key=2393b9c19088d144a773f7a8b64e79d136826097f7a58a4f786e6b6a226fdeb1&data_id=${dataId}&engine=google_maps_reviews&hl=en`
    );

    let reviews = firstPageResult.data.reviews;
    let nextPage = firstPageResult.data.serpapi_pagination?.next;
    let counter = 0;

    while (nextPage && counter < 3) {
      const newPageResult = await axios.get(
        `${nextPage}&api_key=2393b9c19088d144a773f7a8b64e79d136826097f7a58a4f786e6b6a226fdeb1`
      );
      if (newPageResult.data.reviews) {
        reviews = [...reviews, ...newPageResult.data.reviews];
      }
      nextPage = newPageResult.data.serpapi_pagination?.next;
      counter++;
    }

    res.status(200).json(reviews);
  } catch (e) {
    res.status(403);
  }
};

module.exports = allowCors(handler);
