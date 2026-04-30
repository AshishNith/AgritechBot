import { AdminLog } from '../models/AdminLog';
import { CropPlan } from '../models/CropPlan';
import { User } from '../models/User';

interface DailyPoint {
  date: string;
  count: number;
}

const dateKey = (date: Date): string => date.toISOString().slice(0, 10);

const getDates = (days: number): Date[] => {
  const dates: Date[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    dates.push(date);
  }
  return dates;
};

const fillSeries = (raw: Array<{ _id: string; count: number }>, days: number): DailyPoint[] => {
  const map = new Map(raw.map((entry) => [entry._id, Number(entry.count)]));
  return getDates(days).map((date) => ({
    date: dateKey(date),
    count: map.get(dateKey(date)) ?? 0
  }));
};

export async function getDashboardOverview() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const growthStart = new Date(now);
  growthStart.setHours(0, 0, 0, 0);
  growthStart.setDate(growthStart.getDate() - 29);

  const [
    totalUsers,
    activeUsers24h,
    activeUsers7d,
    totalPlans,
    popularCropsRaw,
    apiUsageRaw,
    errorCount,
    tokenUsageFromPlans,
    growthRaw,
    baseUsersBeforeRange
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: { $ne: 'blocked' }, lastActiveAt: { $gte: last24h } }),
    User.countDocuments({ status: { $ne: 'blocked' }, lastActiveAt: { $gte: last7d } }),
    CropPlan.countDocuments(),
    CropPlan.aggregate([
      { $group: { _id: '$crop', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),
    AdminLog.aggregate([
      { $match: { type: 'api' } },
      {
        $group: {
          _id: null,
          requests: { $sum: 1 },
          tokens: { $sum: { $ifNull: ['$meta.tokens', 0] } }
        }
      }
    ]),
    AdminLog.countDocuments({ type: { $in: ['error', 'ai_failure'] } }),
    CropPlan.aggregate([{ $group: { _id: null, totalTokens: { $sum: { $ifNull: ['$tokenUsage', 0] } } } }]),
    User.aggregate([
      { $match: { createdAt: { $gte: growthStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    User.countDocuments({ createdAt: { $lt: growthStart } })
  ]);

  const requests = apiUsageRaw[0]?.requests ?? 0;
  const tokens = (apiUsageRaw[0]?.tokens ?? 0) || (tokenUsageFromPlans[0]?.totalTokens ?? 0);
  const errorRate = requests === 0 ? 0 : Number(((errorCount / requests) * 100).toFixed(2));

  const growthMap = new Map<string, number>(growthRaw.map((row) => [String(row._id), Number(row.count)]));
  let cumulative = baseUsersBeforeRange;
  const userGrowth = getDates(30).map((date) => {
    cumulative += growthMap.get(dateKey(date)) ?? 0;
    return { date: dateKey(date), count: cumulative };
  });

  const cropUsage = popularCropsRaw.map((row) => ({
    crop: String(row._id),
    count: Number(row.count)
  }));

  return {
    metrics: {
      totalUsers,
      activeUsers24h,
      activeUsers7d,
      totalPlans,
      popularCrops: cropUsage,
      apiUsage: { requests, tokens },
      errorRate
    },
    charts: {
      userGrowth,
      cropUsage
    }
  };
}

export async function getDetailedAnalytics() {
  const start14d = new Date();
  start14d.setHours(0, 0, 0, 0);
  start14d.setDate(start14d.getDate() - 13);

  const [dailyActiveRaw, planTrendRaw, tokenUsageRaw, totalUsers, usersWithCrops, usersWithPlans] = await Promise.all([
    CropPlan.aggregate([
      { $match: { createdAt: { $gte: start14d } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            userId: '$userId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    CropPlan.aggregate([
      { $match: { createdAt: { $gte: start14d } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    CropPlan.aggregate([
      { $match: { createdAt: { $gte: start14d } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: { $ifNull: ['$tokenUsage', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    User.countDocuments(),
    User.countDocuments({ 'crops.0': { $exists: true } }),
    CropPlan.distinct('userId').then((ids) => ids.length)
  ]);

  const funnelRaw = [
    { stage: 'Signup', count: totalUsers },
    { stage: 'Crop Selection', count: usersWithCrops },
    { stage: 'Plan Generation', count: usersWithPlans }
  ];

  const signup = totalUsers || 1;
  const funnel = funnelRaw.map((item) => ({
    ...item,
    conversionRate: Number(((item.count / signup) * 100).toFixed(2))
  }));

  return {
    dailyActiveUsers: fillSeries(
      dailyActiveRaw.map((row) => ({ _id: String(row._id), count: Number(row.count) })),
      14
    ),
    planGenerationTrends: fillSeries(
      planTrendRaw.map((row) => ({ _id: String(row._id), count: Number(row.count) })),
      14
    ),
    tokenUsagePerDay: fillSeries(
      tokenUsageRaw.map((row) => ({ _id: String(row._id), count: Number(row.count) })),
      14
    ),
    funnel
  };
}

