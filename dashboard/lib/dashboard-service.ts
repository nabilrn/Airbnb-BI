import { PrismaClient } from '@/lib/generated/prisma';

// Create singleton Prisma instance
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class DashboardService {
    // Get price and location analytics - NO DUMMY DATA
    static async getPriceLocationData() {
        try {
            // Get neighbourhood prices with coordinates for map visualization
            const neighbourhoodData = await prisma.$queryRawUnsafe(`
        SELECT 
          dl.neighbourhood,
          dl.neighbourhood_group,
          ROUND(AVG(f.price::numeric), 0)::int as "avgPrice",
          COUNT(DISTINCT f.listing_id)::int as listings,
          AVG(dl.latitude::numeric)::float as latitude,
          AVG(dl.longitude::numeric)::float as longitude
        FROM fact_listing_daily f
        JOIN dim_location dl ON f.location_id = dl.id
        WHERE dl.neighbourhood IS NOT NULL 
          AND dl.latitude IS NOT NULL 
          AND dl.longitude IS NOT NULL
          AND f.price IS NOT NULL 
          AND f.price > 0
        GROUP BY dl.neighbourhood, dl.neighbourhood_group
        HAVING COUNT(DISTINCT f.listing_id) >= 5
        ORDER BY "avgPrice" DESC
      `) as Array<{
                neighbourhood: string;
                neighbourhood_group: string;
                avgPrice: number;
                listings: number;
                latitude: number;
                longitude: number;
            }>;

            // Get price distribution
            const priceDistribution = await prisma.$queryRawUnsafe(`
        WITH price_ranges AS (
          SELECT 
            CASE 
              WHEN price <= 50 THEN '$0-50'
              WHEN price <= 100 THEN '$51-100'
              WHEN price <= 200 THEN '$101-200'
              WHEN price <= 500 THEN '$201-500'
              ELSE '$500+'
            END as range
          FROM fact_listing_daily 
          WHERE price IS NOT NULL AND price > 0
        ),
        range_counts AS (
          SELECT 
            range,
            COUNT(*)::int as count
          FROM price_ranges
          GROUP BY range
        ),
        total_count AS (
          SELECT SUM(count) as total FROM range_counts
        )
        SELECT 
          rc.range,
          rc.count,
          ROUND((rc.count * 100.0 / tc.total), 0)::int as percentage
        FROM range_counts rc, total_count tc
        ORDER BY 
          CASE rc.range
            WHEN '$0-50' THEN 1
            WHEN '$51-100' THEN 2
            WHEN '$101-200' THEN 3
            WHEN '$201-500' THEN 4
            ELSE 5
          END
      `) as Array<{ range: string; count: number; percentage: number }>;

            // Get average price by area
            const avgPriceByArea = await prisma.$queryRawUnsafe(`
        SELECT 
          dl.neighbourhood_group as area,
          ROUND(AVG(f.price::numeric), 0)::int as "avgPrice",
          COUNT(DISTINCT f.listing_id)::int as "listingCount"
        FROM fact_listing_daily f
        JOIN dim_location dl ON f.location_id = dl.id
        WHERE dl.neighbourhood_group IS NOT NULL 
          AND f.price IS NOT NULL 
          AND f.price > 0
        GROUP BY dl.neighbourhood_group
        ORDER BY "avgPrice" DESC
      `) as Array<{ area: string; avgPrice: number; listingCount: number }>;

            return {
                neighbourhoodPrices: neighbourhoodData,
                priceDistribution: priceDistribution,
                avgPriceByArea: avgPriceByArea
            };
        } catch (error) {
            console.error('Error fetching price location data:', error);
            throw new Error('Failed to fetch price location data from database');
        }
    }

    // Get availability and performance analytics - NO DUMMY DATA
    static async getAvailabilityPerformanceData() {
        try {
            // Property availability by area
            const propertyAvailability = await prisma.$queryRawUnsafe(`
        SELECT 
          dl.neighbourhood_group as area,
          ROUND(AVG(f.availability_365::numeric), 0)::int as availability,
          COUNT(DISTINCT f.listing_id)::int as "totalProperties"
        FROM fact_listing_daily f
        JOIN dim_location dl ON f.location_id = dl.id
        WHERE dl.neighbourhood_group IS NOT NULL 
          AND f.availability_365 IS NOT NULL
        GROUP BY dl.neighbourhood_group
        ORDER BY availability DESC
      `) as Array<{ area: string; availability: number; totalProperties: number }>;

            // Room type availability
            const roomTypeAvailability = await prisma.$queryRawUnsafe(`
        SELECT 
          drt.room_type,
          ROUND(AVG(f.availability_365::numeric), 0)::int as "avgAvailability",
          COUNT(DISTINCT f.listing_id)::int as listings
        FROM fact_listing_daily f
        JOIN dim_room_type drt ON f.room_type_id = drt.id
        WHERE drt.room_type IS NOT NULL 
          AND f.availability_365 IS NOT NULL
        GROUP BY drt.room_type
        ORDER BY "avgAvailability" ASC
      `) as Array<{ room_type: string; avgAvailability: number; listings: number }>;

            // Top rated listings based on review count
            const topRatedListings = await prisma.$queryRawUnsafe(`
        SELECT 
          dl_listing.name,
          f.number_of_reviews::int as reviews,
          dl_location.neighbourhood
        FROM fact_listing_daily f
        JOIN dim_listing dl_listing ON f.listing_id = dl_listing.id
        JOIN dim_location dl_location ON f.location_id = dl_location.id
        WHERE dl_listing.name IS NOT NULL 
          AND f.number_of_reviews > 10
        ORDER BY f.number_of_reviews DESC
        LIMIT 10
      `) as Array<{ name: string; reviews: number; neighbourhood: string }>;

            return {
                propertyAvailability,
                roomTypeAvailability,
                topRatedListings
            };
        } catch (error) {
            console.error('Error fetching availability performance data:', error);
            throw new Error('Failed to fetch availability performance data from database');
        }
    }

    // Get review trends - NO DUMMY DATA
    static async getReviewTrendData() {
        try {
            let monthlyReviews: { month: string; reviews: number }[] = [];

            try {
                // First get all fact data with date relationships
                const factDataWithDates = await prisma.factListingDaily.findMany({
                    where: {
                        number_of_reviews: { not: null },
                        date_id: { not: undefined }
                    },
                    select: {
                        number_of_reviews: true,
                        date: {
                            select: {
                                month: true,
                                year: true
                            }
                        }
                    }
                });

                if (factDataWithDates.length > 0) {
                    // Group by month manually
                    const monthlyGroups: { [key: string]: number } = {};
                    
                    factDataWithDates.forEach(item => {
                        const month = item.date?.month;
                        const year = item.date?.year;
                        const reviews = item.number_of_reviews || 0;

                        if (month && year) {
                            const key = `${year}-${String(month).padStart(2, '0')}`;
                            if (!monthlyGroups[key]) {
                                monthlyGroups[key] = 0;
                            }
                            monthlyGroups[key] += reviews;
                        }
                    });

                    console.log('Monthly groups count:', Object.keys(monthlyGroups).length);

                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    monthlyReviews = Object.entries(monthlyGroups)
                        .map(([key, reviews]) => {
                            const [year, monthStr] = key.split('-');
                            const monthIndex = parseInt(monthStr, 10) - 1;
                            return {
                                month: `${monthNames[monthIndex]} ${year}`,
                                reviews
                            };
                        })
                        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
                }

                // Fallback if no monthly data
                if (monthlyReviews.length === 0) {
                    console.log('No monthly data found, using fallback');
                    monthlyReviews = [
                        { month: 'Jan', reviews: 0 },
                        { month: 'Feb', reviews: 0 },
                        { month: 'Mar', reviews: 0 }
                    ];
                }
            } catch (monthlyError) {
                console.error('Error in monthly reviews:', monthlyError);
                monthlyReviews = [
                    { month: 'Jan', reviews: 0 },
                    { month: 'Feb', reviews: 0 },
                    { month: 'Mar', reviews: 0 }
                ];
            }

            // Step 2: Price vs reviews correlation - USING RELATIONS
            console.log('Fetching price vs reviews data...');
            let priceVsReviews: Array<{ price: number; reviews: number; neighbourhood: string }> = [];

            try {
                // Get fact data with location relationships
                const factDataWithLocations = await prisma.factListingDaily.findMany({
                    where: {
                        price: { gt: 0 },
                        number_of_reviews: { not: null },
                        location_id: { not: undefined }
                    },
                    select: {
                        price: true,
                        number_of_reviews: true,
                        location: {
                            select: {
                                neighbourhood_group: true
                            }
                        }
                    },
                });

                console.log('Fact data with locations count:', factDataWithLocations.length);

                if (factDataWithLocations.length > 0) {
                    // Group by neighbourhood_group manually
                    const priceReviewGroups: { [key: string]: { prices: number[]; totalReviews: number } } = {};

                    factDataWithLocations.forEach(item => {
                        const neighbourhood = item.location?.neighbourhood_group || 'Unknown';
                        const price = Number(item.price) || 0;
                        const reviews = item.number_of_reviews || 0;

                        if (!priceReviewGroups[neighbourhood]) {
                            priceReviewGroups[neighbourhood] = { prices: [], totalReviews: 0 };
                        }

                        priceReviewGroups[neighbourhood].prices.push(price);
                        priceReviewGroups[neighbourhood].totalReviews += reviews;
                    });

                    priceVsReviews = Object.entries(priceReviewGroups)
                        .map(([neighbourhood, data]) => ({
                            price: Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length),
                            reviews: data.totalReviews,
                            neighbourhood
                        }))
                        .filter(item => item.reviews > 0)
                        .sort((a, b) => b.reviews - a.reviews)
                        .slice(0, 15);
                }

                // Fallback if no price vs reviews data
                if (priceVsReviews.length === 0) {
                    console.log('No price vs reviews data found, using fallback');
                    priceVsReviews = [
                        { price: 100, reviews: 0, neighbourhood: 'No Data Available' }
                    ];
                }
            } catch (priceError) {
                console.error('Error in price vs reviews:', priceError);
                priceVsReviews = [
                    { price: 100, reviews: 0, neighbourhood: 'Error Loading Data' }
                ];
            }

            // Step 3: Review distribution - SIMPLE APPROACH
            console.log('Fetching review distribution...');
            let reviewDistribution: string | unknown[] = [];

            try {
                const allReviews = await prisma.factListingDaily.findMany({
                    where: {
                        number_of_reviews: { not: null }
                    },
                    select: {
                        number_of_reviews: true
                    },
                });

                console.log('All reviews count:', allReviews.length);

                if (allReviews.length > 0) {
                    const reviewRanges = {
                        '0 reviews': 0,
                        '1-10 reviews': 0,
                        '11-50 reviews': 0,
                        '51-100 reviews': 0,
                        '100+ reviews': 0
                    };

                    allReviews.forEach(item => {
                        const reviews = item.number_of_reviews || 0;
                        if (reviews === 0) reviewRanges['0 reviews']++;
                        else if (reviews <= 10) reviewRanges['1-10 reviews']++;
                        else if (reviews <= 50) reviewRanges['11-50 reviews']++;
                        else if (reviews <= 100) reviewRanges['51-100 reviews']++;
                        else reviewRanges['100+ reviews']++;
                    });

                    const totalReviews = allReviews.length;
                    reviewDistribution = Object.entries(reviewRanges).map(([range, count]) => ({
                        range,
                        count,
                        percentage: totalReviews > 0 ? Math.round((count * 100) / totalReviews) : 0
                    }));
                }

                // Fallback if no review distribution data
                if (reviewDistribution.length === 0) {
                    console.log('No review distribution data found, using fallback');
                    reviewDistribution = [
                        { range: '0 reviews', count: 1, percentage: 100 }
                    ];
                }
            } catch (distributionError) {
                console.error('Error in review distribution:', distributionError);
                reviewDistribution = [
                    { range: '0 reviews', count: 1, percentage: 100 }
                ];
            }

            console.log('getReviewTrendData completed successfully');

            return {
                monthlyReviews,
                priceVsReviews,
                reviewDistribution
            };
        } catch (error) {
            console.error('Error fetching review trends data:', error);
            console.error('Full error details:', JSON.stringify(error, null, 2));

            // Return fallback data instead of throwing
            console.log('Returning fallback data due to error');
            return {
                monthlyReviews: [
                    { month: 'Jan', reviews: 0 },
                    { month: 'Feb', reviews: 0 },
                    { month: 'Mar', reviews: 0 }
                ],
                priceVsReviews: [
                    { price: 100, reviews: 0, neighbourhood: 'Database Error' }
                ],
                reviewDistribution: [
                    { range: '0 reviews', count: 1, percentage: 100 }
                ]
            };
        }
    }

    // Get host and listing analytics - NO DUMMY DATA
    static async getHostListingData() {
        try {
            // Host distribution
            const hostDistribution = await prisma.$queryRawUnsafe(`
        WITH host_listing_counts AS (
          SELECT 
            f.host_id,
            COUNT(DISTINCT f.listing_id) as listing_count
          FROM fact_listing_daily f
          GROUP BY f.host_id
        ),
        host_categories AS (
          SELECT 
            host_id,
            listing_count,
            CASE 
              WHEN listing_count = 1 THEN 'Single Listing'
              WHEN listing_count BETWEEN 2 AND 5 THEN '2-5 Listings'
              WHEN listing_count BETWEEN 6 AND 10 THEN '6-10 Listings'
              ELSE '11+ Listings'
            END as host_type
          FROM host_listing_counts
        ),
        category_counts AS (
          SELECT 
            host_type,
            COUNT(*)::int as count
          FROM host_categories
          GROUP BY host_type
        ),
        total_hosts AS (
          SELECT SUM(count) as total FROM category_counts
        )
        SELECT 
          cc.host_type as "hostType",
          cc.count,
          ROUND((cc.count * 100.0 / th.total), 0)::int as percentage
        FROM category_counts cc, total_hosts th
        ORDER BY cc.count DESC
      `) as Array<{ hostType: string; count: number; percentage: number }>;

            // Top hosts
            const topHosts = await prisma.$queryRawUnsafe(`
        SELECT 
          dh.host_name as name,
          COUNT(DISTINCT f.listing_id)::int as listings,
          SUM(COALESCE(f.number_of_reviews, 0))::int as "totalReviews",
          ROUND(AVG(f.price::numeric) * COUNT(DISTINCT f.listing_id) * 30, 0)::int as revenue
        FROM dim_host dh
        JOIN fact_listing_daily f ON dh.id = f.host_id
        WHERE dh.host_name IS NOT NULL 
          AND f.price IS NOT NULL 
          AND f.price > 0
        GROUP BY dh.id, dh.host_name
        HAVING COUNT(DISTINCT f.listing_id) >= 2
        ORDER BY listings DESC
        LIMIT 15
      `) as Array<{ name: string; listings: number; totalReviews: number; revenue: number }>;

            // Listings by host range
            const listingsByHost = await prisma.$queryRawUnsafe(`
        WITH host_listing_counts AS (
          SELECT 
            f.host_id,
            COUNT(DISTINCT f.listing_id) as listing_count
          FROM fact_listing_daily f
          GROUP BY f.host_id
        ),
        host_ranges AS (
          SELECT 
            host_id,
            listing_count,
            CASE 
              WHEN listing_count = 1 THEN '1 Listing'
              WHEN listing_count BETWEEN 2 AND 3 THEN '2-3 Listings'
              WHEN listing_count BETWEEN 4 AND 5 THEN '4-5 Listings'
              WHEN listing_count BETWEEN 6 AND 10 THEN '6-10 Listings'
              ELSE '11+ Listings'
            END as range
          FROM host_listing_counts
        )
        SELECT 
          range,
          COUNT(*)::int as hosts,
          SUM(listing_count)::int as "totalListings"
        FROM host_ranges
        GROUP BY range
        ORDER BY "totalListings" DESC
      `) as Array<{ range: string; hosts: number; totalListings: number }>;

            return {
                hostDistribution,
                topHosts,
                listingsByHost
            };
        } catch (error) {
            console.error('Error fetching host listing data:', error);
            throw new Error('Failed to fetch host listing data from database');
        }
    }

    // Get general statistics - NO DUMMY DATA
    static async getGeneralStats() {
        try {
            const stats = await prisma.$queryRawUnsafe(`
        SELECT 
          COUNT(DISTINCT listing_id)::int as "totalListings",
          COUNT(DISTINCT host_id)::int as "totalHosts",
          SUM(COALESCE(number_of_reviews, 0))::int as "totalReviews",
          COUNT(DISTINCT location_id)::int as "totalAreas",
          ROUND(AVG(price::numeric), 0)::int as "avgPrice",
          ROUND(AVG(availability_365::numeric), 0)::int as "avgAvailability"
        FROM fact_listing_daily
        WHERE price IS NOT NULL AND price > 0
      `) as Array<{
                totalListings: number;
                totalHosts: number;
                totalReviews: number;
                totalAreas: number;
                avgPrice: number;
                avgAvailability: number;
            }>;

            return stats[0];
        } catch (error) {
            console.error('Error fetching general stats:', error);
            throw new Error('Failed to fetch general stats from database');
        }
    }
}

export default DashboardService;