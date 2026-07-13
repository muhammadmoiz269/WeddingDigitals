// Try to find Shahi Bulawa using different search strategies
const API_KEY = 'AIzaSyAExU-3XcG6B7ypLB59T3r--C2t1M6cVOI';

async function tryNearbySearch() {
  // From the Maps URL: @29.2666503,70.6023149
  // Let's search near those coordinates
  const queries = [
    'Shahi Bulawa Rahim Yar Khan',
    'Shahi Bulawa wedding',
    'شاہی بلاوا',
    'wedding cards Rahim Yar Khan',
    'invitation cards Rahim Yar Khan',
  ];

  for (const query of queries) {
    console.log(`\n=== Searching: "${query}" ===`);
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount',
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: 29.2666503, longitude: 70.6023149 },
              radius: 5000,
            },
          },
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`HTTP ${res.status}:`, errorBody);
        continue;
      }

      const data = await res.json();
      if (data.places && data.places.length > 0) {
        data.places.slice(0, 5).forEach((p, i) => {
          console.log(`  [${i}] ID: ${p.id}`);
          console.log(`       Name: ${p.displayName?.text}`);
          console.log(`       Address: ${p.formattedAddress}`);
          console.log(`       Rating: ${p.rating} (${p.userRatingCount} reviews)`);
        });
      } else {
        console.log('  No results');
      }
    } catch (e) {
      console.error('Error:', e);
    }
  }

  // Also try fetching the "nearby" endpoint around the coordinates
  console.log('\n=== Nearby Search around 29.2666503, 70.6023149 ===');
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: { latitude: 29.2666503, longitude: 70.6023149 },
            radius: 500,
          },
        },
        maxResultCount: 10,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`HTTP ${res.status}:`, errorBody);
    } else {
      const data = await res.json();
      if (data.places && data.places.length > 0) {
        data.places.forEach((p, i) => {
          console.log(`  [${i}] ID: ${p.id}`);
          console.log(`       Name: ${p.displayName?.text}`);
          console.log(`       Address: ${p.formattedAddress}`);
          console.log(`       Rating: ${p.rating} (${p.userRatingCount} reviews)`);
        });
      } else {
        console.log('  No results');
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

tryNearbySearch();
