import { Spin, Typography, Tag, Card, Button, Collapse, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../hooks/useTrips';
import type { WeekPlan } from '../types';

const { Title, Text } = Typography;

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
          label: `Jour ${day.day}`,
          children: (
            <ul className="list-disc pl-5 space-y-1">
              {day.activities.map((a, i) => <li key={i}><Text>{a}</Text></li>)}
            </ul>
          ),
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
          {trip.interests.map((i) => <Tag key={i}>{i}</Tag>)}
        </div>
      </div>

      {trip.plan.weeks.map((week) => <WeekCard key={week.week} week={week} />)}
    </div>
  );
}
