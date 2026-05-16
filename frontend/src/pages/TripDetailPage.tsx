import { Spin, Typography, Tag, Card, Button, Collapse, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../hooks/useTrips';
import type { WeekPlan, DayPlan, Activity, TravelInterest } from '../types';

const { Title, Text } = Typography;

const INTEREST_LABEL: Record<TravelInterest, string> = {
  outdoor:  'Outdoor',
  cultural: 'Cultural',
  food:     'Food',
  leisure:  'Leisure',
};

const INTEREST_COLOR: Record<TravelInterest, string> = {
  outdoor:  'green',
  cultural: 'purple',
  food:     'orange',
  leisure:  'cyan',
};

const TIME_OF_DAY_LABEL: Record<Activity['timeOfDay'], string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

const TYPE_COLOR: Record<Activity['type'], string> = {
  cultural: 'purple',
  food: 'orange',
  outdoor: 'green',
  transport: 'blue',
  leisure: 'cyan',
};

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 mb-2 bg-white">
      <div className="flex flex-wrap gap-1 mb-1">
        <Tag color={TYPE_COLOR[activity.type]}>{activity.type}</Tag>
        <Tag>{TIME_OF_DAY_LABEL[activity.timeOfDay]}</Tag>
        <Tag>{activity.duration}</Tag>
      </div>
      <Text strong>{activity.name}</Text>
      <p className="text-sm text-gray-600 mt-1 mb-0">{activity.description}</p>
      {activity.tip && (
        <p className="text-xs text-gray-400 italic mt-1 mb-0">💡 {activity.tip}</p>
      )}
    </div>
  );
}

function DaySection({ day }: { day: DayPlan }) {
  return (
    <div className="space-y-2">
      {day.activities.map((activity, i) => (
        <ActivityCard key={i} activity={activity} />
      ))}
    </div>
  );
}

function WeekCard({ week }: { week: WeekPlan }) {
  return (
    <Card
      title={<span>Semaine {week.week} — <Text type="secondary">{week.theme}</Text></span>}
      className="mb-4"
    >
      <Collapse
        size="small"
        items={week.days.map((day) => ({
          key: String(day.day),
          label: <span>Jour {day.day}{day.city ? <Text type="secondary"> — {day.city}</Text> : ''}</span>,
          children: <DaySection day={day} />,
        }))}
      />
    </Card>
  );
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: trip, isLoading, error } = useTrip(id!);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
  }

  if (error || !trip) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert type="error" message="Voyage introuvable." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className="mb-4">
        Retour
      </Button>

      <div className="mb-6">
        <Title level={2}>{trip.label ?? trip.destination}</Title>
        <div className="flex flex-wrap gap-2 items-center">
          <Text type="secondary">{trip.destination}</Text>
          <Tag>{trip.durationWeeks} semaines</Tag>
          <Tag color="blue">{trip.pace}</Tag>
          {(Object.entries(trip.interests) as [TravelInterest, number][]).filter(([, w]) => w > 0).map(([i]) => (
            <Tag key={i} color={INTEREST_COLOR[i]}>{INTEREST_LABEL[i]}</Tag>
          ))}
        </div>
      </div>

      {trip.plan.weeks.map((week) => <WeekCard key={week.week} week={week} />)}
    </div>
  );
}
