import { Button, Card, Tag, Empty, Spin, Popconfirm, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTrips, useDeleteTrip } from '../hooks/useTrips';

const { Title, Text } = Typography;

const PACE_COLOR = { slow: 'green', normal: 'blue', fast: 'orange' } as const;

export default function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const { mutate: deleteTrip } = useDeleteTrip();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">Mes voyages</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/trips/new')}>
          Nouveau voyage
        </Button>
      </div>

      {!trips?.length ? (
        <Empty description="Aucun voyage pour l'instant. Commencez à planifier !" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <Card
              key={trip.id}
              title={<span className="font-semibold">{trip.input.label ?? trip.input.destination}</span>}
              extra={
                <div className="flex gap-2">
                  <Link to={`/trips/${trip.id}`}>
                    <Button size="small" icon={<EyeOutlined />} />
                  </Link>
                  <Popconfirm
                    title="Supprimer ce voyage ?"
                    onConfirm={() => deleteTrip(trip.id)}
                    okText="Supprimer"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              }
            >
              <Text type="secondary">{trip.input.destination}</Text>
              <div className="mt-2 flex flex-wrap gap-1">
                <Tag color={PACE_COLOR[trip.input.pace]}>{trip.input.pace}</Tag>
                <Tag>{trip.input.durationWeeks} sem.</Tag>
                {trip.input.interests.map((i) => <Tag key={i}>{i}</Tag>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
